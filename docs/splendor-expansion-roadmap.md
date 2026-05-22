# Gem Table Splendor Expansion Roadmap

This document defines the implementation plan for adding Splendor expansion
compatibility to ZephyrLabs Gem Table without committing directly to `main`.

Target modules:

- Silk Road: Cities + Trading Posts.
- The Sun Never Sets: Orient + Strongholds.

Official rules references:

- Silk Road rules:
  https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/10/SCSPL03EN_SILKROAD_RULES_20241002_WEB.pdf
- The Sun Never Sets rules:
  https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/10/SCSPL04EN_SPLENDOR_SNS_RULES_20241126.pdf

## Operating Rules

- Never commit directly to `main`.
- Every implementation slice uses a focused branch and a draft PR.
- Each slice must have one clear issue with acceptance criteria.
- Final merge is manual only.
- BoardReplayLab schema/converter changes are tracked in the public
  `Haro-stack/BoardReplayLab` repository and must not be merged directly to
  `main`.
- Production deployment is not part of a slice unless the branch has been
  reviewed and explicitly approved.

## Current State

Gem Table currently supports base Splendor-style hot-seat play and replay:

- Game logic, BGA import, replay stepping, random AI, and rendering are in
  `splendor-table.js`.
- Layout and responsive behavior are in `splendor-table.css`.
- The live schema is `zephyrlabs-gemtable-bga-v1`.
- BGA active expansion captures are currently rejected.
- Replay animation exists for basic token/card/noble actions.
- DinoBoard conversion lives in BoardReplayLab and currently targets base 2P
  Splendor only.

The first risk is architectural drift: frontend BGA conversion and
BoardReplayLab conversion are duplicated. Before active expansion support, both
repos need explicit schema contracts and fixture-based tests.

## Expansion Impact Summary

### Cities

Cities replace nobles. A player who meets a city requirement can take a city at
turn end. The end condition changes from first to 15 prestige to city
completion. Winners must satisfy at least one city.

Primary impact:

- Replace or hide noble UI for city games.
- Add city tile state, city claim move, and city end-game scoring.
- Update replay logs, animations, and BGA conversion.

### Trading Posts

Trading Posts add player-owned permanent powers. They affect token taking,
payment, reserve-from-deck, and scoring.

Primary impact:

- Add player trading post ownership state.
- Add post-action unlock checks and UI.
- Add pending choice for reserve-from-deck choose-two-keep-one behavior.
- Update token/payment logic and animations for extra token gains.

### Orient

Orient adds separate face-up cards and decks for each tier plus special card
abilities.

Primary impact:

- Replace fixed `3 x 4` market assumptions with slot-aware market areas.
- Add card set metadata and ability metadata.
- Support separate page/tab display for base cards and Orient cards.
- Add ability-specific actions, pending choices, logs, and animations.

### Strongholds

Strongholds add player markers on visible cards. They restrict purchase/reserve
access and can enable an additional purchase when a player has three
strongholds on one card.

Primary impact:

- Add stronghold placement, move, and removal state.
- Add post-buy mandatory placement flow.
- Add card-level marker UI and action animations.
- Add legal action constraints for occupied cards.

## UI and UX Requirements

- Desktop and mobile must be reviewed for every slice.
- Supported locales remain `en`, `zh-Hans`, `zh-Hant`, `ja`, `fr`, `de`, `es`.
- Token visuals must match existing ZephyrLabs token language.
- Token and bonus rows must stay aligned in player panels and private hand.
- New module panels must not overlap the sticky top status or private hand dock.
- Orient can use page/tab switching between base cards and Orient cards instead
  of forcing every card into one crowded market.
- Every visible action needs a log entry and an animation:
  - token take and return
  - card buy and reserve
  - city claim
  - trading post claim and power trigger
  - Orient card ability
  - stronghold place, move, remove, and conquest buy
- Mobile tap previews must not render behind rules, logs, or the hand dock.

## Small Focused Slices

### Slice 1: Expansion Schema Baseline

Goal: add a versioned ruleset/module metadata skeleton without changing base
game behavior.

Scope:

- Add `ruleset` and `modules` fields to exported state.
- Preserve old v1 replay import.
- Keep active expansion BGA captures rejected with clearer messages.
- Add internal helpers for `base`, `cities`, `trading_posts`, `orient`, and
  `strongholds` module flags.

Acceptance criteria:

- Base game starts and exports exactly as before, except optional metadata.
- Old replay files still import.
- New metadata round-trips through export/import and replay jump.
- No visual layout change in base mode.

### Slice 2: Converter Parity and Fixture Baseline

Goal: stop frontend and BoardReplayLab conversion drift.

Scope:

