#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const SCHEMA = "zephyrlabs-bga-replay-crawler-v1";

function usage() {
  return [
    "Usage:",
    "  node tools/bga-replay-crawler.mjs --table <BGA_TABLE_ID> [--out ./bga-replays] [--manual] [--headless] [--wait-ms 60000]",
    "",
    "Notes:",
    "  - The script opens the official BGA review page in a local browser.",
    "  - Log in on BGA in that browser if prompted.",
    "  - Your BGA password is never sent to zephyrlabs.cloud or this repo.",
    "  - Output is raw browser-visible BGA replay data for later conversion/import."
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    table: "",
    out: "bga-replays",
    profile: ".bga-crawler-profile",
    manual: false,
    headless: false,
    maxSteps: 400,
    waitMs: 60000
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--table" || value === "-t") args.table = argv[++index] || "";
    else if (value === "--out" || value === "-o") args.out = argv[++index] || args.out;
    else if (value === "--profile") args.profile = argv[++index] || args.profile;
    else if (value === "--manual") args.manual = true;
    else if (value === "--headless") args.headless = true;
    else if (value === "--max-steps") args.maxSteps = Number(argv[++index] || args.maxSteps);
    else if (value === "--wait-ms") args.waitMs = Number(argv[++index] || args.waitMs);
    else if (value === "--help" || value === "-h") {
      console.log(usage());
      process.exit(0);
    }
  }
  args.table = String(args.table || "").replace(/[^\d]/g, "");
  return args;
}

function headersToObject(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) out[key] = value;
  return out;
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function looksReplayRelated(url, contentType, text) {
  const lowerUrl = String(url || "").toLowerCase();
  if (!lowerUrl.includes("boardgamearena.com")) return false;
  if ((contentType || "").toLowerCase().includes("json")) return true;
  if (!text) return false;
  const sample = text.slice(0, 200000);
  return /gamedatas|gamereview|replay|move_id|notification|table_id|splendor/i.test(sample);
}

function safeJsonClone(value, maxDepth = 8) {
  const seen = new WeakSet();
  function walk(input, depth) {
    if (depth > maxDepth) return "[MaxDepth]";
    if (input === null || typeof input !== "object") return input;
    if (seen.has(input)) return "[Circular]";
    seen.add(input);
    if (Array.isArray(input)) return input.slice(0, 500).map((item) => walk(item, depth + 1));
    const out = {};
    for (const key of Object.keys(input).slice(0, 500)) {
      let next;
      try {
        next = input[key];
      } catch {
        next = "[Unreadable]";
      }
      if (typeof next !== "function") out[key] = walk(next, depth + 1);
    }
    return out;
  }
  return walk(value, 0);
}

async function loadChromium(repoRoot) {
  try {
    const mod = await import("playwright");
    return mod.chromium;
  } catch (firstError) {
    const candidates = [
      process.env.PLAYWRIGHT_NODE_MODULES,
      path.join(repoRoot, "node_modules"),
      path.join(repoRoot, "server", "node_modules")
    ].filter(Boolean);
    for (const nodeModules of candidates) {
      try {
        const requireFrom = createRequire(path.join(nodeModules, "package.json"));
        return requireFrom("playwright").chromium;
      } catch {
        // Try the next dependency location.
      }
    }
    throw firstError;
  }
}

async function collectSnapshot(page) {
  return page.evaluate(() => {
    function cloneVisible(value, maxDepth) {
      const seen = new WeakSet();
      function walk(input, depth) {
        if (depth > maxDepth) return "[MaxDepth]";
        if (input === null || typeof input !== "object") return input;
        if (seen.has(input)) return "[Circular]";
        seen.add(input);
        if (Array.isArray(input)) return input.slice(0, 500).map((item) => walk(item, depth + 1));
        const out = {};
        Object.keys(input).slice(0, 500).forEach((key) => {
          let next;
          try {
            next = input[key];
          } catch {
            next = "[Unreadable]";
          }
          if (typeof next !== "function") out[key] = walk(next, depth + 1);
        });
        return out;
      }
      return walk(value, 0);
    }
    const gameui = window.gameui || window.gameui_playback || null;
    const logSelectors = [
      "#logs .log",
      "#logs li",
      ".gamelogreview .log",
      ".gamelogreview li",
      ".chatwindowlogs_zone .log",
      ".log_history_status"
    ];
    const logs = [];
    for (const selector of logSelectors) {
      document.querySelectorAll(selector).forEach((node) => {
        const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
        if (text && !logs.includes(text)) logs.push(text);
      });
    }
    return {
      title: document.title,
      url: location.href,
      gameui: gameui ? cloneVisible({
        game_name: gameui.game_name,
        game_id: gameui.game_id,
        table_id: gameui.table_id,
        gamedatas: gameui.gamedatas,
        player_id: gameui.player_id,
        player_name: gameui.player_name
      }, 10) : null,
      logs
    };
  });
}

async function clickNextReplayControl(page) {
  return page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll("button, a, .archivecontrol, [role='button']"));
    const usable = candidates.filter((node) => {
      const text = String(node.textContent || "").trim().toLowerCase();
      const label = String(node.getAttribute("aria-label") || node.getAttribute("title") || node.id || node.className || "").toLowerCase();
      const joined = `${text} ${label}`;
      if (node.disabled || node.getAttribute("aria-disabled") === "true") return false;
      if (/previous|prev|back|undo|precedent|zuruck|anterior|前|戻/.test(joined)) return false;
      return /next|following|suivant|weiter|siguiente|avance|step|play|fast|>|»|次|進/.test(joined);
    });
    if (!usable.length) return false;
    usable[0].click();
    return true;
  });
}

