(function () {
  "use strict";

  const Effects = window.ZephyrEffects || {};
  const performanceProfile = Effects.getPerformanceProfile
    ? Effects.getPerformanceProfile()
    : { isLite: false, isStill: false, maxDpr: 1.45, frameMs: 1000 / 45, particleScale: 1, starScale: 1, textureScale: 1 };
  const shouldDrawFrame = Effects.shouldDrawFrame || ((lastFrame, now, frameMs) => !lastFrame || now - lastFrame >= frameMs);
  const prefersReducedMotion = performanceProfile.isStill || (Effects.prefersReducedMotion
    ? Effects.prefersReducedMotion()
    : new URLSearchParams(window.location.search).has("reduced-motion"));
  const clamp = Effects.clamp || ((value, min, max) => Math.min(max, Math.max(min, value)));
  const fitCanvas = Effects.fitCanvas || ((canvas, host, maxRatio) => {
    const rect = host.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, maxRatio || 2, performanceProfile.maxDpr || 2);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const targetW = Math.max(1, Math.floor(width * ratio));
    const targetH = Math.max(1, Math.floor(height * ratio));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    }
    return { width, height, ratio };
  });
  const easeInOut = Effects.easeInOut || ((value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  });
  const introMotion = {
    open: prefersReducedMotion ? 1 : 0,
    scroll: 0,
    spotlight: prefersReducedMotion ? 1 : 0
  };
  const artReadyPromise = waitForCriticalArtReady();
  window.ZephyrArtReady = artReadyPromise;

  setupIntroDirector(artReadyPromise);
  setupSiteNav();
  setupReturnTop();
  setupSkyNebulaFeed();
  if (Effects.setupStickyCards) Effects.setupStickyCards({ prefersReducedMotion });
  if (Effects.setupFooterReveal) Effects.setupFooterReveal();
  setupLogoFluid();
  setupAiCircuitVisual(artReadyPromise);
  setupMarketGlobe(artReadyPromise);
  setupObsidianSphere(artReadyPromise);
  setupArtPreloadReveal(artReadyPromise);
  if (Effects.setupLiquidBackground) {
    Effects.setupLiquidBackground({ selector: "#orbit-field", motion: introMotion, prefersReducedMotion });
  }

  function setupIntroDirector(artReady) {
    const root = document.documentElement;
    const body = document.body;
    const projects = document.querySelector(".projects");
    let start = performance.now();
    let started = false;
    let ticking = false;
    let timer = 0;
    let settled = false;
    let timelineComplete = prefersReducedMotion;
    const directorInterval = prefersReducedMotion ? 80 : (performanceProfile.isLite ? 34 : 16);

    body.classList.add("intro-directed");

    function settleBrand() {
      if (!started || settled) return;
      settled = true;
      body.classList.add("brand-settled", "logo-docked", "intro-complete");
      root.style.setProperty("--logo-dock", "1.000");
      window.setTimeout(() => body.classList.add("brand-orb-hidden"), prefersReducedMotion ? 0 : 240);
      schedule();
    }

    function update(now) {
      if (!Number.isFinite(now)) now = performance.now();
      const viewport = Math.max(1, window.innerHeight || 1);
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const elapsed = prefersReducedMotion ? 2600 : Math.max(0, now - start);
      const timeOpen = prefersReducedMotion ? 1 : easeInOut(elapsed / 2800);
      const timedLogoExit = easeInOut((elapsed - 2800) / 860);
      const scrollLogoExit = easeInOut(scrollY / 260);
      const logoExit = settled || prefersReducedMotion ? 1 : Math.max(timedLogoExit, scrollLogoExit);
      const timedNavReveal = easeInOut((elapsed - 3600) / 1000);
      const scrollNavReveal = easeInOut((scrollY - 80) / 280);
      const navReveal = settled || prefersReducedMotion ? 1 : Math.max(timedNavReveal, scrollNavReveal);
      const dock = navReveal;
      const projectTop = projects ? projects.getBoundingClientRect().top + scrollY : viewport * 1.05;
      const scrollStart = Math.max(180, projectTop - viewport * 0.64);
      const scrollEnd = Math.max(scrollStart + 1, projectTop + viewport * 0.12);
      const projectProgress = prefersReducedMotion ? 1 : clamp((scrollY - scrollStart) / (scrollEnd - scrollStart), 0, 1);
      const scroll = easeInOut(projectProgress);
      const pullRaw = prefersReducedMotion ? 1 : clamp(scrollY / (viewport * 0.9), 0, 1);
      const pullPeak = Math.sin(pullRaw * Math.PI);
      const pullRelease = easeInOut((pullRaw - 0.5) / 0.44);
      const scrollPull = prefersReducedMotion ? 0 : pullPeak * (1 - pullRelease * 0.38);
      const heroY = scrollPull * 38 - pullRelease * 108;
      const heroScale = 1 - pullRelease * 0.075;
      const heroExit = easeInOut((pullRaw - 0.62) / 0.32);
      const heroOpacity = prefersReducedMotion ? 1 : clamp(1 - heroExit, 0, 1);
      const textReveal = prefersReducedMotion ? 1 : easeInOut((elapsed - 1900) / 950);
      const eyebrowReveal = prefersReducedMotion ? 1 : textReveal * easeInOut((navReveal - 0.42) / 0.4);
      const cardLift = easeInOut((projectProgress - 0.08) / 0.74);
      const nebula = Math.max(0, Math.min(1, easeInOut(elapsed / 900) * (1 - easeInOut((elapsed - 2800) / 1100)) * (1 - scroll * 0.84)));
      const spotlight = prefersReducedMotion ? 1 : easeInOut(elapsed / 2000);
      const shellRotateX = 58 - timeOpen * 52 - logoExit * 8 - scroll * 8;
      const shellRotateY = -22 + timeOpen * 18 - logoExit * 8 - scroll * 6;
      const shellOpacity = clamp(1 - logoExit * 0.72 - scroll * 0.28, 0.12, 1);
      const projectsY = (1 - cardLift) * 150 + Math.sin(cardLift * Math.PI) * 24;
      const projectsScale = 0.974 + cardLift * 0.026;
      const projectsOpacity = clamp(cardLift * 0.95 + scroll * 0.12, 0, 1);
      const dimOpacity = prefersReducedMotion ? 0 : (1 - spotlight) * 0.64;
      const nebulaX = -42 + timeOpen * 92 - scroll * 24;
      const nebulaY = -18 + timeOpen * 14 - scroll * 8;
      const logoShellOpacity = shellOpacity;

      introMotion.open = timeOpen;
      introMotion.scroll = Math.max(scroll, logoExit * 0.14, scrollPull * 0.16);
      introMotion.spotlight = spotlight;

      root.style.setProperty("--intro-open", timeOpen.toFixed(3));
      root.style.setProperty("--intro-scroll", scroll.toFixed(3));
      root.style.setProperty("--intro-text", textReveal.toFixed(3));
      root.style.setProperty("--intro-text-y", ((1 - textReveal) * 26).toFixed(2) + "px");
      root.style.setProperty("--intro-eyebrow", eyebrowReveal.toFixed(3));
      root.style.setProperty("--intro-eyebrow-y", ((1 - eyebrowReveal) * 18).toFixed(2) + "px");
      root.style.setProperty("--intro-nebula", nebula.toFixed(3));
      root.style.setProperty("--intro-spotlight", spotlight.toFixed(3));
      root.style.setProperty("--intro-dim", dimOpacity.toFixed(3));
      root.style.setProperty("--nebula-x", nebulaX.toFixed(2) + "vw");
      root.style.setProperty("--nebula-y", nebulaY.toFixed(2) + "vh");
      root.style.setProperty("--fluid-shell-rotate-x", shellRotateX.toFixed(2) + "deg");
      root.style.setProperty("--fluid-shell-rotate-y", shellRotateY.toFixed(2) + "deg");
      root.style.setProperty("--water-ring-rotate-x", (72 + shellRotateX * 0.18).toFixed(2) + "deg");
      root.style.setProperty("--water-ring-rotate-z", (shellRotateY * -0.65).toFixed(2) + "deg");
      root.style.setProperty("--fluid-core-rotate-x", (shellRotateX * 0.16).toFixed(2) + "deg");
      root.style.setProperty("--fluid-core-rotate-y", (shellRotateY * 0.22).toFixed(2) + "deg");
      root.style.setProperty("--fluid-shell-opacity", logoShellOpacity.toFixed(3));
      root.style.setProperty("--logo-opacity", clamp(1 - logoExit, 0, 1).toFixed(3));
      root.style.setProperty("--logo-scale", (1 - logoExit * 0.055).toFixed(3));
      root.style.setProperty("--logo-dock", dock.toFixed(3));
      root.style.setProperty("--hero-stick-y", heroY.toFixed(2) + "px");
      root.style.setProperty("--hero-stick-scale", heroScale.toFixed(4));
      root.style.setProperty("--hero-stick-opacity", heroOpacity.toFixed(3));
      root.style.setProperty("--scroll-pull", scrollPull.toFixed(3));
      root.style.setProperty("--scroll-cue-y", (scrollPull * 34).toFixed(2) + "px");
      root.style.setProperty("--scroll-cue-height", (56 + scrollPull * 42).toFixed(2) + "px");
      root.style.setProperty("--projects-y", projectsY.toFixed(2) + "px");
      root.style.setProperty("--projects-scale", projectsScale.toFixed(4));
      root.style.setProperty("--projects-opacity", projectsOpacity.toFixed(3));

      if (logoExit > 0.995) body.classList.add("brand-orb-hidden");
      if (scrollY > Math.min(320, viewport * 0.3)) settleBrand();
      body.classList.toggle("intro-complete", settled || scroll > 0.08);
      body.classList.remove("logo-reentering");
      timelineComplete = prefersReducedMotion || elapsed >= 6000;
      ticking = false;
    }

    function schedule() {
      if (!started) return;
      if (ticking) return;
      ticking = true;
      window.setTimeout(update, 0);
    }

    function loop() {
      update(performance.now());
      if (!timelineComplete) {
        timer = window.setTimeout(loop, directorInterval);
      }
    }

    function begin() {
      if (started) return;
      started = true;
      start = performance.now();
      update(start);
      timer = window.setTimeout(loop, directorInterval);
      window.setTimeout(settleBrand, prefersReducedMotion ? 0 : 4600);
    }

    window.addEventListener("scroll", () => {
      if (!started) return;
      const viewport = Math.max(1, window.innerHeight || 1);
      if ((window.scrollY || window.pageYOffset || 0) > Math.min(320, viewport * 0.3)) settleBrand();
      schedule();
    }, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", () => {
      if (!started) return;
      if (document.hidden) clearTimeout(timer);
      else if (!timelineComplete) timer = window.setTimeout(loop, directorInterval);
    });
    (artReady || Promise.resolve()).then(() => window.requestAnimationFrame(begin));
  }

  function setupSiteNav() {
    const nav = document.querySelector("[data-site-nav]");
    const toggle = nav && nav.querySelector("[data-nav-toggle]");
    if (!nav || !toggle) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function setupReturnTop() {
    const trigger = document.querySelector("[data-return-top]");
    if (!trigger) return;
    let timer = 0;

    function clearReturning() {
      document.body.classList.remove("returning-top");
      timer = 0;
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      window.clearTimeout(timer);
      document.body.classList.add("returning-top");
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
      timer = window.setTimeout(clearReturning, prefersReducedMotion ? 80 : 760);
    });
  }

  function setupSkyNebulaFeed() {
    const root = document.documentElement;
    const body = document.body;
    const endpoint = "https://images-api.nasa.gov/search?q=Carina%20Nebula&media_type=image&page_size=8";
    const params = new URLSearchParams(window.location.search);

    function setSkyState(state) {
      body.classList.toggle("sky-feed-live", state === "live");
      body.classList.toggle("sky-feed-local", state !== "live");
    }

    function imageUrlsFromAssetList(value) {
      if (Array.isArray(value)) return value.filter((url) => typeof url === "string").map(normalizeSkyUrl);
      if (value && Array.isArray(value.collection)) return value.collection.filter((url) => typeof url === "string").map(normalizeSkyUrl);
      return [];
    }

    function normalizeSkyUrl(url) {
      return String(url || "").replace(/^http:\/\/images-assets\.nasa\.gov/i, "https://images-assets.nasa.gov");
    }

    function chooseImageUrl(urls, fallback) {
      const jpgs = urls.filter((url) => /\.(jpg|jpeg|png)(\?|$)/i.test(url));
      return (
        jpgs.find((url) => /~large\.(jpg|jpeg|png)(\?|$)/i.test(url)) ||
        jpgs.find((url) => /~medium\.(jpg|jpeg|png)(\?|$)/i.test(url)) ||
        jpgs.find((url) => /~orig\.(jpg|jpeg|png)(\?|$)/i.test(url)) ||
        normalizeSkyUrl(fallback)
      );
    }

    function preloadImage(src, timeoutMs) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        const timer = window.setTimeout(() => reject(new Error("Sky image timed out")), timeoutMs);
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.onload = () => {
          window.clearTimeout(timer);
          resolve(src);
        };
        image.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Sky image failed to load"));
        };
        image.src = src;
      });
    }

    async function fetchJson(url, timeoutMs) {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { cache: "force-cache", signal: controller.signal });
        if (!response.ok) throw new Error("Sky feed returned " + response.status);
        return response.json();
      } finally {
        window.clearTimeout(timer);
      }
    }

    async function loadSkyImage() {
      setSkyState("checking");
      try {
        const data = await fetchJson(endpoint, 8000);
        const items = data && data.collection && Array.isArray(data.collection.items) ? data.collection.items : [];
        const item = items.find((entry) => {
          return entry && entry.links && entry.links[0] && entry.links[0].href;
        });
        if (!item) throw new Error("No sky image candidate");
        const preview = normalizeSkyUrl(item.links[0].href);
        let imageUrl = preview;
        if (item.href) try {
          const assetList = await fetchJson(item.href, 8000);
          imageUrl = chooseImageUrl(imageUrlsFromAssetList(assetList), preview);
        } catch (_error) {
          imageUrl = preview;
        }
        await preloadImage(imageUrl, 9000);
        root.style.setProperty("--sky-nebula-image", "url(" + JSON.stringify(imageUrl) + ")");
        setSkyState("live");
      } catch (_error) {
        setSkyState("local");
      }
    }

    setSkyState("local");
    if (!params.has("live-sky")) return;
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 900));
    window.addEventListener("load", () => schedule(loadSkyImage), { once: true });
  }

  function waitForCriticalArtReady() {
    const domReady = document.readyState === "loading"
      ? new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }))
      : Promise.resolve();

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
            reject(new Error("Critical art image has no dimensions"));
            return;
          }
          if (image.decode) image.decode().catch(() => {}).then(resolve);
          else resolve();
        };
        const fail = () => {
          image.removeEventListener("load", done);
          image.removeEventListener("error", fail);
          reject(new Error("Critical art image failed to load"));
        };
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", fail, { once: true });
      });
    }

    return domReady.then(() => {
      const images = Array.from(document.querySelectorAll([
        ".ai-poster",
        ".market-poster"
      ].join(",")));
      const fontReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
      const decoded = Promise.all(images.map(waitImage)).then(() => undefined, () => new Promise(() => {}));
      const timeout = new Promise((resolve) => window.setTimeout(() => resolve({ timedOut: true }), 12000));
      return Promise.race([
        Promise.all([decoded, fontReady]).then(() => ({ timedOut: false })),
        timeout
      ]);
    });
  }

  function setupArtPreloadReveal(artReady) {
    const body = document.body;
    if (!body.classList.contains("art-preload")) return;
    let released = false;
    function loadDeferredImages() {
      document.querySelectorAll("img[data-deferred-src]").forEach((image) => {
        if (!image.getAttribute("src")) image.setAttribute("src", image.dataset.deferredSrc);
      });
    }
    function release() {
      if (released) return;
      released = true;
      body.classList.remove("art-preload");
      body.classList.add("art-ready");
      loadDeferredImages();
    }
    artReady.then((result) => {
      if (result && result.timedOut) body.classList.add("art-timeout");
      requestAnimationFrame(() => requestAnimationFrame(release));
    });
  }

  function setupLogoFluid() {
    const canvas = document.getElementById("logo-fluid");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement || canvas;
    const particles = [];
    const targets = [];
    let width = 1, height = 1, ratio = 1, frame = 0, lastFrame = 0;
    const pointer = { x: 0, y: 0, active: false };

    function resize() {
      const size = fitCanvas(canvas, host, performanceProfile.isLite ? 1.05 : 2.2);
      width = size.width;
      height = size.height;
      ratio = size.ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildTargets();
      buildParticles();
    }

    function buildTargets() {
      targets.length = 0;
      const mask = document.createElement("canvas");
      const m = mask.getContext("2d");
      mask.width = width;
      mask.height = height;
      m.fillStyle = "#fff";
      m.textAlign = "center";
      m.textBaseline = "middle";
      m.font = "900 " + Math.floor(width * 0.34) + "px Inter, Arial, sans-serif";
      m.fillText("ZL", width / 2, height / 2 + height * 0.02);
      const image = m.getImageData(0, 0, width, height).data;
      const step = Math.max(performanceProfile.isLite ? 5 : 3, Math.floor(width / (performanceProfile.isLite ? 54 : 82)));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (image[(y * width + x) * 4 + 3] > 80) targets.push({ x, y });
        }
      }
    }

    function buildParticles() {
      const count = Math.min(
        performanceProfile.isLite ? 520 : 1600,
        Math.max(performanceProfile.isLite ? 140 : 360, Math.floor(targets.length * (performanceProfile.particleScale || 1)))
      );
      particles.length = 0;
      for (let i = 0; i < count; i += 1) {
        const target = targets[i % Math.max(1, targets.length)] || { x: width / 2, y: height / 2 };
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          tx: target.x,
          ty: target.y,
          phase: Math.random() * Math.PI * 2,
          color: i % 3
        });
      }
    }

    function rgba(index, alpha) {
      const colors = [[49, 215, 255], [127, 242, 255], [255, 191, 69]];
      const c = colors[index % colors.length];
      return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha + ")";
    }

    function draw(now) {
      now = Number.isFinite(now) ? now : performance.now();
      if (!prefersReducedMotion && !shouldDrawFrame(lastFrame, now, performanceProfile.frameMs || 16)) {
        requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      frame += prefersReducedMotion ? 0 : (performanceProfile.isLite ? 0.65 : 1);
      const time = frame * 0.012;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p) => {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const swirl = Math.sin(time + p.phase + p.x * 0.012) * 0.12;
        p.vx += dx * 0.0042 - dy * 0.00052 + Math.cos(time + p.phase) * 0.018 + swirl;
        p.vy += dy * 0.0042 + dx * 0.00052 + Math.sin(time * 1.1 + p.phase) * 0.018;
        if (pointer.active) {
          const px = p.x - pointer.x;
          const py = p.y - pointer.y;
          const d = Math.max(1, Math.hypot(px, py));
          const f = Math.max(0, 1 - d / (width * 0.42));
          p.vx += (px / d) * f * 1.05;
          p.vy += (py / d) * f * 1.05;
        }
        p.vx *= 0.91;
        p.vy *= 0.91;
        p.x += p.vx;
        p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.66, 0, Math.PI * 2);
        ctx.fillStyle = rgba(p.color, 0.48);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });
    canvas.addEventListener("pointerleave", () => { pointer.active = false; });
    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  function setupAiCircuitVisual(artReady) {
    const visual = document.querySelector("[data-ai-visual]");
    const canvas = visual && visual.querySelector("[data-ai-circuit-canvas]");
    if (!visual || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 1, height = 1, ratio = 1, raf = 0, last = 0, lastDraw = 0;
    const paths = [
      [[0.08,0.24],[0.19,0.24],[0.19,0.38],[0.36,0.38]],
      [[0.02,0.50],[0.23,0.50],[0.31,0.44],[0.41,0.44]],
      [[0.07,0.72],[0.24,0.72],[0.24,0.63],[0.38,0.63]],
      [[0.30,0.02],[0.30,0.21],[0.43,0.21],[0.43,0.33]],
      [[0.52,0.02],[0.52,0.26],[0.50,0.34]],
      [[0.70,0.04],[0.70,0.28],[0.61,0.38]],
      [[0.96,0.24],[0.78,0.24],[0.78,0.38],[0.64,0.38]],
      [[0.98,0.50],[0.81,0.50],[0.72,0.46],[0.62,0.46]],
      [[0.92,0.74],[0.76,0.74],[0.76,0.62],[0.63,0.62]],
      [[0.34,0.98],[0.34,0.78],[0.43,0.70]],
      [[0.52,0.98],[0.52,0.78],[0.50,0.68]],
      [[0.72,0.98],[0.72,0.80],[0.61,0.70]],
      [[0.12,0.16],[0.12,0.34],[0.22,0.34]],
      [[0.88,0.12],[0.88,0.34],[0.79,0.34]],
      [[0.14,0.86],[0.14,0.78],[0.27,0.78]],
      [[0.88,0.86],[0.88,0.78],[0.75,0.78]]
    ];

    function resize() {
      const size = fitCanvas(canvas, visual, performanceProfile.isLite ? 1.05 : 1.65);
      width = size.width;
      height = size.height;
      ratio = size.ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawPath(path, tone, alpha) {
      const color = tone ? [255, 232, 186] : [86, 232, 255];
      ctx.strokeStyle = "rgba(" + color.join(",") + "," + alpha + ")";
      ctx.lineWidth = 1.05;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      path.forEach((point, i) => {
        const x = point[0] * width;
        const y = point[1] * height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    function pointOnPath(path, progress) {
      const lengths = [];
      let total = 0;
      for (let i = 1; i < path.length; i += 1) {
        const ax = path[i-1][0] * width, ay = path[i-1][1] * height;
        const bx = path[i][0] * width, by = path[i][1] * height;
        const d = Math.hypot(bx - ax, by - ay);
        lengths.push(d); total += d;
      }
      let target = progress * total;
      for (let i = 1; i < path.length; i += 1) {
        const segment = lengths[i-1] || 1;
        if (target <= segment) {
          const local = target / segment;
          return {
            x: (path[i-1][0] + (path[i][0] - path[i-1][0]) * local) * width,
            y: (path[i-1][1] + (path[i][1] - path[i-1][1]) * local) * height
          };
        }
        target -= segment;
      }
      const p = path[path.length - 1];
      return { x: p[0] * width, y: p[1] * height };
    }

    function drawNode(x, y, color, active) {
      const radius = active ? 3.7 : 2.3;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, active ? 20 : 12);
      glow.addColorStop(0, "rgba(255,255,255," + (active ? 0.55 : 0.26) + ")");
      glow.addColorStop(0.32, "rgba(" + color.join(",") + "," + (active ? 0.32 : 0.13) + ")");
      glow.addColorStop(1, "rgba(" + color.join(",") + ",0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, active ? 20 : 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(245,252,255," + (active ? 0.86 : 0.5) + ")";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function activation() {
      const rect = visual.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      return clamp(1 - Math.abs((rect.top + rect.height / 2) - viewport / 2) / (viewport * 0.8), 0, 1);
    }

    function draw(now) {
      now = Number.isFinite(now) ? now : performance.now();
      if (!prefersReducedMotion && !shouldDrawFrame(lastDraw, now, performanceProfile.frameMs || 16)) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const dt = Math.min(32, now - last || 16);
      last = now;
      const active = activation();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      const haze = ctx.createRadialGradient(width * 0.5, height * 0.53, 0, width * 0.5, height * 0.53, Math.max(width, height) * 0.52);
      haze.addColorStop(0, "rgba(40, 215, 255," + (0.025 + active * 0.055) + ")");
      haze.addColorStop(0.48, "rgba(23, 127, 150," + (0.018 + active * 0.025) + ")");
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);

      paths.forEach((path, i) => drawPath(path, i % 5 === 0, 0.09 + active * 0.11));
      if (!prefersReducedMotion) {
        paths.forEach((path, i) => {
          if (i % 2 && active < 0.18) return;
          const p = pointOnPath(path, (now * (0.00011 + i * 0.000006) + i * 0.073) % 1);
          const tone = i % 5 === 0 ? [255, 215, 150] : [72, 229, 255];
          drawNode(p.x, p.y, tone, i % 3 === 0 || active > 0.6);
        });
      }
      paths.forEach((path, i) => {
        const end = path[path.length - 1];
        if (i % 3 === 0) drawNode(end[0] * width, end[1] * height, [82, 232, 255], false);
      });
      ctx.globalCompositeOperation = "source-over";
      if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      if (!document.hidden) raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else { last = 0; lastDraw = 0; raf = requestAnimationFrame(draw); }
    });
    artReady.then(start);
  }

  function setupMarketGlobe(artReady) {
    const visual = document.querySelector("[data-market-visual]");
    const canvas = visual && visual.querySelector("[data-market-canvas]");
    if (!visual || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const tape = visual.querySelector("[data-market-tape]");
    const clock = visual.querySelector("[data-local-clock]");
    let width = 1, height = 1, ratio = 1, raf = 0, lastTextureKey = "", lastDraw = 0;
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d");
    const textures = {
      surface: loadTexture("assets/earth_atmos_2048.jpg"),
      clouds: loadTexture("assets/earth_clouds_1024.png"),
      lights: loadTexture("assets/earth_lights_2048.png")
    };
    const marketSeries = buildMarketSeries();

    function loadTexture(src) {
      const asset = { ready: false, image: null, data: null, width: 0, height: 0 };
      const img = new Image();
      img.decoding = "async";
      img.addEventListener("load", () => {
        const c = document.createElement("canvas");
        const cx = c.getContext("2d");
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        cx.drawImage(img, 0, 0);
        try {
          const data = cx.getImageData(0, 0, c.width, c.height).data;
          asset.ready = true;
          asset.image = img;
          asset.data = data;
          asset.width = c.width;
          asset.height = c.height;
          lastTextureKey = "";
        } catch (error) { asset.ready = false; }
      }, { once: true });
      img.src = src;
      return asset;
    }

    function sample(asset, u, v) {
      if (!asset.ready || !asset.data) return null;
      u = ((u % 1) + 1) % 1;
      v = clamp(v, 0, 1);
      const x = Math.min(asset.width - 1, Math.max(0, Math.floor(u * asset.width)));
      const y = Math.min(asset.height - 1, Math.max(0, Math.floor(v * asset.height)));
      const o = (y * asset.width + x) * 4;
      return [asset.data[o], asset.data[o+1], asset.data[o+2], asset.data[o+3]];
    }

    function resize() {
      const size = fitCanvas(canvas, visual, performanceProfile.isLite ? 1.05 : 1.55);
      width = size.width; height = size.height; ratio = size.ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      lastTextureKey = "";
    }

    function buildMarketSeries() {
      const seed = Math.floor(Date.now() / 3600000);
      const points = [];
      const pointCount = performanceProfile.isLite ? 56 : 96;
      for (let i = 0; i < pointCount; i += 1) {
        const trend = i * 0.024 + Math.sin(seed * 0.21) * i * 0.006;
        const wave = Math.sin(i * 0.21 + seed * 0.6) * 1.1 + Math.cos(i * 0.07 + seed) * 0.65;
        points.push(100 + trend + wave);
      }
      return points;
    }

    function updateReadout() {
      const now = new Date();
      const sign = "+";
      const pct = 2.25;
      if (tape) {
        tape.textContent = "NASDAQ " + sign + pct.toFixed(2) + "%";
        tape.classList.add("is-up");
      }
      if (clock) {
        const offset = -now.getTimezoneOffset() / 60;
        const prefix = "GMT" + (offset >= 0 ? "+" : "") + offset;
        clock.textContent = prefix + " " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      }
    }

    function earthMetrics() {
      const r = Math.min(width * 0.41, height * 0.47);
      return { x: width * 0.43, y: height * 0.47, r };
    }

    function radians(v) { return v * Math.PI / 180; }
    function normalizeRadians(v) {
      let n = v % (Math.PI * 2);
      if (n > Math.PI) n -= Math.PI * 2;
      if (n < -Math.PI) n += Math.PI * 2;
      return n;
    }
    function vectorFromLatLon(lat, lon) {
      const clat = Math.cos(lat);
      return { x: clat * Math.sin(lon), y: Math.sin(lat), z: clat * Math.cos(lon) };
    }
    function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

    function solarModel(date) {
      const start = Date.UTC(date.getUTCFullYear(), 0, 0);
      const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const day = (today - start) / 86400000;
      const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
      const b = radians((360 / 364) * (day - 81));
      const equationMinutes = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
      const declination = radians(23.44) * Math.sin((Math.PI * 2 * (day - 80)) / 365.2422);
      const subsolarLon = radians(180 - (utcMinutes + equationMinutes) / 4);
      const localLon = radians((-date.getTimezoneOffset()) / 4);
      return { declination, subsolarLon, localLon, sun: vectorFromLatLon(declination, subsolarLon) };
    }

    function proceduralLand(lat, lon, time) {
      const latDeg = lat * 180 / Math.PI;
      const lonDeg = lon * 180 / Math.PI;
      function blob(clat, clon, slat, slon, amount) {
        let dLon = lonDeg - clon;
        while (dLon > 180) dLon -= 360;
        while (dLon < -180) dLon += 360;
        const a = (latDeg - clat) / slat;
        const b = dLon / slon;
        return Math.exp(-(a*a + b*b) * 0.5) * amount;
      }
      let amount = 0;
      amount += blob(47, 75, 20, 72, 0.92);
      amount += blob(23, 78, 18, 24, 0.5);
      amount += blob(9, 20, 34, 22, 0.86);
      amount += blob(45, -101, 22, 42, 0.82);
      amount += blob(66, -42, 11, 18, 0.48);
      amount += blob(-17, -61, 31, 16, 0.78);
      amount += blob(-26, 134, 13, 18, 0.56);
      amount += blob(-4, 122, 10, 28, 0.32);
      const coast = Math.sin(lon * 7.1 + lat * 3.3 + time * 0.05) * 0.1 + Math.cos(lon * 15.7 - lat * 6.2) * 0.07;
      return clamp((amount + coast - 0.42) * 2.45, 0, 1);
    }

    function buildEarthTexture(earth, now, model) {
      const detail = Math.min(
        performanceProfile.isLite ? 190 : 300,
        Math.max(performanceProfile.isLite ? 112 : 184, Math.floor(earth.r * 1.22 * (performanceProfile.textureScale || 1)))
      );
      const rotation = now * 0.000026 + model.localLon * 0.35;
      const rotationBucket = performanceProfile.isLite ? 72 : 180;
      const timeBucket = performanceProfile.isLite ? 1200 : 450;
      const key = detail + ":" + Math.floor(rotation * rotationBucket) + ":" + Math.floor(now / timeBucket);
      if (key === lastTextureKey && buffer.width === detail && buffer.height === detail) return;
      lastTextureKey = key;
      buffer.width = detail;
      buffer.height = detail;
      const image = bctx.createImageData(detail, detail);
      const data = image.data;
      const inv = 2 / detail;
      for (let y = 0; y < detail; y += 1) {
        for (let x = 0; x < detail; x += 1) {
          const sx = (x + 0.5) * inv - 1;
          const sy = (y + 0.5) * inv - 1;
          const rr = sx*sx + sy*sy;
          const o = (y * detail + x) * 4;
          if (rr > 1) { data[o+3] = 0; continue; }
          const z = Math.sqrt(1 - rr);
          const nx = sx;
          const ny = -sy;
          const nz = z;
          const lon = Math.atan2(nx, nz) + rotation;
          const lat = Math.asin(ny);
          const u = lon / (Math.PI * 2) + 0.5;
          const v = 0.5 - lat / Math.PI;
          const normal = vectorFromLatLon(lat, lon);
          const day = clamp(dot(normal, model.sun) * 0.5 + 0.5, 0, 1);
          const hardDay = clamp((day - 0.25) / 0.75, 0, 1);
          const night = clamp(1 - day * 1.35, 0, 1);
          let sr = 4, sg = 18, sb = 32;
          const s = sample(textures.surface, u, v);
          if (s) {
            sr = s[0] * 0.72; sg = s[1] * 0.78; sb = s[2] * 0.88;
          } else {
            const land = proceduralLand(lat, lon, now * 0.001);
            sr = 6 + land * 42;
            sg = 22 + land * 58;
            sb = 38 + land * 44;
          }
          const c = sample(textures.clouds, u + now * 0.000002, v);
          const cloud = c ? (c[0] + c[1] + c[2]) / 765 : clamp(Math.sin(lon * 10 + now * 0.00025 + Math.sin(lat * 6)) * 0.26 + 0.34, 0, 1);
          const l = sample(textures.lights, u, v);
          const lights = l ? Math.max(l[0], l[1], l[2]) / 255 : Math.pow(proceduralLand(lat, lon, now * 0.001), 3.2) * (Math.sin(lon * 36) * Math.sin(lat * 22) * 0.5 + 0.5);
          const rim = Math.pow(1 - z, 2.4);
          let r = sr * (0.14 + hardDay * 0.96) + 255 * lights * night * 0.82 + 185 * cloud * hardDay * 0.12;
          let g = sg * (0.14 + hardDay * 0.94) + 184 * lights * night * 0.58 + 218 * cloud * hardDay * 0.14;
          let b = sb * (0.18 + hardDay * 1.05) + 110 * lights * night * 0.32 + 240 * cloud * hardDay * 0.18;
          r += 88 * rim * 0.18; g += 202 * rim * 0.26; b += 255 * rim * 0.36;
          data[o] = clamp(r, 0, 255);
          data[o+1] = clamp(g, 0, 255);
          data[o+2] = clamp(b, 0, 255);
          data[o+3] = clamp((1 - rr) * 420, 0, 255);
        }
      }
      bctx.putImageData(image, 0, 0);
    }

    function drawSpace(model, now) {
      ctx.clearRect(0, 0, width, height);
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "rgba(1,6,13,0.96)");
      g.addColorStop(0.48, "rgba(2,9,17,0.86)");
      g.addColorStop(1, "rgba(0,2,7,0.98)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const nebula = ctx.createRadialGradient(width * 0.32, height * 0.42, 0, width * 0.32, height * 0.42, Math.max(width, height) * 0.62);
      nebula.addColorStop(0, "rgba(36, 132, 206, 0.14)");
      nebula.addColorStop(0.42, "rgba(21, 58, 104, 0.055)");
      nebula.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);
      const starCount = Math.max(performanceProfile.isLite ? 24 : 42, Math.floor(width * height / (performanceProfile.isLite ? 19000 : 9000)));
      for (let i = 0; i < starCount; i += 1) {
        const x = (Math.sin(i * 127.13) * 43758.5453 % 1 + 1) % 1 * width;
        const y = (Math.sin(i * 311.7 + 19.1) * 24634.6345 % 1 + 1) % 1 * height;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.001 + i));
        ctx.fillStyle = "rgba(220,244,255," + (0.035 + tw * 0.085) + ")";
        ctx.beginPath();
        ctx.arc(x, y, i % 13 === 0 ? 1.25 : 0.62, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawOrbitalRing(earth, now, variant, foreground) {
      ctx.save();
      ctx.translate(earth.x, earth.y);
      ctx.rotate(variant ? -0.22 : 0.18);
      ctx.scale(1, variant ? 0.29 : 0.38);
      ctx.globalCompositeOperation = "screen";
      ctx.lineWidth = variant ? 1.1 : 1.25;
      const gold = variant % 2 === 1;
      ctx.strokeStyle = gold ? "rgba(255,198,103," + (foreground ? 0.28 : 0.14) + ")" : "rgba(76,224,255," + (foreground ? 0.3 : 0.13) + ")";
      ctx.beginPath();
      const start = foreground ? Math.PI * 0.02 : Math.PI;
      const end = foreground ? Math.PI * 1.05 : Math.PI * 2.02;
      ctx.ellipse(0, 0, earth.r * (1.45 + variant * 0.12), earth.r * (1.45 + variant * 0.12), 0, start, end);
      ctx.stroke();
      if (foreground && !prefersReducedMotion) {
        const t = (now * (0.00013 + variant * 0.00004) + variant * 0.35) % 1;
        const a = start + (end - start) * t;
        const px = Math.cos(a) * earth.r * (1.45 + variant * 0.12);
        const py = Math.sin(a) * earth.r * (1.45 + variant * 0.12);
        const rg = ctx.createRadialGradient(px, py, 0, px, py, earth.r * 0.07);
        rg.addColorStop(0, "rgba(255,255,255,0.52)");
        rg.addColorStop(0.42, gold ? "rgba(255,198,103,0.22)" : "rgba(70,229,255,0.22)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(px, py, earth.r * 0.07, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    function drawMarketRoutes(earth, now) {
      const routes = [
        [-0.58, -0.18, -0.12, -0.46, 0.55, -0.14, 0],
        [-0.54, 0.18, -0.02, -0.08, 0.46, 0.28, 1],
        [-0.2, 0.42, 0.18, 0.02, 0.58, 0.05, 0],
        [-0.42, -0.38, 0.08, -0.18, 0.42, -0.33, 1]
      ];
      ctx.save();
      ctx.beginPath(); ctx.arc(earth.x, earth.y, earth.r * 1.01, 0, Math.PI * 2); ctx.clip();
      ctx.globalCompositeOperation = "screen";
      routes.forEach((route, i) => {
        const [x0,y0,cx,cy,x1,y1,gold] = route;
        const sx = earth.x + x0 * earth.r, sy = earth.y + y0 * earth.r;
        const mx = earth.x + cx * earth.r, my = earth.y + cy * earth.r;
        const ex = earth.x + x1 * earth.r, ey = earth.y + y1 * earth.r;
        ctx.strokeStyle = gold ? "rgba(255,201,111,0.22)" : "rgba(92,234,255,0.21)";
        ctx.lineWidth = Math.max(0.8, earth.r * 0.0045);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
        if (!prefersReducedMotion) {
          const t = (now * (0.00017 + i * 0.000023) + i * 0.18) % 1;
          const qx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex;
          const qy = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey;
          const rg = ctx.createRadialGradient(qx, qy, 0, qx, qy, earth.r * 0.07);
          rg.addColorStop(0, "rgba(255,255,255,0.62)");
          rg.addColorStop(0.4, gold ? "rgba(255,201,111,0.28)" : "rgba(80,231,255,0.28)");
          rg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(qx, qy, earth.r * 0.07, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.restore();
    }

    function drawEarth(now, model) {
      const earth = earthMetrics();
      buildEarthTexture(earth, now, model);
      drawOrbitalRing(earth, now, 0, false);
      drawOrbitalRing(earth, now, 1, false);
      ctx.save();
      ctx.translate(earth.x, earth.y + earth.r * 1.03);
      ctx.scale(1.12, 0.22);
      const contact = ctx.createRadialGradient(0, 0, earth.r * 0.1, 0, 0, earth.r * 1.05);
      contact.addColorStop(0, "rgba(76,219,255,0.18)");
      contact.addColorStop(0.54, "rgba(42,125,160,0.06)");
      contact.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = contact;
      ctx.beginPath(); ctx.arc(0, 0, earth.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(74, 226, 255, 0.32)";
      ctx.shadowBlur = earth.r * 0.14;
      ctx.drawImage(buffer, earth.x - earth.r, earth.y - earth.r, earth.r * 2, earth.r * 2);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const rim = ctx.createRadialGradient(earth.x, earth.y, earth.r * 0.72, earth.x, earth.y, earth.r * 1.12);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(0.76, "rgba(82,221,255,0.12)");
      rim.addColorStop(1, "rgba(82,221,255,0)");
      ctx.fillStyle = rim;
      ctx.beginPath(); ctx.arc(earth.x, earth.y, earth.r * 1.12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(172,238,255,0.26)";
      ctx.lineWidth = Math.max(1, earth.r * 0.006);
      ctx.beginPath(); ctx.arc(earth.x, earth.y, earth.r * 1.002, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      drawMarketRoutes(earth, now);
      drawOrbitalRing(earth, now, 0, true);
      drawOrbitalRing(earth, now, 1, true);
      drawMiniChart(earth, now);
    }

    function drawMiniChart(earth, now) {
      const x = earth.x - earth.r * 0.46;
      const y = earth.y + earth.r * 0.46;
      const w = earth.r * 0.66;
      const h = earth.r * 0.16;
      const min = Math.min.apply(null, marketSeries), max = Math.max.apply(null, marketSeries);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(160,239,255,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      marketSeries.forEach((v, i) => {
        const px = x + (i / (marketSeries.length - 1)) * w;
        const py = y + h - ((v - min) / Math.max(1, max - min)) * h;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    function draw(now) {
      now = Number.isFinite(now) ? now : performance.now();
      const frameMs = performanceProfile.isLite ? Math.max(performanceProfile.frameMs || 16, 1000 / 18) : (performanceProfile.frameMs || 16);
      if (!prefersReducedMotion && !shouldDrawFrame(lastDraw, now, frameMs)) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const model = solarModel(new Date());
      drawSpace(model, now);
      drawEarth(now, model);
      updateReadout();
      if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      if (!document.hidden) raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else { lastTextureKey = ""; lastDraw = 0; raf = requestAnimationFrame(draw); }
    });
    artReady.then(start);
  }

  function setupObsidianSphere(artReady) {
    const visual = document.querySelector("[data-journal-visual]");
    const stage = document.querySelector("[data-journal-stage]");
    const canvas = stage && stage.querySelector("[data-journal-canvas]");
    if (!visual || !stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const hoverLabel = document.createElement("div");
    hoverLabel.className = "obsidian-node-label";
    hoverLabel.setAttribute("aria-hidden", "true");
    stage.appendChild(hoverLabel);
    const setHovered = (hovered) => visual.classList.toggle("is-hovered", hovered);
    visual.addEventListener("pointerenter", () => setHovered(true));
    visual.addEventListener("pointerleave", () => setHovered(false));
    visual.addEventListener("focusin", () => setHovered(true));
    visual.addEventListener("focusout", () => setHovered(false));
    let width = 1, height = 1, ratio = 1, raf = 0;
    let transferTimer = 0;
    let graphTotal = 0;
    let streamComplete = false;
    let hoveredId = "";
    let screenNodes = [];
    let activatedAt = 0;
    let activationStarted = false;
    let activationObserver = null;
    let lastDraw = 0;
    const streamDelay = prefersReducedMotion ? 0 : (performanceProfile.isLite ? 260 : 190);
    const nodes = [];
    const journalStars = makeJournalStars(Math.max(36, Math.round(176 * (performanceProfile.starScale || 1))));
    let edges = [];
    let graphLinks = [];
    let categories = new Map([
      ["core", { color: "#f5f8fb" }],
      ["ai", { color: "#ffb4a7" }],
      ["research", { color: "#f3f6ff" }],
      ["reflection", { color: "#dde8ff" }],
      ["practice", { color: "#e0f8ff" }],
      ["language", { color: "#d9fbff" }],
      ["public", { color: "#eee9ff" }]
    ]);
    stage.dataset.transfer = "waiting";
    stage.dataset.revealedNodes = "0";
    stage.dataset.totalNodes = "0";

    function delay(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function makeJournalStars(count) {
      function fract(value) {
        return value - Math.floor(value);
      }
      function rand(seed) {
        return fract(Math.sin(seed * 12.9898) * 43758.5453);
      }
      return Array.from({ length: count }, (_, i) => {
        const angle = rand(i + 9) * Math.PI * 2;
        const radius = Math.pow(rand(i + 21), 0.72);
        return {
          x: 0.5 + Math.cos(angle) * radius * 0.47,
          y: 0.5 + Math.sin(angle) * radius * 0.43,
          z: rand(i + 37),
          phase: rand(i + 51) * Math.PI * 2,
          delay: rand(i + 67) * 2100,
          drift: 4 + rand(i + 83) * 18,
          speed: 0.000045 + rand(i + 99) * 0.00012,
          size: 0.45 + Math.pow(rand(i + 111), 2) * 1.85,
          warm: rand(i + 127) > 0.82
        };
      }).sort((a, b) => a.delay - b.delay);
    }

    function parseColor(value, fallback) {
      const raw = String(value || "").replace("#", "");
      if (!/^[0-9a-f]{6}$/i.test(raw)) return fallback;
      const n = parseInt(raw, 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }

    function categoryColor(node) {
      const category = categories.get(node.category) || categories.get("public") || {};
      return parseColor(category.color, [238, 244, 255]);
    }

    function orderedNodes(items) {
      const priority = new Map([
        ["zephyrlabs-journal", 0],
        ["research", 1],
        ["philosophy", 2],
        ["geminus", 3],
        ["snowboard", 4],
        ["ai", 5],
        ["language", 6]
      ]);
      return items.slice().sort((a, b) => {
        const pa = priority.has(a.id) ? priority.get(a.id) : 20;
        const pb = priority.has(b.id) ? priority.get(b.id) : 20;
        return pa - pb || String(a.title || a.id).localeCompare(String(b.title || b.id));
      });
    }

    function positionFor(node, index, total) {
      if (node.id === "zephyrlabs-journal") return [0, 0, 1];
      const rank = Math.max(0, index - 1);
      const count = Math.max(1, total - 1);
      const y = 1 - ((rank + 0.5) / count) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = rank * 2.399963229728653;
      const boost = node.kind === "constellation" ? 0.72 : node.kind === "project" ? 0.84 : 0.96;
      return [Math.cos(angle) * ring * boost, y * boost, Math.sin(angle) * ring * boost];
    }

    function refreshEdges() {
      const ids = new Set(nodes.map((node) => node.id));
      edges = graphLinks
        .filter((link) => ids.has(link.source) && ids.has(link.target))
        .map((link) => [link.source, link.target]);
    }

    function addGraphNode(rawNode) {
      if (!rawNode || !rawNode.id || nodes.some((node) => node.id === rawNode.id)) return;
      const index = nodes.length;
      const node = {
        id: rawNode.id,
        title: rawNode.id === "zephyrlabs-journal" ? "Journal" : rawNode.title || rawNode.id,
        category: rawNode.category || "public",
        kind: rawNode.kind || "note",
        c: categoryColor(rawNode),
        p: positionFor(rawNode, index, graphTotal || index + 1),
        addedAt: performance.now(),
        size: rawNode.kind === "constellation" ? 1.22 : rawNode.kind === "project" ? 1.12 : 0.88
      };
      nodes.push(node);
      refreshEdges();
      stage.dataset.totalNodes = String(graphTotal || nodes.length);
      stage.dataset.transferredNodes = String(nodes.length);
    }

    function applyMeta(meta) {
      if (Array.isArray(meta.categories)) categories = new Map(meta.categories.map((item) => [item.id, item]));
      if (Array.isArray(meta.links)) graphLinks = meta.links;
      graphTotal = Number(meta.totalNodes) || graphTotal || 0;
      stage.dataset.totalNodes = String(graphTotal);
    }

    async function loadStreamedGraph() {
      stage.dataset.transfer = "active";
      try {
        const response = await fetch("/api/journal/graph/stream", { cache: "no-store" });
        if (!response.ok || !response.body) throw new Error("stream unavailable");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (event.type === "meta") applyMeta(event);
            if (event.type === "node") {
              addGraphNode(event.node);
              if (streamDelay) await delay(streamDelay);
            }
          }
        }
      } catch (_error) {
        const response = await fetch("journal-data.json", { cache: "force-cache" });
        if (!response.ok) return;
        const data = await response.json();
        const ordered = orderedNodes(Array.isArray(data.nodes) ? data.nodes : []);
        applyMeta({
          totalNodes: ordered.length,
          categories: data.categories || [],
          links: data.links || []
        });
        for (const node of ordered) {
          addGraphNode(node);
          if (streamDelay) await delay(streamDelay);
        }
      } finally {
        streamComplete = true;
      }
    }

    function keepTransferMoving() {
      if (document.hidden) return;
      cancelAnimationFrame(raf);
      draw(performance.now());
      if (stage.dataset.transfer !== "complete") {
        transferTimer = window.setTimeout(keepTransferMoving, performanceProfile.isLite ? 260 : 180);
      }
    }

    function beginRenderAfterArtReady() {
      if (stage.dataset.transfer !== "waiting") return;
      activationStarted = true;
      activatedAt = performance.now();
      stage.dataset.transfer = "priming";
      stage.dataset.starfield = "active";
      keepTransferMoving();
      window.setTimeout(loadStreamedGraph, prefersReducedMotion ? 80 : 620);
      if (activationObserver) activationObserver.disconnect();
    }

    function armJournalReveal() {
      const section = visual.closest(".project-card-section") || visual;
      const shouldStart = () => {
        const rect = section.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        return rect.top < viewport * 0.82 && rect.bottom > viewport * 0.1;
      };
      const check = () => {
        if (stage.dataset.transfer !== "waiting") return;
        if (shouldStart()) beginRenderAfterArtReady();
      };
      if ("IntersectionObserver" in window) {
        activationObserver = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) beginRenderAfterArtReady();
        }, { rootMargin: "-10% 0px -18% 0px", threshold: 0.08 });
        activationObserver.observe(section);
      } else {
        window.addEventListener("scroll", check, { passive: true });
        window.addEventListener("resize", check);
      }
      check();
    }

    function resize() {
      const size = fitCanvas(canvas, stage, performanceProfile.isLite ? 1.05 : 1.7);
      width = size.width;
      height = size.height;
      ratio = size.ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function rotate(point, t) {
      let [x, y, z] = point;
      const ay = t * 0.00018;
      const ax = -0.34 + Math.sin(t * 0.00011) * 0.08;
      const cy = Math.cos(ay), sy = Math.sin(ay);
      const cx = Math.cos(ax), sx = Math.sin(ax);
      let x1 = x * cy + z * sy;
      let z1 = -x * sy + z * cy;
      let y1 = y * cx - z1 * sx;
      z1 = y * sx + z1 * cx;
      return [x1, y1, z1];
    }

    function project(point, t) {
      const [x, y, z] = rotate(point, t);
      const s = 0.74 + z * 0.22;
      const r = Math.min(width, height) * 0.32;
      return {
        x: width * 0.5 + x * r * s,
        y: height * 0.5 + y * r * s,
        z: clamp((z + 1) / 2, 0, 1)
      };
    }

    function revealFor(node, now) {
      if (prefersReducedMotion) return 1;
      const value = (now - node.addedAt) / 1380;
      return easeInOut(value);
    }

    function edgeRevealFor(a, b, now) {
      if (prefersReducedMotion) return 1;
      const value = (now - Math.max(a.node.addedAt, b.node.addedAt) - 260) / 920;
      return easeInOut(value);
    }

    function journalIntro(now) {
      if (!activationStarted || !activatedAt) return 0;
      if (prefersReducedMotion) return 1;
      return easeInOut((now - activatedAt) / 2400);
    }

    function starReveal(star, now) {
      if (!activationStarted || !activatedAt) return 0;
      if (prefersReducedMotion) return 1;
      return easeInOut((now - activatedAt - star.delay) / 1450);
    }

    function drawJournalStarfield(now, intro) {
      if (intro <= 0.001) return;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      journalStars.forEach((star, index) => {
        const reveal = starReveal(star, now);
        if (reveal <= 0.01) return;
        const wave = Math.sin(now * star.speed + star.phase);
        const cross = Math.cos(now * star.speed * 0.73 + star.phase * 1.6);
        const x = star.x * width + wave * star.drift * (0.18 + star.z * 0.82);
        const y = star.y * height + cross * star.drift * 0.54;
        const twinkle = 0.62 + 0.38 * Math.sin(now * (0.001 + star.speed * 11) + star.phase);
        const alpha = reveal * intro * (0.08 + star.z * 0.32) * twinkle;
        const size = star.size * (0.7 + reveal * 0.3);
        const color = star.warm ? "255,218,168" : "206,241,255";
        const halo = ctx.createRadialGradient(x, y, 0, x, y, size * (7 + star.z * 6));
        halo.addColorStop(0, "rgba(" + color + "," + (alpha * 0.9) + ")");
        halo.addColorStop(0.32, "rgba(" + color + "," + (alpha * 0.2) + ")");
        halo.addColorStop(1, "rgba(" + color + ",0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, size * (7 + star.z * 6), 0, Math.PI * 2);
        ctx.fill();
        if (index % 9 === 0 && reveal > 0.55) {
          ctx.strokeStyle = "rgba(" + color + "," + (alpha * 0.22) + ")";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(x - size * 5, y);
          ctx.lineTo(x + size * 5, y);
          ctx.moveTo(x, y - size * 4);
          ctx.lineTo(x, y + size * 4);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    function updateHoverLabel(point) {
      if (!point || !point.node) {
        hoverLabel.removeAttribute("data-visible");
        hoverLabel.removeAttribute("data-anchor");
        return;
      }
      const color = point.node.c || [238, 244, 255];
      const anchorLeft = point.x > width * 0.58;
      const x = clamp(point.x + (anchorLeft ? -18 : 18), 18, width - 18);
      const y = clamp(point.y - 2, 20, height - 20);
      hoverLabel.textContent = point.node.title;
      hoverLabel.style.left = x.toFixed(1) + "px";
      hoverLabel.style.top = y.toFixed(1) + "px";
      hoverLabel.style.setProperty("--label-rgb", color.join(","));
      hoverLabel.style.setProperty("--label-depth", point.z.toFixed(3));
      hoverLabel.dataset.anchor = anchorLeft ? "left" : "right";
      hoverLabel.dataset.visible = "true";
    }

    function drawArrivalPulse(point, visibleReveal, now) {
      if (prefersReducedMotion) return;
      const age = clamp((now - point.node.addedAt) / 1050, 0, 1);
      if (age >= 1 || visibleReveal <= 0.02) return;
      const color = point.node.c;
      const pulse = easeInOut(age);
      const radius = 12 + point.z * 18 + pulse * 34;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(" + color.join(",") + "," + ((1 - pulse) * 0.32 * visibleReveal) + ")";
      ctx.lineWidth = 1.1 + (1 - pulse) * 1.4;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      const ray = 22 + pulse * 28;
      ctx.strokeStyle = "rgba(255,255,255," + ((1 - pulse) * 0.16 * visibleReveal) + ")";
      ctx.beginPath();
      ctx.moveTo(point.x - ray, point.y);
      ctx.lineTo(point.x + ray, point.y);
      ctx.moveTo(point.x, point.y - ray * 0.72);
      ctx.lineTo(point.x, point.y + ray * 0.72);
      ctx.stroke();
      ctx.restore();
    }

    function draw(now) {
      now = Number.isFinite(now) ? now : performance.now();
      const frameMs = performanceProfile.isLite ? Math.max(performanceProfile.frameMs || 16, 1000 / 18) : (performanceProfile.frameMs || 16);
      if (!prefersReducedMotion && !shouldDrawFrame(lastDraw, now, frameMs)) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      ctx.clearRect(0, 0, width, height);
      const cx = width * 0.5, cy = height * 0.5;
      const radius = Math.min(width, height) * 0.34;
      const intro = journalIntro(now);
      drawJournalStarfield(now, intro);
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const glow = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 1.35);
      glow.addColorStop(0, "rgba(105,152,255," + (0.04 + intro * 0.11) + ")");
      glow.addColorStop(0.45, "rgba(49,215,255," + (0.02 + intro * 0.055) + ")");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = "rgba(183,211,255," + (0.035 + intro * 0.095) + ")";
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i += 1) {
        const yy = cy + i * radius * 0.18;
        ctx.beginPath(); ctx.ellipse(cx, yy, radius * Math.sqrt(1 - Math.min(0.85, Math.pow(i / 4, 2))), radius * 0.08, 0, 0, Math.PI * 2); ctx.stroke();
      }
      for (let i = 0; i < 6; i += 1) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * Math.PI / 6 + now * 0.00008); ctx.scale(0.32, 1); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }

      const projected = nodes.map((node) => ({ node, reveal: revealFor(node, now), ...project(node.p, now) }));
      const revealedCount = projected.filter((point) => point.reveal * intro > 0.06).length;
      stage.dataset.revealedNodes = String(revealedCount);
      if (streamComplete && revealedCount >= nodes.length && nodes.length >= graphTotal) stage.dataset.transfer = "complete";

      edges.forEach(([a, b]) => {
        const pa = projected.find((point) => point.node.id === a);
        const pb = projected.find((point) => point.node.id === b);
        if (!pa || !pb) return;
        const reveal = Math.min(pa.reveal, pb.reveal, edgeRevealFor(pa, pb, now));
        if (reveal <= 0.02) return;
        const alpha = (0.06 + Math.min(pa.z, pb.z) * 0.22) * reveal * intro;
        ctx.strokeStyle = "rgba(166,197,255," + alpha + ")";
        ctx.lineWidth = (0.9 + Math.min(pa.z, pb.z) * 0.7) * (0.65 + reveal * 0.35);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      });

      projected.sort((a, b) => a.z - b.z).forEach((p) => {
        const visibleReveal = p.reveal * intro;
        if (visibleReveal <= 0.01) return;
        const color = p.node.c;
        const scaleIn = 0.48 + visibleReveal * 0.52;
        const r = (2.1 + p.z * 4.1) * p.node.size * scaleIn;
        p.radius = r;
        p.hitRadius = Math.max(16, r + 12);
        const haloRadius = 20 + p.z * 19;
        drawArrivalPulse(p, visibleReveal, now);
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
        rg.addColorStop(0, "rgba(255,255,255," + ((0.42 + p.z * 0.34) * visibleReveal) + ")");
        rg.addColorStop(0.4, "rgba(" + color.join(",") + "," + ((0.14 + p.z * 0.2) * visibleReveal) + ")");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(245,250,255," + ((0.38 + p.z * 0.5) * visibleReveal) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        if (p.node.id === hoveredId) {
          ctx.strokeStyle = "rgba(" + color.join(",") + "," + (0.42 + p.z * 0.22) + ")";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(8, r + 7), 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      screenNodes = projected.filter((point) => point.reveal * intro > 0.18).sort((a, b) => b.z - a.z);
      updateHoverLabel(screenNodes.find((point) => point.node.id === hoveredId));
      ctx.restore();
      if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
    }

    function hitNode(event) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (width / Math.max(1, rect.width));
      const y = (event.clientY - rect.top) * (height / Math.max(1, rect.height));
      let best = null;
      let bestScore = Infinity;
      screenNodes.forEach((point) => {
        const distance = Math.hypot(point.x - x, point.y - y);
        const radius = point.hitRadius || 14;
        if (distance > radius) return;
        const score = distance / radius - point.z * 0.08;
        if (score < bestScore) {
          best = point.node;
          bestScore = score;
        }
      });
      return best;
    }

    stage.addEventListener("pointerenter", () => visual.classList.add("is-hovered"));
    stage.addEventListener("pointerleave", () => visual.classList.remove("is-hovered"));
    canvas.addEventListener("pointermove", (event) => {
      const node = hitNode(event);
      hoveredId = node ? node.id : "";
      if (hoveredId) canvas.dataset.hoveredNode = hoveredId;
      else delete canvas.dataset.hoveredNode;
      if (hoveredId) stage.dataset.hoveredNode = hoveredId;
      else delete stage.dataset.hoveredNode;
      if (!hoveredId) updateHoverLabel(null);
      canvas.style.cursor = node ? "pointer" : "default";
    });
    canvas.addEventListener("pointerleave", () => {
      hoveredId = "";
      delete canvas.dataset.hoveredNode;
      delete stage.dataset.hoveredNode;
      updateHoverLabel(null);
      canvas.style.cursor = "default";
    });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        window.clearTimeout(transferTimer);
      } else if (stage.dataset.transfer !== "waiting") {
        lastDraw = 0;
        keepTransferMoving();
      }
    });
    resize();
    artReady.then(() => window.setTimeout(armJournalReveal, prefersReducedMotion ? 80 : 220));
  }

})();
