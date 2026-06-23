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
const ADMIN_UI_ENABLED = process.env.JOURNAL_ENABLE_ADMIN_UI === "1";
const ADMIN_UI_PATH = path.join(__dirname, "admin", "journal-admin.html");
const ADMIN_ALLOWED_ORIGIN = process.env.JOURNAL_ADMIN_ORIGIN || "";
const PORT = Number(process.env.PORT || 8787);
const MAX_BODY_BYTES = Number(process.env.JOURNAL_MAX_BODY_BYTES || 4 * 1024 * 1024);
const MAX_NODE_BODY_BYTES = Number(process.env.JOURNAL_MAX_NODE_BODY_BYTES || 64 * 1024);
const MAX_VAULT_FILE_BYTES = Number(process.env.JOURNAL_MAX_VAULT_FILE_BYTES || 3 * 1024 * 1024);
const MAX_LISTED_VAULT_FILES = 500;
const ADMIN_RATE_WINDOW_MS = Number(process.env.JOURNAL_ADMIN_RATE_WINDOW_MS || 10 * 60 * 1000);
const ADMIN_RATE_MAX = Number(process.env.JOURNAL_ADMIN_RATE_MAX || 60);
const adminRateBuckets = new Map();
const ALLOWED_VAULT_EXTENSIONS = new Set([".md", ".txt", ".json", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".pdf"]);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".pdf": "application/pdf"
};

const LEAK_PATTERN = /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|BEGIN (?:RSA|OPENSSH|PRIVATE) KEY|api[_ -]?key|secret|password|token|C:\\|G:\\|\/home\/|\/Users\/|\/opt\/|\/var\/www|bilibili|space\.bilibili)/i;
let baseGraph = null;
let baseNodeIds = null;
let lastVaultSync = {
  state: "idle",
  message: "Vault sync has not run.",
  at: null
};

function securityHeaders(headers = {}) {
  return {
    "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://images-api.nasa.gov https://images-assets.nasa.gov; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    ...headers
  };
}

function sendJson(response, status, body) {
  response.writeHead(status, securityHeaders({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }));
  response.end(JSON.stringify(body));
}

