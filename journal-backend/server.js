"use strict";

const { execFile } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const PUBLIC_ROOT = path.resolve(__dirname, "..");
const STORE_PATH = path.resolve(process.env.JOURNAL_STORE_PATH || path.join(__dirname, "journal-store.json"));
const VAULT_PATH = path.resolve(process.env.JOURNAL_VAULT_PATH || path.join(__dirname, "vault-private"));
const VAULT_GIT_REMOTE = process.env.JOURNAL_VAULT_GIT_REMOTE || "";
const VAULT_GIT_BRANCH = process.env.JOURNAL_VAULT_GIT_BRANCH || "main";
const VAULT_AUTO_SYNC = process.env.JOURNAL_VAULT_GIT_AUTO_SYNC !== "0";
const VAULT_GIT_AUTHOR_NAME = process.env.JOURNAL_VAULT_GIT_AUTHOR_NAME || "ZephyrLabs Journal Bot";
const VAULT_GIT_AUTHOR_EMAIL = process.env.JOURNAL_VAULT_GIT_AUTHOR_EMAIL || "journal-bot@example.invalid";
const ADMIN_TOKEN = process.env.JOURNAL_ADMIN_TOKEN || "";
const PORT = Number(process.env.PORT || 8787);
const MAX_BODY_BYTES = Number(process.env.JOURNAL_MAX_BODY_BYTES || 4 * 1024 * 1024);
const MAX_VAULT_FILE_BYTES = Number(process.env.JOURNAL_MAX_VAULT_FILE_BYTES || 3 * 1024 * 1024);
const MAX_LISTED_VAULT_FILES = 500;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const LEAK_PATTERN = /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|BEGIN (?:RSA|OPENSSH|PRIVATE) KEY|api[_ -]?key|secret|password|token|C:\\|G:\\|\/home\/|\/Users\/|\/opt\/|\/var\/www|bilibili|space\.bilibili)/i;
let baseGraph = null;
let baseNodeIds = null;
let lastVaultSync = {
  state: "idle",
  message: "Vault sync has not run.",
  at: null
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function sendText(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readStore() {
  try {
    const parsed = JSON.parse(await fs.readFile(STORE_PATH, "utf8"));
    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      links: Array.isArray(parsed.links) ? parsed.links : []
    };
  } catch (error) {
    if (error.code === "ENOENT") return { nodes: [], links: [] };
    throw error;
  }
}

async function readBaseNodeIds() {
  if (baseNodeIds) return baseNodeIds;
  const graph = await readBaseGraph();
  baseNodeIds = new Set(Array.isArray(graph.nodes) ? graph.nodes.map((node) => node.id).filter(Boolean) : []);
  return baseNodeIds;
}

async function readBaseGraph() {
  if (baseGraph) return baseGraph;
  try {
    baseGraph = JSON.parse(await fs.readFile(path.join(PUBLIC_ROOT, "journal-data.json"), "utf8"));
    return baseGraph;
  } catch (_error) {
    baseGraph = { nodes: [], links: [], categories: [] };
    return baseGraph;
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const tempPath = STORE_PATH + ".tmp";
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2) + "\n", "utf8");
  await fs.rename(tempPath, STORE_PATH);
}

async function pathExists(target) {
  try {
    await fs.stat(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function normalizeVaultPath(value) {
  const raw = String(value || "").trim().replace(/\\/g, "/");
  if (!raw) throw new Error("Vault file path is required.");
  if (raw.includes("\0") || raw.startsWith("/") || /^[a-z]:/i.test(raw)) {
    throw new Error("Vault file path must be relative.");
  }
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) throw new Error("Vault file path is required.");
  if (parts.some((part) => part === "." || part === ".." || part === ".git")) {
    throw new Error("Vault file path contains an unsafe segment.");
  }
  const normalized = parts.join("/");
  if (normalized.length > 220) throw new Error("Vault file path is too long.");
  return normalized;
}

function resolveVaultPath(value) {
  const relativePath = normalizeVaultPath(value);
  const target = path.resolve(VAULT_PATH, ...relativePath.split("/"));
  const relative = path.relative(VAULT_PATH, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Vault file path escapes the vault.");
  }
  return { relativePath, target };
}

function vaultDisplayPath(target) {
  return path.relative(VAULT_PATH, target).split(path.sep).join("/");
}

async function listVaultFiles() {
  const files = [];

  async function walk(directory) {
    if (files.length >= MAX_LISTED_VAULT_FILES) return;
    let entries = [];
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (files.length >= MAX_LISTED_VAULT_FILES) return;
      if (entry.name === ".git") continue;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(target);
        continue;
      }
      if (!entry.isFile()) continue;
      const stat = await fs.stat(target);
      files.push({
        path: vaultDisplayPath(target),
        size: stat.size,
        updated: stat.mtime.toISOString()
      });
    }
  }

  await walk(VAULT_PATH);
  return files;
}

