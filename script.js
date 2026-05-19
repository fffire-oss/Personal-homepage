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

    window.setTimeout(function () {
      nodes.forEach(function (node) {
        node.classList.add("visible");
      });
    }, 900);
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

  function setupSplendorDemo() {
    var board = document.getElementById("splendor-board");
    if (!board) return;

    var gemColors = {
      white: "#e6dfcf",
      blue: "#7ba7ff",
      green: "#37e89b",
      red: "#ff6b5d",
      black: "#77808e",
      gold: "#ffbf45"
    };

    var gemLabels = {
      white: "W",
      blue: "U",
      green: "G",
      red: "R",
      black: "B",
      gold: "*"
    };

    var splendorCards = [
      { id: "sp-c1", tier: 1, gem: "green", points: 0, cost: ["white", "blue", "red"] },
      { id: "sp-c2", tier: 1, gem: "blue", points: 0, cost: ["green", "green", "black"] },
      { id: "sp-c3", tier: 1, gem: "red", points: 1, cost: ["white", "black", "black"] },
      { id: "sp-c4", tier: 1, gem: "white", points: 0, cost: ["blue", "red", "green"] },
      { id: "sp-c5", tier: 2, gem: "black", points: 2, cost: ["red", "red", "green", "blue"] },
      { id: "sp-c6", tier: 2, gem: "green", points: 1, cost: ["white", "white", "blue", "black"] },
      { id: "sp-c7", tier: 2, gem: "blue", points: 2, cost: ["green", "red", "red", "black"] },
      { id: "sp-c8", tier: 2, gem: "red", points: 1, cost: ["white", "blue", "green", "black"] },
      { id: "sp-c9", tier: 3, gem: "white", points: 4, cost: ["blue", "blue", "green", "green", "black"] },
      { id: "sp-c10", tier: 3, gem: "red", points: 3, cost: ["white", "white", "green", "black", "black"] },
      { id: "sp-c11", tier: 3, gem: "green", points: 5, cost: ["red", "red", "red", "blue", "black"] },
      { id: "sp-c12", tier: 3, gem: "black", points: 4, cost: ["white", "blue", "blue", "green", "red"] }
    ];

    var moves = [
      {
        type: "coins",
        title: "Take three colors",
        gems: ["white", "green", "red"],
        value: "+0.31",
        entropy: "1.12",
        policy: [["Take gems", 0.48], ["Reserve card", 0.22], ["Buy tier I", 0.19], ["Wait", 0.11]],
        state: [0.2, 0.38, 0.74, 0.46, 0.57, 0.18, 0.82, 0.62, 0.34, 0.66, 0.28, 0.72],
        coach: "The rollout opens by collecting three colors because it keeps two low-tier buys and one tier-II route alive."
      },
      {
        type: "reserve",
        title: "Reserve engine card",
        card: "sp-c6",
        gems: ["gold"],
        value: "+0.44",
        entropy: "1.04",
        policy: [["Reserve card", 0.41], ["Take gems", 0.27], ["Buy tier I", 0.2], ["Buy tier II", 0.12]],
        state: [0.32, 0.45, 0.64, 0.51, 0.49, 0.7, 0.36, 0.8, 0.29, 0.55, 0.48, 0.68],
        coach: "The reserved green card protects a useful engine piece while the gold token raises short-term purchase flexibility."
      },
      {
        type: "buy",
        title: "Buy red discount",
        card: "sp-c3",
        value: "+0.57",
        entropy: "0.92",
        policy: [["Buy card", 0.57], ["Take gems", 0.22], ["Reserve", 0.13], ["Buy tier II", 0.08]],
        state: [0.48, 0.53, 0.4, 0.72, 0.68, 0.26, 0.59, 0.62, 0.33, 0.43, 0.77, 0.41],
        coach: "Turning tokens into a permanent red discount improves later tier-II and tier-III affordability."
      },
      {
        type: "coins",
        title: "Prepare tier-II cost",
        gems: ["blue", "blue"],
        value: "+0.62",
        entropy: "0.88",
        policy: [["Take two blue", 0.46], ["Buy tier I", 0.23], ["Reserve", 0.18], ["Take mixed", 0.13]],
        state: [0.22, 0.66, 0.63, 0.45, 0.39, 0.71, 0.51, 0.52, 0.63, 0.33, 0.59, 0.27],
        coach: "Taking two blue maximizes the probability of converting into the reserved tier-II card next turn."
      },
      {
        type: "buy",
        title: "Buy tier-II green",
        card: "sp-c6",
        value: "+0.74",
        entropy: "0.76",
        policy: [["Buy tier II", 0.64], ["Take gems", 0.16], ["Reserve tier III", 0.12], ["Buy tier I", 0.08]],
        state: [0.58, 0.68, 0.73, 0.48, 0.57, 0.29, 0.62, 0.76, 0.38, 0.45, 0.8, 0.54],
        coach: "The model now prefers conversion: one VP plus a green discount is better than extending the token hand."
      },
      {
        type: "buy",
        title: "Finish tier-III points",
        card: "sp-c10",
        value: "+0.91",
        entropy: "0.61",
        policy: [["Buy tier III", 0.71], ["Take gems", 0.12], ["Reserve", 0.1], ["Buy tier II", 0.07]],
        state: [0.79, 0.55, 0.82, 0.91, 0.68, 0.44, 0.63, 0.77, 0.84, 0.58, 0.49, 0.69],
        coach: "The high-value card pushes the agent toward endgame pressure, so the policy accepts a less flexible hand."
      }
    ];

    var index = 0;
    var timer = null;
    var playing = false;
    var market = document.getElementById("splendor-market");
    var bank = document.getElementById("splendor-bank");
    var motionLayer = document.getElementById("splendor-motion-layer");
    var stage = document.getElementById("splendor-stage");
    var aiEndpoint = window.DINOBOARD_AI_ENDPOINT || "";

    function colorFor(gem) {
      return gemColors[gem] || gemColors.gold;
    }

    function renderMarket() {
      var html = "";
      [3, 2, 1].forEach(function (tier) {
        html += '<div class="splendor-tier-label">Tier ' + tier + "</div>";
        splendorCards.filter(function (card) {
          return card.tier === tier;
        }).forEach(function (card) {
          html += '<article class="splendor-card" id="' + card.id + '" style="--card-color:' + colorFor(card.gem) + '">';
          html += '<span class="splendor-card-score">' + card.points + "</span>";
          html += '<span class="splendor-card-gem">' + gemLabels[card.gem] + "</span>";
          html += '<div class="splendor-cost">';
          card.cost.forEach(function (gem) {
            html += '<span class="splendor-dot" style="--gem-color:' + colorFor(gem) + '"></span>';
          });
          html += "</div></article>";
        });
      });
      market.innerHTML = html;
    }

    function renderBank() {
      bank.innerHTML = ["white", "blue", "green", "red", "black", "gold"].map(function (gem) {
        return (
          '<div class="bank-token-wrap" data-gem="' + gem + '">' +
          '<span class="bank-token" style="--gem-color:' + colorFor(gem) + '">' + gemLabels[gem] + "</span>" +
          "<b>4</b></div>"
        );
      }).join("");
    }

    function renderPolicy(move) {
      document.getElementById("splendor-policy-list").innerHTML = move.policy.map(function (item) {
        var width = Math.round(item[1] * 100);
        return (
          '<div class="splendor-policy-row">' +
          "<span>" + item[0] + "</span>" +
          '<div class="splendor-policy-bar"><span style="--w:' + width + '%"></span></div>' +
          "<strong>" + width + "%</strong></div>"
        );
      }).join("");
    }

    function renderStateGrid(move) {
      var cells = [];
      for (var i = 0; i < 48; i += 1) {
        var value = Math.max(0.05, Math.min(1, move.state[i % move.state.length] * (0.82 + ((i * 13) % 10) / 45)));
        cells.push('<span class="state-cell" style="--v:' + value.toFixed(2) + '"></span>');
      }
      document.getElementById("splendor-state-grid").innerHTML = cells.join("");
    }

    function stagePoint(element) {
      var outer = stage.getBoundingClientRect();
      var rect = element.getBoundingClientRect();
      return {
        x: rect.left - outer.left + rect.width / 2,
        y: rect.top - outer.top + rect.height / 2
      };
    }

    function addTrail(from, to) {
      var dx = to.x - from.x;
      var dy = to.y - from.y;
      var trail = document.createElement("span");
      trail.className = "flight-trail";
      trail.style.width = Math.sqrt(dx * dx + dy * dy) + "px";
      trail.style.setProperty("--x", from.x + "px");
      trail.style.setProperty("--y", from.y + "px");
      trail.style.setProperty("--angle", Math.atan2(dy, dx) + "rad");
      motionLayer.appendChild(trail);
      trail.addEventListener("animationend", function () {
        trail.remove();
      });
    }

    function addSparks(to, color) {
      for (var i = 0; i < 7; i += 1) {
        var spark = document.createElement("span");
        spark.className = "splendor-spark";
        spark.style.background = color;
        spark.style.setProperty("--x", to.x + "px");
        spark.style.setProperty("--y", to.y + "px");
        spark.style.setProperty("--dx", Math.cos(i * 1.7) * (20 + i * 3) + "px");
        spark.style.setProperty("--dy", Math.sin(i * 1.3) * (18 + i * 2) + "px");
        motionLayer.appendChild(spark);
        spark.addEventListener("animationend", function () {
          this.remove();
        });
      }
    }

    function flyToken(gem) {
      var source = document.querySelector('.bank-token-wrap[data-gem="' + gem + '"]');
      var target = document.getElementById("agent-token-strip");
      if (!source || !target) return;
      var from = stagePoint(source);
      var to = stagePoint(target);
      var token = document.createElement("span");
      token.className = "flying-token";
      token.style.setProperty("--gem-color", colorFor(gem));
      token.style.setProperty("--from-x", from.x - 17 + "px");
      token.style.setProperty("--from-y", from.y - 17 + "px");
      token.style.setProperty("--to-x", to.x - 17 + "px");
      token.style.setProperty("--to-y", to.y - 17 + "px");
      motionLayer.appendChild(token);
      addTrail(from, to);
      addSparks(to, colorFor(gem));
      token.addEventListener("animationend", function () {
        token.remove();
        var mini = document.createElement("span");
        mini.className = "agent-token";
        mini.style.setProperty("--gem-color", colorFor(gem));
        target.appendChild(mini);
        while (target.children.length > 12) target.firstElementChild.remove();
      });
    }

    function flyCard(cardId) {
      var source = document.getElementById(cardId);
      var target = document.getElementById("agent-card-strip");
      var card = splendorCards.filter(function (item) {
        return item.id === cardId;
      })[0];
      if (!source || !target || !card) return;
      var from = stagePoint(source);
      var to = stagePoint(target);
      var ghost = document.createElement("span");
      ghost.className = "flying-card";
      ghost.style.setProperty("--card-color", colorFor(card.gem));
      ghost.style.setProperty("--from-x", from.x - 39 + "px");
      ghost.style.setProperty("--from-y", from.y - 54 + "px");
      ghost.style.setProperty("--to-x", to.x - 39 + "px");
      ghost.style.setProperty("--to-y", to.y - 54 + "px");
      motionLayer.appendChild(ghost);
      addTrail(from, to);
      addSparks(to, colorFor(card.gem));
      ghost.addEventListener("animationend", function () {
        ghost.remove();
        var mini = document.createElement("span");
        mini.className = "agent-card-mini";
        mini.style.setProperty("--card-color", colorFor(card.gem));
        target.appendChild(mini);
        while (target.children.length > 10) target.firstElementChild.remove();
      });
    }

    function animateMove(move) {
      Array.prototype.slice.call(document.querySelectorAll(".splendor-card")).forEach(function (card) {
        card.classList.remove("target");
      });
      if (move.card) {
        var targetCard = document.getElementById(move.card);
        if (targetCard) targetCard.classList.add("target");
      }
      if (move.gems) {
        move.gems.forEach(function (gem, i) {
          window.setTimeout(function () {
            flyToken(gem);
          }, i * 110);
        });
      }
      if (move.card) {
        window.setTimeout(function () {
          flyCard(move.card);
        }, move.type === "reserve" ? 180 : 80);
      }
    }

    function localCoach(move) {
      document.getElementById("splendor-ai-mode").textContent = aiEndpoint ? "fallback" : "demo";
      document.getElementById("splendor-coach").textContent = move.coach;
    }

    function requestCoach(move) {
      localCoach(move);
      if (!aiEndpoint || !window.fetch) return;
      window.fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "Personal-homepage Splendor RL",
          attribution: "DinoBoard fork integration; retain upstream notices.",
          move: move
        })
      })
        .then(function (response) {
          return response.ok ? response.json() : null;
        })
        .then(function (data) {
          if (!data || !data.explanation) return;
          document.getElementById("splendor-ai-mode").textContent = "DinoBoard";
          document.getElementById("splendor-coach").textContent = data.explanation;
        })
        .catch(function () {
          localCoach(move);
        });
    }

    function updateSplendor(animate) {
      var move = moves[index];
      document.getElementById("splendor-action-title").textContent = move.title;
      document.getElementById("splendor-value").textContent = move.value;
      document.getElementById("splendor-entropy").textContent = "entropy " + move.entropy;
      document.getElementById("splendor-step").textContent = "Move " + (index + 1) + " / " + moves.length;
      document.getElementById("splendor-progress-fill").style.width = ((index + 1) / moves.length) * 100 + "%";
      renderPolicy(move);
      renderStateGrid(move);
      requestCoach(move);
      if (animate && !prefersReducedMotion) animateMove(move);
    }

    function step(delta) {
      index = (index + delta + moves.length) % moves.length;
      updateSplendor(true);
    }

    renderMarket();
    renderBank();
    updateSplendor(false);

    document.getElementById("splendor-prev").addEventListener("click", function () {
      step(-1);
    });
    document.getElementById("splendor-next").addEventListener("click", function () {
      step(1);
    });
    document.getElementById("splendor-play").addEventListener("click", function () {
      playing = !playing;
      this.textContent = playing ? "Pause rollout" : "Play rollout";
      if (playing) {
        timer = window.setInterval(function () {
          step(1);
        }, 1850);
      } else {
        window.clearInterval(timer);
      }
    });
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
  setupSplendorDemo();
})();
