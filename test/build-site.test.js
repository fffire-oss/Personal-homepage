const assert = require("node:assert/strict");
const cp = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const distAssets = path.join(root, "dist", "assets");

const expectedPublicArt = [
  "ai-chip-cinematic.png",
  "algo-globe-cinematic.png",
  "earth_atmos_2048.jpg",
  "earth_clouds_1024.png",
  "earth_lights_2048.png",
  "zl-hologram-halo.png",
  "zl-hologram-pass.png",
  "zl-mark-small.png"
];

test("production build publishes only referenced public art assets", { timeout: 30000 }, function () {
  cp.execFileSync(process.execPath, ["scripts/build-site.js"], {
    cwd: root,
    stdio: "pipe"
  });

  const publicArt = fs.readdirSync(distAssets)
    .filter((name) => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(name))
    .sort();

  assert.deepEqual(publicArt, expectedPublicArt.slice().sort());
  assert.equal(fs.existsSync(path.join(distAssets, "moon_1024.jpg")), false);
  assert.equal(fs.existsSync(path.join(distAssets, "zl-core-pass.png")), false);
});