async function readVaultFile(pathname) {
  const { relativePath, target } = resolveVaultPath(pathname);
  const stat = await fs.stat(target);
  if (!stat.isFile()) throw new Error("Vault path is not a file.");
  if (stat.size > MAX_VAULT_FILE_BYTES) throw new Error("Vault file is too large to load in the editor.");
  return {
    path: relativePath,
    size: stat.size,
    updated: stat.mtime.toISOString(),
    content: await fs.readFile(target, "utf8")
  };
}

async function writeVaultFile(payload) {
  const { relativePath, target } = resolveVaultPath(payload.path);
  const encoding = payload.encoding === "base64" ? "base64" : "utf8";
  const buffer = encoding === "base64"
    ? Buffer.from(String(payload.content || ""), "base64")
    : Buffer.from(String(payload.content ?? ""), "utf8");
  if (!buffer.length) throw new Error("Vault file content is required.");
  if (buffer.length > MAX_VAULT_FILE_BYTES) throw new Error("Vault file is too large.");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  const stat = await fs.stat(target);
  return {
    path: relativePath,
    size: stat.size,
    updated: stat.mtime.toISOString()
  };
}

function compactGitMessage(value) {
  return String(value || "")
    .replace(/https?:\/\/[^@\s]+@/g, "https://***@")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-2)
    .join(" ")
    .slice(0, 240);
}

function runGit(args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile("git", args, {
      cwd: options.cwd || VAULT_PATH,
      timeout: options.timeout || 120000,
      windowsHide: true,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      const result = {
        ok: !error,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
        code: error && typeof error.code !== "undefined" ? error.code : 0
      };
      if (!error || options.allowFail) {
        resolve(result);
        return;
      }
      reject(new Error(compactGitMessage(stderr || stdout) || error.message));
    });
  });
}

async function ensureVaultGit() {
  await fs.mkdir(VAULT_PATH, { recursive: true });
  const repoCheck = await runGit(["rev-parse", "--is-inside-work-tree"], { allowFail: true });
  if (!repoCheck.ok || repoCheck.stdout.trim() !== "true") {
    await runGit(["init"]);
    await runGit(["checkout", "-B", VAULT_GIT_BRANCH], { allowFail: true });
  }

  await runGit(["config", "user.name", VAULT_GIT_AUTHOR_NAME]);
  await runGit(["config", "user.email", VAULT_GIT_AUTHOR_EMAIL]);

  if (VAULT_GIT_REMOTE) {
    const remote = await runGit(["remote", "get-url", "origin"], { allowFail: true });
    if (remote.ok) {
      await runGit(["remote", "set-url", "origin", VAULT_GIT_REMOTE]);
    } else {
      await runGit(["remote", "add", "origin", VAULT_GIT_REMOTE]);
    }
  }
}

function pullFailureIsEmptyRemote(result) {
  return /couldn't find remote ref|could not find remote ref|no such ref/i
    .test((result.stderr || "") + "\n" + (result.stdout || ""));
}

async function syncVault() {
  lastVaultSync = {
    state: "running",
    message: "Syncing vault.",
    at: new Date().toISOString()
  };

  try {
    await ensureVaultGit();
    if (VAULT_GIT_REMOTE) {
      const pull = await runGit(["pull", "--rebase", "--autostash", "origin", VAULT_GIT_BRANCH], { allowFail: true });
      if (!pull.ok && !pullFailureIsEmptyRemote(pull)) {
        throw new Error("Git pull failed: " + compactGitMessage(pull.stderr || pull.stdout));
      }
    }

    await runGit(["add", "-A"]);
    const status = await runGit(["status", "--porcelain"]);
    let committed = false;
    if (status.stdout.trim()) {
      await runGit(["commit", "-m", "Update journal vault"]);
      committed = true;
    }

    const hasHead = await runGit(["rev-parse", "--verify", "HEAD"], { allowFail: true });
    if (VAULT_GIT_REMOTE && hasHead.ok) {
      await runGit(["push", "-u", "origin", VAULT_GIT_BRANCH]);
    }

    lastVaultSync = {
      state: "ok",
      message: VAULT_GIT_REMOTE
        ? committed ? "Vault synced to GitHub." : "Vault already matches the GitHub remote."
        : committed ? "Vault committed locally; GitHub remote is not configured." : "Vault has no local changes.",
      at: new Date().toISOString()
    };
    return lastVaultSync;
  } catch (error) {
    lastVaultSync = {
      state: "error",
      message: error.message,
      at: new Date().toISOString()
    };
    throw error;
  }
}

