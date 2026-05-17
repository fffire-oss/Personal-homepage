(function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("market-canvas");
  var ctx = canvas.getContext("2d");
  var width = 0;
  var height = 0;
  var particles = [];
  var pointer = { x: 0, y: 0, active: false };
  var frame = 0;

  function resizeCanvas() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    var count = Math.max(42, Math.min(96, Math.floor((width * height) / 19000)));
    particles = [];
    for (var i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: 1.2 + Math.random() * 1.8,
        c: i % 4
      });
    }
  }

  function drawMarketWave() {
    var baseY = height * 0.58;
    ctx.beginPath();
    for (var x = 0; x <= width; x += 18) {
      var y =
        baseY +
        Math.sin((x + frame * 0.9) * 0.012) * 28 +
        Math.sin((x - frame * 1.3) * 0.026) * 12;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = "rgba(255, 191, 69, 0.26)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    var gradient = ctx.createLinearGradient(0, baseY - 60, 0, height);
    gradient.addColorStop(0, "rgba(255, 191, 69, 0.09)");
    gradient.addColorStop(0.45, "rgba(55, 232, 155, 0.04)");
    gradient.addColorStop(1, "rgba(7, 9, 13, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function drawParticles() {
    var colors = [
      "rgba(55, 232, 155, 0.86)",
      "rgba(49, 215, 255, 0.74)",
      "rgba(255, 191, 69, 0.82)",
      "rgba(248, 95, 175, 0.72)"
    ];

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      if (pointer.active) {
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 1) {
          p.x += (dx / dist) * 0.22;
          p.y += (dy / dist) * 0.22;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = colors[p.c];
      ctx.fill();

      for (var j = i + 1; j < particles.length; j += 1) {
        var q = particles[j];
        var lx = p.x - q.x;
        var ly = p.y - q.y;
        var linkDist = lx * lx + ly * ly;
        if (linkDist < 9800) {
          var opacity = 1 - linkDist / 9800;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(147, 162, 184, " + opacity * 0.16 + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    frame += 1;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#07090d";
    ctx.fillRect(0, 0, width, height);
    drawMarketWave();
    drawParticles();

    if (!prefersReducedMotion) {
      window.requestAnimationFrame(animateCanvas);
    }
  }

  function setupReveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function setupCounters() {
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (counter) {
        counter.textContent = counter.getAttribute("data-count");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = Number(entry.target.getAttribute("data-count"));
          var start = performance.now();
          var duration = prefersReducedMotion ? 1 : 1100;

          function tick(now) {
            var progress = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - progress, 3);
            entry.target.textContent = Math.round(target * eased);
            if (progress < 1) {
              window.requestAnimationFrame(tick);
            }
          }

          window.requestAnimationFrame(tick);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function setupTilt() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"));
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        if (window.innerWidth < 820 || prefersReducedMotion) return;
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var rx = ((y / rect.height) - 0.5) * -5;
        var ry = ((x / rect.width) - 0.5) * 5;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  function setupLabTabs() {
    var data = {
      policy: {
        label: "Policy Stack",
        title: "Train agents against market friction, not clean charts.",
        body:
          "The policy loop combines feature windows, transaction-cost modeling, reward constraints, and out-of-sample validation before a strategy reaches paper trading."
      },
      market: {
        label: "Market Simulator",
        title: "Replay regimes with enough noise to expose brittle strategies.",
        body:
          "Market modules stress strategies with slippage, latency assumptions, trend shifts, volatility bursts, and liquidity-aware position limits."
      },
      risk: {
        label: "Risk Control",
        title: "Every automated signal passes through portfolio-level brakes.",
        body:
          "Risk checks evaluate exposure, daily loss, correlation, turnover, and confidence before an order intent can leave the research sandbox."
      }
    };

    var tabs = Array.prototype.slice.call(document.querySelectorAll(".lab-tab"));
    var label = document.getElementById("lab-label");
    var title = document.getElementById("lab-title");
    var body = document.getElementById("lab-body");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-lab");
        var next = data[key];
        tabs.forEach(function (item) {
          item.classList.toggle("active", item === tab);
          item.setAttribute("aria-selected", item === tab ? "true" : "false");
        });
        label.textContent = next.label;
        title.textContent = next.title;
        body.textContent = next.body;
      });
    });
  }

  function setupActiveStates() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);
    var timelineItems = Array.prototype.slice.call(document.querySelectorAll(".timeline-item"));

    function update() {
      var scrollY = window.scrollY + 160;
      var activeId = "";
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollY) activeId = section.id;
      });
      links.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + activeId);
      });

      timelineItems.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        item.classList.toggle("active", rect.top < window.innerHeight * 0.68 && rect.bottom > 120);
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  window.addEventListener("pointermove", function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });

  window.addEventListener("pointerleave", function () {
    pointer.active = false;
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  animateCanvas();
  setupReveal();
  setupCounters();
  setupTilt();
  setupLabTabs();
  setupActiveStates();
})();
