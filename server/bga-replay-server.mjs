import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 4175);
const JOB_ROOT = path.resolve(process.env.BGA_REPLAY_JOB_DIR || path.join(REPO_ROOT, ".bga-replay-jobs"));
const CRAWLER_PATH = path.join(REPO_ROOT, "tools", "bga-replay-crawler.mjs");
const jobs = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanTableId(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function publicJob(job) {
  return {
    jobId: job.jobId,
    tableId: job.tableId,
    status: job.status,
    error: job.error || "",
    compatibility: job.compatibility || null,
    importable: !!job.importable,
    downloadUrl: job.status === "done" ? `/api/bga/replay/${encodeURIComponent(job.jobId)}/download` : ""
  };
}

function createJob(tableId) {
  const jobId = `${tableId}-${Date.now().toString(36)}`;
  const jobDir = path.join(JOB_ROOT, jobId);
  const outputPath = path.join(jobDir, `bga-table-${tableId}-replay.json`);
  const job = {
    jobId,
    tableId,
    jobDir,
    outputPath,
    status: "queued",
    error: "",
    compatibility: null,
    importable: false,
    createdAt: new Date().toISOString()
  };
  jobs.set(jobId, job);
  runJob(job);
  return job;
}

async function runJob(job) {
  job.status = "running";
  await mkdir(job.jobDir, { recursive: true });
  const args = [
    CRAWLER_PATH,
    "--table",
    job.tableId,
    "--out",
    job.jobDir,
    "--headless"
  ];
  const child = spawn(process.execPath, args, {
    cwd: REPO_ROOT,
    env: Object.assign({}, process.env, {
      PLAYWRIGHT_NODE_MODULES: path.join(__dirname, "node_modules")
    }),
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
  });
  child.on("error", (error) => {
    job.status = "failed";
    job.error = error.message;
  });
  child.on("exit", async (code) => {
    if (code !== 0) {
      job.status = "failed";
      job.error = stderr.trim() || `crawler exited with code ${code}`;
      return;
    }
    try {
      const payload = JSON.parse(await readFile(job.outputPath, "utf8"));
      job.compatibility = payload.compatibility || null;
      job.importable = !!(payload.compatibility && payload.compatibility.importable_by_current_zephyrlabs_viewer);
      job.status = "done";
    } catch (error) {
      job.status = "failed";
      job.error = error.message;
    }
  });
}

async function handleApi(req, res, url) {
  if (req.method === "POST" && url.pathname === "/api/bga/replay") {
    let parsed = {};
    try {
      parsed = JSON.parse(await readRequestBody(req) || "{}");
    } catch {
      sendJson(res, 400, { error: "invalid JSON body" });
      return;
    }
    const tableId = cleanTableId(parsed.tableId);
    if (!tableId) {
      sendJson(res, 400, { error: "numeric tableId is required" });
      return;
    }
    const job = createJob(tableId);
    sendJson(res, 202, publicJob(job));
    return;
  }

  const match = url.pathname.match(/^\/api\/bga\/replay\/([^/]+)(?:\/download)?$/);
  if (!match) {
    sendJson(res, 404, { error: "not found" });
    return;
  }
  const jobId = decodeURIComponent(match[1]);
  const job = jobs.get(jobId);
  if (!job) {
    sendJson(res, 404, { error: "unknown job" });
    return;
  }
  if (url.pathname.endsWith("/download")) {
    if (job.status !== "done") {
      sendJson(res, 409, publicJob(job));
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="bga-table-${job.tableId}-replay.json"`
    });
    createReadStream(job.outputPath).pipe(res);
    return;
  }
  sendJson(res, 200, publicJob(job));
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const resolved = path.resolve(REPO_ROOT, pathname.slice(1));
  if (!resolved.startsWith(REPO_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const info = await stat(resolved);
    const filePath = info.isDirectory() ? path.join(resolved, "index.html") : resolved;
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

mkdir(JOB_ROOT, { recursive: true }).then(() => {
  server.listen(PORT, () => {
    console.log(`ZephyrLabs BGA replay server listening on http://127.0.0.1:${PORT}`);
    console.log("Run npm install in ./server and npm run install-browser before using the crawler API.");
  });
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
