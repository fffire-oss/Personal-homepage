(function () {
  "use strict";

  var STORAGE_KEY = "zephyrlabs-gem-table-save-v2";
  var LEGACY_STORAGE_KEYS = ["zephyrlabs-gem-table-save-v1"];
  var SCHEMA = "zephyrlabs-gemtable-bga-v1";
  var COLORS = ["white", "blue", "green", "red", "black"];
  var ALL_TOKENS = COLORS.concat(["gold"]);
  var GEM_HEX = {
    white: "#f1eadb",
    blue: "#55a7ff",
    green: "#37e89b",
    red: "#ff6b5d",
    black: "#536070",
    gold: "#ffbf45"
  };
  var TOKEN_LABEL = {
    white: "W",
    blue: "U",
    green: "G",
    red: "R",
    black: "B",
    gold: "*"
  };
  var TIER_SIZES = { 1: 40, 2: 30, 3: 20 };

  var NOBLE_POOL = [
    { id: "noble-01", req: { white: 4, blue: 4 } },
    { id: "noble-02", req: { blue: 4, green: 4 } },
    { id: "noble-03", req: { green: 4, red: 4 } },
    { id: "noble-04", req: { red: 4, black: 4 } },
    { id: "noble-05", req: { black: 4, white: 4 } },
    { id: "noble-06", req: { white: 3, blue: 3, green: 3 } },
    { id: "noble-07", req: { blue: 3, green: 3, red: 3 } },
    { id: "noble-08", req: { green: 3, red: 3, black: 3 } },
    { id: "noble-09", req: { red: 3, black: 3, white: 3 } },
    { id: "noble-10", req: { black: 3, white: 3, blue: 3 } }
  ].map(function (noble, index) {
    return {
      id: noble.id,
      name: "Patron " + String(index + 1).padStart(2, "0"),
      points: 3,
      req: normalizeCost(noble.req)
    };
  });

  var state = null;
  var liveStateBeforeReplay = null;
  var replayData = null;
  var replayIndex = -1;
  var pendingTake = [];
  var messageText = "";
  var startMessageText = "";
  var messageKind = "";

  var el = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function emptyCounts(includeGold) {
    var counts = {};
    COLORS.forEach(function (color) {
      counts[color] = 0;
    });
    if (includeGold) {
      counts.gold = 0;
    }
    return counts;
  }

  function normalizeCost(cost) {
    var normalized = emptyCounts(false);
    COLORS.forEach(function (color) {
      normalized[color] = Math.max(0, Number(cost && cost[color]) || 0);
    });
    return normalized;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeRng(seed) {
    var value = seed >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function shuffle(items, seed) {
    var rng = makeRng(seed);
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function pointValue(tier, index) {
    if (tier === 1) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 1, 1][index % 10];
    }
    if (tier === 2) {
      return [1, 1, 1, 2, 2, 2, 3, 3, 0, 2][index % 10];
    }
    return [3, 3, 4, 4, 4, 5, 5, 3, 4, 5][index % 10];
  }

  function generatedCost(tier, index, gem, points) {
    var cost = emptyCounts(false);
    var templates = {
      1: [
        [1, 1, 1, 0, 0],
        [0, 2, 1, 1, 0],
        [2, 0, 0, 1, 1],
        [0, 1, 2, 0, 1],
        [1, 0, 1, 2, 0],
        [0, 0, 2, 2, 1],
        [2, 1, 0, 0, 2],
        [1, 2, 2, 0, 0],
        [0, 0, 0, 4, 0],
        [0, 3, 0, 0, 2]
      ],
      2: [
        [0, 2, 2, 3, 0],
        [3, 0, 2, 0, 2],
        [2, 3, 0, 2, 0],
        [0, 0, 3, 2, 3],
        [2, 0, 0, 3, 3],
        [0, 5, 0, 0, 0],
        [0, 0, 5, 0, 0],
        [0, 0, 0, 5, 0],
        [0, 0, 0, 0, 5],
        [5, 0, 0, 0, 0]
      ],
      3: [
        [0, 3, 3, 5, 3],
        [3, 0, 3, 3, 5],
        [5, 3, 0, 3, 3],
        [3, 5, 3, 0, 3],
        [3, 3, 5, 3, 0],
        [0, 0, 0, 7, 0],
        [0, 0, 7, 0, 0],
        [7, 0, 0, 0, 0],
        [0, 7, 0, 0, 0],
        [0, 0, 0, 0, 7]
      ]
    };
    var base = templates[tier][index % templates[tier].length].slice();
    var gemIndex = COLORS.indexOf(gem);
    base[gemIndex] = Math.max(0, base[gemIndex] - (points > 2 ? 1 : 0));
    COLORS.forEach(function (color, colorIndex) {
      cost[color] = base[(colorIndex + index) % COLORS.length];
    });
    if (Object.values(cost).reduce(function (sum, value) { return sum + value; }, 0) === 0) {
      cost[COLORS[(gemIndex + 1) % COLORS.length]] = tier + 2;
    }
    return cost;
  }

  function generateDeck(tier, size) {
    var deck = [];
    for (var index = 0; index < size; index += 1) {
      var gem = COLORS[(index + tier) % COLORS.length];
      var points = pointValue(tier, index);
      deck.push({
        id: "t" + tier + "-" + String(index + 1).padStart(2, "0"),
        tier: tier,
        color: gem,
        points: points,
        cost: generatedCost(tier, index, gem, points)
      });
    }
    return shuffle(deck, 7000 + tier * 101);
  }

  function tokenCountForPlayers(playerCount) {
    if (playerCount === 2) return 4;
    if (playerCount === 3) return 5;
    return 7;
  }

  function playerId(index) {
    return "p" + (index + 1);
  }

  function createGame(playerCount, names) {
    var tokenCount = tokenCountForPlayers(playerCount);
    var decks = {
      1: generateDeck(1, TIER_SIZES[1]),
      2: generateDeck(2, TIER_SIZES[2]),
      3: generateDeck(3, TIER_SIZES[3])
    };
    var game = {
      schema: SCHEMA,
      created_at: new Date().toISOString(),
      mode: "live",
      playerCount: playerCount,
      next_move_id: 1,
      players: names.map(function (name, index) {
        return {
          id: playerId(index),
          name: cleanName(name, index),
          tokens: emptyCounts(true),
          bonuses: emptyCounts(false),
          reserved: [],
          purchased: [],
          nobles: []
        };
      }),
      bank: emptyCounts(true),
      decks: decks,
      market: { 1: [], 2: [], 3: [] },
      nobles: shuffle(NOBLE_POOL, 9111).slice(0, playerCount + 1),
      current: 0,
      round: 1,
      log: [],
      moves: [],
      initial_gamedatas: null,
      awaitingDiscard: false,
      awaitingNobleChoice: null,
      endTriggered: false,
      finalTurnsLeft: null,
      gameOver: false
    };

    COLORS.forEach(function (color) {
      game.bank[color] = tokenCount;
    });
    game.bank.gold = 5;
    [1, 2, 3].forEach(function (tier) {
      refillMarket(game, tier);
    });
    game.log.unshift("Started " + playerCount + "-player local table.");
    game.initial_gamedatas = toGamedatas(game, { includeSourceState: true });
    return game;
  }

  function cleanName(name, index) {
    var fallback = "Player " + (index + 1);
    var value = String(name || "").trim();
    return value ? value.slice(0, 28) : fallback;
  }

  function refillMarket(game, tier) {
    while (game.market[tier].length < 4 && game.decks[tier].length > 0) {
      game.market[tier].push(game.decks[tier].pop());
    }
  }

  function activePlayer() {
    return state && state.players[state.current];
  }

  function scoreFor(player) {
    return player.purchased.reduce(function (sum, card) {
      return sum + card.points;
    }, 0) + player.nobles.reduce(function (sum, noble) {
      return sum + noble.points;
    }, 0);
  }

  function totalTokens(player) {
    return ALL_TOKENS.reduce(function (sum, color) {
      return sum + (Number(player.tokens[color]) || 0);
    }, 0);
  }

  function canAct() {
    return !!state && state.mode !== "replay" && !state.gameOver && !state.awaitingDiscard && !state.awaitingNobleChoice;
  }

  function logEntry(message) {
    if (!state) return;
    state.log.unshift(message);
    state.log = state.log.slice(0, 120);
  }

  function showMessage(message, kind) {
    messageText = message || "";
    messageKind = kind || "";
    if (el.message) {
      el.message.textContent = messageText;
      el.message.classList.toggle("ok", messageKind === "ok");
    }
  }

  function showStartMessage(message, kind) {
    startMessageText = message || "";
    if (el.startMessage) {
      el.startMessage.textContent = startMessageText;
      el.startMessage.classList.toggle("ok", kind === "ok");
    }
  }

  function storageGetItem(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function storageSetItem(key, value) {
    try {
      if (!window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function storageRemoveItem(key) {
    try {
      if (window.localStorage) window.localStorage.removeItem(key);
    } catch (error) {
      // Storage can be blocked by privacy settings or embedded preview sandboxes.
    }
  }

  function saveState() {
    if (!state || state.mode === "replay") return;
    var serialized = "";
    try {
      serialized = JSON.stringify(state);
    } catch (error) {
      showMessage("Save failed: table state could not be serialized.");
      return;
    }
    if (!storageSetItem(STORAGE_KEY, serialized)) {
      showMessage("Save failed: localStorage is unavailable or full.");
    }
  }

  function clearSavedState() {
    storageRemoveItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach(function (key) {
      storageRemoveItem(key);
    });
  }

  function loadSavedState() {
    LEGACY_STORAGE_KEYS.forEach(function (key) {
      if (storageGetItem(key)) storageRemoveItem(key);
    });
    var raw = storageGetItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (!validateState(parsed)) {
        storageRemoveItem(STORAGE_KEY);
        showStartMessage("Saved data was invalid and has been cleared.");
        return null;
      }
      parsed.mode = "live";
      return parsed;
    } catch (error) {
      storageRemoveItem(STORAGE_KEY);
      showStartMessage("Saved data could not be parsed and has been cleared.");
      return null;
    }
  }

  function validateState(candidate) {
    if (!candidate || candidate.schema !== SCHEMA) return false;
    if (!Array.isArray(candidate.players) || candidate.players.length < 2 || candidate.players.length > 4) return false;
    if (!candidate.bank || !candidate.decks || !candidate.market) return false;
    if (!Array.isArray(candidate.nobles) || !Array.isArray(candidate.log) || !Array.isArray(candidate.moves)) return false;
    return candidate.players.every(function (player) {
      return player && player.tokens && player.bonuses && Array.isArray(player.reserved) && Array.isArray(player.purchased) && Array.isArray(player.nobles);
    });
  }

  function renderNameFields() {
    var count = Number(el.playerCount.value) || 4;
    el.playerNameFields.innerHTML = "";
    for (var index = 0; index < count; index += 1) {
      var label = document.createElement("label");
      label.textContent = "Player " + (index + 1) + " name";
      var input = document.createElement("input");
      input.name = "playerName";
      input.autocomplete = "off";
      input.maxLength = 28;
      input.placeholder = "Player " + (index + 1);
      label.append(input);
      el.playerNameFields.append(label);
    }
  }

  function gemStyle(color) {
    return "--gem:" + GEM_HEX[color];
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function costHtml(cost) {
    var parts = COLORS.filter(function (color) {
      return (cost[color] || 0) > 0;
    }).map(function (color) {
      return '<span class="cost-pill" data-color="' + color + '" style="' + gemStyle(color) + '">' + TOKEN_LABEL[color] + " " + cost[color] + "</span>";
    });
    return parts.length ? parts.join("") : '<span class="muted">Free</span>';
  }

  function bonusesHtml(counts) {
    return COLORS.map(function (color) {
      return '<span class="bonus-pill" data-color="' + color + '" style="' + gemStyle(color) + '">' + TOKEN_LABEL[color] + " " + (counts[color] || 0) + "</span>";
    }).join("");
  }

  function tokensHtml(counts, asButtons, actionName) {
    return ALL_TOKENS.map(function (color) {
      var value = Number(counts[color]) || 0;
      if (asButtons) {
        return '<button class="token-button" type="button" data-' + actionName + '="' + color + '" data-color="' + color + '" style="' + gemStyle(color) + '" ' + (value <= 0 ? "disabled" : "") + ">" + TOKEN_LABEL[color] + " " + value + "</button>";
      }
      return '<span class="token" data-color="' + color + '" style="' + gemStyle(color) + '">' + TOKEN_LABEL[color] + " " + value + "</span>";
    }).join("");
  }

  function affordability(player, card) {
    var pay = emptyCounts(true);
    var goldNeeded = 0;
    COLORS.forEach(function (color) {
      var needed = Math.max((card.cost[color] || 0) - (player.bonuses[color] || 0), 0);
      var coloredPay = Math.min(player.tokens[color] || 0, needed);
      pay[color] = coloredPay;
      goldNeeded += needed - coloredPay;
    });
    pay.gold = goldNeeded;
    return { ok: goldNeeded <= (player.tokens.gold || 0), pay: pay };
  }

  function spendForCard(player, pay) {
    COLORS.forEach(function (color) {
      var count = pay[color] || 0;
      player.tokens[color] -= count;
      state.bank[color] += count;
    });
    player.tokens.gold -= pay.gold || 0;
    state.bank.gold += pay.gold || 0;
  }

  function renderCard(card, controls) {
    var buyAttr = controls.buy ? 'data-' + controls.buy + '="' + controls.value + '"' : "";
    var reserveAttr = controls.reserve ? 'data-' + controls.reserve + '="' + controls.value + '"' : "";
    var afford = controls.afford;
    var affordText = afford && afford.ok ? "Affordable" : "Need tokens";
    return [
      '<article class="dev-card" style="' + gemStyle(card.color) + '">',
      "<h3><span>Tier " + card.tier + " " + TOKEN_LABEL[card.color] + '<br><span class="card-id">' + card.id + '</span></span><span class="points">' + card.points + "</span></h3>",
      '<div class="cost-row">' + costHtml(card.cost) + "</div>",
      '<p class="muted compact">' + affordText + "</p>",
      '<div class="card-actions">',
      '<button type="button" ' + buyAttr + " " + (controls.buyDisabled ? "disabled" : "") + ">Buy</button>",
      '<button type="button" ' + reserveAttr + " " + (controls.reserveDisabled ? "disabled" : "") + ">Reserve</button>",
      "</div>",
      "</article>"
    ].join("");
  }

  function renderNoble(noble, choiceMode) {
    var button = choiceMode ? '<button type="button" class="primary" data-choose-noble="' + noble.id + '">Choose</button>' : "";
    return [
      '<article class="noble-card">',
      "<strong>" + noble.points + " prestige</strong>",
      '<div class="cost-row">' + costHtml(noble.req) + "</div>",
      button,
      "</article>"
    ].join("");
  }

  function renderBank() {
    el.bankTokens.innerHTML = ALL_TOKENS.map(function (color) {
      var disabled = color === "gold" || !canAct() || state.bank[color] <= 0;
      return '<button class="token-button" type="button" data-bank-color="' + color + '" data-color="' + color + '" style="' + gemStyle(color) + '" ' + (disabled ? "disabled" : "") + ">" + TOKEN_LABEL[color] + " " + state.bank[color] + "</button>";
    }).join("");

    el.takeSummary.textContent = takeSummaryText();
    el.confirmTake.disabled = !canAct() || !pendingTakeIsLegal();
    el.clearTake.disabled = !canAct() || pendingTake.length === 0;
  }

  function takeSummaryText() {
    if (pendingTake.length === 0) return "No take selected.";
    return "Selected: " + pendingTake.map(function (color) {
      return TOKEN_LABEL[color];
    }).join(", ") + ". Legal take requires 3 different or 2 matching from a stack with 4+.";
  }

  function renderMarket() {
    var active = activePlayer();
    el.market.innerHTML = [3, 2, 1].map(function (tier) {
      var cards = state.market[tier].map(function (card, index) {
        var afford = affordability(active, card);
        return renderCard(card, {
          buy: "buy-market",
          reserve: "reserve-market",
          value: tier + ":" + index,
          afford: afford,
          buyDisabled: !canAct() || !afford.ok,
          reserveDisabled: !canAct() || active.reserved.length >= 3
        });
      }).join("");
      return [
        '<section class="tier">',
        '<div class="deck-box">',
        '<span class="label">Tier ' + tier + "</span>",
        "<strong>" + state.decks[tier].length + "</strong>",
        '<span class="muted compact">Deck cards</span>',
        '<button type="button" data-reserve-deck="' + tier + '" ' + (!canAct() || active.reserved.length >= 3 || state.decks[tier].length === 0 ? "disabled" : "") + ">Reserve deck</button>",
        "</div>",
        '<div class="card-grid">' + (cards || '<span class="muted">No face-up cards remain.</span>') + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderPlayers() {
    el.players.innerHTML = state.players.map(function (player, playerIndex) {
      var reservedCards = player.reserved.length
        ? player.reserved.map(function (card, cardIndex) {
            var afford = affordability(player, card);
            return [
              '<div class="reserved-card" style="' + gemStyle(card.color) + '">',
              '<span>Tier ' + card.tier + " " + TOKEN_LABEL[card.color] + ", " + card.points + " prestige</span>",
              '<button type="button" data-buy-reserved="' + playerIndex + ":" + cardIndex + '" ' + (playerIndex !== state.current || !canAct() || !afford.ok ? "disabled" : "") + ">Buy</button>",
              "</div>"
            ].join("");
          }).join("")
        : '<span class="muted">No reserved cards</span>';
      var nobleText = player.nobles.length ? player.nobles.map(function (noble) { return noble.name; }).join(", ") : "None";
      return [
        '<article class="player-card ' + (playerIndex === state.current ? "active" : "") + '">',
        '<div class="player-top"><h3>' + escapeHtml(player.name) + '</h3><strong class="score-line">' + scoreFor(player) + " prestige</strong></div>",
        '<div><span class="label">Tokens (' + totalTokens(player) + '/10)</span><div class="token-row">' + tokensHtml(player.tokens, false) + "</div></div>",
        '<div><span class="label">Bonuses</span><div class="bonus-row">' + bonusesHtml(player.bonuses) + "</div></div>",
        '<div><span class="label">Reserved (' + player.reserved.length + '/3)</span><div class="reserved-list">' + reservedCards + "</div></div>",
        '<div class="purchased-summary" style="' + gemStyle("gold") + '"><span>Purchased cards: ' + player.purchased.length + ". Nobles: " + escapeHtml(nobleText) + ".</span></div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderNobles() {
    el.nobles.innerHTML = state.nobles.length ? state.nobles.map(function (noble) {
      return renderNoble(noble, false);
    }).join("") : '<span class="muted">No nobles remain.</span>';
  }

  function renderDiscard() {
    var player = activePlayer();
    el.discardPanel.hidden = !state.awaitingDiscard;
    if (!state.awaitingDiscard) {
      el.discardTokens.innerHTML = "";
      return;
    }
    el.discardTokens.innerHTML = tokensHtml(player.tokens, true, "discard-color");
  }

  function renderNobleChoice() {
    el.nobleChoicePanel.hidden = !state.awaitingNobleChoice;
    if (!state.awaitingNobleChoice) {
      el.nobleChoiceList.innerHTML = "";
      return;
    }
    var eligible = state.nobles.filter(function (noble) {
      return state.awaitingNobleChoice.indexOf(noble.id) >= 0;
    });
    el.nobleChoiceList.innerHTML = eligible.map(function (noble) {
      return renderNoble(noble, true);
    }).join("");
  }

  function renderLog() {
    el.actionLog.innerHTML = state.log.map(function (entry) {
      return "<li>" + escapeHtml(entry) + "</li>";
    }).join("");
  }

  function renderReplayStatus() {
    if (!state || state.mode !== "replay") {
      el.replayStatus.textContent = "Live table";
      el.prevMove.disabled = true;
      el.nextMove.disabled = true;
      el.exitReplay.disabled = true;
      return;
    }
    var total = replayData && replayData.moves ? replayData.moves.length : 0;
    el.replayStatus.textContent = "Replay move " + Math.max(0, replayIndex + 1) + " / " + total;
    el.prevMove.disabled = replayIndex < 0;
    el.nextMove.disabled = !replayData || replayIndex >= total - 1;
    el.exitReplay.disabled = false;
  }

  function render() {
    var saved = loadSavedState();
    el.resumeGame.hidden = !saved || !!state;
    el.startMessage.textContent = startMessageText;

    if (!state) {
      el.startPanel.hidden = false;
      el.gamePanel.hidden = true;
      renderReplayStatus();
      return;
    }

    el.startPanel.hidden = true;
    el.gamePanel.hidden = false;
    el.currentPlayer.textContent = activePlayer().name;
    el.roundLabel.textContent = String(state.round);
    el.moveLabel.textContent = String((state.next_move_id || 1) - 1);
    el.gameStateLabel.textContent = gameStateText();
    el.message.textContent = messageText;
    el.message.classList.toggle("ok", messageKind === "ok");

    renderBank();
    renderNobles();
    renderMarket();
    renderPlayers();
    renderDiscard();
    renderNobleChoice();
    renderLog();
    renderReplayStatus();
  }

  function gameStateText() {
    if (state.mode === "replay") return "Replay";
    if (state.gameOver) return "Finished";
    if (state.awaitingDiscard) return "Discard required";
    if (state.awaitingNobleChoice) return "Noble choice";
    if (state.endTriggered) return "Final round (" + state.finalTurnsLeft + " turns left)";
    return "In progress";
  }

  function pendingTakeIsLegal() {
    if (pendingTake.length === 3) {
      var unique = new Set(pendingTake);
      return unique.size === 3;
    }
    if (pendingTake.length === 2 && pendingTake[0] === pendingTake[1]) {
      return state.bank[pendingTake[0]] >= 4;
    }
    return false;
  }

  function selectTake(color) {
    if (!canAct()) {
      showMessage("Resolve the current required step before taking another action.");
      render();
      return;
    }
    if (color === "gold") {
      showMessage("Gold can only be gained when reserving a card.");
      render();
      return;
    }
    if (pendingTake.length >= 3) {
      showMessage("A take action is either exactly 3 different tokens or exactly 2 matching tokens.");
      render();
      return;
    }
    var already = pendingTake.filter(function (item) { return item === color; }).length;
    if (state.bank[color] <= already) {
      showMessage("That bank stack does not have enough tokens.");
      render();
      return;
    }
    if (already > 0) {
      if (pendingTake.some(function (item) { return item !== color; })) {
        showMessage("Two matching tokens must be the whole action.");
        render();
        return;
      }
      if (already >= 2) {
        showMessage("You can take only two matching tokens.");
        render();
        return;
      }
      if (state.bank[color] < 4) {
        showMessage("Two matching tokens require at least 4 in that bank stack before taking.");
        render();
        return;
      }
    } else if (pendingTake.length === 2 && pendingTake[0] === pendingTake[1]) {
      showMessage("Two matching tokens must be the whole action.");
      render();
      return;
    } else if (pendingTake.indexOf(color) >= 0) {
      showMessage("Three-token takes must use different colors.");
      render();
      return;
    }
    pendingTake.push(color);
    showMessage("");
    render();
  }

  function confirmTake() {
    if (!canAct()) return;
    if (!pendingTakeIsLegal()) {
      showMessage("Select exactly 3 different non-gold tokens, or exactly 2 matching tokens from a stack with 4+.");
      render();
      return;
    }
    var player = activePlayer();
    var taken = pendingTake.slice();
    taken.forEach(function (color) {
      state.bank[color] -= 1;
      player.tokens[color] += 1;
    });
    pendingTake = [];
    logEntry(player.name + " took " + taken.map(function (color) { return TOKEN_LABEL[color]; }).join(", ") + ".");
    afterAction("takeTokens", { colors: taken });
  }

  function reserveMarket(value) {
    if (!canAct()) return;
    var parts = value.split(":");
    var tier = Number(parts[0]);
    var index = Number(parts[1]);
    var player = activePlayer();
    if (player.reserved.length >= 3) {
      showMessage("A player can reserve at most 3 cards.");
      render();
      return;
    }
    var card = state.market[tier][index];
    if (!card) {
      showMessage("That market card is no longer available.");
      render();
      return;
    }
    state.market[tier].splice(index, 1);
    refillMarket(state, tier);
    reserveCard(player, card, "reserveMarket", { card_id: card.id, tier: tier });
  }

  function reserveDeck(tier) {
    if (!canAct()) return;
    var player = activePlayer();
    if (player.reserved.length >= 3) {
      showMessage("A player can reserve at most 3 cards.");
      render();
      return;
    }
    var card = state.decks[tier].pop();
    if (!card) {
      showMessage("That deck is empty.");
      render();
      return;
    }
    reserveCard(player, card, "reserveDeck", { card_id: card.id, tier: tier });
  }

  function reserveCard(player, card, type, args) {
    player.reserved.push(card);
    var tookGold = false;
    if (state.bank.gold > 0) {
      state.bank.gold -= 1;
      player.tokens.gold += 1;
      tookGold = true;
    }
    logEntry(player.name + " reserved " + card.id + (tookGold ? " and took gold." : "."));
    args.took_gold = tookGold;
    afterAction(type, args);
  }

  function buyMarket(value) {
    if (!canAct()) return;
    var parts = value.split(":");
    var tier = Number(parts[0]);
    var index = Number(parts[1]);
    var card = state.market[tier][index];
    if (!card) {
      showMessage("That market card is no longer available.");
      render();
      return;
    }
    if (!buyCard(activePlayer(), card)) return;
    state.market[tier].splice(index, 1);
    refillMarket(state, tier);
    afterAction("buyMarket", { card_id: card.id, tier: tier });
  }

  function buyReserved(value) {
    if (!canAct()) return;
    var parts = value.split(":");
    var playerIndex = Number(parts[0]);
    var index = Number(parts[1]);
    if (playerIndex !== state.current) return;
    var player = activePlayer();
    var card = player.reserved[index];
    if (!card || !buyCard(player, card)) return;
    player.reserved.splice(index, 1);
    afterAction("buyReserved", { card_id: card.id });
  }

  function buyCard(player, card) {
    var afford = affordability(player, card);
    if (!afford.ok) {
      showMessage("Not enough tokens or gold for that card.");
      render();
      return false;
    }
    spendForCard(player, afford.pay);
    player.purchased.push(card);
    player.bonuses[card.color] += 1;
    logEntry(player.name + " bought " + card.id + " for " + card.points + " prestige.");
    showMessage("");
    return true;
  }

  function afterAction(type, args) {
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if (totalTokens(player) > 10) {
      state.awaitingDiscard = true;
      showMessage(player.name + " has " + totalTokens(player) + " tokens and must return down to 10.");
      recordMove(type, args, actor);
      saveState();
      render();
      return;
    }
    resolveNoblesOrTurn(type, args, actor);
  }

  function discardToken(color) {
    if (!state.awaitingDiscard || state.mode === "replay") return;
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if ((player.tokens[color] || 0) <= 0) return;
    player.tokens[color] -= 1;
    state.bank[color] += 1;
    logEntry(player.name + " returned " + TOKEN_LABEL[color] + ".");
    if (totalTokens(player) <= 10) {
      state.awaitingDiscard = false;
      showMessage("");
      resolveNoblesOrTurn("discardToken", { color: color }, actor);
      return;
    }
    showMessage(player.name + " still has " + totalTokens(player) + " tokens. Return down to 10.");
    recordMove("discardToken", { color: color }, actor);
    saveState();
    render();
  }

  function eligibleNobles(player) {
    return state.nobles.filter(function (noble) {
      return COLORS.every(function (color) {
        return (player.bonuses[color] || 0) >= (noble.req[color] || 0);
      });
    });
  }

  function awardNoble(player, nobleId) {
    var index = state.nobles.findIndex(function (noble) {
      return noble.id === nobleId;
    });
    if (index < 0) return null;
    var noble = state.nobles.splice(index, 1)[0];
    player.nobles.push(noble);
    logEntry(player.name + " received " + noble.name + " for " + noble.points + " prestige.");
    return noble;
  }

  function resolveNoblesOrTurn(type, args, actor) {
    var player = activePlayer();
    var eligible = eligibleNobles(player);
    if (eligible.length === 0) {
      proceedToNextTurn();
      recordMove(type, args, actor);
      saveState();
      render();
      return;
    }
    if (eligible.length === 1) {
      var noble = awardNoble(player, eligible[0].id);
      proceedToNextTurn();
      var withNoble = Object.assign({}, args, { noble_id: noble.id });
      recordMove(type, withNoble, actor);
      saveState();
      render();
      return;
    }
    state.awaitingNobleChoice = eligible.map(function (noble) { return noble.id; });
    showMessage(player.name + " is eligible for multiple nobles. Choose one.");
    recordMove(type, args, actor);
    saveState();
    render();
  }

  function chooseNoble(nobleId) {
    if (!state.awaitingNobleChoice || state.mode === "replay") return;
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if (state.awaitingNobleChoice.indexOf(nobleId) < 0) {
      showMessage("That noble is not eligible.");
      render();
      return;
    }
    awardNoble(player, nobleId);
    state.awaitingNobleChoice = null;
    showMessage("");
    proceedToNextTurn();
    recordMove("chooseNoble", { noble_id: nobleId }, actor);
    saveState();
    render();
  }

  function proceedToNextTurn() {
    var player = activePlayer();
    if (!state.endTriggered && scoreFor(player) >= 15) {
      state.endTriggered = true;
      state.finalTurnsLeft = state.players.length - 1 - state.current;
      logEntry(player.name + " reached 15 prestige. Final round begins.");
    } else if (state.endTriggered) {
      state.finalTurnsLeft -= 1;
    }

    if (state.endTriggered && state.finalTurnsLeft <= 0) {
      state.gameOver = true;
      var result = winnersText();
      logEntry(result);
      showMessage(result, "ok");
      return;
    }

    state.current = (state.current + 1) % state.players.length;
    if (state.current === 0) state.round += 1;
    showMessage("");
  }

  function winnersText() {
    var ranked = state.players.map(function (player) {
      return { player: player, score: scoreFor(player), purchased: player.purchased.length };
    }).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.purchased - b.purchased;
    });
    var best = ranked[0];
    var winners = ranked.filter(function (entry) {
      return entry.score === best.score && entry.purchased === best.purchased;
    });
    if (winners.length > 1) {
      return "Shared win: " + winners.map(function (entry) { return entry.player.name; }).join(", ") + ".";
    }
    return "Winner: " + best.player.name + ".";
  }

  function recordMove(type, args, actor) {
    if (!state || state.mode === "replay") return;
    var player = actor || state.players[state.current] || state.players[0];
    var move = {
      move_id: state.next_move_id,
      type: type,
      player_id: player.id,
      args: args || {},
      notification: {
        type: type,
        log: state.log[0] || "",
        args: Object.assign({ player_id: player.id, player_name: player.name }, args || {})
      },
      state_after: toGamedatas(state, { includeSourceState: true })
    };
    state.moves.push(move);
    state.next_move_id += 1;
  }

  function toGamedatas(game, options) {
    var includeSourceState = options && options.includeSourceState;
    var players = {};
    game.players.forEach(function (player, index) {
      players[player.id] = {
        id: player.id,
        no: index + 1,
        name: player.name,
        score: scoreFor(player),
        tokens: clone(player.tokens),
        bonuses: clone(player.bonuses),
        reserved: clone(player.reserved),
        purchased_count: player.purchased.length,
        purchased: clone(player.purchased),
        nobles: clone(player.nobles)
      };
    });
    var data = {
      schema: SCHEMA,
      table: {
        player_count: game.players.length,
        round: game.round,
        current_player_id: game.players[game.current] ? game.players[game.current].id : null,
        active_player_id: game.players[game.current] ? game.players[game.current].id : null,
        next_move_id: game.next_move_id,
        mode: game.mode || "live"
      },
      gamestate: {
        name: game.gameOver ? "gameEnd" : game.awaitingDiscard ? "discard" : game.awaitingNobleChoice ? "chooseNoble" : "playerTurn",
        description: gameStateTextFor(game),
        active_player: game.players[game.current] ? game.players[game.current].id : null
      },
      players: players,
      playerorder: game.players.map(function (player) { return player.id; }),
      bank: clone(game.bank),
      market: clone(game.market),
      nobles: clone(game.nobles),
      decks_remaining: {
        1: game.decks[1].length,
        2: game.decks[2].length,
        3: game.decks[3].length
      },
      awaiting: {
        discard: !!game.awaitingDiscard,
        noble_choice: game.awaitingNobleChoice ? game.awaitingNobleChoice.slice() : null
      },
      end: {
        triggered: !!game.endTriggered,
        final_turns_left: game.finalTurnsLeft,
        game_over: !!game.gameOver
      },
      log: game.log.slice()
    };
    if (includeSourceState) {
      data.source_state = cloneWithoutMoveSnapshots(game);
    }
    return data;
  }

  function gameStateTextFor(game) {
    if (game.gameOver) return "Game finished";
    if (game.awaitingDiscard) return "Active player must discard to token cap";
    if (game.awaitingNobleChoice) return "Active player must choose one noble";
    if (game.endTriggered) return "Final round";
    return "Player turn";
  }

  function cloneWithoutMoveSnapshots(game) {
    var copy = clone(game);
    copy.moves = copy.moves.map(function (move) {
      return {
        move_id: move.move_id,
        type: move.type,
        player_id: move.player_id,
        args: clone(move.args),
        notification: clone(move.notification),
        state_after: {
          schema: SCHEMA,
          table: move.state_after.table,
          gamestate: move.state_after.gamestate
        }
      };
    });
    copy.initial_gamedatas = null;
    return copy;
  }

  function stateFromGamedatas(gamedatas) {
    if (!gamedatas || gamedatas.schema !== SCHEMA) return null;
    if (gamedatas.source_state && validateState(gamedatas.source_state)) {
      var restored = clone(gamedatas.source_state);
      restored.mode = "live";
      return restored;
    }
    return null;
  }

  function exportStateJson() {
    if (!state) {
      showMessage("No active table to export.");
      render();
      return;
    }
    var payload = {
      schema: SCHEMA,
      next_move_id: state.next_move_id,
      gamedatas: toGamedatas(state, { includeSourceState: true }),
      moves: clone(state.moves)
    };
    el.bgaJson.value = JSON.stringify(payload, null, 2);
    showMessage("Current state exported.", "ok");
    render();
  }

  function exportReplayJson() {
    if (!state) {
      showMessage("No active table to export.");
      render();
      return;
    }
    var payload = {
      schema: SCHEMA,
      next_move_id: state.next_move_id,
      gamedatas: state.initial_gamedatas || toGamedatas(state, { includeSourceState: true }),
      moves: clone(state.moves)
    };
    el.bgaJson.value = JSON.stringify(payload, null, 2);
    showMessage("Replay exported.", "ok");
    render();
  }

  function importStateJson() {
    var payload = parseJsonTextarea();
    if (!payload) return;
    var imported = null;
    if (validateState(payload)) {
      imported = payload;
    } else if (payload.schema === SCHEMA && payload.gamedatas) {
      imported = stateFromGamedatas(payload.gamedatas);
    } else if (payload.schema === SCHEMA && payload.source_state) {
      imported = stateFromGamedatas(payload);
    }
    if (!imported) {
      showMessage("Import failed: expected a Gem Table state or gamedatas.source_state using " + SCHEMA + ".");
      render();
      return;
    }
    imported.mode = "live";
    state = imported;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    pendingTake = [];
    showMessage("State imported.", "ok");
    saveState();
    render();
  }

  function loadReplayJson() {
    var payload = parseJsonTextarea();
    if (!payload) return;
    if (payload.schema !== SCHEMA || !payload.gamedatas || !Array.isArray(payload.moves)) {
      showMessage("Load replay failed: expected { schema, gamedatas, moves }.");
      render();
      return;
    }
    var initial = stateFromGamedatas(payload.gamedatas);
    if (!initial) {
      showMessage("Load replay failed: gamedatas.source_state is required for this static viewer.");
      render();
      return;
    }
    if (state && state.mode !== "replay") {
      liveStateBeforeReplay = clone(state);
    }
    replayData = clone(payload);
    replayIndex = -1;
    state = initial;
    state.mode = "replay";
    pendingTake = [];
    showMessage("Replay loaded. Use Next move and Prev move to inspect snapshots.", "ok");
    render();
  }

  function stepReplay(delta) {
    if (!replayData || state.mode !== "replay") return;
    var nextIndex = replayIndex + delta;
    if (nextIndex < -1 || nextIndex >= replayData.moves.length) return;
    replayIndex = nextIndex;
    if (replayIndex === -1) {
      state = stateFromGamedatas(replayData.gamedatas);
    } else {
      state = stateFromGamedatas(replayData.moves[replayIndex].state_after);
    }
    state.mode = "replay";
    var moveText = replayIndex === -1 ? "Initial replay position." : "Replay at move " + replayData.moves[replayIndex].move_id + ": " + replayData.moves[replayIndex].type + ".";
    showMessage(moveText, "ok");
    render();
  }

  function exitReplay() {
    if (!state || state.mode !== "replay") return;
    state = liveStateBeforeReplay ? clone(liveStateBeforeReplay) : null;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    pendingTake = [];
    showMessage(state ? "Returned to live table." : "");
    render();
  }

  function parseJsonTextarea() {
    try {
      return JSON.parse(el.bgaJson.value);
    } catch (error) {
      showMessage("JSON parse failed: " + error.message);
      render();
      return null;
    }
  }

  function startGameWithCurrentForm(countOverride) {
    var count = countOverride || Number(el.playerCount.value);
    if (![2, 3, 4].includes(count)) {
      showStartMessage("Choose 2, 3, or 4 players.");
      render();
      return;
    }
    el.playerCount.value = String(count);
    if (el.playerNameFields.querySelectorAll("input").length !== count) {
      renderNameFields();
    }
    var names = Array.from(el.playerNameFields.querySelectorAll("input")).map(function (input, index) {
      return cleanName(input.value, index);
    });
    state = createGame(count, names);
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    pendingTake = [];
    showStartMessage("");
    showMessage("Game started.", "ok");
    saveState();
    render();
  }

  function resetToStart() {
    state = null;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    pendingTake = [];
    messageText = "";
    messageKind = "";
    clearSavedState();
    render();
  }

  function wireEvents() {
    el.playerCount.addEventListener("change", renderNameFields);
    el.startForm.addEventListener("submit", function (event) {
      event.preventDefault();
      startGameWithCurrentForm();
    });
    el.startGame.addEventListener("click", function (event) {
      event.preventDefault();
      startGameWithCurrentForm();
    });
    document.querySelectorAll("[data-quick-start]").forEach(function (button) {
      button.addEventListener("click", function () {
        startGameWithCurrentForm(Number(button.dataset.quickStart));
      });
    });
    el.resumeGame.addEventListener("click", function () {
      var saved = loadSavedState();
      if (!saved) {
        showStartMessage("No valid saved table found.");
        render();
        return;
      }
      state = saved;
      pendingTake = [];
      showMessage("Saved table resumed.", "ok");
      render();
    });
    el.clearSave.addEventListener("click", function () {
      clearSavedState();
      showStartMessage("Saved data cleared.", "ok");
      render();
    });
    el.saveGame.addEventListener("click", function () {
      if (!state || state.mode === "replay") {
        showMessage("No live table to save.");
      } else {
        saveState();
        showMessage("Game saved.", "ok");
      }
      render();
    });
    el.resetGame.addEventListener("click", resetToStart);
    el.confirmTake.addEventListener("click", confirmTake);
    el.clearTake.addEventListener("click", function () {
      pendingTake = [];
      showMessage("");
      render();
    });
    el.bankTokens.addEventListener("click", function (event) {
      var button = event.target.closest("[data-bank-color]");
      if (button) selectTake(button.dataset.bankColor);
    });
    el.market.addEventListener("click", function (event) {
      var reserveMarketButton = event.target.closest("[data-reserve-market]");
      var reserveDeckButton = event.target.closest("[data-reserve-deck]");
      var buyMarketButton = event.target.closest("[data-buy-market]");
      if (reserveMarketButton) {
        reserveMarket(reserveMarketButton.dataset.reserveMarket);
      } else if (reserveDeckButton) {
        reserveDeck(Number(reserveDeckButton.dataset.reserveDeck));
      } else if (buyMarketButton) {
        buyMarket(buyMarketButton.dataset.buyMarket);
      }
    });
    el.players.addEventListener("click", function (event) {
      var button = event.target.closest("[data-buy-reserved]");
      if (button) buyReserved(button.dataset.buyReserved);
    });
    el.discardTokens.addEventListener("click", function (event) {
      var button = event.target.closest("[data-discard-color]");
      if (button) discardToken(button.dataset.discardColor);
    });
    el.nobleChoiceList.addEventListener("click", function (event) {
      var button = event.target.closest("[data-choose-noble]");
      if (button) chooseNoble(button.dataset.chooseNoble);
    });
    el.exportState.addEventListener("click", exportStateJson);
    el.importState.addEventListener("click", importStateJson);
    el.exportReplay.addEventListener("click", exportReplayJson);
    el.loadReplay.addEventListener("click", loadReplayJson);
    el.prevMove.addEventListener("click", function () { stepReplay(-1); });
    el.nextMove.addEventListener("click", function () { stepReplay(1); });
    el.exitReplay.addEventListener("click", exitReplay);
  }

  function collectElements() {
    [
      "start-panel",
      "start-form",
      "start-game",
      "start-message",
      "player-count",
      "player-name-fields",
      "resume-game",
      "clear-save",
      "game-panel",
      "current-player",
      "round-label",
      "game-state-label",
      "move-label",
      "message",
      "discard-panel",
      "discard-tokens",
      "noble-choice-panel",
      "noble-choice-list",
      "take-summary",
      "bank-tokens",
      "confirm-take",
      "clear-take",
      "nobles",
      "market",
      "players",
      "action-log",
      "save-game",
      "reset-game",
      "bga-json",
      "export-state",
      "import-state",
      "export-replay",
      "load-replay",
      "prev-move",
      "next-move",
      "exit-replay",
      "replay-status"
    ].forEach(function (id) {
      var key = id.replace(/-([a-z])/g, function (_, letter) {
        return letter.toUpperCase();
      });
      el[key] = byId(id);
    });
  }

  function init() {
    collectElements();
    renderNameFields();
    wireEvents();
    render();

    window.__gemTableDebug = {
      createGame: createGame,
      getState: function () { return state; },
      startGame: function (count, names) {
        state = createGame(count, names || []);
        pendingTake = [];
        render();
        return state;
      },
      setState: function (nextState) {
        if (validateState(nextState)) {
          state = nextState;
          render();
        }
      },
      actions: {
        selectTake: selectTake,
        confirmTake: confirmTake,
        reserveDeck: reserveDeck,
        reserveMarket: reserveMarket,
        buyMarket: buyMarket,
        buyReserved: buyReserved,
        discardToken: discardToken,
        chooseNoble: chooseNoble
      },
      exportReplayPayload: function () {
        return state ? {
          schema: SCHEMA,
          next_move_id: state.next_move_id,
          gamedatas: state.initial_gamedatas || toGamedatas(state, { includeSourceState: true }),
          moves: clone(state.moves)
        } : null;
      },
      clearSave: clearSavedState,
      schema: SCHEMA
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
