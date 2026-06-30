"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const fsp = fs.promises;

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const PUBLIC_FILES = [
  "journal-data.json",
  "robots.txt",
  "sitemap.xml",
  "site-config.json"
];

const PUBLIC_DIRS = [
  ".well-known"
];

const PUBLIC_ASSET_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".webp"
]);

const ASSET_REFERENCE_PATTERN = /((?:\.\.\/|\/)?assets\/[^"'`)<>\s]+\.(?:avif|gif|jpe?g|png|svg|webp))(?:\?[^"'`)<>\s]*)?/gi;

const ENTRIES = [
  {
    source: "index.html",
    target: "index.html",
    bundleName: "home",
    bundleDir: "assets",
    styles: [
      { source: "styles.css", href: "styles.css" }
    ],
    scripts: [
      { source: "shared/effects.js", src: "shared/effects.js" },
      { source: "site-config.js", src: "site-config.js" },
      { source: "cinematic-stage.js", src: "cinematic-stage.js" },
      { source: "homepage-effects.js", src: "homepage-effects.js" },
      { source: "homepage-fixes.js", src: "homepage-fixes.js" }
    ]
  },
  {
    source: "journal.html",
    target: "journal.html",
    bundleName: "journal",
    bundleDir: "assets",
    styles: [
      { source: "styles.css", href: "styles.css" },
      { source: "journal.css", href: "journal.css" }
    ],
    scripts: [
      { source: "shared/effects.js", src: "shared/effects.js" },
      { source: "journal.js", src: "journal.js" }
    ]
  },
  {
    source: "gemtable/index.html",
    target: "gemtable/index.html",
    bundleName: "gemtable",
    bundleDir: "gemtable/assets",
    styles: [
      { source: "gemtable/styles.css", href: "styles.css" }
    ],
    scripts: [
      { source: "gemtable/modules/rules.js", src: "modules/rules.js" },
      { source: "site-config.js", src: "../site-config.js" },
      { source: "gemtable/app.js", src: "app.js", productionTransform: stripGemTableDebugHooks }
    ]
  }
];

function toWebPath(value) {
  return value.split(path.sep).join("/");
}

function fromRoot(relativePath) {
  return path.join(ROOT, relativePath);
}

function fromDist(relativePath) {
  return path.join(DIST, relativePath);
}

function escapeRegExp(value) {
  return String(value).replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

async function pathExists(target) {
  try {
    await fsp.lstat(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function removePath(target) {
  let stat;
  try {
    stat = await fsp.lstat(target);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  if (stat.isDirectory() && !stat.isSymbolicLink()) {
    const entries = await fsp.readdir(target);
    for (const entry of entries) {
      await removePath(path.join(target, entry));
    }
    await fsp.rmdir(target);
    return;
  }

  await fsp.unlink(target);
}

async function ensureDir(directory) {
  await fsp.mkdir(directory, { recursive: true });
}

async function readUtf8(relativePath) {
  return fsp.readFile(fromRoot(relativePath), "utf8");
}

async function writeDist(relativePath, data) {
  const target = fromDist(relativePath);
  await ensureDir(path.dirname(target));
  await fsp.writeFile(target, data);
}

async function copyFileToDist(relativePath, targetRelativePath) {
  const target = fromDist(targetRelativePath || relativePath);
  await ensureDir(path.dirname(target));
  await fsp.copyFile(fromRoot(relativePath), target);
}

async function copyDirectoryToDist(relativePath) {
  const source = fromRoot(relativePath);
  if (!(await pathExists(source))) return;

  async function walk(sourceDirectory, targetDirectory) {
    await ensureDir(targetDirectory);
    const entries = await fsp.readdir(sourceDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = path.join(sourceDirectory, entry.name);
      const targetPath = path.join(targetDirectory, entry.name);
      if (entry.isDirectory()) {
        await walk(sourcePath, targetPath);
      } else if (entry.isFile()) {
        await ensureDir(path.dirname(targetPath));
        await fsp.copyFile(sourcePath, targetPath);
      }
    }
  }

  await walk(source, fromDist(relativePath));
}

function normalizeAssetReference(reference) {
  let clean = String(reference || "").split(/[?#]/)[0].replace(/\\/g, "/");
  if (clean.charAt(0) === "/") clean = clean.slice(1);
  while (clean.indexOf("../") === 0) clean = clean.slice(3);

  const normalized = path.posix.normalize(clean);
  if (normalized.indexOf("..") !== -1 || normalized.indexOf("assets/") !== 0) return "";
  return normalized;
}

function assetReferenceSources() {
  const sources = new Set(PUBLIC_FILES.concat(["splendor-table.html"]));

  for (const entry of ENTRIES) {
    sources.add(entry.source);
    for (const style of entry.styles) sources.add(style.source);
    for (const script of entry.scripts) sources.add(script.source);
  }

  return Array.from(sources).sort();
}

async function collectReferencedAssets() {
  const assets = new Set();

  for (const sourcePath of assetReferenceSources()) {
    if (!(await pathExists(fromRoot(sourcePath)))) continue;

    const source = await readUtf8(sourcePath);
    ASSET_REFERENCE_PATTERN.lastIndex = 0;
    let match;
    while ((match = ASSET_REFERENCE_PATTERN.exec(source))) {
      const asset = normalizeAssetReference(match[1]);
      if (asset) assets.add(asset);
    }
  }

  return assets;
}

async function copyReferencedAssets(referencedAssets) {
  for (const asset of Array.from(referencedAssets).sort()) {
    const extension = path.extname(asset).toLowerCase();
    if (!PUBLIC_ASSET_EXTENSIONS.has(extension)) continue;
    await copyFileToDist(asset);
  }
}

function hashContent(data, length) {
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, length || 10);
}

function integrity(data) {
  return "sha384-" + crypto.createHash("sha384").update(data).digest("base64");
}

function hashedName(name, extension, data) {
  return name + "-" + hashContent(data, 10) + extension;
}

function relativeDistPath(fromRelativeFile, toRelativeFile) {
  return toWebPath(path.relative(path.dirname(fromDist(fromRelativeFile)), fromDist(toRelativeFile)));
}

function stripJsComments(source) {
  let output = "";
  let state = "code";
  let quote = "";
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (state === "lineComment") {
      if (char === "\n" || char === "\r") {
        output += "\n";
        state = "code";
      }
      continue;
    }

    if (state === "blockComment") {
      if (char === "*" && next === "/") {
        index += 1;
        output += " ";
        state = "code";
      }
      continue;
    }

    if (state === "string") {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        state = "code";
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      state = "string";
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      state = "lineComment";
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      state = "blockComment";
      index += 1;
      continue;
    }

    output += char;
  }

  return output;
}

function collapseJsWhitespace(source) {
  let output = "";
  let state = "code";
  let quote = "";
  let escaped = false;
  let pendingSpace = false;

  function emitPending() {
    if (pendingSpace && output && !/\s$/.test(output)) output += " ";
    pendingSpace = false;
  }

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (state === "string") {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        state = "code";
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      emitPending();
      quote = char;
      state = "string";
      output += char;
      continue;
    }

    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }

    emitPending();
    output += char;
  }

  return output.trim() + "\n";
}

function minifyJs(source) {
  return collapseJsWhitespace(stripJsComments(source).replace(/\/\/# sourceMappingURL=.*$/gm, ""));
}

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim() + "\n";
}

function minifyHtml(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+>/g, ">")
    .trim() + "\n";
}

function stripGemTableDebugHooks(source) {
  return source.replace(
    /  function installDebugHooks\(\) \{[\s\S]*?\r?\n  \}\r?\n\r?\n  function init\(\) \{/,
    "  function installDebugHooks() {}\n\n  function init() {"
  );
}

async function buildStyle(style) {
  const source = await readUtf8(style.source);
  const content = minifyCss(source);
  const extension = path.extname(style.source);
  const base = path.basename(style.source, extension);
  const outputName = hashedName(base, extension, content);
  const outputPath = style.outputPath || path.join("assets", outputName);
  await writeDist(outputPath, content);
  return {
    href: toWebPath(outputPath),
    integrity: integrity(content)
  };
}

async function buildBundle(entry) {
  const chunks = [];
  for (const script of entry.scripts) {
    let source = await readUtf8(script.source);
    if (script.productionTransform) source = script.productionTransform(source);
    chunks.push(source);
  }

  const content = minifyJs(chunks.join("\n;\n"));
  const outputName = hashedName(entry.bundleName, ".js", content);
  const outputPath = path.join(entry.bundleDir, outputName);
  await writeDist(outputPath, content);
  return {
    src: relativeDistPath(entry.target, outputPath),
    integrity: integrity(content)
  };
}

function replaceStylesheet(html, href, asset) {
  const pattern = new RegExp("<link\\b([^>]*?)href=\"" + escapeRegExp(href) + "(?:\\?[^\\\"]*)?\"([^>]*)>", "g");
  return html.replace(pattern, function (_match, before, after) {
    return "<link" + before + "href=\"" + asset.href + "\" integrity=\"" + asset.integrity + "\"" + after + ">";
  });
}

function removeScript(html, src) {
  const pattern = new RegExp("\\s*<script\\s+src=\"" + escapeRegExp(src) + "(?:\\?[^\\\"]*)?\"\\s*><\\/script>", "g");
  return html.replace(pattern, "");
}

async function buildEntry(entry, sharedStyles) {
  let html = await readUtf8(entry.source);

  for (const style of entry.styles) {
    const key = style.source + " -> " + (style.outputPath || "");
    let asset = sharedStyles.get(key);
    if (!asset) {
      const outputDir = style.source.indexOf("gemtable/") === 0 ? "gemtable/assets" : "assets";
      const extension = path.extname(style.source);
      const base = style.source.indexOf("gemtable/") === 0 ? "gemtable" : path.basename(style.source, extension);
      const source = await readUtf8(style.source);
      const content = minifyCss(source);
      const outputPath = path.join(outputDir, hashedName(base, extension, content));
      await writeDist(outputPath, content);
      asset = {
        href: relativeDistPath(entry.target, outputPath),
        integrity: integrity(content)
      };
      sharedStyles.set(key, asset);
    }
    html = replaceStylesheet(html, style.href, asset);
  }

  for (const script of entry.scripts) {
    html = removeScript(html, script.src);
  }

  const bundle = await buildBundle(entry);
  const tag = "    <script src=\"" + bundle.src + "\" integrity=\"" + bundle.integrity + "\"></script>\n";
  html = html.replace(/\s*<\/body>/, "\n" + tag + "  </body>");

  await writeDist(entry.target, minifyHtml(html));
}

async function buildRedirectPage() {
  let html = await readUtf8("splendor-table.html");
  const script = minifyJs("window.location.replace(\"gemtable/\" + window.location.search + window.location.hash);");
  const outputPath = path.join("assets", hashedName("splendor-redirect", ".js", script));
  await writeDist(outputPath, script);
  html = html.replace(/<script>[\s\S]*?<\/script>/, "<script src=\"" + toWebPath(outputPath) + "\" integrity=\"" + integrity(script) + "\"></script>");
  await writeDist("splendor-table.html", minifyHtml(html));
}

async function copyPublicAssets() {
  for (const directory of PUBLIC_DIRS) {
    await copyDirectoryToDist(directory);
  }

  for (const file of PUBLIC_FILES) {
    if (await pathExists(fromRoot(file))) {
      await copyFileToDist(file);
    }
  }
}

async function assertNoUnreferencedPublicArt(referencedAssets) {
  const assetsRoot = fromDist("assets");
  if (!(await pathExists(assetsRoot))) return;

  const leaked = [];
  async function walk(directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(target);
        continue;
      }

      if (!entry.isFile()) continue;
      const relativePath = toWebPath(path.relative(DIST, target));
      const extension = path.extname(relativePath).toLowerCase();
      if (PUBLIC_ASSET_EXTENSIONS.has(extension) && !referencedAssets.has(relativePath)) {
        leaked.push(relativePath);
      }
    }
  }

  await walk(assetsRoot);
  if (leaked.length) {
    throw new Error("Production dist includes unreferenced public art assets: " + leaked.join(", "));
  }
}

async function assertNoBlockedOutputs() {
  const blocked = [
    "debug.log",
    "README.md",
    "package.json",
    "site-config.local.example.json",
    "server-connection.local.txt",
    "docs",
    "test",
    "journal-backend",
    "scripts"
  ];

  const leaked = [];
  for (const item of blocked) {
    if (await pathExists(fromDist(item))) leaked.push(item);
  }

  if (leaked.length) {
    throw new Error("Production dist includes blocked paths: " + leaked.join(", "));
  }
}

async function main() {
  await removePath(DIST);
  await ensureDir(DIST);
  const referencedAssets = await collectReferencedAssets();
  await copyPublicAssets();
  await copyReferencedAssets(referencedAssets);

  const sharedStyles = new Map();
  for (const entry of ENTRIES) {
    await buildEntry(entry, sharedStyles);
  }
  await buildRedirectPage();
  await assertNoBlockedOutputs();
  await assertNoUnreferencedPublicArt(referencedAssets);

  console.log("Built production site in " + path.relative(ROOT, DIST));
}

main().catch(function (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
