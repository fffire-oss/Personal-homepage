const assert = require("node:assert/strict");
const test = require("node:test");

require("../gemtable/modules/rules.js");

const {
  bonusDisplaySummary,
  effectiveCardBonuses,
  replayUrlFromQuery,
  strongholdAccessStatusForSlot,
  strongholdSummaryFromHolders
} = globalThis.GemTableRules;

test("Orient 2x bonus displays as one card plus one extra bonus", function () {
  var card = {
    id: "orient-211",
    module: "orient",
    color: "red",
    printed_color: "red",
    orient_effective: {
      bonus: { red: 2 }
    },
    abilities: [
      {
        effect: "double_bonus",
        bonus_color: "red",
        bonus_count: 2
      }
    ]
  };
  var player = { purchased: [card] };
  var counts = { white: 0, blue: 0, green: 0, red: 2, black: 0 };

  assert.equal(effectiveCardBonuses(card).red, 2);
  assert.deepEqual(bonusDisplaySummary(counts, player, "red"), {
    cards: 1,
    extra: 1,
    total: 2
  });
});

test("Orient 2x bonus falls back from ability metadata without double-counting the card", function () {
  var card = {
    id: "orient-212",
    module: "orient",
    color: "black",
    printed_color: "black",
    abilities: [
      {
        effect: "double_bonus",
        bonus_color: "black",
        bonus_count: 2
      }
    ]
  };
  var player = { purchased: [card] };

  assert.equal(effectiveCardBonuses(card).black, 2);
  assert.deepEqual(bonusDisplaySummary({ black: 2 }, player, "black"), {
    cards: 1,
    extra: 1,
    total: 2
  });
});

test("Stronghold summary and access lock buy/reserve for other players", function () {
  var game = {
    players: [{ id: "p1" }, { id: "p2" }],
    strongholds: {
      placements: {
        "base-t1-s1": [0]
      }
    }
  };

  var ownerSummary = strongholdSummaryFromHolders([0], 0);
  assert.equal(ownerSummary.locked, false);
  assert.equal(strongholdAccessStatusForSlot(game, "base-t1-s1", 0, { enabled: true }).ok, true);

  var opponentAccess = strongholdAccessStatusForSlot(game, "base-t1-s1", 1, { enabled: true });
  assert.equal(opponentAccess.ok, false);
  assert.equal(opponentAccess.reasonKey, "strongholdBlocked");
  assert.equal(opponentAccess.summary.locked, true);

  var buyAllowed = opponentAccess.ok;
  var reserveAllowed = opponentAccess.ok;
  assert.equal(buyAllowed, false);
  assert.equal(reserveAllowed, false);
});

test("Stronghold summary is stable for three same-player tokens", function () {
  var ownerSummary = strongholdSummaryFromHolders([1, 1, 1], 1);

  assert.equal(ownerSummary.count, 3);
  assert.deepEqual(ownerSummary.players, [1]);
  assert.equal(ownerSummary.counts[1], 3);
  assert.equal(ownerSummary.owner, "1");
  assert.equal(ownerSummary.locked, false);

  var opponentSummary = strongholdSummaryFromHolders([1, 1, 1], 0);
  assert.equal(opponentSummary.count, 3);
  assert.equal(opponentSummary.owner, "1");
  assert.equal(opponentSummary.locked, true);
});

test("Replay query URLs are limited to same-origin /api/bga/replay/", function () {
  var origin = "https://www.qzq.at";

  assert.equal(
    replayUrlFromQuery("?replayUrl=/api/bga/replay/job-42?download=1", origin),
    "/api/bga/replay/job-42?download=1"
  );
  assert.equal(
    replayUrlFromQuery("?replay=" + encodeURIComponent("https://www.qzq.at/api/bga/replay/job-7?step=2"), origin),
    "/api/bga/replay/job-7?step=2"
  );

  [
    "https://evil.example/api/bga/replay/job-42",
    "//evil.example/api/bga/replay/job-42",
    "/api/bga/replayevil/job-42",
    "/api/bga/replay",
    "/api/other/replay/job-42"
  ].forEach(function (value) {
    assert.equal(replayUrlFromQuery("?replayUrl=" + encodeURIComponent(value), origin), "");
  });
});