function sendText(response, status, body) {
  response.writeHead(status, securityHeaders({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  }));
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
  if (parts.some((part) => part === "." || part === ".." || part.startsWith("."))) {
    throw new Error("Vault file path contains an unsafe segment.");
  }
  const normalized = parts.join("/");
  if (normalized.length > 220) throw new Error("Vault file path is too long.");
  const extension = path.extname(normalized).toLowerCase();
  if (!ALLOWED_VAULT_EXTENSIONS.has(extension)) {
    throw new Error("Vault file type is not allowed.");
  }
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

function validateVaultBuffer(buffer, relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  const head = buffer.subarray(0, 16);
  const startsWith = (bytes) => bytes.every((byte, index) => head[index] === byte);
  if ([".md", ".txt", ".json"].includes(extension)) {
    if (buffer.includes(0)) throw new Error("Text vault files may not contain NUL bytes.");
    if (extension === ".json") JSON.parse(buffer.toString("utf8"));
    return;
  }
  if (extension === ".png" && !startsWith([0x89, 0x50, 0x4e, 0x47])) throw new Error("PNG resource has an invalid file signature.");
  if ((extension === ".jpg" || extension === ".jpeg") && !startsWith([0xff, 0xd8, 0xff])) throw new Error("JPEG resource has an invalid file signature.");
  if (extension === ".gif" && !startsWith([0x47, 0x49, 0x46, 0x38])) throw new Error("GIF resource has an invalid file signature.");
  if (extension === ".pdf" && !startsWith([0x25, 0x50, 0x44, 0x46])) throw new Error("PDF resource has an invalid file signature.");
  if (extension === ".webp" && !(buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP")) {
    throw new Error("WebP resource has an invalid file signature.");
  }
  if (extension === ".avif" && buffer.subarray(4, 12).toString("ascii").indexOf("ftyp") === -1) {
    throw new Error("AVIF resource has an invalid file signature.");
  }
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
  const extension = path.extname(relativePath).toLowerCase();
  if (![".md", ".txt", ".json"].includes(extension)) throw new Error("Only text vault files can be loaded in the editor.");
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
  assertAllowedKeys(payload, new Set(["path", "content", "encoding"]), "vault file");
  const { relativePath, target } = resolveVaultPath(payload.path);
  const encoding = payload.encoding === "base64" ? "base64" : "utf8";
  if (encoding === "base64" && !/^[A-Za-z0-9+/]+={0,2}$/.test(String(payload.content || "").replace(/\s+/g, ""))) {
    throw new Error("Vault resource content is not valid base64.");
  }
  const buffer = encoding === "base64"
    ? Buffer.from(String(payload.content || "").replace(/\s+/g, ""), "base64")
    : Buffer.from(String(payload.content ?? ""), "utf8");
  if (!buffer.length) throw new Error("Vault file content is required.");
  if (buffer.length > MAX_VAULT_FILE_BYTES) throw new Error("Vault file is too large.");
  validateVaultBuffer(buffer, relativePath);
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

function clientIp(request) {
  return request.socket && request.socket.remoteAddress ? request.socket.remoteAddress : "unknown";
}

function auditAdmin(request, action, status) {
  console.warn(JSON.stringify({
    at: new Date().toISOString(),
    event: "journal-admin-api",
    action,
    status,
    method: request.method,
    path: new URL(request.url, "http://localhost").pathname,
    ip: clientIp(request)
  }));
}

function rateLimitAdmin(request) {
  const now = Date.now();
  const key = clientIp(request);
  const bucket = adminRateBuckets.get(key) || { resetAt: now + ADMIN_RATE_WINDOW_MS, count: 0 };
  if (bucket.resetAt <= now) {
    bucket.resetAt = now + ADMIN_RATE_WINDOW_MS;
    bucket.count = 0;
  }
  bucket.count += 1;
  adminRateBuckets.set(key, bucket);
  return bucket.count <= ADMIN_RATE_MAX;
}

function adminRequestAllowed(request, response, action) {
  if (!rateLimitAdmin(request)) {
    auditAdmin(request, action, "rate-limited");
    sendJson(response, 429, { error: "Too many admin requests. Try again later." });
    return false;
  }
  return true;
}

function sameOriginWriteAllowed(request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return true;
  const origin = request.headers.origin || "";
  const secFetchSite = request.headers["sec-fetch-site"] || "";
  if (secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) return false;
  if (!origin) return true;
  if (ADMIN_ALLOWED_ORIGIN && origin === ADMIN_ALLOWED_ORIGIN) return true;
  const host = request.headers["x-forwarded-host"] || request.headers.host || "";
  const proto = request.headers["x-forwarded-proto"] || "http";
  return Boolean(host) && origin === proto + "://" + host;
}

function requireWriteGuards(request, response, action) {
  if (!sameOriginWriteAllowed(request)) {
    auditAdmin(request, action, "bad-origin");
    sendJson(response, 403, { error: "Cross-site admin writes are not allowed." });
    return false;
  }
  const contentType = request.headers["content-type"] || "";
  if (["POST", "PUT", "PATCH"].includes(request.method) && !contentType.toLowerCase().includes("application/json")) {
    auditAdmin(request, action, "bad-content-type");
    sendJson(response, 415, { error: "Admin writes require application/json." });
    return false;
  }
  return true;
}

function assertAllowedKeys(payload, allowed, label) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error(label + " payload must be an object.");
  const unknown = Object.keys(payload).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(label + " payload contains unsupported fields: " + unknown.join(", "));
}

function readBody(request, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBytes) {
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
  assertAllowedKeys(payload, new Set(["id", "title", "category", "kind", "status", "summary", "body", "links", "source"]), "journal node");
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

function publicNode(node) {
  const body = Array.isArray(node.body)
    ? node.body.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8)
    : typeof node.body === "string" && node.body.trim()
      ? [node.body.trim()]
      : [];
  return {
    id: String(node.id || ""),
    title: String(node.title || node.id || ""),
    category: String(node.category || "public"),
    kind: String(node.kind || "note"),
    status: String(node.status || "public"),
    summary: String(node.summary || ""),
    body,
    route: typeof node.route === "string" && !/^(?:[a-z]+:|\/\/)/i.test(node.route) ? node.route : ""
  };
}

function publicLinks(links, nodeIds) {
  const seen = new Set();
  return (links || [])
    .filter((link) => link && nodeIds.has(link.source) && nodeIds.has(link.target))
    .map((link) => ({
      source: String(link.source),
      target: String(link.target),
      kind: String(link.kind || "related")
    }))
    .filter((link) => {
      const key = link.source + "->" + link.target + ":" + link.kind;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function publicGraph(graph) {
  const nodes = (graph.nodes || [])
    .map(publicNode)
    .filter((node) => node.id && node.title && node.summary);
  const ids = new Set(nodes.map((node) => node.id));
  return {
    generatedAt: graph.generatedAt || null,
    categories: Array.isArray(graph.categories) ? graph.categories : [],
    nodes,
    links: publicLinks(graph.links || [], ids)
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
  const graph = publicGraph(await currentGraph());
  const nodes = orderedGraphNodes(graph.nodes);
  response.writeHead(200, securityHeaders({
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }));

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
  if (!adminRequestAllowed(request, response, "vault")) return;
  if (!authorized(request)) {
    auditAdmin(request, "vault", "unauthorized");
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
    if (!requireWriteGuards(request, response, "vault:file")) return;
    try {
      const payload = JSON.parse(await readBody(request));
      const file = await writeVaultFile(payload);
      if (!VAULT_AUTO_SYNC) {
        auditAdmin(request, "vault:file", "saved");
        sendJson(response, 200, { saved: true, file, sync: lastVaultSync });
        return;
      }
      try {
        const sync = await syncVault();
        auditAdmin(request, "vault:file", "saved");
        sendJson(response, 200, { saved: true, file, sync });
      } catch (error) {
        auditAdmin(request, "vault:file", "saved-sync-warning");
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
    if (!requireWriteGuards(request, response, "vault:sync")) return;
    try {
      auditAdmin(request, "vault:sync", "requested");
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
      const graph = publicGraph(await currentGraph());
      sendJson(response, 200, {
        graph
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
    const store = await readStore();
    const publicStore = publicGraph({ nodes: store.nodes, links: store.links, categories: [] });
    sendJson(response, 200, { nodes: publicStore.nodes, links: publicStore.links });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!adminRequestAllowed(request, response, "journal:nodes")) return;
  if (!authorized(request)) {
    auditAdmin(request, "journal:nodes", "unauthorized");
    sendJson(response, 401, { error: "Admin token is required." });
    return;
  }
  if (!requireWriteGuards(request, response, "journal:nodes")) return;

  try {
    const payload = JSON.parse(await readBody(request, MAX_NODE_BODY_BYTES));
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
    auditAdmin(request, "journal:nodes", existingIndex === -1 ? "created" : "updated");
    sendJson(response, existingIndex === -1 ? 201 : 200, { node, links });
  } catch (error) {
    sendJson(response, error instanceof SyntaxError ? 400 : 422, { error: error.message });
  }
}

async function serveStatic(response, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/journal-admin.html" || pathname.startsWith("/journal-backend/") || pathname.startsWith("/docs/") || pathname.startsWith("/test/") || ["/README.md", "/package.json", "/package-lock.json"].includes(pathname)) {
    sendText(response, 404, "Not found");
    return;
  }
  const requested = path.resolve(PUBLIC_ROOT, "." + pathname);
  if (!requested.startsWith(PUBLIC_ROOT)) {
    sendText(response, 403, "Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(requested);
    const filePath = stat.isDirectory() ? path.join(requested, "index.html") : requested;
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, securityHeaders({
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=120"
    }));
    response.end(await fs.readFile(filePath));
  } catch (error) {
    sendText(response, error.code === "ENOENT" ? 404 : 500, error.code === "ENOENT" ? "Not found" : "Server error");
  }
}

async function serveAdminUi(response) {
  if (!ADMIN_UI_ENABLED) {
    sendText(response, 404, "Not found");
    return;
  }
  response.writeHead(200, securityHeaders({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  }));
  response.end(await fs.readFile(ADMIN_UI_PATH));
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
  if (url.pathname === "/admin/journal-admin.html") {
    serveAdminUi(response).catch((error) => sendText(response, 500, error.message));
    return;
  }
  serveStatic(response, url).catch((error) => sendText(response, 500, error.message));
});

server.listen(PORT, () => {
  console.log("Journal server listening on http://localhost:" + PORT);
});
