(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const Effects = window.ZephyrEffects || {};
  const performanceProfile = Effects.getPerformanceProfile
    ? Effects.getPerformanceProfile()
    : { isLite: false, isStill: false, maxDpr: 1.45, frameMs: 1000 / 45, particleScale: 1, starScale: 1 };
  const shouldDrawFrame = Effects.shouldDrawFrame || ((lastFrame, now, frameMs) => !lastFrame || now - lastFrame >= frameMs);
  const freezeShot = params.get("shot");
  const freezeTimes = { opening: 0.72, vertigo: 1.65, settled: 4.15 };
  const freezeTime = params.has("t")
    ? Number(params.get("t"))
    : (Object.prototype.hasOwnProperty.call(freezeTimes, freezeShot) ? freezeTimes[freezeShot] : null);
  const reduced = performanceProfile.isStill || window.matchMedia("(prefers-reduced-motion: reduce)").matches || params.has("reduced-motion");

  const root = document.documentElement;
  const body = document.body;
  const hero = document.getElementById("hero");
  const worldCanvas = document.getElementById("world-canvas");
  const stageCanvas = document.getElementById("zl-stage-canvas");
  if (!hero || !worldCanvas || !stageCanvas) return;
  const worldCtx = worldCanvas.getContext("2d", { alpha: true });
  const stageCtx = stageCanvas.getContext("2d", { alpha: true });
  if (!worldCtx || !stageCtx) return;

  const resourceGraph = {
    mattePasses: ["assets/zl-hologram-pass.png", "assets/zl-hologram-halo.png", "assets/zl-mark-small.png"],
    generatedMeshes: ["fluidStage", "portalRings", "scanlineParticles", "cameraTimeline"],
    domUi: ["topbar", "hero-copy", "project-chips"]
  };
  window.ZephyrStageResources = resourceGraph;

  let width = 0;
  let height = 0;
  let ratio = 1;
  let start = performance.now();
  let lastFrame = 0;
  const stars = makeStars(Math.max(24, Math.round(160 * (performanceProfile.starScale || 1))));
  const particles = makeParticles(Math.max(36, Math.round(180 * (performanceProfile.particleScale || 1))));

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
  function pulse(t, a, b) { return smoothstep(a, (a + b) * 0.5, t) * (1 - smoothstep((a + b) * 0.5, b, t)); }

  function makeStars(count) {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.sin(i * 41.91) * 0.5 + 0.5),
      y: (Math.cos(i * 57.13) * 0.5 + 0.5) * 0.62,
      r: 0.28 + ((i * 13) % 9) / 12,
      tw: Math.random() * 6.28
    }));
  }

  function makeParticles(count) {
    return Array.from({ length: count }, (_, i) => ({
      a: Math.random() * Math.PI * 2,
      r: 0.16 + Math.random() * 0.58,
      speed: 0.08 + Math.random() * 0.18,
      z: Math.random(),
      tone: i % 7 === 0 ? "gold" : "cyan"
    }));
  }

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, performanceProfile.maxDpr || 1.45, 1.65);
    width = window.innerWidth;
    height = window.innerHeight;
    worldCanvas.width = Math.floor(width * ratio);
    worldCanvas.height = Math.floor(height * ratio);
    worldCanvas.style.width = width + "px";
    worldCanvas.style.height = height + "px";
    worldCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const stageHost = stageCanvas.parentElement || stageCanvas;
    const stageWidth = Math.max(1, Math.floor(stageHost.offsetWidth || stageHost.getBoundingClientRect().width));
    const stageHeight = Math.max(1, Math.floor(stageHost.offsetHeight || stageHost.getBoundingClientRect().height));
    stageCanvas.width = Math.floor(stageWidth * ratio);
    stageCanvas.height = Math.floor(stageHeight * ratio);
    stageCanvas.style.width = "100%";
    stageCanvas.style.height = "100%";
    stageCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function timeline(t) {
    const wake = smoothstep(0.02, 0.55, t);
    const lock = smoothstep(0.24, 1.12, t);
    const vertigo = smoothstep(1.05, 2.05, t);
    const copy = smoothstep(2.35, 3.22, t);
    const chips = smoothstep(2.95, 3.65, t);
    const ui = smoothstep(2.25, 3.12, t);
    const settle = smoothstep(3.15, 4.18, t);
    return { wake, lock, vertigo, copy, chips, ui, settle };
  }

  function applyCss(t) {
    const m = timeline(t);
    const scrollBoost = window.scrollY > 80 ? 1 : 0;
    const uiAlpha = Math.max(m.ui, scrollBoost);
    const settle = Math.max(m.settle, scrollBoost);
    const worldScale = mix(1.28, 1.0, m.lock) + pulse(t, 1.1, 2.1) * 0.035;
    const introStageScale = mix(0.72, 0.98, easeOutCubic(m.lock)) + m.vertigo * (1 - m.settle) * 0.07;
    const introStageY = mix(6, -46, m.lock) - m.vertigo * (1 - m.settle) * 18;
    const stageScale = mix(introStageScale, 0.7, settle);
    const stageY = mix(introStageY, -150, settle);
    const stageIntroAlpha = clamp(0.28 + m.wake * 0.74 + 0.12 * m.lock, 0, 1);
    const ringAlpha = mix(0.3 + stageIntroAlpha * 0.7, 0.12, settle);
    const matteAlpha = mix(0.18 + m.lock * 0.82, 0.18, settle);
    const haloAlpha = mix(0.14 + m.lock * 0.56, 0.04, settle);
    const stageSaturation = mix(1, 0.72, settle);
    const stageBrightness = mix(1, 0.72, settle);

    hero.style.setProperty("--ui-alpha", uiAlpha.toFixed(3));
    hero.style.setProperty("--copy-alpha", m.copy.toFixed(3));
    hero.style.setProperty("--chips-alpha", m.chips.toFixed(3));
    hero.style.setProperty("--stage-alpha", stageIntroAlpha.toFixed(3));
    hero.style.setProperty("--ring-alpha", ringAlpha.toFixed(3));
    hero.style.setProperty("--stage-scale", stageScale.toFixed(4));
    hero.style.setProperty("--stage-y", stageY.toFixed(2) + "px");
    hero.style.setProperty("--matte-alpha", matteAlpha.toFixed(3));
    hero.style.setProperty("--matte-scale", mix(mix(0.86, 1.02, m.lock) + Math.sin(t * 1.6) * 0.004, 0.78, settle).toFixed(4));
    hero.style.setProperty("--halo-alpha", haloAlpha.toFixed(3));
    hero.style.setProperty("--stage-saturation", stageSaturation.toFixed(3));
    hero.style.setProperty("--stage-brightness", stageBrightness.toFixed(3));
    hero.style.setProperty("--scan-y", (-44 + ((t * 18) % 110)).toFixed(2) + "%");
    hero.style.setProperty("--world-scale", worldScale.toFixed(4));
    hero.style.setProperty("--world-y", mix(42, 0, m.lock).toFixed(2) + "px");
    hero.style.setProperty("--world-brightness", (0.72 + m.lock * 0.32).toFixed(3));
    root.style.setProperty("--world-scale", worldScale.toFixed(4));
    root.style.setProperty("--world-y", mix(42, 0, m.lock).toFixed(2) + "px");
    root.style.setProperty("--world-brightness", (0.72 + m.lock * 0.32).toFixed(3));
    root.style.setProperty("--ui-alpha", uiAlpha.toFixed(3));
    root.style.setProperty("--nav-reveal", uiAlpha.toFixed(3));
    root.style.setProperty("--nav-y", ((1 - uiAlpha) * -16).toFixed(2) + "px");
    body.classList.toggle("nav-visible", uiAlpha > 0.72);
    body.classList.toggle("hero-settled", settle > 0.92);
  }

  function drawWorld(t) {
    const m = timeline(t);
    worldCtx.clearRect(0, 0, width, height);

    const veil = worldCtx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, "rgba(2,7,15,0.26)");
    veil.addColorStop(0.42, "rgba(3,16,28,0.12)");
    veil.addColorStop(0.78, "rgba(0,1,4,0.18)");
    veil.addColorStop(1, "rgba(0,0,0,0.36)");
    worldCtx.fillStyle = veil;
    worldCtx.fillRect(0, 0, width, height);

    worldCtx.save();
    worldCtx.globalCompositeOperation = "screen";
    stars.forEach((s, i) => {
      const tw = 0.42 + Math.sin(t * (0.5 + (i % 5) * 0.07) + s.tw) * 0.18;
      worldCtx.fillStyle = `rgba(204,238,255,${(0.045 + 0.04 * m.lock) * tw})`;
      worldCtx.beginPath();
      worldCtx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
      worldCtx.fill();
    });

    const neb = worldCtx.createRadialGradient(width * 0.65, height * 0.24, 0, width * 0.65, height * 0.24, width * 0.42);
    neb.addColorStop(0, `rgba(48, 154, 255, ${0.05 + m.lock * 0.05})`);
    neb.addColorStop(0.35, `rgba(21, 79, 132, ${0.032 + m.lock * 0.04})`);
    neb.addColorStop(1, "rgba(0,0,0,0)");
    worldCtx.fillStyle = neb;
    worldCtx.fillRect(0, 0, width, height * 0.72);
    worldCtx.restore();

    // Low-angle camera streaks during opening.
    if (t < 2.4) {
      worldCtx.save();
      worldCtx.globalCompositeOperation = "screen";
      const alpha = pulse(t, 0.15, 1.85) * 0.9;
      const streakCount = performanceProfile.isLite ? 10 : 30;
      for (let i = 0; i < streakCount; i++) {
        const x0 = width * (0.12 + (i / Math.max(1, streakCount - 1)) * 0.76);
        const x1 = width * 0.5 + Math.sin(i * 2.1) * width * 0.08;
        const y0 = height * (0.92 + Math.sin(i) * 0.05);
        const y1 = height * (0.60 + Math.cos(i * 0.7) * 0.08);
        const grad = worldCtx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, "rgba(80,205,255,0)");
        grad.addColorStop(0.78, `rgba(125,235,255,${0.04 * alpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        worldCtx.strokeStyle = grad;
        worldCtx.lineWidth = 1 + (i % 4) * 0.45;
        worldCtx.beginPath();
        worldCtx.moveTo(x0, y0);
        worldCtx.lineTo(x1, y1);
        worldCtx.stroke();
      }
      worldCtx.restore();
    }
  }

  function drawStage(t) {
    const w = stageCanvas.width / ratio;
    const h = stageCanvas.height / ratio;
    if (!w || !h) return;
    const m = timeline(t);
    stageCtx.clearRect(0, 0, w, h);
    const cx = w * 0.512;
    const cy = h * 0.59;
    const scale = 0.78 + m.vertigo * 0.15 - m.settle * 0.04;

    stageCtx.save();
    stageCtx.globalCompositeOperation = "screen";

    drawPortalPad(stageCtx, cx, cy + h * 0.14, w * 0.29 * scale, h * 0.055 * scale, t, m.lock);
    drawHudRings(stageCtx, cx, cy - h * 0.13, w * 0.33 * scale, t, m);
    drawParticles(stageCtx, cx, cy - h * 0.12, w * 0.34 * scale, t, m.lock);

    stageCtx.restore();
  }

  function drawPortalPad(ctx, cx, cy, rx, ry, t, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.34);
    const baseRings = performanceProfile.isLite ? 6 : 10;
    for (let i = 0; i < baseRings; i++) {
      const r = rx * (0.22 + i * 0.095);
      ctx.lineWidth = i % 3 === 0 ? 1.2 : 0.65;
      ctx.strokeStyle = i % 3 === 0 ? `rgba(142,245,255,${0.12 * alpha})` : `rgba(26,154,255,${0.07 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const arcRings = performanceProfile.isLite ? 3 : 5;
    for (let i = 0; i < arcRings; i++) {
      const r = rx * (0.42 + i * 0.15);
      const a0 = t * 0.45 + i * 1.2;
      ctx.strokeStyle = `rgba(122,244,255,${0.28 * alpha})`;
      ctx.lineWidth = 2.5 - i * 0.28;
      ctx.beginPath();
      ctx.arc(0, 0, r, a0, a0 + 0.45 + i * 0.07);
      ctx.stroke();
    }
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.62);
    glow.addColorStop(0, `rgba(238,255,255,${0.78 * alpha})`);
    glow.addColorStop(0.22, `rgba(45,197,255,${0.28 * alpha})`);
    glow.addColorStop(1, "rgba(45,197,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, rx * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHudRings(ctx, cx, cy, r, t, m) {
    ctx.save();
    ctx.translate(cx, cy);
    const alpha = m.lock;
    const intro = smoothstep(0.4, 1.35, t);
    const ringScale = 0.82 + m.vertigo * 0.2 + m.settle * 0.02;
    ctx.scale(ringScale, ringScale);

    const layers = performanceProfile.isLite ? 3 : 5;
    for (let layer = 0; layer < layers; layer++) {
      const rr = r * (0.62 + layer * 0.105);
      ctx.lineWidth = layer === 1 ? 1.2 : 0.65;
      ctx.strokeStyle = layer % 2 === 0 ? `rgba(100, 229, 255,${0.10 * alpha})` : `rgba(230,250,255,${0.15 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, Math.PI * 2 * intro);
      ctx.stroke();

      const segs = performanceProfile.isLite ? 3 + layer : 5 + layer * 2;
      for (let i = 0; i < segs; i++) {
        const a = t * (0.08 + layer * 0.02) + i * Math.PI * 2 / segs + layer * 0.31;
        const len = 0.1 + (i % 3) * 0.035;
        ctx.strokeStyle = i % 4 === 0 ? `rgba(237,254,255,${0.34 * alpha})` : `rgba(48,190,255,${0.22 * alpha})`;
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.arc(0, 0, rr, a, a + len);
        ctx.stroke();
      }
    }

    // radial ticks
    const tickCount = performanceProfile.isLite ? 40 : 96;
    for (let i = 0; i < tickCount; i++) {
      const a = i * Math.PI * 2 / tickCount;
      const big = i % 8 === 0;
      const inner = r * (0.76 + (big ? 0 : 0.02));
      const outer = r * (0.79 + (big ? 0.035 : 0.015));
      ctx.strokeStyle = `rgba(112,245,255,${(big ? 0.24 : 0.09) * alpha})`;
      ctx.lineWidth = big ? 1.3 : 0.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.stroke();
    }

    // alignment lines
    ctx.strokeStyle = `rgba(120, 245, 255, ${0.17 * alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 1.15, 0);
    ctx.lineTo(-r * 0.72, 0);
    ctx.moveTo(r * 0.72, 0);
    ctx.lineTo(r * 1.15, 0);
    ctx.moveTo(0, -r * 1.12);
    ctx.lineTo(0, -r * 0.74);
    ctx.moveTo(0, r * 0.74);
    ctx.lineTo(0, r * 1.12);
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles(ctx, cx, cy, r, t, alpha) {
    particles.forEach((p, i) => {
      const a = p.a + t * p.speed;
      const z = 0.55 + p.z * 0.45;
      const x = cx + Math.cos(a) * r * p.r;
      const y = cy + Math.sin(a) * r * p.r * 0.9;
      const size = 0.55 + p.z * 1.5;
      const color = p.tone === "gold" ? [255, 214, 130] : [125, 238, 255];
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * (0.13 + p.z * 0.2)})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function frame(now) {
    if (freezeTime === null && !reduced && !shouldDrawFrame(lastFrame, now, performanceProfile.frameMs || 16)) {
      window.requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    const t = freezeTime !== null && Number.isFinite(freezeTime) ? freezeTime : (now - start) / 1000;
    applyCss(t);
    drawWorld(t);
    drawStage(t);
    if (freezeTime === null && !reduced) window.requestAnimationFrame(frame);
  }

  function waitForArtReady() {
    if (!body.classList.contains("art-preload")) return Promise.resolve();
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        observer.disconnect();
        window.clearTimeout(timer);
        resolve();
      };
      const observer = new MutationObserver(() => {
        if (!body.classList.contains("art-preload") || body.classList.contains("art-ready")) finish();
      });
      const timer = window.setTimeout(() => {
        body.classList.add("art-ready", "art-timeout");
        body.classList.remove("art-preload");
        finish();
      }, 12500);
      observer.observe(body, { attributes: true, attributeFilter: ["class"] });
    });
  }

  function waitImage(image) {
    if (!image) return Promise.resolve();
    if (image.complete && image.naturalWidth > 0) {
      return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const done = () => {
        image.removeEventListener("load", done);
        image.removeEventListener("error", fail);
        if (!image.naturalWidth) {
          reject(new Error("Stage image has no dimensions"));
          return;
        }
        if (image.decode) image.decode().catch(() => {}).then(resolve);
        else resolve();
      };
      const fail = () => {
        image.removeEventListener("load", done);
        image.removeEventListener("error", fail);
        reject(new Error("Stage image failed"));
      };
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", fail, { once: true });
    });
  }

  function waitForStageArt() {
    const images = Array.from(hero.querySelectorAll(".zl-halo, .zl-matte"));
    images.forEach((image) => {
      if (!image.getAttribute("src") && image.dataset.stageSrc) {
        image.setAttribute("src", image.dataset.stageSrc);
      }
    });
    return Promise.all(images.map(waitImage));
  }

  let started = false;
  function startStage() {
    if (started) return;
    started = true;
    body.classList.add("stage-art-ready");
    start = performance.now();
    resize();
    frame(start);
  }

  window.addEventListener("resize", () => {
    resize();
    if (started) frame(performance.now());
  });
  Promise.all([waitForArtReady(), waitForStageArt()])
    .then(() => window.requestAnimationFrame(startStage))
    .catch(() => body.classList.add("stage-art-unavailable"));
})();
