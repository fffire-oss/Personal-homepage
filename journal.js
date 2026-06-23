(function () {
  "use strict";

  const DATA_PATH = "journal-data.json";
  const API_GRAPH_PATH = "/api/journal/graph";
  const API_NODES_PATH = "/api/journal/nodes";
  const API_VAULT_BASE = "/api/journal/vault";
  const DRAFT_KEY = "zephyrlabs.journal.localNodes";
  const FALLBACK_COLOR = "#f5f8fb";

  const state = {
    data: null,
    nodes: [],
    links: [],
    categories: new Map(),
    selectedId: "zephyrlabs-journal",
    filter: "",
    query: "",
    canvas: null,
    ctx: null,
    ratio: 1,
    width: 1,
    height: 1,
    pointer: null,
    hoveredId: "",
    animation: 0,
    introStartedAt: 0,
    introDuration: 1650,
    stars: [],
    screenNodes: []
  };

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function readDrafts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      return {
        nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
        links: Array.isArray(parsed.links) ? parsed.links : []
      };
    } catch (_error) {
      return { nodes: [], links: [] };
    }
  }

  function writeDrafts(drafts) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      nodes: Array.isArray(drafts.nodes) ? drafts.nodes : [],
      links: Array.isArray(drafts.links) ? drafts.links : []
    }, null, 2));
  }

  function categoryColor(category) {
    const item = state.categories.get(category);
    return item ? item.color : FALLBACK_COLOR;
  }

  function categoryLabel(category) {
    const item = state.categories.get(category);
    return item ? item.label : category || "Note";
  }

  function rgbaColor(hex, alpha) {
    const value = String(hex || FALLBACK_COLOR).replace("#", "");
    const normalized = value.length === 3
      ? value.split("").map((char) => char + char).join("")
      : value.padEnd(6, "f").slice(0, 6);
    const intValue = Number.parseInt(normalized, 16);
    const r = intValue >> 16 & 255;
    const g = intValue >> 8 & 255;
    const b = intValue & 255;
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  async function readJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load " + path);
    return response.json();
  }

  async function loadApiNodes() {
    try {
      const response = await fetch(API_NODES_PATH, { cache: "no-store" });
      if (!response.ok) return { nodes: [], links: [] };
      const parsed = await response.json();
      return {
        nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
        links: Array.isArray(parsed.links) ? parsed.links : []
      };
    } catch (_error) {
      return { nodes: [], links: [] };
    }
  }

  async function loadAllData() {
    const base = await readJson(DATA_PATH);
    const apiGraph = await loadApiGraph();
    const dynamic = await loadApiNodes();
    const drafts = readDrafts();
    return mergeData(apiGraph || base, apiGraph ? { nodes: [], links: [] } : dynamic, drafts);
  }

  async function loadApiGraph() {
    try {
      const response = await fetch(API_GRAPH_PATH, { cache: "no-store" });
      if (!response.ok) return null;
      const parsed = await response.json();
      return parsed && parsed.graph && Array.isArray(parsed.graph.nodes) ? parsed.graph : null;
    } catch (_error) {
      return null;
    }
  }

  function mergeData(base, dynamic, drafts) {
    const nodeMap = new Map();
    const links = [];

    function addNode(node) {
      if (!node || typeof node.id !== "string") return;
      const previous = nodeMap.get(node.id) || {};
      nodeMap.set(node.id, {
        ...previous,
        id: node.id,
        title: node.title || node.id,
        category: node.category || "public",
        kind: node.kind || "note",
        status: node.status || "public",
        summary: node.summary || "",
        body: Array.isArray(node.body) ? node.body : typeof node.body === "string" && node.body.trim() ? [node.body.trim()] : previous.body || [],
        source: node.source || "public data",
        route: node.route || ""
      });
    }

    function addLinks(items) {
      items.forEach((link) => {
        if (!link || !nodeMap.has(link.source) || !nodeMap.has(link.target)) return;
        links.push({
          source: link.source,
          target: link.target,
          kind: link.kind || "related"
        });
      });
    }

    (base.nodes || []).forEach(addNode);
    (dynamic.nodes || []).forEach(addNode);
    (drafts.nodes || []).forEach(addNode);
    addLinks(base.links || []);
    addLinks(dynamic.links || []);
    addLinks(drafts.links || []);

    const dedupedLinks = [];
    const seenLinks = new Set();
    links.forEach((link) => {
      const key = link.source + "->" + link.target + ":" + link.kind;
      if (seenLinks.has(key)) return;
      seenLinks.add(key);
      dedupedLinks.push(link);
    });

    return { ...base, nodes: Array.from(nodeMap.values()), links: dedupedLinks };
  }

  function matchesNode(node) {
    const categoryMatch = !state.filter || node.category === state.filter;
    if (!categoryMatch) return false;
    if (!state.query) return true;
    const haystack = [node.title, node.summary, node.kind, node.status].join(" ").toLowerCase();
    return haystack.includes(state.query);
  }

  function visibleWeight(node) {
    return matchesNode(node) ? 1 : 0.16;
  }

  function hydrateGraphData(data) {
    state.data = data;
    state.categories = new Map((data.categories || []).map((item) => [item.id, item]));
    const priority = new Map([
      ["zephyrlabs-journal", 0],
      ["research", 1],
      ["philosophy", 2],
      ["geminus", 3],
      ["snowboard", 4],
      ["ai", 5],
      ["language", 6]
    ]);
    const orderedNodes = (data.nodes || []).slice().sort((a, b) => {
      const pa = priority.has(a.id) ? priority.get(a.id) : 20;
      const pb = priority.has(b.id) ? priority.get(b.id) : 20;
      return pa - pb || String(a.title || a.id).localeCompare(String(b.title || b.id));
    });
    state.nodes = orderedNodes.map((node, index) => {
      const count = Math.max(1, orderedNodes.length);
      const rank = node.id === "zephyrlabs-journal" ? -1 : index - 1;
      const y = node.id === "zephyrlabs-journal" ? 0 : 1 - ((rank + 0.5) / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = Math.max(0, rank) * 2.399963229728653;
      const hubBoost = node.kind === "map" ? 0 : node.kind === "constellation" ? 0.72 : node.kind === "project" ? 0.84 : 0.96;
      const radius = 278;
      return {
        ...node,
        x: Math.cos(angle) * ring * radius * hubBoost,
        y: y * radius * hubBoost,
        z: (node.kind === "map" ? 1 : Math.sin(angle) * ring) * radius * (node.kind === "map" ? 1 : hubBoost),
        vx: 0,
        vy: 0,
        vz: 0
      };
    });
    const nodeIds = new Set(state.nodes.map((node) => node.id));
    state.links = (data.links || []).filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));
    assignVisualWeights();
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("node");
    if (hash && nodeIds.has(hash)) state.selectedId = hash;
    if (!nodeIds.has(state.selectedId) && state.nodes[0]) state.selectedId = state.nodes[0].id;
  }

  function linkKey(link) {
    return link.source + "->" + link.target + ":" + (link.kind || "related");
  }

  function nodeVisualScore(node, degree) {
    const kindScore = node.kind === "map" ? 100 : node.kind === "constellation" ? 52 : node.kind === "project" ? 42 : 0;
    const categoryScore = node.category === "core" ? 24 : node.category === "ai" || node.category === "research" ? 9 : 0;
    return kindScore + categoryScore + degree * 12;
  }

  function assignVisualWeights() {
    const degree = new Map();
    state.links.forEach((link) => {
      degree.set(link.source, (degree.get(link.source) || 0) + 1);
      degree.set(link.target, (degree.get(link.target) || 0) + 1);
    });

    const scoredNodes = state.nodes
      .map((node, index) => ({ node, index, degree: degree.get(node.id) || 0, score: nodeVisualScore(node, degree.get(node.id) || 0) }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const major = new Set(scoredNodes.slice(0, Math.min(7, scoredNodes.length)).map((item) => item.node.id));
    const mid = new Set(scoredNodes.slice(7, Math.min(22, scoredNodes.length)).map((item) => item.node.id));

    state.nodes.forEach((node, index) => {
      node.degree = degree.get(node.id) || 0;
      node.visualRank = major.has(node.id) ? 2 : mid.has(node.id) ? 1 : 0;
      node.visualPhase = pseudoRandom(index, 12) * Math.PI * 2;
    });

    const linkScores = state.links
      .map((link, index) => {
        const source = nodeById(link.source);
        const target = nodeById(link.target);
        const score = (source ? source.visualRank * 24 + source.degree : 0) + (target ? target.visualRank * 24 + target.degree : 0);
        return { key: linkKey(link), index, score };
      })
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const primaryCount = Math.max(8, Math.floor(state.links.length * 0.3));
    const primary = new Set(linkScores.slice(0, primaryCount).map((item) => item.key));
    state.links = state.links.map((link, index) => ({
      ...link,
      primary: primary.has(linkKey(link)),
      flowPhase: pseudoRandom(index, 14),
      curveSeed: pseudoRandom(index, 16)
    }));
  }

  function fillCategorySelect() {
    const select = $("#journal-category");
    if (!select) return;
    (state.data.categories || []).forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label;
      select.append(option);
    });
  }

  function selectedNode() {
    return state.nodes.find((node) => node.id === state.selectedId) || state.nodes[0] || null;
  }

  function linkedNodes(id) {
    const ids = new Set();
    state.links.forEach((link) => {
      if (link.source === id) ids.add(link.target);
      if (link.target === id) ids.add(link.source);
    });
    return Array.from(ids)
      .map((linkedId) => state.nodes.find((node) => node.id === linkedId))
      .filter(Boolean);
  }

  function updateInspector() {
    const node = selectedNode();
    if (!node) return;
    if (state.canvas) state.canvas.dataset.selectedNode = node.id;
    const title = $("[data-node-title]");
    const summary = $("[data-node-summary]");
    const body = $("[data-node-body]");
    const category = $("[data-node-category]");
    const kind = $("[data-node-kind]");
    const status = $("[data-node-status]");
    const source = $("[data-node-source]");
    const links = $("[data-node-links]");

    if (title) title.textContent = node.title;
    if (summary) summary.textContent = node.summary;
    if (body) {
      body.textContent = "";
      const paragraphs = Array.isArray(node.body) && node.body.length ? node.body : [node.summary];
      paragraphs.forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        body.append(paragraph);
      });
    }
    if (category) {
      category.textContent = categoryLabel(node.category);
      category.style.borderColor = categoryColor(node.category);
    }
    if (kind) kind.textContent = node.kind;
    if (status) status.textContent = node.status;
    if (source) source.textContent = node.source || "public data";
    if (links) {
      links.textContent = "";
      linkedNodes(node.id).forEach((linked) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = linked.title;
        button.addEventListener("click", () => selectNode(linked.id));
        links.append(button);
      });
    }
  }

  function renderNoteGrid() {
    const grid = $("[data-note-grid]");
    if (!grid) return;
    grid.textContent = "";
    state.nodes
      .filter((node) => matchesNode(node))
      .sort((a, b) => {
        const rank = { core: 0, public: 1, ai: 2, research: 3, reflection: 4, practice: 5, language: 6 };
        return (rank[a.category] ?? 9) - (rank[b.category] ?? 9) || a.title.localeCompare(b.title);
      })
      .forEach((node) => {
        const card = document.createElement("article");
        card.className = "note-card";
        card.style.setProperty("--note-color", categoryColor(node.category));
        card.innerHTML = [
          "<div>",
          "<span class=\"journal-kicker\"></span>",
          "<h3></h3>",
          "<p></p>",
          "</div>",
          "<footer><span></span><button type=\"button\">Open</button></footer>"
        ].join("");
        $(".journal-kicker", card).textContent = categoryLabel(node.category);
        $("h3", card).textContent = node.title;
        $("p", card).textContent = node.summary;
        $("footer span", card).textContent = node.status + " / " + node.kind;
        $("button", card).addEventListener("click", () => {
          selectNode(node.id);
          const inspector = $(".node-inspector");
          if (inspector) inspector.scrollIntoView({ block: "nearest", behavior: "smooth" });
        });
        grid.append(card);
      });
  }

  function updateStatus(message) {
    const status = $("[data-graph-status]");
    if (status) status.textContent = message;
  }

  function selectNode(id) {
    if (!state.nodes.some((node) => node.id === id)) return;
    state.selectedId = id;
    if (state.canvas) state.canvas.dataset.selectedNode = id;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    params.set("node", id);
    history.replaceState(null, "", "#" + params.toString());
    updateInspector();
  }

  function resizeCanvas() {
    if (!state.canvas || !state.ctx) return;
    const previousWidth = state.width;
    const previousHeight = state.height;
    const rect = state.canvas.getBoundingClientRect();
    state.ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    state.canvas.width = Math.floor(state.width * state.ratio);
    state.canvas.height = Math.floor(state.height * state.ratio);
    state.ctx.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    if (!state.stars.length || Math.abs(previousWidth - state.width) > 24 || Math.abs(previousHeight - state.height) > 24) {
      initStarField();
    }
  }

  function nodeById(id) {
    return state.nodes.find((node) => node.id === id);
  }

  function tickLayout() {
    const centerForce = 0.0045;
    const linkForce = 0.0035;
    const repelForce = 1200;
    const preferred = Math.min(state.width, state.height) * 0.28;

    state.links.forEach((link) => {
      const source = nodeById(link.source);
      const target = nodeById(link.target);
      if (!source || !target) return;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dz = target.z - source.z;
      const distance = Math.max(1, Math.hypot(dx, dy, dz));
      const delta = (distance - preferred) * linkForce;
      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;
      source.vx += nx * delta;
      source.vy += ny * delta;
      source.vz += nz * delta;
      target.vx -= nx * delta;
      target.vy -= ny * delta;
      target.vz -= nz * delta;
    });

    for (let i = 0; i < state.nodes.length; i += 1) {
      for (let j = i + 1; j < state.nodes.length; j += 1) {
        const a = state.nodes[i];
        const b = state.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const distance = Math.max(20, Math.hypot(dx, dy, dz));
        const force = repelForce / (distance * distance);
        const nx = dx / distance;
        const ny = dy / distance;
        const nz = dz / distance;
        a.vx -= nx * force;
        a.vy -= ny * force;
        a.vz -= nz * force;
        b.vx += nx * force;
        b.vy += ny * force;
        b.vz += nz * force;
      }
    }

    state.nodes.forEach((node) => {
      node.vx += -node.x * centerForce;
      node.vy += -node.y * centerForce;
      node.vz += -node.z * centerForce;
      node.vx *= 0.82;
      node.vy *= 0.82;
      node.vz *= 0.82;
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeOutCubic(value) {
    const t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  function startGraphIntro() {
    state.introStartedAt = performance.now();
    if (state.canvas) state.canvas.dataset.intro = "revealing";
  }

  function pseudoRandom(index, salt) {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  function initStarField() {
    const count = clamp(Math.floor(state.width * state.height / 470), 620, 2050);
    state.stars = Array.from({ length: count }, (_item, index) => ({
      x: pseudoRandom(index, 1) * state.width,
      y: pseudoRandom(index, 2) * state.height,
      radius: pseudoRandom(index, 8) > 0.96 ? 0.95 + pseudoRandom(index, 3) * 1.3 : 0.28 + pseudoRandom(index, 3) * 0.74,
      alpha: pseudoRandom(index, 9) > 0.96 ? 0.42 + pseudoRandom(index, 4) * 0.4 : 0.08 + pseudoRandom(index, 4) * 0.3,
      depth: pseudoRandom(index, 10),
      phase: pseudoRandom(index, 5) * Math.PI * 2,
      speed: 0.00055 + pseudoRandom(index, 6) * 0.0018,
      drift: 0.006 + pseudoRandom(index, 11) * 0.032,
      warm: pseudoRandom(index, 7) > 0.82
    }));
  }

  function cameraAngles(time) {
    return {
      yaw: 0.68 + time * 0.000038,
      pitch: -0.52,
      roll: 0.12
    };
  }

  function rotateCoordinates(x, y, z, angles) {
    const cy = Math.cos(angles.yaw);
    const sy = Math.sin(angles.yaw);
    const cp = Math.cos(angles.pitch);
    const sp = Math.sin(angles.pitch);
    const cr = Math.cos(angles.roll);
    const sr = Math.sin(angles.roll);

    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y1 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    return {
      x: x1 * cr - y1 * sr,
      y: x1 * sr + y1 * cr,
      z: z2
    };
  }

  function projectCoordinates(x, y, z, angles, baseScale) {
    const rotated = rotateCoordinates(x, y, z, angles);
    const depth = clamp((rotated.z + 360) / 720, 0, 1);
    const perspective = 0.76 + depth * 0.42;
    return {
      x: state.width * 0.48 + rotated.x * baseScale * perspective,
      y: state.height * 0.57 + rotated.y * baseScale * perspective,
      depth,
      scale: baseScale * perspective,
      rotatedZ: rotated.z
    };
  }

  function project(node, angles) {
    const baseScale = clamp(Math.min(state.width, state.height) * 0.62 / 300, 0.78, 1.38);
    return projectCoordinates(node.x, node.y, node.z, angles, baseScale);
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  function drawStarlightBackground(ctx, time, intro) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.26 + intro * 0.74;
    state.stars.forEach((star) => {
      const pulse = 0.72 + Math.sin(time * star.speed + star.phase) * 0.28;
      const alpha = star.alpha * pulse;
      const x = star.x + Math.sin(time * 0.00003 + star.phase) * star.drift * 28 * (star.depth + 0.3);
      const y = star.y + Math.cos(time * 0.000025 + star.phase) * star.drift * 18 * (star.depth + 0.3);
      ctx.fillStyle = star.warm
        ? "rgba(255, 219, 170, " + alpha + ")"
        : "rgba(190, 224, 255, " + alpha + ")";
      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      if (star.radius > 1.45) {
        const glowRadius = star.radius * (6 + star.depth * 5);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glow.addColorStop(0, star.warm ? "rgba(255, 220, 168, " + alpha * 0.72 + ")" : "rgba(195, 228, 255, " + alpha * 0.72 + ")");
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  function drawProjectedPath(ctx, points, angles, alpha, width) {
    for (let index = 1; index < points.length; index += 1) {
      const a = projectCoordinates(points[index - 1].x, points[index - 1].y, points[index - 1].z, angles, 1);
      const b = projectCoordinates(points[index].x, points[index].y, points[index].z, angles, 1);
      const front = (a.rotatedZ + b.rotatedZ) * 0.5 > 0;
      const depth = (a.depth + b.depth) * 0.5;
      ctx.strokeStyle = "rgba(177, 221, 255, " + (front ? alpha * (0.9 + depth * 0.55) : alpha * 0.28) + ")";
      ctx.lineWidth = front ? width * (0.86 + depth * 0.38) : width * 0.72;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function drawOrbBackground(ctx, angles) {
    const cx = state.width * 0.48;
    const cy = state.height * 0.57;
    const radius = Math.min(state.width, state.height) * 0.43;
    const glow = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.28, radius * 0.08, cx, cy, radius * 1.5);
    glow.addColorStop(0, "rgba(160, 212, 255, 0.2)");
    glow.addColorStop(0.4, "rgba(73, 146, 226, 0.08)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createRadialGradient(cx - radius * 0.24, cy - radius * 0.32, radius * 0.08, cx, cy, radius);
    body.addColorStop(0, "rgba(154, 210, 255, 0.18)");
    body.addColorStop(0.34, "rgba(82, 149, 215, 0.09)");
    body.addColorStop(0.68, "rgba(18, 72, 128, 0.035)");
    body.addColorStop(1, "rgba(5, 18, 31, 0)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(205, 232, 255, 0.055)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = -3; i <= 3; i += 1) {
      const latitude = i / 4.5;
      const ringRadius = radius * Math.sqrt(Math.max(0, 1 - latitude * latitude));
      const y = radius * latitude;
      const points = [];
      for (let step = 0; step <= 96; step += 1) {
        const angle = step / 96 * Math.PI * 2;
        points.push({
          x: Math.cos(angle) * ringRadius,
          y,
          z: Math.sin(angle) * ringRadius
        });
      }
      drawProjectedPath(ctx, points, angles, 0.11, 1);
    }

    for (let i = 0; i < 7; i += 1) {
      const longitude = i / 7 * Math.PI * 2;
      const points = [];
      for (let step = 0; step <= 112; step += 1) {
        const angle = step / 112 * Math.PI * 2;
        const cross = Math.cos(angle) * radius;
        points.push({
          x: cross * Math.cos(longitude),
          y: Math.sin(angle) * radius,
          z: cross * Math.sin(longitude)
        });
      }
      drawProjectedPath(ctx, points, angles, 0.075, 0.9);
    }

    for (let i = 0; i < 4; i += 1) {
      const phase = i * Math.PI / 4;
      const points = [];
      for (let step = 0; step <= 124; step += 1) {
        const angle = step / 124 * Math.PI * 2;
        points.push({
          x: Math.cos(angle) * radius * 1.02,
          y: Math.sin(angle + phase) * radius * 0.26,
          z: Math.sin(angle) * radius * 1.02
        });
      }
      drawProjectedPath(ctx, points, angles, 0.045, 0.75);
    }
  }

  function drawObservatoryReveal(ctx, intro, time) {
    if (intro >= 0.995) return;
    const remaining = 1 - intro;
    const cx = state.width * 0.48;
    const cy = state.height * 0.57;
    const radius = Math.min(state.width, state.height) * (0.18 + intro * 0.58);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0, 3, 8, " + remaining * 0.58 + ")";
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.globalCompositeOperation = "screen";
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.18, cx, cy, radius * 1.24);
    glow.addColorStop(0, "rgba(155, 218, 255, " + (0.16 + intro * 0.08) + ")");
    glow.addColorStop(0.62, "rgba(88, 160, 255, " + remaining * 0.16 + ")");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(200, 238, 255, " + remaining * 0.34 + ")";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const sweep = (time * 0.0014) % (Math.PI * 2);
    ctx.strokeStyle = "rgba(120, 230, 255, " + remaining * 0.24 + ")";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.72, sweep, sweep + Math.PI * 0.42);
    ctx.stroke();
    ctx.restore();
  }

  function shouldShowLabel(node) {
    return node.id === state.hoveredId ||
      Boolean((state.filter || state.query) && matchesNode(node));
  }

  function drawLabel(ctx, node, point) {
    const text = node.title;
    ctx.font = "760 12px Inter, Segoe UI, sans-serif";
    const width = Math.ceil(ctx.measureText(text).width) + 20;
    const height = 28;
    const x = Math.min(state.width - width - 12, Math.max(12, point.x + 13));
    const y = Math.min(state.height - height - 12, Math.max(12, point.y - height * 0.5));
    drawRoundedRect(ctx, x, y, width, height, 9);
    ctx.fillStyle = "rgba(4, 9, 16, 0.78)";
    ctx.fill();
    ctx.strokeStyle = categoryColor(node.category);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(248, 252, 255, 0.95)";
    ctx.fillText(text, x + 10, y + 18);
  }

  function quadraticPoint(a, control, b, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * a.x + 2 * mt * t * control.x + t * t * b.x,
      y: mt * mt * a.y + 2 * mt * t * control.y + t * t * b.y
    };
  }

  function linkControlPoint(link, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / distance;
    const ny = dx / distance;
    const sign = link.curveSeed > 0.5 ? 1 : -1;
    const bend = clamp(distance * (link.primary ? 0.13 : 0.07) * sign + (link.curveSeed - 0.5) * 30, -92, 92);
    return {
      x: (a.x + b.x) * 0.5 + nx * bend,
      y: (a.y + b.y) * 0.5 + ny * bend
    };
  }

  function drawGraphLink(ctx, link, a, b, time, intro) {
    const source = a.node;
    const target = b.node;
    const visible = Math.min(visibleWeight(source), visibleWeight(target));
    const hovered = source.id === state.hoveredId || target.id === state.hoveredId;
    const active = hovered;
    const depth = (a.depth + b.depth) * 0.5;
    const introWeight = 0.18 + intro * 0.82;
    const alpha = visible * introWeight * (active ? 0.32 + depth * 0.16 : 0.066 + depth * 0.07);
    if (alpha <= 0.005) return;

    const control = linkControlPoint(link, a, b);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(162, 213, 255, " + alpha + ")";
    ctx.lineWidth = active ? 1.45 : 0.62 + depth * 0.22;
    ctx.shadowColor = active ? "rgba(160, 224, 255, 0.34)" : "rgba(96, 156, 220, 0.12)";
    ctx.shadowBlur = active ? 9 : 2.2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(control.x, control.y, b.x, b.y);
    ctx.stroke();
    if (active) {
      const t = (time * 0.000055 + link.flowPhase) % 1;
      const bead = quadraticPoint(a, control, b, t);
      const glowRadius = active ? 12 : 6;
      const glow = ctx.createRadialGradient(bead.x, bead.y, 0, bead.x, bead.y, glowRadius);
      glow.addColorStop(0, "rgba(245, 252, 255, " + (active ? 0.52 : 0.16) * visible + ")");
      glow.addColorStop(0.42, "rgba(126, 220, 255, " + (active ? 0.18 : 0.055) * visible + ")");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bead.x, bead.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawStarNode(ctx, point, time, intro) {
    const node = point.node;
    const selected = node.id === state.selectedId;
    const hovered = node.id === state.hoveredId;
    const weight = visibleWeight(node);
    const rank = node.visualRank || 0;
    const color = categoryColor(node.category);
    const breath = rank === 2 ? 0.94 + Math.sin(time * 0.00125 + node.visualPhase) * 0.08 : 1;
    const baseRadius = rank === 2 ? 7.1 : rank === 1 ? 5.65 : 4.75;
    const depthBoost = rank === 2 ? 4.5 : rank === 1 ? 3.55 : 3.1;
    const radius = (baseRadius + point.depth * depthBoost + (selected ? 2.2 : hovered ? 2.6 : 0)) * breath;
    const haloRadius = (rank === 2 ? 44 + point.depth * 40 : rank === 1 ? 30 + point.depth * 30 : 24 + point.depth * 24) * (hovered ? 1.5 : 1);
    const coreAlpha = hovered ? 0.98 : rank === 2 ? 0.86 : rank === 1 ? 0.8 : 0.72;
    point.radius = radius;
    point.hitRadius = Math.max(18, radius + 14);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = weight * (0.18 + intro * 0.82);
    const halo = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, haloRadius);
    halo.addColorStop(0, "rgba(255, 255, 255, " + (hovered ? 0.86 : rank === 2 ? 0.6 : rank === 1 ? 0.48 : 0.42) + ")");
    halo.addColorStop(0.2, rgbaColor(color, hovered ? 0.5 : rank === 2 ? 0.3 : rank === 1 ? 0.26 : 0.24));
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(point.x, point.y, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    if (rank === 2) {
      ctx.strokeStyle = rgbaColor(color, 0.16);
      ctx.lineWidth = 0.7;
      const flare = haloRadius * 0.34;
      ctx.beginPath();
      ctx.moveTo(point.x - flare, point.y);
      ctx.lineTo(point.x + flare, point.y);
      ctx.moveTo(point.x, point.y - flare * 0.72);
      ctx.lineTo(point.x, point.y + flare * 0.72);
      ctx.stroke();
    }

    if (hovered) {
      const outer = ctx.createRadialGradient(point.x, point.y, radius * 0.5, point.x, point.y, haloRadius * 1.24);
      outer.addColorStop(0, rgbaColor(color, 0.32));
      outer.addColorStop(0.36, "rgba(230, 248, 255, 0.18)");
      outer.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(point.x, point.y, haloRadius * 1.18, 0, Math.PI * 2);
      ctx.fill();
    }

    const core = ctx.createRadialGradient(point.x - radius * 0.35, point.y - radius * 0.4, 0, point.x, point.y, radius * 1.4);
    core.addColorStop(0, "rgba(255,255,255," + coreAlpha + ")");
    core.addColorStop(0.52, rgbaColor(color, hovered ? 0.72 : rank === 2 ? 0.68 : rank === 1 ? 0.58 : 0.5));
    core.addColorStop(1, "rgba(225, 244, 255, 0.32)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (shouldShowLabel(node)) {
      ctx.globalAlpha = hovered ? 1 : 0.78;
      drawLabel(ctx, node, point);
    }
    ctx.restore();
  }

  function drawGraph() {
    const ctx = state.ctx;
    if (!ctx) return;
    const time = performance.now();
    const introRaw = state.introStartedAt ? clamp((time - state.introStartedAt) / state.introDuration, 0, 1) : 1;
    const intro = easeOutCubic(introRaw);
    if (introRaw >= 1 && state.canvas && state.canvas.dataset.intro !== "ready") {
      state.canvas.dataset.intro = "ready";
    }
    const angles = cameraAngles(time);
    ctx.clearRect(0, 0, state.width, state.height);

    drawStarlightBackground(ctx, time, intro);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    drawOrbBackground(ctx, angles);
    const projected = state.nodes
      .map((node) => ({ node, ...project(node, angles) }))
      .sort((a, b) => a.depth - b.depth);
    const projectedById = new Map(projected.map((point) => [point.node.id, point]));

    state.links
      .slice()
      .sort((a, b) => Number(Boolean(a.primary)) - Number(Boolean(b.primary)))
      .forEach((link) => {
      const a = projectedById.get(link.source);
      const b = projectedById.get(link.target);
      if (!a || !b) return;
      drawGraphLink(ctx, link, a, b, time, intro);
    });

    projected.forEach((point) => {
      drawStarNode(ctx, point, time, intro);
    });
    state.screenNodes = projected;
    ctx.restore();
    drawObservatoryReveal(ctx, intro, time);

    state.animation = requestAnimationFrame(drawGraph);
  }

  function hitNode(clientX, clientY) {
    const rect = state.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (state.width / Math.max(1, rect.width));
    const y = (clientY - rect.top) * (state.height / Math.max(1, rect.height));
    let best = null;
    let bestScore = Infinity;
    state.screenNodes.forEach((point) => {
      const distance = Math.hypot(point.x - x, point.y - y);
      const radius = point.hitRadius || 16;
      if (distance > radius) return;
      const score = distance / radius - point.depth * 0.06;
      if (score < bestScore) {
        best = point.node;
        bestScore = score;
      }
    });
    return best;
  }

  function bindGraphEvents() {
    state.canvas.addEventListener("pointermove", (event) => {
      const hovered = hitNode(event.clientX, event.clientY);
      state.hoveredId = hovered ? hovered.id : "";
      if (state.hoveredId) state.canvas.dataset.hoveredNode = state.hoveredId;
      else delete state.canvas.dataset.hoveredNode;
      state.canvas.style.cursor = hovered ? "pointer" : "default";
    });

    state.canvas.addEventListener("pointerleave", () => {
      state.hoveredId = "";
      delete state.canvas.dataset.hoveredNode;
      state.canvas.style.cursor = "default";
    });

    state.canvas.addEventListener("click", (event) => {
      const node = hitNode(event.clientX, event.clientY);
      if (node) selectNode(node.id);
    });

    $("#journal-search").addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      renderNoteGrid();
    });

    $("#journal-category").addEventListener("change", (event) => {
      state.filter = event.target.value;
      renderNoteGrid();
    });

    $("#journal-reset").addEventListener("click", () => {
      state.filter = "";
      state.query = "";
      $("#journal-search").value = "";
      $("#journal-category").value = "";
      renderNoteGrid();
      selectNode("zephyrlabs-journal");
    });

    const copyButton = $("[data-copy-node-id]");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const node = selectedNode();
        if (!node) return;
        try {
          await navigator.clipboard.writeText(node.id);
          copyButton.textContent = "Copied";
          window.setTimeout(() => { copyButton.textContent = "Copy id"; }, 1200);
        } catch (_error) {
          copyButton.textContent = node.id;
        }
      });
    }

    window.addEventListener("resize", resizeCanvas);
  }

  async function initGraphPage() {
    state.canvas = $("#journal-graph");
    if (!state.canvas) return;
    state.ctx = state.canvas.getContext("2d");
    if (!state.ctx) return;

    try {
      hydrateGraphData(await loadAllData());
      fillCategorySelect();
      resizeCanvas();
      bindGraphEvents();
      updateInspector();
      renderNoteGrid();
      updateStatus(state.nodes.length + " stars / " + state.links.length + " light routes");
      startGraphIntro();
      drawGraph();
    } catch (error) {
      updateStatus(error.message);
    }
  }

  function linkTargetsFor(id) {
    return state.links
      .filter((link) => link.source === id)
      .map((link) => link.target)
      .join(", ");
  }

  function fillExistingNodeSelect(form) {
    const select = $("[data-existing-node]", form);
    if (!select) return;
    select.textContent = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "New node";
    select.append(empty);
    state.nodes
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((node) => {
        const option = document.createElement("option");
        option.value = node.id;
        option.textContent = node.title + " (" + node.id + ")";
        select.append(option);
      });
  }

  function loadNodeIntoForm(form, id) {
    const node = id ? nodeById(id) : null;
    if (!node) {
      form.reset();
      form.elements.kind.value = "note";
      form.elements.id.value = "";
      form.elements.existing.value = "";
      return;
    }
    form.elements.existing.value = node.id;
    form.elements.id.value = node.id;
    form.elements.title.value = node.title;
    form.elements.category.value = node.category;
    form.elements.kind.value = node.kind;
    form.elements.summary.value = node.summary;
    form.elements.body.value = Array.isArray(node.body) ? node.body.join("\n\n") : "";
    form.elements.links.value = linkTargetsFor(node.id);
  }

  function formPayload(form) {
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const id = slugify(formData.get("id") || title);
    const links = String(formData.get("links") || "")
      .split(",")
      .map((item) => slugify(item))
      .filter(Boolean);
    const body = String(formData.get("body") || "")
      .split(/\n{2,}|\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    return {
      id,
      title,
      category: String(formData.get("category") || "public"),
      kind: String(formData.get("kind") || "note").trim() || "note",
      status: "public",
      summary: String(formData.get("summary") || "").trim(),
      body,
      source: "journal-admin",
      links
    };
  }

  function setAdminMessage(message) {
    const element = $("[data-admin-message]");
    if (element) element.textContent = message;
  }

  function saveDraftFromForm(form) {
    const payload = formPayload(form);
    if (!payload.title || !payload.summary) {
      setAdminMessage("Title and summary are required.");
      return null;
    }
    const drafts = readDrafts();
    drafts.nodes = drafts.nodes.filter((node) => node.id !== payload.id);
    drafts.nodes.push({
      id: payload.id,
      title: payload.title,
      category: payload.category,
      kind: payload.kind,
      status: payload.status,
      summary: payload.summary,
      body: payload.body,
      source: payload.source
    });
    drafts.links = drafts.links.filter((link) => link.source !== payload.id);
    payload.links.forEach((target) => drafts.links.push({ source: payload.id, target, kind: "related" }));
    writeDrafts(drafts);
    renderDrafts();
    setAdminMessage("Saved to local draft queue.");
    return payload;
  }

  async function submitNode(form) {
    const payload = formPayload(form);
    const token = String(new FormData(form).get("token") || "").trim();
    if (!payload.title || !payload.summary) {
      setAdminMessage("Title and summary are required.");
      return;
    }
    if (!token) {
      saveDraftFromForm(form);
      return;
    }
    try {
      const response = await fetch(API_NODES_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Backend rejected the node.");
      setAdminMessage("Node added through backend API.");
      form.reset();
      form.elements.kind.value = "note";
      form.elements.existing.value = "";
      form.elements.id.value = "";
      renderDrafts();
    } catch (error) {
      setAdminMessage(error.message + " Saved as local draft instead.");
      saveDraftFromForm(form);
    }
  }

  function renderDrafts() {
    const list = $("[data-draft-list]");
    if (!list) return;
    const drafts = readDrafts();
    list.textContent = "";
    if (!drafts.nodes.length) {
      const empty = document.createElement("p");
      empty.className = "admin-message";
      empty.textContent = "No local drafts.";
      list.append(empty);
      return;
    }
    drafts.nodes.forEach((node) => {
      const item = document.createElement("article");
      item.className = "draft-item";
      const title = document.createElement("strong");
      const summary = document.createElement("p");
      title.textContent = node.title;
      summary.textContent = node.id + " / " + node.summary;
      item.append(title, summary);
      list.append(item);
    });
  }

  function exportDrafts() {
    const drafts = readDrafts();
    const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "journal-node-drafts.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setAdminMessage("Draft export generated.");
  }

  function activeAdminToken() {
    return $all("[data-admin-token]")
      .map((input) => String(input.value || "").trim())
      .find(Boolean) || "";
  }

  function bindAdminTokenSync() {
    const inputs = $all("[data-admin-token]");
    inputs.forEach((input) => {
      if (input.dataset.tokenSyncBound) return;
      input.dataset.tokenSyncBound = "true";
      input.addEventListener("input", () => {
        inputs.forEach((other) => {
          if (other !== input) other.value = input.value;
        });
      });
    });
  }

  async function vaultFetch(path, options) {
    const token = activeAdminToken();
    if (!token) throw new Error("Admin token is required for vault access.");
    const headers = {
      "Authorization": "Bearer " + token,
      ...(options && options.headers ? options.headers : {})
    };
    const response = await fetch(API_VAULT_BASE + path, {
      cache: "no-store",
      ...(options || {}),
      headers
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Vault API request failed.");
    return body;
  }

  function setVaultMessage(message) {
    const element = $("[data-vault-message]");
    if (element) element.textContent = message;
  }

  function formatBytes(value) {
    const size = Number(value || 0);
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return Math.round(size / 1024) + " KB";
    return (size / 1024 / 1024).toFixed(1) + " MB";
  }

  function formatSync(sync) {
    if (!sync || !sync.message) return "Not run";
    return sync.at ? sync.message + " / " + new Date(sync.at).toLocaleString() : sync.message;
  }

  function renderVaultStatus(status) {
    const remote = $("[data-vault-remote]");
    const branch = $("[data-vault-branch]");
    const autoSync = $("[data-vault-auto-sync]");
    const lastSync = $("[data-vault-last-sync]");
    if (remote) remote.textContent = status.remoteConfigured ? "Configured" : "Not configured";
    if (branch) branch.textContent = status.branch || "main";
    if (autoSync) autoSync.textContent = status.autoSync ? "On" : "Off";
    if (lastSync) lastSync.textContent = formatSync(status.lastSync);
  }

  function renderVaultFiles(files) {
    const list = $("[data-vault-file-list]");
    if (!list) return;
    list.textContent = "";
    if (!files.length) {
      const empty = document.createElement("p");
      empty.className = "admin-message";
      empty.textContent = "No vault files yet.";
      list.append(empty);
      return;
    }
    files
      .slice()
      .sort((a, b) => String(a.path).localeCompare(String(b.path)))
      .forEach((file) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "vault-file-item";
        const title = document.createElement("strong");
        const meta = document.createElement("span");
        title.textContent = file.path;
        meta.textContent = formatBytes(file.size) + " / " + new Date(file.updated).toLocaleString();
        button.append(title, meta);
        button.addEventListener("click", () => loadVaultFile(file.path));
        list.append(button);
      });
  }

  async function refreshVault(options) {
    try {
      const [status, fileBody] = await Promise.all([
        vaultFetch("/status"),
        vaultFetch("/files")
      ]);
      renderVaultStatus(status);
      renderVaultFiles(Array.isArray(fileBody.files) ? fileBody.files : []);
      if (!options || !options.silent) setVaultMessage("Vault status refreshed.");
    } catch (error) {
      setVaultMessage(error.message);
    }
  }

  async function loadVaultFile(pathname) {
    const form = $("[data-vault-form]");
    if (!form) return;
    try {
      const file = await vaultFetch("/file?path=" + encodeURIComponent(pathname));
      form.elements.path.value = file.path;
      form.elements.content.value = file.content;
      setVaultMessage("Loaded " + file.path + ".");
    } catch (error) {
      setVaultMessage(error.message);
    }
  }

  function yamlQuote(value) {
    return "\"" + String(value || "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
  }

  function buildVaultMarkdownFromNode() {
    const nodeForm = $("[data-admin-form]");
    const vaultForm = $("[data-vault-form]");
    if (!nodeForm || !vaultForm) return;
    const payload = formPayload(nodeForm);
    if (!payload.title || !payload.summary) {
      setVaultMessage("Title and summary are required before generating Markdown.");
      return;
    }
    const frontmatter = [
      "---",
      "title: " + yamlQuote(payload.title),
      "graph_id: " + yamlQuote(payload.id),
      "category: " + yamlQuote(payload.category),
      "kind: " + yamlQuote(payload.kind),
      "status: draft",
      "links: [" + payload.links.map(yamlQuote).join(", ") + "]",
      "---"
    ].join("\n");
    const content = [
      frontmatter,
      "",
      "# " + payload.title,
      "",
      payload.summary,
      "",
      ...(payload.body || [])
    ].filter((item) => item !== "").join("\n\n");
    vaultForm.elements.path.value = "Public/" + payload.id + ".md";
    vaultForm.elements.content.value = content;
    setVaultMessage("Node form converted to vault Markdown.");
  }

  async function saveVaultFile(form) {
    const formData = new FormData(form);
    const payload = {
      path: String(formData.get("path") || "").trim(),
      content: String(formData.get("content") || ""),
      encoding: "utf8"
    };
    try {
      const body = await vaultFetch("/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await refreshVault({ silent: true });
      setVaultMessage(body.warning || (body.sync && body.sync.message) || "Vault file saved.");
    } catch (error) {
      setVaultMessage(error.message);
    }
  }

  function safeResourceName(name) {
    return String(name || "resource")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "") || "resource";
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  }

  async function uploadVaultResource(form) {
    const formData = new FormData(form);
    const file = formData.get("asset");
    if (!(file instanceof File) || !file.name) {
      setVaultMessage("Choose a resource file first.");
      return;
    }
    const pathname = String(formData.get("path") || "").trim() || "Resources/" + safeResourceName(file.name);
    try {
      const payload = {
        path: pathname,
        content: arrayBufferToBase64(await file.arrayBuffer()),
        encoding: "base64"
      };
      const body = await vaultFetch("/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      form.reset();
      await refreshVault({ silent: true });
      setVaultMessage(body.warning || (body.sync && body.sync.message) || "Vault resource uploaded.");
    } catch (error) {
      setVaultMessage(error.message);
    }
  }

  async function syncVaultNow() {
    try {
      const body = await vaultFetch("/sync", { method: "POST" });
      await refreshVault({ silent: true });
      setVaultMessage(body.sync && body.sync.message ? body.sync.message : "Vault sync complete.");
    } catch (error) {
      setVaultMessage(error.message);
    }
  }

  function initVaultTools() {
    const form = $("[data-vault-form]");
    if (!form) return;
    bindAdminTokenSync();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveVaultFile(form);
    });
    const buildButton = $("[data-build-vault-note]");
    if (buildButton) buildButton.addEventListener("click", buildVaultMarkdownFromNode);
    const syncButton = $("[data-vault-sync]");
    if (syncButton) syncButton.addEventListener("click", syncVaultNow);
    const clearButton = $("[data-vault-clear]");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        form.elements.path.value = "";
        form.elements.content.value = "";
        setVaultMessage("Vault editor cleared.");
      });
    }
    const refreshButton = $("[data-refresh-vault]");
    if (refreshButton) refreshButton.addEventListener("click", refreshVault);
    const assetForm = $("[data-vault-asset-form]");
    if (assetForm) {
      const fileInput = assetForm.elements.asset;
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        if (file && !assetForm.elements.path.value.trim()) {
          assetForm.elements.path.value = "Resources/" + safeResourceName(file.name);
        }
      });
      assetForm.addEventListener("submit", (event) => {
        event.preventDefault();
        uploadVaultResource(assetForm);
      });
    }
    setVaultMessage("Enter the admin token to load vault status.");
  }

  async function initAdminPage() {
    const form = $("[data-admin-form]");
    if (!form) return;
    bindAdminTokenSync();
    try {
      hydrateGraphData(await loadAllData());
      fillExistingNodeSelect(form);
      const requested = new URLSearchParams(window.location.search).get("node");
      if (requested) loadNodeIntoForm(form, requested);
    } catch (error) {
      setAdminMessage(error.message);
    }
    $("[data-existing-node]", form).addEventListener("change", (event) => {
      loadNodeIntoForm(form, event.target.value);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitNode(form);
    });
    $("[data-save-draft]").addEventListener("click", () => saveDraftFromForm(form));
    $("[data-export-drafts]").addEventListener("click", exportDrafts);
    $("[data-clear-form]").addEventListener("click", () => loadNodeIntoForm(form, ""));
    renderDrafts();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGraphPage();
    initAdminPage();
    initVaultTools();
  });
})();
