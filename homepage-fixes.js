(function () {
  "use strict";

  const Effects = window.ZephyrEffects || {};
  const reduceMotion = Effects.prefersReducedMotion
    ? Effects.prefersReducedMotion()
    : new URLSearchParams(window.location.search).has("reduced-motion");
  const clamp = Effects.clamp || ((value, min, max) => Math.min(max, Math.max(min, value)));
  const fitCanvas = Effects.fitCanvas || ((canvas, host, maxRatio) => {
    const rect = host.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, maxRatio || 1.6);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const targetWidth = Math.floor(width * ratio);
    const targetHeight = Math.floor(height * ratio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    }
    const ctx = canvas.getContext("2d", { alpha: true });
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { width, height, ratio, ctx };
  });
  const cardFocusFor = Effects.cardFocusFor || ((frame) => {
    const rect = frame.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const center = rect.top + rect.height * 0.5;
    const focus = clamp(1 - Math.abs(center - viewport * 0.5) / (viewport * 0.62), 0, 1);
    const reveal = clamp((viewport - rect.top) / (viewport * 0.72), 0, 1);
    const leave = clamp(rect.bottom / (viewport * 0.55), 0, 1);
    const visibility = Math.min(reveal, leave);
    const smooth = focus * focus * (3 - 2 * focus);
    return smooth * visibility;
  });

  function installCardFocusDimming() {
    if (Effects.setupCardFocusDimming) {
      Effects.setupCardFocusDimming({ prefersReducedMotion: reduceMotion });
    }
  }

  function installAiFlowPatch() {
    const visual = document.querySelector("[data-ai-visual]");
    if (!visual) return;
    const original = visual.querySelector("[data-ai-circuit-canvas]");
    if (original) original.setAttribute("aria-hidden", "true");
    visual.classList.add("has-ai-flow-patch");

    const canvas = document.createElement("canvas");
    canvas.className = "ai-flow-canvas";
    canvas.setAttribute("aria-hidden", "true");
    visual.insertBefore(canvas, visual.querySelector(".visual-vignette"));

    const chip = { left: 0.305, right: 0.695, top: 0.342, bottom: 0.715 };
    const paths = [
      [[0.02, 0.24], [0.16, 0.24], [0.16, 0.38], [chip.left, 0.38]],
      [[0.04, 0.49], [0.18, 0.49], [0.18, 0.48], [chip.left, 0.48]],
      [[0.035, 0.72], [0.22, 0.72], [0.22, 0.62], [chip.left, 0.62]],
      [[0.12, 0.12], [0.12, 0.33], [0.2, 0.33], [0.2, 0.43], [chip.left, 0.43]],
      [[0.18, 0.96], [0.18, 0.8], [0.32, 0.8], [0.32, chip.bottom]],
      [[0.02, 0.84], [0.24, 0.84], [0.24, 0.7], [chip.left, 0.7]],
      [[0.965, 0.26], [0.8, 0.26], [0.8, 0.39], [chip.right, 0.39]],
      [[0.98, 0.52], [0.82, 0.52], [0.82, 0.5], [chip.right, 0.5]],
      [[0.94, 0.72], [0.77, 0.72], [0.77, 0.63], [chip.right, 0.63]],
      [[0.88, 0.1], [0.88, 0.34], [0.78, 0.34], [0.78, 0.44], [chip.right, 0.44]],
      [[0.82, 0.95], [0.82, 0.82], [0.66, 0.82], [0.66, chip.bottom]],
      [[0.98, 0.84], [0.74, 0.84], [0.74, 0.71], [chip.right, 0.71]],
      [[0.5, 0.02], [0.5, 0.18], [0.44, 0.18], [0.44, chip.top]],
      [[0.62, 0.02], [0.62, 0.16], [0.56, 0.16], [0.56, chip.top]],
      [[0.34, 0.06], [0.34, 0.22], [0.38, 0.22], [0.38, chip.top]],
      [[0.72, 0.08], [0.72, 0.25], [0.63, 0.25], [0.63, chip.top]],
      [[0.5, 0.98], [0.5, 0.82], [0.46, 0.82], [0.46, chip.bottom]],
      [[0.59, 0.99], [0.59, 0.85], [0.54, 0.85], [0.54, chip.bottom]],
      [[0.37, 0.96], [0.37, 0.83], [0.4, 0.83], [0.4, chip.bottom]],
      [[0.7, 0.98], [0.7, 0.83], [0.61, 0.83], [0.61, chip.bottom]],
      [[0.05, 0.32], [0.26, 0.32], [0.32, chip.top]],
      [[0.95, 0.34], [0.78, 0.34], [0.68, chip.top]]
    ];

    let width = 0;
    let height = 0;
    let ctx = null;
    let phase = 0;
    let last = 0;
    let raf = 0;

    function resize() {
      const fit = fitCanvas(canvas, visual, 1.75);
      width = fit.width;
      height = fit.height;
      ctx = fit.ctx;
    }

    function pointAt(path, progress) {
      const segments = [];
      let total = 0;
      for (let i = 1; i < path.length; i += 1) {
        const ax = path[i - 1][0] * width;
        const ay = path[i - 1][1] * height;
        const bx = path[i][0] * width;
        const by = path[i][1] * height;
        const dist = Math.hypot(bx - ax, by - ay);
        segments.push(dist);
        total += dist;
      }
      let target = ((progress % 1) + 1) % 1 * total;
      for (let i = 1; i < path.length; i += 1) {
        const len = segments[i - 1] || 1;
        if (target <= len) {
          const t = target / len;
          return {
            x: (path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t) * width,
            y: (path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t) * height,
            wrap: false
          };
        }
        target -= len;
      }
      const end = path[path.length - 1];
      return { x: end[0] * width, y: end[1] * height, wrap: false };
    }

    function strokePath(path, color, lineWidth) {
      ctx.beginPath();
      path.forEach((point, index) => {
        const x = point[0] * width;
        const y = point[1] * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    function flowLine(path, progress, span, alpha, lineWidth) {
      const samples = 26;
      let previousProgress = null;
      let first = null;
      let lastPoint = null;
      const points = [];
      for (let i = 0; i <= samples; i += 1) {
        const local = i / samples;
        const p = (progress - span + span * local + 1) % 1;
        const point = pointAt(path, p);
        points.push({ point, p });
        if (!first) first = point;
        lastPoint = point;
      }
      const gradient = ctx.createLinearGradient(first.x, first.y, lastPoint.x, lastPoint.y);
      gradient.addColorStop(0, "rgba(0, 185, 255, 0)");
      gradient.addColorStop(0.18, "rgba(33, 145, 185," + (alpha * 0.26) + ")");
      gradient.addColorStop(0.54, "rgba(82, 232, 255," + (alpha * 0.74) + ")");
      gradient.addColorStop(0.72, "rgba(244, 255, 255," + alpha + ")");
      gradient.addColorStop(1, "rgba(82, 232, 255, 0)");

      ctx.beginPath();
      points.forEach((entry, index) => {
        if (index === 0 || (previousProgress !== null && Math.abs(entry.p - previousProgress) > 0.5)) {
          ctx.moveTo(entry.point.x, entry.point.y);
        } else {
          ctx.lineTo(entry.point.x, entry.point.y);
        }
        previousProgress = entry.p;
      });
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    function draw(now) {
      if (!ctx) resize();
      const delta = last ? now - last : 16;
      last = now;
      const frame = visual.closest(".project-card-frame") || visual;
      const focus = cardFocusFor(frame);
      const active = clamp(0.18 + focus * 0.82, 0.12, 1);
      visual.style.setProperty("--ai-activation", active.toFixed(3));
      if (!reduceMotion) phase = (phase + delta * 0.000065 * (0.55 + active * 0.75)) % 1;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.fillStyle = "rgba(0, 4, 9, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";
      paths.forEach((path, index) => {
        const baseAlpha = 0.045 + active * 0.035;
        strokePath(path, index % 3 === 0 ? "rgba(51, 172, 196," + baseAlpha + ")" : "rgba(58, 135, 158," + (baseAlpha * 0.72) + ")", 1.05);
      });

      ctx.globalCompositeOperation = "screen";
      paths.forEach((path, index) => {
        if (index % 2 !== 0 && active < 0.54) return;
        const p = reduceMotion ? (index % 7) / 7 : (phase + index * 0.073) % 1;
        const alpha = (0.16 + active * 0.42) * (index % 5 === 0 ? 1 : 0.74);
        flowLine(path, p, 0.08 + active * 0.055, alpha, 1.05 + active * 0.6);
      });

      ctx.restore();
      if (!reduceMotion) raf = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw(performance.now());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !reduceMotion) {
        window.cancelAnimationFrame(raf);
        last = 0;
        raf = window.requestAnimationFrame(draw);
      }
    });
  }

  function installRealEarthGlobe() {
    const visual = document.querySelector("[data-market-visual]");
    if (!visual) return;
    const original = visual.querySelector("[data-market-canvas]");
    if (original) original.setAttribute("aria-hidden", "true");
    visual.classList.add("has-real-earth");

    const canvas = document.createElement("canvas");
    canvas.className = "real-earth-canvas";
    canvas.setAttribute("aria-hidden", "true");
    visual.insertBefore(canvas, visual.querySelector(".visual-poster") || visual.firstChild);

    const assets = {
      day: loadTexture("assets/earth_atmos_2048.jpg"),
      clouds: loadTexture("assets/earth_clouds_1024.png"),
      lights: loadTexture("assets/earth_lights_2048.png")
    };

    const earthBuffer = document.createElement("canvas");
    const earthCtx = earthBuffer.getContext("2d", { alpha: true });
    let width = 0;
    let height = 0;
    let ctx = null;
    let lastRenderStamp = "";
    let last = 0;
    let raf = 0;

    function loadTexture(src) {
      const asset = { ready: false, width: 0, height: 0, data: null };
      const img = new Image();
      img.decoding = "async";
      img.addEventListener("load", () => {
        const buffer = document.createElement("canvas");
        const bctx = buffer.getContext("2d", { willReadFrequently: true });
        if (!bctx) return;
        buffer.width = img.naturalWidth || img.width;
        buffer.height = img.naturalHeight || img.height;
        bctx.drawImage(img, 0, 0);
        try {
          const data = bctx.getImageData(0, 0, buffer.width, buffer.height).data;
          asset.ready = true;
          asset.width = buffer.width;
          asset.height = buffer.height;
          asset.data = data;
          lastRenderStamp = "";
        } catch (error) {
          asset.ready = false;
        }
      });
      img.src = src;
      return asset;
    }

    function sample(asset, u, v) {
      if (!asset.ready || !asset.data) return null;
      const x = Math.min(asset.width - 1, Math.max(0, Math.floor((((u % 1) + 1) % 1) * asset.width)));
      const y = Math.min(asset.height - 1, Math.max(0, Math.floor(clamp(v, 0, 1) * asset.height)));
      const o = (y * asset.width + x) * 4;
      return [asset.data[o], asset.data[o + 1], asset.data[o + 2], asset.data[o + 3]];
    }

    function resize() {
      const fit = fitCanvas(canvas, visual, 1.5);
      width = fit.width;
      height = fit.height;
      ctx = fit.ctx;
      lastRenderStamp = "";
    }

    function smoothstep(edge0, edge1, value) {
      const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }

    function mix(a, b, t) {
      return a + (b - a) * t;
    }

    function vectorFromLatLon(lat, lon) {
      const clat = Math.cos(lat);
      return { x: clat * Math.sin(lon), y: Math.sin(lat), z: clat * Math.cos(lon) };
    }

    function sunModel(date) {
      const start = Date.UTC(date.getUTCFullYear(), 0, 0);
      const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const day = (today - start) / 86400000;
      const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
      const b = (2 * Math.PI * (day - 81)) / 364;
      const equation = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
      const declination = (23.44 * Math.PI / 180) * Math.sin((2 * Math.PI * (day - 80)) / 365.2422);
      const subsolarLon = ((180 - (minutes + equation) / 4) * Math.PI) / 180;
      return vectorFromLatLon(declination, subsolarLon);
    }

    function colorString(r, g, b, a) {
      return "rgba(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + "," + a + ")";
    }

    function drawSpace(now, focus) {
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#020811");
      g.addColorStop(0.48, "#03070e");
      g.addColorStop(1, "#000207");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const starCount = Math.max(20, Math.floor((width * height) / 16000));
      ctx.fillStyle = "rgba(220,244,255," + (0.035 + focus * 0.035) + ")";
      for (let i = 0; i < starCount; i += 1) {
        const x = (Math.sin(i * 78.233) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 42.927) * 0.5 + 0.5) * height * 0.88;
        const r = 0.35 + ((i * 19) % 6) / 16;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const nebula = ctx.createRadialGradient(width * 0.34, height * 0.48, 0, width * 0.34, height * 0.48, Math.max(width, height) * 0.72);
      nebula.addColorStop(0, "rgba(30, 134, 210," + (0.08 + focus * 0.09) + ")");
      nebula.addColorStop(0.46, "rgba(18, 57, 105," + (0.035 + focus * 0.035) + ")");
      nebula.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    function earthMetrics() {
      const r = Math.min(width, height) * (width < 480 ? 0.32 : 0.36);
      return {
        r,
        x: width * (width < 480 ? 0.5 : 0.39),
        y: height * (width < 480 ? 0.45 : 0.49)
      };
    }

    function renderEarthTexture(earth, now) {
      if (!earthCtx) return;
      const detail = Math.round(clamp(earth.r * 1.65, 180, 520));
      const frameStamp = Math.floor(now / 64) + ":" + detail + ":" + (assets.day.ready ? "d" : "p") + (assets.lights.ready ? "n" : "p") + (assets.clouds.ready ? "c" : "p");
      if (frameStamp === lastRenderStamp) return;
      lastRenderStamp = frameStamp;
      if (earthBuffer.width !== detail || earthBuffer.height !== detail) {
        earthBuffer.width = detail;
        earthBuffer.height = detail;
      }

      const image = earthCtx.createImageData(detail, detail);
      const data = image.data;
      const half = detail / 2;
      const date = new Date();
      const sun = sunModel(date);
      const realRotation = (date.getTime() / 86400000) * Math.PI * 2;
      const cinematicSpin = reduceMotion ? 0 : now * 0.000025;
      const viewerLon = -realRotation * 0.18 + cinematicSpin - 1.78;
      const cloudShift = now * 0.0000009;

      for (let y = 0; y < detail; y += 1) {
        const ny = (y + 0.5 - half) / half;
        for (let x = 0; x < detail; x += 1) {
          const nx = (x + 0.5 - half) / half;
          const rr = nx * nx + ny * ny;
          const o = (y * detail + x) * 4;
          if (rr > 1) {
            data[o + 3] = 0;
            continue;
          }
          const z = Math.sqrt(1 - rr);
          const lat = Math.asin(-ny);
          const lon = viewerLon + Math.atan2(nx, z);
          const u = lon / (Math.PI * 2) + 0.5;
          const v = 0.5 - lat / Math.PI;
          const normal = vectorFromLatLon(lat, lon);
          const sunDot = normal.x * sun.x + normal.y * sun.y + normal.z * sun.z;
          const day = smoothstep(-0.12, 0.18, sunDot);
          const night = 1 - smoothstep(-0.2, 0.06, sunDot);
          const terminator = 1 - smoothstep(0.01, 0.18, Math.abs(sunDot));
          const limb = Math.pow(clamp(z, 0, 1), 0.52);

          const dayPx = sample(assets.day, u, v);
          const lightPx = sample(assets.lights, u, v);
          const cloudPx = sample(assets.clouds, u + cloudShift, v + Math.sin(lon * 2.2 + now * 0.00005) * 0.004);

          let dr = 18, dg = 58, db = 84;
          if (dayPx) {
            const bright = (dayPx[0] + dayPx[1] + dayPx[2]) / 765;
            const contrast = 1.12;
            dr = clamp((dayPx[0] - 128) * contrast + 128 + bright * 8, 0, 255);
            dg = clamp((dayPx[1] - 128) * contrast + 128 + bright * 8, 0, 255);
            db = clamp((dayPx[2] - 128) * contrast + 128 + bright * 12, 0, 255);
          } else {
            const land = smoothstep(0.18, 0.88, Math.sin(lon * 2.1) * Math.cos(lat * 3.6) + Math.sin(lon * 7.2 + lat * 4.0) * 0.35 + 0.42);
            dr = mix(12, 92, land);
            dg = mix(48, 118, land);
            db = mix(88, 82, land);
          }

          const lightStrength = lightPx ? Math.pow((lightPx[0] + lightPx[1] + lightPx[2]) / 765, 1.1) : 0;
          const nr = 2 + lightStrength * 255;
          const ng = 7 + lightStrength * 180;
          const nb = 18 + lightStrength * 92;

          let r = mix(nr, dr, day);
          let g = mix(ng, dg, day);
          let b = mix(nb, db, day);

          const cloud = cloudPx ? clamp(((cloudPx[0] + cloudPx[1] + cloudPx[2]) / 765) * (cloudPx[3] / 255), 0, 1) : 0;
          const cloudLight = cloud * (0.08 + day * 0.62);
          r = mix(r, 238, cloudLight);
          g = mix(g, 245, cloudLight);
          b = mix(b, 252, cloudLight);

          r += terminator * 18;
          g += terminator * 25;
          b += terminator * 32;

          const atmosphere = Math.pow(1 - z, 2.4) * (0.3 + day * 0.45);
          r = mix(r, 96, atmosphere);
          g = mix(g, 170, atmosphere);
          b = mix(b, 246, atmosphere);

          data[o] = Math.round(clamp(r * limb, 0, 255));
          data[o + 1] = Math.round(clamp(g * limb, 0, 255));
          data[o + 2] = Math.round(clamp(b * limb, 0, 255));
          data[o + 3] = Math.round(255 * smoothstep(1, 0.96, rr));
        }
      }
      earthCtx.putImageData(image, 0, 0);
    }

    function drawOrbit(earth, now, index, front) {
      const colors = index === 0 ? [59, 181, 255] : [255, 194, 96];
      const tilt = index === 0 ? -0.33 : 0.42;
      const rx = earth.r * (1.28 + index * 0.16);
      const ry = earth.r * (0.36 + index * 0.05);
      const t = (now * (0.00008 + index * 0.00002) + index * 0.42) % (Math.PI * 2);
      ctx.save();
      ctx.translate(earth.x, earth.y + earth.r * (index ? 0.01 : 0.03));
      ctx.rotate(tilt);
      ctx.scale(1, 0.48);
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = colorString(colors[0], colors[1], colors[2], front ? 0.18 : 0.045);
      ctx.lineWidth = Math.max(0.6, earth.r * 0.0042);
      ctx.beginPath();
      ctx.arc(0, 0, rx, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
      ctx.stroke();
      if (front && !reduceMotion) {
        const px = Math.cos(t) * rx;
        const py = Math.sin(t) * rx;
        ctx.fillStyle = colorString(240, 252, 255, 0.42);
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.2, earth.r * 0.009), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawGlobe(now) {
      if (!ctx) resize();
      const frame = visual.closest(".project-card-frame") || visual;
      const focus = cardFocusFor(frame);
      const earth = earthMetrics();
      drawSpace(now, focus);
      renderEarthTexture(earth, now);

      drawOrbit(earth, now, 0, false);
      drawOrbit(earth, now, 1, false);

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.translate(earth.x, earth.y + earth.r * 1.16);
      ctx.scale(1.12, 0.22);
      const shadow = ctx.createRadialGradient(0, 0, earth.r * 0.08, 0, 0, earth.r * 1.06);
      shadow.addColorStop(0, "rgba(58, 186, 232, 0.16)");
      shadow.addColorStop(0.45, "rgba(18, 70, 108, 0.06)");
      shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(0, 0, earth.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.drawImage(earthBuffer, earth.x - earth.r, earth.y - earth.r, earth.r * 2, earth.r * 2);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const rim = ctx.createRadialGradient(earth.x, earth.y, earth.r * 0.82, earth.x, earth.y, earth.r * 1.46);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(0.66, "rgba(55, 166, 255, " + (0.08 + focus * 0.09) + ")");
      rim.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(earth.x, earth.y, earth.r * 1.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(155, 221, 255, " + (0.16 + focus * 0.1) + ")";
      ctx.lineWidth = Math.max(0.7, earth.r * 0.0055);
      ctx.beginPath();
      ctx.arc(earth.x, earth.y, earth.r * 1.004, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      drawOrbit(earth, now, 0, true);
      drawOrbit(earth, now, 1, true);
    }

    function draw(now) {
      const delta = last ? now - last : 16;
      last = now;
      drawGlobe(now);
      if (!reduceMotion) raf = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw(performance.now());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !reduceMotion) {
        window.cancelAnimationFrame(raf);
        last = 0;
        lastRenderStamp = "";
        raf = window.requestAnimationFrame(draw);
      }
    });
  }

  function init() {
    installCardFocusDimming();
    installAiFlowPatch();
    installRealEarthGlobe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
