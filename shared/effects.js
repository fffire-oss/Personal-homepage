(function () {
  "use strict";

  let cachedPerformanceProfile = null;

  function motionModeFrom(value) {
    const mode = String(value || "").trim().toLowerCase();
    if (["full", "high", "cinematic", "max"].includes(mode)) return "full";
    if (["lite", "light", "low", "reduce", "reduced", "balanced"].includes(mode)) return "lite";
    if (["still", "static", "off", "none", "minimal"].includes(mode)) return "still";
    return "";
  }

  function prefersReducedMotion() {
    const params = new URLSearchParams(window.location.search);
    const media = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return params.has("reduced-motion") || motionModeFrom(params.get("motion")) === "still" || !!media;
  }

  function storedMotionMode() {
    try {
      return motionModeFrom(window.localStorage && window.localStorage.getItem("zephyrlabs.motion"));
    } catch (_error) {
      return "";
    }
  }

  function selectedMotionMode(params) {
    return motionModeFrom(params.get("motion")) || motionModeFrom(params.get("perf")) || storedMotionMode();
  }

  function applyPerformanceProfile(profile) {
    const root = document.documentElement;
    if (root) {
      root.dataset.motionMode = profile.mode;
      root.style.setProperty("--motion-frame-ms", String(Math.round(profile.frameMs || 16)));
    }
    if (document.body) {
      document.body.classList.toggle("motion-full", profile.mode === "full");
      document.body.classList.toggle("motion-lite", profile.mode === "lite");
      document.body.classList.toggle("motion-still", profile.mode === "still");
    }
  }

  function getPerformanceProfile(refresh) {
    if (cachedPerformanceProfile && !refresh) return cachedPerformanceProfile;

    const params = new URLSearchParams(window.location.search);
    const explicit = selectedMotionMode(params);
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    const dpr = window.devicePixelRatio || 1;
    const cores = Number(navigator.hardwareConcurrency) || 0;
    const memory = Number(navigator.deviceMemory) || 0;
    const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const viewportArea = viewportWidth * Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const reducedMotion = prefersReducedMotion();
    const lowMemory = memory > 0 && memory <= 4;
    const lowCores = cores > 0 && cores <= 4;
    const smallScreen = viewportWidth <= 760;
    const denseLowPower = dpr >= 1.75 && (lowCores || lowMemory || viewportArea < 540000);
    const saveData = !!connection.saveData;
    const lowPower = saveData || lowMemory || lowCores || smallScreen || denseLowPower;
    const mode = explicit || (reducedMotion ? "still" : (lowPower ? "lite" : "full"));
    const isStill = mode === "still" || reducedMotion;
    const isLite = mode === "lite" || (lowPower && mode !== "full");
    const frameMs = isStill ? Infinity : (isLite ? 1000 / 24 : 1000 / 45);

    cachedPerformanceProfile = {
      mode: isStill ? "still" : (isLite ? "lite" : "full"),
      explicit: !!explicit,
      isLite,
      isStill,
      lowPower,
      reducedMotion,
      saveData,
      cores,
      memory,
      dpr,
      frameMs,
      maxDpr: isStill ? 1 : (isLite ? 1 : 1.45),
      webglDpr: isLite ? 1 : 1.35,
      particleScale: isStill ? 0.22 : (isLite ? 0.42 : 1),
      textureScale: isStill ? 0.5 : (isLite ? 0.68 : 1),
      starScale: isStill ? 0.28 : (isLite ? 0.45 : 1)
    };
    applyPerformanceProfile(cachedPerformanceProfile);
    return cachedPerformanceProfile;
  }

  function shouldDrawFrame(lastFrame, now, frameMs) {
    if (!Number.isFinite(frameMs) || !lastFrame) return true;
    return now - lastFrame >= frameMs;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function fitCanvas(canvas, host, maxRatio) {
    const rect = host.getBoundingClientRect();
    const profile = getPerformanceProfile();
    const ratio = Math.min(window.devicePixelRatio || 1, maxRatio || 2, profile.maxDpr || 2);
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
    const ctx = canvas.getContext("2d", { alpha: true });
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { width, height, ratio, ctx };
  }

  function easeInOut(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function cardFocusFor(frame) {
    const rect = frame.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const center = rect.top + rect.height * 0.5;
    const focus = clamp(1 - Math.abs(center - viewport * 0.5) / (viewport * 0.62), 0, 1);
    const reveal = clamp((viewport - rect.top) / (viewport * 0.72), 0, 1);
    const leave = clamp(rect.bottom / (viewport * 0.55), 0, 1);
    const visibility = Math.min(reveal, leave);
    const smooth = focus * focus * (3 - 2 * focus);
    return smooth * visibility;
  }

  function setupFooterReveal(options) {
    const settings = options || {};
    const footer = typeof settings.footer === "string"
      ? document.querySelector(settings.footer)
      : settings.footer || document.querySelector(".site-footer");
    if (!footer) return;
    const body = settings.body || document.body;
    const className = settings.className || "is-page-bottom";
    let ticking = false;

    function update() {
      const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const viewportBottom = window.scrollY + window.innerHeight;
      const revealDistance = Math.max(42, Math.min(140, window.innerHeight * 0.14));
      body.classList.toggle(className, viewportBottom >= documentHeight - revealDistance);
      ticking = false;
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  }

  function setupStickyCards(options) {
    const settings = options || {};
    const reduce = !!settings.prefersReducedMotion;
    const minViewportWidth = settings.minViewportWidth || 760;
    const sectionSelector = settings.sectionSelector || ".project-card-section";
    const frameSelector = settings.frameSelector || ".project-card-frame";
    const entries = Array.from(document.querySelectorAll(sectionSelector))
      .map((section) => ({ section, frame: section.querySelector(frameSelector) }))
      .filter((entry) => entry.frame);
    if (!entries.length) return;
    let ticking = false;

    function update() {
      const viewport = window.innerHeight || 1;
      entries.forEach(({ section, frame }) => {
        if (reduce || viewport < minViewportWidth) {
          frame.style.setProperty("--card-scale", "1");
          frame.style.setProperty("--card-y", "0px");
          frame.style.setProperty("--visual-y", "0px");
          frame.style.setProperty("--content-y", "0px");
          frame.style.setProperty("--card-opacity", "1");
          return;
        }
        const rect = section.getBoundingClientRect();
        const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
        const center = rect.top + rect.height * 0.43;
        const focus = clamp(1 - Math.abs(center - viewport * 0.5) / (viewport * 0.76), 0, 1);
        const reveal = clamp((viewport - rect.top) / (viewport * 0.66), 0, 1);
        const leave = clamp(rect.bottom / (viewport * 0.58), 0, 1);
        const visible = Math.min(reveal, leave);
        frame.style.setProperty("--card-scale", (0.945 + focus * 0.055).toFixed(3));
        frame.style.setProperty("--card-y", ((0.5 - progress) * 30).toFixed(2) + "px");
        frame.style.setProperty("--visual-y", ((progress - 0.5) * -42).toFixed(2) + "px");
        frame.style.setProperty("--content-y", ((0.5 - progress) * -14).toFixed(2) + "px");
        frame.style.setProperty("--card-opacity", (0.7 + visible * 0.3).toFixed(3));
      });
      ticking = false;
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  }

  function setupCardFocusDimming(options) {
    const settings = options || {};
    const frameSelector = settings.frameSelector || ".project-card-frame";
    const frames = Array.from(document.querySelectorAll(frameSelector));
    if (!frames.length) return;
    let ticking = false;

    function update() {
      frames.forEach((frame) => {
        const focus = cardFocusFor(frame);
        const brightness = 0.46 + focus * 0.54;
        const saturation = 0.58 + focus * 0.42;
        const contrast = 0.92 + focus * 0.08;
        frame.style.setProperty("--card-focus", focus.toFixed(3));
        frame.style.setProperty("--card-brightness", brightness.toFixed(3));
        frame.style.setProperty("--card-saturation", saturation.toFixed(3));
        frame.style.setProperty("--card-contrast", contrast.toFixed(3));
        frame.style.filter = "brightness(" + brightness.toFixed(3) + ") saturate(" + saturation.toFixed(3) + ") contrast(" + contrast.toFixed(3) + ")";
        frame.classList.toggle("is-card-dim", focus < 0.58);
      });
      ticking = false;
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  }

  function setupLiquidBackground(options) {
    const settings = options || {};
    const canvas = typeof settings.canvas === "string"
      ? document.querySelector(settings.canvas)
      : settings.canvas || document.querySelector(settings.selector || "#orbit-field");
    const motion = settings.motion || { open: 1, scroll: 0, spotlight: 1 };
    const profile = getPerformanceProfile();
    const reduce = ("prefersReducedMotion" in settings ? !!settings.prefersReducedMotion : prefersReducedMotion()) || profile.isStill;
    if (profile.isLite || reduce) {
      setupFluidFallback(canvas, profile, reduce);
      return;
    }
    if (!setupRaymarchPortal(canvas, motion, reduce, profile)) setupFluidFallback(canvas, profile, reduce);
  }

  function setupRaymarchPortal(canvas, motion, reduce, performanceProfile) {
    if (!canvas) return false;
    const introMotion = motion || { open: 1, scroll: 0, spotlight: 1 };
    const profile = performanceProfile || getPerformanceProfile();
    const prefersReducedMotion = !!reduce || profile.isStill;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
    if (!gl) return false;
    const ext = gl.getExtension("EXT_color_buffer_float");
    if (!ext) return false;

    const vertexShader = `#version 300 es
      precision highp float;
      in vec2 aPosition;
      out vec2 vUv;
      void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;

    const simShader = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uState;
      uniform vec2 uTexel;
      uniform vec2 uPointer;
      uniform vec2 uPointerDir;
      uniform float uPointerStrength;
      uniform float uTime;
      uniform float uFrame;

      vec4 stateAt(vec2 uv) { return texture(uState, clamp(uv, vec2(0.0), vec2(1.0))); }
      float cubeDistance(vec2 uv) {
        vec2 p = uv * 2.0 - 1.0;
        p.y += 0.035;
        vec2 q = abs(p) - vec2(0.245, 0.185);
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
      }
      float cubeMask(vec2 uv) { return smoothstep(0.018, -0.012, cubeDistance(uv)); }
      float cubeEdge(vec2 uv) { float d = abs(cubeDistance(uv)); return exp(-d * d * 940.0); }
      void main() {
        vec4 c = stateAt(vUv);
        float h = c.r;
        float hp = c.g;
        float hL = stateAt(vUv - vec2(uTexel.x, 0.0)).r;
        float hR = stateAt(vUv + vec2(uTexel.x, 0.0)).r;
        float hT = stateAt(vUv - vec2(0.0, uTexel.y)).r;
        float hB = stateAt(vUv + vec2(0.0, uTexel.y)).r;
        float lap = hL + hR + hT + hB - 4.0 * h;
        vec2 d = (vUv - uPointer) * vec2(1.0, 1.35);
        float dist = length(d);
        float crown = exp(-pow(dist - 0.06, 2.0) * 1800.0);
        float core = exp(-dist * dist * 720.0);
        float trough = exp(-pow(dist - 0.14, 2.0) * 840.0);
        float impulse = (crown * 0.34 - core * 0.16 - trough * 0.12) * uPointerStrength;
        impulse += sin(uTime * 0.8 + vUv.x * 7.0) * 0.00014;
        float edge = cubeEdge(vUv);
        float mask = cubeMask(vUv);
        float next = (2.0 * h - hp + lap * 0.19 + impulse) * mix(0.989, 0.976, edge);
        next = mix(next, (hL + hR + hT + hB) * 0.25, 0.018);
        next += edge * (h - hp) * 0.03;
        float wall = step(vUv.x, uTexel.x * 1.8) + step(1.0 - uTexel.x * 1.8, vUv.x) + step(vUv.y, uTexel.y * 1.8) + step(1.0 - uTexel.y * 1.8, vUv.y);
        next = mix(next, -hp * 0.42, clamp(wall, 0.0, 1.0));
        float fade = smoothstep(0.0, 0.032, vUv.x) * smoothstep(0.0, 0.032, vUv.y) * smoothstep(0.0, 0.032, 1.0 - vUv.x) * smoothstep(0.0, 0.032, 1.0 - vUv.y);
        next *= mix(0.86, 1.0, fade);
        next = mix(next, 0.0, mask * 0.72);
        h = mix(h, 0.0, mask * 0.72);
        float energy = clamp(abs(next - h) * 2.4 + abs(lap) * 0.24 + edge * 0.025 + abs(impulse) * 1.2, 0.0, 1.0);
        fragColor = vec4(clamp(next, -2.4, 2.4), clamp(h, -2.4, 2.4), mask, energy);
      }
    `;

    const renderShader = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uState;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uIntro;
      uniform float uScroll;
      uniform float uSpotlight;

      vec4 stateAt(vec2 uv) { return texture(uState, clamp(uv, vec2(0.0), vec2(1.0))); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        float a = hash(i); float b = hash(i + vec2(1.0,0.0)); float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }
      float fbm(vec2 p) { float v = 0.0; float a = 0.5; mat2 r = mat2(0.82,-0.57,0.57,0.82); for (int i=0; i<5; i++) { v += noise(p) * a; p = r * p * 2.05 + 13.7; a *= 0.52; } return v; }
      vec2 worldToUv(vec2 xz) { return xz * vec2(0.38, 0.46) + 0.5; }
      float domainMask(vec2 uv) { return smoothstep(0.0,0.05,uv.x)*smoothstep(0.0,0.05,uv.y)*smoothstep(0.0,0.05,1.0-uv.x)*smoothstep(0.0,0.05,1.0-uv.y); }
      vec4 simAtWorld(vec2 xz) { vec2 uv = worldToUv(xz); vec4 s = stateAt(uv); return s * domainMask(uv); }
      float waterHeight(vec2 xz) { vec4 s = simAtWorld(xz); return s.r * 0.092 + s.a * 0.012 - 0.024 * dot(xz, xz); }
      vec3 environment(vec3 r, vec2 uv) {
        float horizon = smoothstep(-0.48, 0.72, r.y);
        float soft = exp(-dot(vec2(r.x*1.1-0.1, r.y*1.7+0.18), vec2(r.x*1.1-0.1, r.y*1.7+0.18)) * 1.5);
        float line = pow(smoothstep(0.82,1.0,sin((r.x*1.75 + r.z*0.7 + uv.y*0.2)*3.14159)*0.5+0.5), 6.4);
        vec3 color = mix(vec3(0.0,0.001,0.002), vec3(0.004,0.015,0.02), horizon);
        color += vec3(0.02,0.28,0.44) * soft * 0.18;
        color += vec3(0.82,0.94,1.0) * line * 0.12;
        return color;
      }
      vec3 introNebula(vec2 uv) {
        vec2 p = uv * 2.0 - 1.0; p.x *= uResolution.x / max(1.0, uResolution.y);
        float radius = length(p); float angle = atan(p.y, p.x);
        vec2 swirl = p + vec2(cos(angle*1.7 + uTime*0.22), sin(angle*1.35 - uTime*0.18)) * (0.08 + radius*0.035);
        float cloud = smoothstep(0.3, 0.9, fbm(swirl*1.9 + vec2(uTime*0.028, -uTime*0.018))) * exp(-dot(p-vec2(-0.18,0.02), p-vec2(-0.18,0.02))*0.88);
        float stars = smoothstep(0.987, 1.0, noise(uv*uResolution.xy*0.36 + floor(uTime*3.0))) * smoothstep(1.05, 0.12, radius);
        return vec3(0.04,0.5,0.78)*cloud*0.38 + vec3(0.78,0.96,1.0)*stars*0.44;
      }
      vec3 waterNormal(vec3 p) {
        float e = 0.006;
        float hL = waterHeight(p.xz - vec2(e,0.0)); float hR = waterHeight(p.xz + vec2(e,0.0));
        float hD = waterHeight(p.xz - vec2(0.0,e)); float hU = waterHeight(p.xz + vec2(0.0,e));
        return normalize(vec3(-(hR-hL)*7.4, 2.0*e, -(hU-hD)*7.4));
      }
      bool traceWater(vec3 ro, vec3 rd, out vec3 hit, out float travel) {
        float t = 0.0;
        for (int i=0; i<48; i++) {
          vec3 p = ro + rd * t;
          float d = p.y - waterHeight(p.xz);
          if (d < 0.0015) { hit = p; travel = t; return true; }
          t += clamp(d * 0.72, 0.014, 0.18);
          if (t > 4.8) break;
        }
        hit = ro + rd * t; travel = t; return false;
      }
      vec3 shade(vec3 p, vec3 n, vec3 rd, float travel) {
        vec2 uv = worldToUv(p.xz); vec4 s = stateAt(uv); float domain = domainMask(uv); float obstacle = s.b; float energy = s.a;
        float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 5.0);
        vec3 light = normalize(vec3(-0.42, 0.82, 0.26)); vec3 halfD = normalize(light - rd); vec3 refl = reflect(rd, n);
        float spec = pow(clamp(dot(n, halfD), 0.0, 1.0), 118.0);
        float broad = pow(clamp(dot(n, normalize(vec3(0.2,0.78,0.58))), 0.0, 1.0), 22.0);
        float longLine = pow(smoothstep(0.78, 1.0, sin((refl.x*2.1 + refl.z*0.7)*3.14159)*0.5+0.5), 5.0);
        vec3 color = mix(vec3(0.001,0.0014,0.0018), environment(refl, uv), 0.18 + fres * 0.34);
        color += vec3(0.96,0.99,1.0) * spec * (1.55 + energy * 1.8);
        color += vec3(0.55,0.72,0.76) * broad * 0.11;
        color += vec3(0.9,0.97,1.0) * longLine * fres * 0.16;
        color += vec3(0.12,0.56,0.84) * smoothstep(0.06,0.36,energy) * 0.22;
        color *= domain * exp(-travel * 0.18);
        vec3 solid = vec3(0.0,0.003,0.005) + vec3(0.06,0.14,0.16) * fres + vec3(0.75) * spec * 0.55;
        return mix(color, solid, obstacle * 0.9);
      }
      void main() {
        float open = smoothstep(0.0, 1.0, uIntro);
        float top = smoothstep(0.0, 1.0, uScroll);
        vec2 screen = vUv * 2.0 - 1.0; screen.x *= uResolution.x / max(1.0, uResolution.y);
        vec3 roFront = vec3(0.0, 0.24, 2.28);
        vec3 roOblique = vec3(0.0, 0.78, 1.76);
        vec3 roTop = vec3(0.0, 1.84, 0.34);
        vec3 targetFront = vec3(0.0, 0.02, -0.06);
        vec3 targetOblique = vec3(0.0, 0.0, -0.08);
        vec3 targetTop = vec3(0.0, -0.02, 0.0);
        vec3 ro = mix(mix(roFront, roOblique, open), roTop, top);
        vec3 target = mix(mix(targetFront, targetOblique, open), targetTop, top);
        vec3 forward = normalize(target - ro);
        vec3 cameraUp = normalize(mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, -1.0), top * 0.72));
        vec3 right = normalize(cross(forward, cameraUp));
        vec3 up = cross(right, forward);
        vec3 rd = normalize(right * screen.x * mix(0.68, 0.86, top) + up * screen.y * mix(0.42, 0.84, top) + forward * mix(1.18, 0.98, top));
        vec3 hit; float travel; bool ok = traceWater(ro, rd, hit, travel);
        vec3 color = environment(rd, vUv) * 0.08;
        if (ok) color = shade(hit, waterNormal(hit), rd, travel);
        float nebulaOut = smoothstep(0.0, 0.42, uIntro) * (1.0 - smoothstep(0.58, 1.0, uIntro)) * (1.0 - smoothstep(0.0, 0.64, uScroll));
        float cone = exp(-dot(screen * vec2(0.78, 1.26), screen * vec2(0.78, 1.26)) * mix(3.2, 0.9, uSpotlight));
        color += introNebula(vUv) * nebulaOut;
        color *= mix(0.18, 1.0, smoothstep(0.0, 1.0, uSpotlight));
        color += vec3(0.06, 0.28, 0.42) * cone * smoothstep(0.12, 1.0, uSpotlight) * 0.18;
        float vignette = smoothstep(1.28, 0.18, length((vUv - 0.5) * vec2(1.18, 0.86)));
        float aperture = smoothstep(0.02,0.18,vUv.y) * smoothstep(0.02,0.18,1.0-vUv.y);
        color = mix(vec3(0.0), color, (0.62 + vignette*0.38) * aperture);
        color = pow(clamp(color,0.0,1.0), vec3(0.74));
        fragColor = vec4(color, 1.0);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    function program(fragmentSource) {
      const vs = compile(gl.VERTEX_SHADER, vertexShader);
      const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
      if (!vs || !fs) return null;
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
      gl.deleteShader(vs); gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); gl.deleteProgram(p); return null; }
      return p;
    }
    const simProgram = program(simShader);
    const renderProgram = program(renderShader);
    if (!simProgram || !renderProgram) return false;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function attrib(programObject) {
      const loc = gl.getAttribLocation(programObject, "aPosition");
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    function makeTarget(w, h) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.FLOAT, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fbo, w, h };
    }

    let width = 1, height = 1, ratio = 1, simW = 1, simH = 1, read = null, write = null, raf = 0, frame = 0, lastFrame = 0;
    const pointer = { x: 0.62, y: 0.34, px: 0.62, py: 0.34, dx: 0, dy: 0, strength: 0, movedAt: 0 };

    function resize() {
      ratio = Math.min(window.devicePixelRatio || 1, profile.webglDpr || 1.35, 1.5);
      width = Math.max(1, Math.floor(window.innerWidth));
      height = Math.max(1, Math.floor(window.innerHeight));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      const nextW = width > 980 ? 224 : 160;
      const nextH = Math.max(112, Math.floor(nextW * height / Math.max(1, width)));
      if (!read || nextW !== simW || nextH !== simH) {
        simW = nextW; simH = nextH;
        read = makeTarget(simW, simH);
        write = makeTarget(simW, simH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, read.fbo); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, write.fbo); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    function updatePointer(event) {
      const x = event.clientX / Math.max(1, width);
      const y = event.clientY / Math.max(1, height);
      pointer.dx = x - pointer.x;
      pointer.dy = y - pointer.y;
      pointer.px = pointer.x; pointer.py = pointer.y;
      pointer.x = x; pointer.y = y; pointer.movedAt = performance.now();
      pointer.strength = clamp(Math.hypot(pointer.dx, pointer.dy) * 46, 0.12, 1.1);
    }
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", updatePointer, { passive: true });
    window.addEventListener("resize", resize);
    canvas.dataset.renderer = "webgl-cinematic-water-intro";

    function simulate(now) {
      if (prefersReducedMotion) pointer.strength *= 0.8;
      const idle = Math.max(0, 1 - (now - pointer.movedAt) / 1000);
      const autoX = 0.5 + Math.sin(now * 0.00013) * 0.18;
      const autoY = 0.52 + Math.cos(now * 0.00017) * 0.16;
      const useAuto = idle < 0.08;
      const px = useAuto ? autoX : pointer.x;
      const py = useAuto ? autoY : pointer.y;
      const strength = useAuto ? (0.08 + 0.06 * Math.sin(now * 0.00071)) : pointer.strength;

      gl.useProgram(simProgram);
      attrib(simProgram);
      gl.viewport(0, 0, simW, simH);
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.fbo);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.tex);
      gl.uniform1i(gl.getUniformLocation(simProgram, "uState"), 0);
      gl.uniform2f(gl.getUniformLocation(simProgram, "uTexel"), 1 / simW, 1 / simH);
      gl.uniform2f(gl.getUniformLocation(simProgram, "uPointer"), px, py);
      gl.uniform2f(gl.getUniformLocation(simProgram, "uPointerDir"), pointer.dx, pointer.dy);
      gl.uniform1f(gl.getUniformLocation(simProgram, "uPointerStrength"), strength);
      gl.uniform1f(gl.getUniformLocation(simProgram, "uTime"), now * 0.001);
      gl.uniform1f(gl.getUniformLocation(simProgram, "uFrame"), frame);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const temp = read; read = write; write = temp;
      pointer.strength *= 0.92;
      frame += 1;
    }

    function render(now) {
      gl.useProgram(renderProgram);
      attrib(renderProgram);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.tex);
      gl.uniform1i(gl.getUniformLocation(renderProgram, "uState"), 0);
      gl.uniform2f(gl.getUniformLocation(renderProgram, "uResolution"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(renderProgram, "uTime"), now * 0.001);
      gl.uniform1f(gl.getUniformLocation(renderProgram, "uIntro"), introMotion.open);
      gl.uniform1f(gl.getUniformLocation(renderProgram, "uScroll"), introMotion.scroll);
      gl.uniform1f(gl.getUniformLocation(renderProgram, "uSpotlight"), introMotion.spotlight);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function tick(now) {
      if (!shouldDrawFrame(lastFrame, now, profile.frameMs)) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;
      simulate(now);
      render(now);
      if (!prefersReducedMotion) raf = requestAnimationFrame(tick);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        lastFrame = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    resize();
    raf = requestAnimationFrame(tick);
    return true;
  }

  function setupFluidFallback(canvas, performanceProfile, reduce) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const profile = performanceProfile || getPerformanceProfile();
    const still = !!reduce || profile.isStill;
    let width = 1, height = 1, ratio = 1, raf = 0, lastFrame = 0;
    function resize() {
      ratio = Math.min(window.devicePixelRatio || 1, profile.maxDpr || 1.2, 1.5);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + "px"; canvas.style.height = height + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function draw(now) {
      if (!shouldDrawFrame(lastFrame, now, profile.frameMs)) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      ctx.clearRect(0,0,width,height);
      const g = ctx.createRadialGradient(width*0.5,height*0.48,0,width*0.5,height*0.48,Math.max(width,height)*0.72);
      g.addColorStop(0,"rgba(49,215,255,0.09)"); g.addColorStop(0.45,"rgba(10,34,48,0.28)"); g.addColorStop(1,"rgba(0,0,0,1)");
      ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle = "rgba(137,238,255,0.05)"; ctx.lineWidth = 1;
      const rings = profile.isLite || still ? 5 : 9;
      for (let i=0;i<rings;i+=1) { ctx.beginPath(); ctx.ellipse(width*0.5,height*0.72, width*(0.18+i*0.06), height*(0.04+i*0.018), Math.sin(now*0.0001+i)*0.1, 0, Math.PI*2); ctx.stroke(); }
      if (!still) raf = requestAnimationFrame(draw);
    }
    window.addEventListener("resize", resize); resize(); raf = requestAnimationFrame(draw);
  }

  window.ZephyrEffects = {
    cardFocusFor,
    clamp,
    easeInOut,
    fitCanvas,
    getPerformanceProfile,
    prefersReducedMotion,
    shouldDrawFrame,
    setupCardFocusDimming,
    setupFooterReveal,
    setupLiquidBackground,
    setupStickyCards
  };
})();