async function assertNotLoginOrLobby(page) {
  const current = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    body: document.body ? document.body.innerText.slice(0, 2000) : ""
  }));
  if (
    /\/account|\/lobby/i.test(current.url) ||
    /login|log in|sign in/i.test(current.title) ||
    /login|log in|sign in/i.test(current.body)
  ) {
    throw new Error("BGA redirected to login or lobby. Log in with the crawler browser profile and make sure this account can view the table replay.");
  }
  if (!/gamereview/i.test(current.url)) {
    throw new Error(`BGA did not stay on the gamereview page. Current URL: ${current.url}`);
  }
}

function detectCompatibility(payload) {
  const text = JSON.stringify(payload).toLowerCase();
  const snapshots = Array.isArray(payload.snapshots) ? payload.snapshots : [];
  const lastSnapshot = snapshots.length ? snapshots[snapshots.length - 1] : {};
  const gameui = lastSnapshot && lastSnapshot.gameui ? lastSnapshot.gameui : {};
  const gameName = String(gameui.game_name || lastSnapshot.title || "").toLowerCase();
  const expansionTerms = [
    "cities",
    "city",
    "trading",
    "stronghold",
    "orient",
    "expansion",
    "extension",
    "永昼",
    "都市",
    "交易",
    "拠点"
  ];
  const hasExpansion = expansionTerms.some((term) => text.includes(term.toLowerCase()));
  const maybeSplendor = /splendor|璀璨|宝石|宝石の煌き/.test(gameName) || /splendor|璀璨|宝石|宝石の煌き/.test(text);
  return {
    maybe_splendor: maybeSplendor,
    has_expansion_hint: hasExpansion,
    importable_by_current_zephyrlabs_viewer: false,
    reason: hasExpansion
      ? "Expansion-like data was detected. The current ZephyrLabs importer supports only the local base-game replay schema."
      : "This is raw BGA browser-visible replay data. A BGA-to-ZephyrLabs converter is still required before direct replay import."
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.table) {
    console.error(usage());
    process.exit(1);
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, "..");
  const chromium = await loadChromium(repoRoot);
  const outputDir = path.resolve(process.cwd(), args.out);
  const profileDir = path.resolve(process.cwd(), args.profile);
  await mkdir(outputDir, { recursive: true });

  const responses = [];
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: args.headless,
    viewport: { width: 1440, height: 1000 }
  });
  const page = context.pages()[0] || await context.newPage();

  page.on("response", async (response) => {
    try {
      const url = response.url();
      const headers = headersToObject(response.headers());
      const contentType = headers["content-type"] || "";
      const text = await response.text();
      if (!looksReplayRelated(url, contentType, text)) return;
      responses.push({
        url,
        status: response.status(),
        content_type: contentType,
        captured_at: new Date().toISOString(),
        parsed_json: parseMaybeJson(text),
        text
      });
    } catch {
      // Ignore binary, opaque, or consumed responses.
    }
  });

  const reviewUrl = `https://boardgamearena.com/gamereview?table=${encodeURIComponent(args.table)}`;
  console.log(`Opening ${reviewUrl}`);
  await page.goto(reviewUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
  console.log("If BGA asks you to log in, complete login in the opened browser window.");
  console.log("When the replay page is visible, the crawler will continue automatically.");
  await page.waitForTimeout(1800);
  await assertNotLoginOrLobby(page);

  await page.waitForFunction(() => {
    if (/\/account|\/lobby/i.test(location.href) || /login|log in|sign in/i.test(document.title)) return false;
    const text = document.body ? document.body.innerText : "";
    return /gamereview/i.test(location.href) && (/replay|archive|logs|tour|turn|move|spectator|review/i.test(text) || window.gameui || window.gameui_playback);
  }, { timeout: args.waitMs }).catch((error) => {
    throw new Error(`BGA review page did not load usable replay data within ${args.waitMs}ms. Login, permission, or Premium access may be required. ${error.message}`);
  });
  await assertNotLoginOrLobby(page);

  const snapshots = [];
  snapshots.push(await collectSnapshot(page));

  if (!args.manual) {
    for (let step = 0; step < args.maxSteps; step += 1) {
      const clicked = await clickNextReplayControl(page);
      if (!clicked) break;
      await page.waitForTimeout(450);
      const snapshot = await collectSnapshot(page);
      snapshots.push(snapshot);
      const previousSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : {};
      const lastLogs = previousSnapshot && previousSnapshot.logs ? previousSnapshot.logs : [];
      if (
        step > 8 &&
        snapshot.logs.length === lastLogs.length &&
        responses.length > 0
      ) {
        break;
      }
    }
  } else {
    console.log("Manual mode: play or step through the replay in the browser.");
    console.log("Press Enter here when the replay data you need has loaded.");
    await new Promise((resolve) => process.stdin.once("data", resolve));
    snapshots.push(await collectSnapshot(page));
  }

  const payload = {
    schema: SCHEMA,
    source: "boardgamearena-gamereview-local-playwright-crawler",
    table_id: args.table,
    review_url: reviewUrl,
    exported_at: new Date().toISOString(),
    note: "Raw BGA browser-visible replay capture. It may require a converter before it can be replayed in ZephyrLabs Gem Table.",
    snapshots: safeJsonClone(snapshots, 12),
    responses: safeJsonClone(responses, 12)
  };
  payload.compatibility = detectCompatibility(payload);

  const outputPath = path.join(outputDir, `bga-table-${args.table}-replay.json`);
  await writeFile(outputPath, JSON.stringify(payload), "utf8");
  console.log(`Saved ${outputPath}`);
  console.log(`Repo script: ${path.relative(repoRoot, fileURLToPath(import.meta.url)).replace(/\\/g, "/")}`);
  await context.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