async function vaultStatus() {
  const gitReady = await pathExists(path.join(VAULT_PATH, ".git"));
  const files = await listVaultFiles();
  return {
    pathConfigured: Boolean(process.env.JOURNAL_VAULT_PATH),
    remoteConfigured: Boolean(VAULT_GIT_REMOTE),
    branch: VAULT_GIT_BRANCH,
    autoSync: VAULT_AUTO_SYNC,
    gitReady,
    fileCount: files.length,
    lastSync: lastVaultSync
  };
}

function bearerToken(request) {
  const header = request.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : "";
}

function authorized(request) {
  if (!ADMIN_TOKEN) return false;
  const provided = Buffer.from(bearerToken(request));
  const expected = Buffer.from(ADMIN_TOKEN);
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function cleanText(value, field, maxLength) {
  const text = String(value || "").trim();
  if (!text) throw new Error(field + " is required.");
  if (text.length > maxLength) throw new Error(field + " is too long.");
  if (LEAK_PATTERN.test(text)) throw new Error(field + " appears to contain private or unsafe content.");
  return text;
}

function cleanBody(value) {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\n{2,}|\r?\n/)
      : [];
  return items
    .map((item, index) => cleanText(item, "body paragraph " + (index + 1), 700))
    .slice(0, 8);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function sanitizeNode(payload) {
  const title = cleanText(payload.title, "title", 80);
  const id = slugify(payload.id || title);
  if (!id) throw new Error("id is required.");
  const allowedCategories = new Set(["core", "ai", "research", "reflection", "practice", "language", "public"]);
  const category = allowedCategories.has(payload.category) ? payload.category : "public";
  return {
    id,
    title,
    category,
    kind: cleanText(payload.kind || "note", "kind", 40),
    status: "public",
    summary: cleanText(payload.summary, "summary", 420),
    body: cleanBody(payload.body),
    source: "journal-backend"
  };
}

function sanitizeLinks(payload, sourceId) {
  if (!Array.isArray(payload.links)) return [];
  return payload.links
    .map((target) => slugify(target))
    .filter(Boolean)
    .filter((target, index, items) => items.indexOf(target) === index && target !== sourceId)
    .map((target) => ({ source: sourceId, target, kind: "related" }));
}

async function currentGraph() {
  return mergeGraph(await readBaseGraph(), await readStore());
}

function mergeGraph(base, store) {
  const nodeMap = new Map();
  const links = [];

  function addNode(node) {
    if (!node || !node.id) return;
    nodeMap.set(node.id, { ...(nodeMap.get(node.id) || {}), ...node });
  }

  function addLinks(items) {
    (items || []).forEach((link) => {
      if (!link || !nodeMap.has(link.source) || !nodeMap.has(link.target)) return;
      links.push({ source: link.source, target: link.target, kind: link.kind || "related" });
    });
  }

  (base.nodes || []).forEach(addNode);
  (store.nodes || []).forEach(addNode);
  addLinks(base.links || []);
  addLinks(store.links || []);

  const seen = new Set();
  return {
    ...base,
    nodes: Array.from(nodeMap.values()),
    links: links.filter((link) => {
      const key = link.source + "->" + link.target + ":" + link.kind;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  };
}

function orderedGraphNodes(nodes) {
  const priority = new Map([
    ["zephyrlabs-journal", 0],
    ["research", 1],
    ["philosophy", 2],
    ["geminus", 3],
    ["snowboard", 4],
    ["ai", 5],
    ["language", 6]
  ]);
  return (nodes || []).slice().sort((a, b) => {
    const pa = priority.has(a.id) ? priority.get(a.id) : 20;
    const pb = priority.has(b.id) ? priority.get(b.id) : 20;
    return pa - pb || String(a.title || a.id).localeCompare(String(b.title || b.id));
  });
}

function publicStreamNode(node) {
  return {
    id: node.id,
    title: node.title || node.id,
    category: node.category || "public",
    kind: node.kind || "note",
    status: node.status || "public"
  };
}

async function writeStreamLine(response, payload) {
  if (response.destroyed) return false;
  const canContinue = response.write(JSON.stringify(payload) + "\n");
  if (!canContinue) await new Promise((resolve) => response.once("drain", resolve));
  return !response.destroyed;
}

async function sendGraphStream(response) {
  const graph = await currentGraph();
  const nodes = orderedGraphNodes(graph.nodes);
  response.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });

  const alive = await writeStreamLine(response, {
    type: "meta",
    totalNodes: nodes.length,
    categories: graph.categories || [],
    links: graph.links || []
  });
  if (!alive) return;

  for (const node of nodes) {
    const stillAlive = await writeStreamLine(response, { type: "node", node: publicStreamNode(node) });
    if (!stillAlive) return;
    await sleep(12);
  }
  response.end();
}

async function handleVaultApi(request, response, url) {
  if (!authorized(request)) {
    sendJson(response, 401, { error: "Admin token is required for vault access." });
    return;
  }

  if (url.pathname === "/api/journal/vault/status") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }
    sendJson(response, 200, await vaultStatus());
    return;
  }

  if (url.pathname === "/api/journal/vault/files") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }
    sendJson(response, 200, { files: await listVaultFiles() });
    return;
  }

  if (url.pathname === "/api/journal/vault/file" && request.method === "GET") {
    const pathname = url.searchParams.get("path") || "";
    try {
      sendJson(response, 200, await readVaultFile(pathname));
    } catch (error) {
      sendJson(response, 404, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/journal/vault/file" && request.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(request));
      const file = await writeVaultFile(payload);
      if (!VAULT_AUTO_SYNC) {
        sendJson(response, 200, { saved: true, file, sync: lastVaultSync });
        return;
      }
      try {
        const sync = await syncVault();
        sendJson(response, 200, { saved: true, file, sync });
      } catch (error) {
        sendJson(response, 202, { saved: true, file, sync: lastVaultSync, warning: error.message });
      }
    } catch (error) {
      sendJson(response, error instanceof SyntaxError ? 400 : 422, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/journal/vault/sync") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }
    try {
      sendJson(response, 200, { sync: await syncVault() });
    } catch (error) {
      sendJson(response, 502, { error: error.message, sync: lastVaultSync });
    }
    return;
  }

  sendJson(response, 404, { error: "Unknown vault API route." });
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname === "/api/journal/graph/stream") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }
    await sendGraphStream(response);
    return;
  }

  if (url.pathname === "/api/journal/graph") {
    if (request.method === "GET") {
      const graph = await currentGraph();
      sendJson(response, 200, {
        graph,
        overrides: await readStore()
      });
      return;
    }

    sendJson(response, 405, { error: "Use /api/journal/nodes to add or update one public node at a time." });
    return;
  }

  if (url.pathname.startsWith("/api/journal/vault")) {
    await handleVaultApi(request, response, url);
    return;
  }

  if (url.pathname !== "/api/journal/nodes") {
    sendJson(response, 404, { error: "Unknown API route." });
    return;
  }

  if (request.method === "GET") {
    sendJson(response, 200, await readStore());
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!authorized(request)) {
    sendJson(response, 401, { error: "Admin token is required." });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(request));
    const node = sanitizeNode(payload);
    const store = await readStore();
    const knownTargets = new Set([...store.nodes.map((item) => item.id), ...await readBaseNodeIds()]);
    const links = sanitizeLinks(payload, node.id).filter((link) => knownTargets.has(link.target));
    const existingIndex = store.nodes.findIndex((item) => item.id === node.id);
    if (existingIndex === -1) {
      store.nodes.push(node);
    } else {
      store.nodes[existingIndex] = node;
    }
    store.links = store.links.filter((link) => link.source !== node.id);
    store.links.push(...links);
    await writeStore(store);
    sendJson(response, existingIndex === -1 ? 201 : 200, { node, links });
  } catch (error) {
    sendJson(response, error instanceof SyntaxError ? 400 : 422, { error: error.message });
  }
}

async function serveStatic(response, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const requested = path.resolve(PUBLIC_ROOT, "." + pathname);
  if (!requested.startsWith(PUBLIC_ROOT)) {
    sendText(response, 403, "Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(requested);
    const filePath = stat.isDirectory() ? path.join(requested, "index.html") : requested;
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=120"
    });
    response.end(await fs.readFile(filePath));
  } catch (error) {
    sendText(response, error.code === "ENOENT" ? 404 : 500, error.code === "ENOENT" ? "Not found" : "Server error");
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    handleApi(request, response, url).catch((error) => sendJson(response, 500, { error: error.message }));
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed");
    return;
  }
  serveStatic(response, url).catch((error) => sendText(response, 500, error.message));
});

server.listen(PORT, () => {
  console.log("Journal server listening on http://localhost:" + PORT);
});
