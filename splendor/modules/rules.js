(function (root) {
  "use strict";

  var DEFAULT_COLORS = ["white", "blue", "green", "red", "black"];

  function colorsFromOptions(options) {
    return Array.isArray(options && options.colors) && options.colors.length ? options.colors : DEFAULT_COLORS;
  }

  function emptyBonusCounts(colors) {
    return colors.reduce(function (counts, color) {
      counts[color] = 0;
      return counts;
    }, {});
  }

  function normalizedPlayerIndex(value) {
    if (value === null || value === undefined || value === "") return null;
    var number = Number(value);
    return Number.isInteger(number) ? number : null;
  }

  function cardIsOrient(card, options) {
    var orientMarketId = options && options.orientMarketId || "orient";
    return !!(card && card.module === orientMarketId);
  }

  function effectiveCardBonuses(card, options) {
    var colors = colorsFromOptions(options);
    var bonuses = emptyBonusCounts(colors);
    if (!card) return bonuses;

    if (cardIsOrient(card, options)) {
      if (card.copied_color && colors.indexOf(card.copied_color) >= 0) {
        bonuses[card.copied_color] = 1;
        return bonuses;
      }

      var explicit = card.orient_effective && card.orient_effective.bonus || card.effective_bonuses;
      colors.forEach(function (color) {
        bonuses[color] = Math.max(0, Number(explicit && explicit[color]) || 0);
      });

      (Array.isArray(card.abilities) ? card.abilities : []).forEach(function (ability) {
        if (!ability || (ability.effect !== "double_bonus" && ability.effect !== "fixed_bonus")) return;
        var color = ability.bonus_color || card.printed_color || card.color;
        if (colors.indexOf(color) >= 0 && bonuses[color] === 0) {
          bonuses[color] = Math.max(1, Number(ability.bonus_count) || (ability.effect === "double_bonus" ? 2 : 1));
        }
      });

      var fallbackColor = card.printed_color || card.color;
      if (!colors.some(function (color) { return bonuses[color] > 0; }) && colors.indexOf(fallbackColor) >= 0) {
        bonuses[fallbackColor] = Math.max(1, Number(card.bga_carddb && card.bga_carddb.nbBonus) || 1);
      }
      return bonuses;
    }

    if (colors.indexOf(card.color) >= 0) bonuses[card.color] = 1;
    return bonuses;
  }

  function bonusDisplaySummary(counts, player, color, options) {
    var total = Number(counts && counts[color]) || 0;
    if (!player || !Array.isArray(player.purchased)) {
      return { cards: total, extra: 0, total: total };
    }

    var cards = 0;
    player.purchased.forEach(function (card) {
      var amount = Number(effectiveCardBonuses(card, options)[color]) || 0;
      if (amount > 0) cards += 1;
    });

    return {
      cards: cards,
      extra: Math.max(0, total - cards),
      total: total
    };
  }

  function strongholdSummaryFromHolders(holders, perspective) {
    var perspectiveIndex = normalizedPlayerIndex(perspective);
    var summary = {
      players: [],
      counts: {},
      count: 0,
      owner: "",
      locked: false
    };

    (Array.isArray(holders) ? holders : []).forEach(function (holder) {
      var playerIndex = normalizedPlayerIndex(holder);
      if (playerIndex === null) return;
      summary.counts[playerIndex] = (summary.counts[playerIndex] || 0) + 1;
      summary.count += 1;
    });

    summary.players = Object.keys(summary.counts).map(function (key) {
      return Number(key);
    }).sort(function (a, b) { return a - b; });
    summary.owner = summary.players.length === 1 ? String(summary.players[0]) : "";
    summary.locked = perspectiveIndex !== null && summary.players.some(function (playerIndex) {
      return playerIndex !== perspectiveIndex;
    });
    return summary;
  }

  function strongholdAccessStatusFromSummary(summary, options) {
    if (options && options.enabled === false) return { ok: true };
    if (!summary || !summary.count || !summary.locked) return { ok: true };
    return { ok: false, reasonKey: "strongholdBlocked" };
  }

  function strongholdHoldersForSlot(game, slotId) {
    var placements = game && game.strongholds && game.strongholds.placements || {};
    var holders = Array.isArray(placements[slotId]) ? placements[slotId] : [];
    var players = Array.isArray(game && game.players) ? game.players : null;
    return holders.map(normalizedPlayerIndex).filter(function (playerIndex) {
      return playerIndex !== null && (!players || !!players[playerIndex]);
    });
  }

  function strongholdAccessStatusForSlot(game, slotId, playerIndex, options) {
    if (!game || !slotId || options && options.enabled === false) return { ok: true };
    var summary = strongholdSummaryFromHolders(strongholdHoldersForSlot(game, slotId), playerIndex);
    var status = strongholdAccessStatusFromSummary(summary, options);
    return Object.assign({ summary: summary }, status);
  }

  function nobleRequirementMet(noble, bonuses) {
    var req = noble && (noble.req || noble.requirements) || {};
    return Object.keys(req).every(function (color) {
      return (Number(bonuses && bonuses[color]) || 0) >= (Number(req[color]) || 0);
    });
  }

  function firstEligibleNobleIndex(nobles, bonuses) {
    if (!Array.isArray(nobles)) return -1;
    for (var index = 0; index < nobles.length; index += 1) {
      if (nobleRequirementMet(nobles[index], bonuses)) return index;
    }
    return -1;
  }

  function firstEligibleNoble(nobles, bonuses) {
    var index = firstEligibleNobleIndex(nobles, bonuses);
    return index >= 0 ? { index: index, noble: nobles[index] } : null;
  }

  function replayUrlFromQuery(search, origin) {
    if (!origin) return "";
    var params = search instanceof URLSearchParams ? search : new URLSearchParams(search || "");
    var value = params.get("replayUrl") || params.get("replay");
    if (!value) return "";

    try {
      var base = new URL(origin);
      var url = new URL(value, base.origin);
      if (url.origin !== base.origin) return "";
      if (!url.pathname.startsWith("/api/bga/replay/")) return "";
      return url.pathname + url.search;
    } catch (error) {
      return "";
    }
  }

  root.GemTableRules = {
    DEFAULT_COLORS: DEFAULT_COLORS,
    bonusDisplaySummary: bonusDisplaySummary,
    cardIsOrient: cardIsOrient,
    effectiveCardBonuses: effectiveCardBonuses,
    firstEligibleNoble: firstEligibleNoble,
    firstEligibleNobleIndex: firstEligibleNobleIndex,
    nobleRequirementMet: nobleRequirementMet,
    replayUrlFromQuery: replayUrlFromQuery,
    strongholdAccessStatusForSlot: strongholdAccessStatusForSlot,
    strongholdAccessStatusFromSummary: strongholdAccessStatusFromSummary,
    strongholdHoldersForSlot: strongholdHoldersForSlot,
    strongholdSummaryFromHolders: strongholdSummaryFromHolders
  };
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this);
