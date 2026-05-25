(function () {
  "use strict";

  const canvas = document.getElementById("orbit-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = [
    [49, 215, 255],
    [55, 232, 155],
    [255, 191, 69],
    [255, 107, 93],
  ];
  const pointer = {
    x: window.innerWidth * 0.62,
    y: window.innerHeight * 0.34,
    tx: window.innerWidth * 0.62,
    ty: window.innerHeight * 0.34,
    active: false,
  };

  let width = 0;
  let height = 0;
  let ratio = 1;
  let particles = [];
  let frame = 0;

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(72, Math.min(180, Math.floor((width * height) / 8500)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 0.85 + Math.random() * 1.65,
      phase: Math.random() * Math.PI * 2,
      color: index % colors.length,
      pull: 0.002 + Math.random() * 0.004,
    }));
  }

  function setPointer(x, y, active) {
    pointer.tx = x;
    pointer.ty = y;
    pointer.active = active;
  }

  function rgba(color, alpha) {
    return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
  }

  function drawGlow() {
    const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 280);
    halo.addColorStop(0, "rgba(244, 250, 255, 0.22)");
    halo.addColorStop(0.18, "rgba(49, 215, 255, 0.18)");
    halo.addColorStop(0.44, "rgba(55, 232, 155, 0.09)");
    halo.addColorStop(1, "rgba(7, 10, 16, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 280, 0, Math.PI * 2);
    ctx.fill();

    const pulse = reducedMotion ? 0 : Math.sin(frame * 0.035) * 7;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(244, 250, 255, 0.42)";
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 70 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(49, 215, 255, 0.28)";
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 118 - pulse * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawParticles() {
    for (const particle of particles) {
      if (!reducedMotion) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const influence = Math.max(0, 1 - dist / 520);
        particle.vx += (dx / dist) * particle.pull * influence;
        particle.vy += (dy / dist) * particle.pull * influence;
        particle.vx *= 0.992;
        particle.vy *= 0.992;
        particle.x += particle.vx + Math.cos(frame * 0.012 + particle.phase) * 0.06;
        particle.y += particle.vy + Math.sin(frame * 0.011 + particle.phase) * 0.06;
      }

      if (particle.x < -24) particle.x = width + 24;
      if (particle.x > width + 24) particle.x = -24;
      if (particle.y < -24) particle.y = height + 24;
      if (particle.y > height + 24) particle.y = -24;

      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const focus = Math.max(0, 1 - dist / 360);
      const color = colors[particle.color];
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r + focus * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.18 + focus * 0.58);
      ctx.shadowBlur = 12 + focus * 26;
      ctx.shadowColor = rgba(color, 0.52);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function draw() {
    frame += 1;
    if (!pointer.active) {
      pointer.tx = width * 0.62 + Math.cos(frame * 0.006) * Math.min(120, width * 0.08);
      pointer.ty = height * 0.34 + Math.sin(frame * 0.007) * Math.min(90, height * 0.08);
    }
    pointer.x += (pointer.tx - pointer.x) * 0.085;
    pointer.y += (pointer.ty - pointer.y) * 0.085;

    ctx.clearRect(0, 0, width, height);
    drawGlow();
    drawParticles();

    if (!reducedMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener("pointermove", (event) => {
    setPointer(event.clientX, event.clientY, true);
  });
  window.addEventListener("pointerdown", (event) => {
    setPointer(event.clientX, event.clientY, true);
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  window.addEventListener("blur", () => {
    pointer.active = false;
  });
  window.addEventListener("resize", () => {
    resize();
    draw();
  });

  resize();
  draw();
})();
