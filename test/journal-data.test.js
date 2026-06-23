const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "journal-data.json"), "utf8"));
const leakPattern = /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|BEGIN (?:RSA|OPENSSH|PRIVATE) KEY|api[_ -]?key|secret|password|token|C:\\|G:\\|\/home\/|\/Users\/|\/opt\/|\/var\/www|bilibili|space\.bilibili)/i;
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

test("journal graph has valid node and link references", () => {
  assert.ok(data.nodes.length >= 20);
  const ids = new Set(data.nodes.map((node) => node.id));
  assert.equal(ids.size, data.nodes.length);

  for (const link of data.links) {
    assert.ok(ids.has(link.source), "missing source " + link.source);
    assert.ok(ids.has(link.target), "missing target " + link.target);
  }
});

test("journal graph summaries are concrete and public-safe", () => {
  assert.equal(hasOwn(data, "source"), false, "public journal-data should not expose source metadata");
  for (const node of data.nodes) {
    assert.ok(node.summary.length >= 70, node.id + " summary is too short");
    assert.ok(Array.isArray(node.body), node.id + " is missing note body");
    assert.ok(node.body.length >= 1, node.id + " has no note body paragraphs");
    assert.ok(node.body.join(" ").length >= 150, node.id + " note body is too thin");
    assert.equal(hasOwn(node, "source"), false, node.id + " exposes source metadata");
    assert.doesNotMatch(JSON.stringify(node), leakPattern, node.id + " contains private-looking data");
  }
});

test("removed public video hub surface", () => {
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const siteConfig = fs.readFileSync(path.join(root, "site-config.json"), "utf8");

  assert.doesNotMatch(index, /video\.html|Video Hub|Creator channel|bilibili/i);
  assert.doesNotMatch(siteConfig, /videoHub|bilibili/i);
});

test("homepage streams the full vault graph after art assets are ready", () => {
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const homepageEffects = fs.readFileSync(path.join(root, "homepage-effects.js"), "utf8");

  assert.doesNotMatch(index, /journal-photon-cache|\/api\/journal\/photon-cache/i);
  assert.match(homepageEffects, /waitForCriticalArtReady/);
  assert.match(homepageEffects, /\/api\/journal\/graph\/stream/);
  assert.doesNotMatch(homepageEffects, /journal-photon-cache|\/api\/journal\/photon-cache/i);
  assert.doesNotMatch(homepageEffects, /fetch\(["']\/api\/journal\/graph["']/i);
  assert.doesNotMatch(index, /class="graph-node|data-topic=/i);
});

test("journal display page does not expose admin edit entry points", () => {
  const journal = fs.readFileSync(path.join(root, "journal.html"), "utf8");
  const adminPath = path.join(root, "journal-backend", "admin", "journal-admin.html");
  const admin = fs.readFileSync(adminPath, "utf8");

  assert.equal(fs.existsSync(path.join(root, "journal-admin.html")), false);
  assert.doesNotMatch(journal, /journal-admin\.html|Edit node|data-node-edit|Node console/i);
  assert.match(admin, /name="robots" content="noindex,nofollow"/i);
  assert.match(admin, /\/admin\/journal-admin\.html/i);
});

test("homepage journal shortcuts scroll to the Journal section", () => {
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const inPageJournalLinks = index.match(/href="#journal"/g) || [];
  const journalPageLinks = index.match(/href="journal\.html"/g) || [];

  assert.equal(inPageJournalLinks.length, 2);
  assert.equal(journalPageLinks.length, 1);
});

test("homepage CSS preserves hidden optional links", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.match(styles, /\[hidden\]\s*{\s*display:\s*none\s*!important;\s*}/);
});

function makeConfigurableLink() {
  const link = {
    hidden: true,
    href: "",
    strong: { textContent: "Market trainer" },
    span: { textContent: "Historical replay trainer" },
    querySelector(selector) {
      if (selector === "strong") return this.strong;
      if (selector === "span") return this.span;
      return null;
    }
  };
  return link;
}

async function applyHomepageConfig(config) {
  const script = fs.readFileSync(path.join(root, "site-config.js"), "utf8");
  const link = makeConfigurableLink();
  const context = {
    URL,
    window: { location: { href: "https://zephyrlabs.test/" } },
    document: {
      querySelector(selector) {
        if (selector === '[data-site-link="marketTrainer"]') return link;
        return null;
      }
    },
    fetch: async (requestPath) => {
      assert.equal(requestPath, "/site-config.local.json");
      return {
        ok: true,
        json: async () => config
      };
    }
  };

  vm.runInNewContext(script, context, { filename: "site-config.js" });
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return link;
}

test("homepage config ignores placeholder external links", async () => {
  const link = await applyHomepageConfig({
    homepage: {
      links: {
        marketTrainer: {
          title: "Market trainer",
          description: "Historical replay trainer",
          url: "https://example.com/market-trainer"
        }
      }
    }
  });

  assert.equal(link.hidden, true);
  assert.equal(link.href, "");
});

test("homepage config reveals explicit public links", async () => {
  const link = await applyHomepageConfig({
    homepage: {
      links: {
        marketTrainer: {
          title: "Trading Lab",
          description: "Replay practice",
          url: "https://tools.zephyrlabs.test/replay/"
        }
      }
    }
  });

  assert.equal(link.hidden, false);
  assert.equal(link.href, "https://tools.zephyrlabs.test/replay/");
  assert.equal(link.strong.textContent, "Trading Lab");
  assert.equal(link.span.textContent, "Replay practice");
});