- Align BGA conversion behavior with BoardReplayLab fixtures.
- Add a test checklist for base buy/reserve/take/return/noble/end moves.
- Ensure `claimNoble` inside a buy move is handled consistently.

Acceptance criteria:

- Same BGA base capture produces equivalent Gem Table replay in frontend and
  BoardReplayLab.
- Buy-with-noble, return-token, reserve-from-deck, and replay export remain
  stable.

### Slice 3: Cities State and UI

Goal: support city tiles as state and read-only replay UI.

Scope:

- Add city tile model.
- Add city panel that replaces nobles when `cities` is active.
- Render city requirements with square requirement tiles, not token circles.
- Preserve desktop and mobile layout.

Acceptance criteria:

- City games show cities instead of nobles.
- City state exports/imports/replays.
- Mobile 2/3/4 city layouts are scrollable without horizontal overflow.

### Slice 4: Cities Rules and Endgame

Goal: make Cities playable.

Scope:

- Implement city eligibility after an action.
- Implement city claim flow.
- Implement city-triggered final round and winner logic.
- Add city claim animation and log rendering.

Acceptance criteria:

- A player can claim a city at the correct timing.
- Game end follows city rules.
- Replay step shows city claim animation.
- All locales have non-overflowing city labels.

### Slice 5: Trading Posts State and UI

Goal: render and persist Trading Posts.

Scope:

- Add trading post board state and player ownership.
- Add compact desktop/mobile trading post panel.
- Add replay/log rendering for post claims.

Acceptance criteria:

- Trading post state round-trips through export/import/replay.
- Player panels show ownership without token/bonus misalignment.
- Mobile layout does not overlap private hand dock.

### Slice 6: Trading Posts Effects

Goal: implement each Trading Post power as isolated commits.

Scope:

- Extra non-gold token after buying.
- Extra token after taking two matching tokens.
- Gold token payment multiplier.
- Trading-post-based prestige.
- Reserve-from-deck choose-two-keep-one flow.

Acceptance criteria:

- Each power has a targeted fixture and replay animation.
- Payment choice UI remains readable on desktop and mobile.
- Random AI only uses implemented legal actions.

### Slice 7: Silk Road Integration

Goal: combine Cities and Trading Posts under the Silk Road ruleset.

Scope:

- Enable `module_set: "silk_road"`.
- Ensure Trading Posts are checked before Cities where rules require it.
- Add BGA import compatibility once BoardReplayLab provides fixtures.

Acceptance criteria:

- Cities-only, Trading-Posts-only, and Silk Road combined paths are covered.
- BGA captures with active Silk Road flags import only when supported.

### Slice 8: Orient Market and Card Model

Goal: add Orient cards without implementing every effect at once.

Scope:

- Introduce slot-aware market areas: `base` and `orient`.
- Add Orient decks and visible cards.
- Use page/tab switching between base and Orient cards.
- Add generic effect badges and disabled unsupported effects.

Acceptance criteria:

- Base layout remains unchanged when Orient is disabled.
- Orient enabled layout fits desktop and mobile.
- Replay/export preserves Orient slots.

### Slice 9: Orient Abilities

Goal: implement Orient abilities one at a time.

Scope:

- Virtual gold effects.
- Bonded card/color effects.
- Free card acquisition.
- Double bonus cards.
- Discard-card purchase requirements.

Acceptance criteria:

- Each ability has logs, animation, replay, and mobile interaction tests.
- Unsupported ability data is rejected clearly.

### Slice 10: Strongholds State and UI

Goal: add stronghold markers and market constraints.

Scope:

- Track marker positions by stable market slot reference.
- Render markers on cards.
- Enforce access restrictions for occupied cards.

Acceptance criteria:

- Stronghold markers align on all card sizes.
- Mobile card scrolling remains usable.
- Replay shows marker movement.

### Slice 11: Strongholds Rules

Goal: implement post-buy stronghold choices and conquest buy.

Scope:

- Mandatory place/move/remove flow after buying.
- Extra purchase when three own strongholds are on one card.
- Logs, animations, and replay support.

Acceptance criteria:

- Stronghold pending action cannot be skipped incorrectly.
- Extra buy is visually clear and replayable.
- Desktop/mobile/multilingual QA passes.

### Slice 12: Full Expansion QA

Goal: validate all supported module combinations.

Scope:

- Desktop screenshot review.
- Mobile screenshot review.
- Locale sweep for seven languages.
- Replay playback, jump, autoplay, continue-from-replay.
- BGA import/export with fixture corpus.
- BoardReplayLab converter sync.

Acceptance criteria:

- No layout overlap in desktop or mobile.
- No untranslated critical controls in supported locales.
- All supported actions have logs and animations.
- Draft PRs remain unmerged until manual review.
