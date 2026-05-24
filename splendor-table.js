(function () {
  "use strict";

  var STORAGE_KEY = "zephyrlabs-gem-table-save-v3";
  var LEGACY_STORAGE_KEYS = ["zephyrlabs-gem-table-save-v2", "zephyrlabs-gem-table-save-v1"];
  var SCHEMA = "zephyrlabs-gemtable-bga-v1";
  var RULESET_SCHEMA = "zephyrlabs-gemtable-ruleset-v1";
  var BASE_RULESET_ID = "splendor-base";
  var ORIENT_RULESET_ID = "splendor-base-orient";
  var STRONGHOLDS_RULESET_ID = "splendor-base-strongholds";
  var ORIENT_STRONGHOLDS_RULESET_ID = "splendor-base-orient-strongholds";
  var EXPANSION_MODULES = ["cities", "trading_posts", "orient", "strongholds"];
  var ENGINE_SUPPORTED_MODULES = ["orient", "strongholds"];
  var BASE_MARKET_ID = "base";
  var ORIENT_MARKET_ID = "orient";
  var BASE_MARKET_SLOT_COUNT = 4;
  var ORIENT_MARKET_SLOT_COUNT = 2;
  var ORIENT_CATALOG_SCHEMA = "zephyrlabs-gemtable-orient-bga-carddb-v1";
  var MOVE_EVENT_SCHEMA = "zephyrlabs-gemtable-move-events-v1";
  var COLORS = ["white", "blue", "green", "red", "black"];
  var ALL_TOKENS = COLORS.concat(["gold"]);
  var AI_LEVELS = ["easy", "balanced", "expert"];
  var TURN_SWITCH_READY_MS = 3000;
  var HAND_DOCK_RETRACT_MS = 260;
  var HAND_DOCK_REENTER_MS = 360;
  var AI_MIN_THINK_MS = 2000;
  var REPLAY_STEP_DELAY_MS = 1800;
  var REPLAY_AUTO_DELAY_MS = 420;
  var LEGACY_TABLE_SEED_FALLBACK = 20260524;
  var marketOrientWrapSyncScheduled = false;
  var GEM_HEX = {
    white: "#f1eadb",
    blue: "#55a7ff",
    green: "#37e89b",
    red: "#ff6b5d",
    black: "#778494",
    gold: "#ffbf45",
    wild: "#b9f7ff"
  };
  var TOKEN_LABEL = {
    white: "W",
    blue: "U",
    green: "G",
    red: "R",
    black: "B",
    gold: "Au",
    wild: "\u25c7"
  };
  var BGA_COST_COLOR = {
    C: "white",
    S: "blue",
    E: "green",
    R: "red",
    O: "black"
  };
  var TIER_SIZES = { 1: 40, 2: 30, 3: 20 };
  var LANGUAGE_KEY = "zephyrlabs-gem-table-language-v1";
  var currentLocale = "en";
  var I18N = {
    en: {
      languageLabel: "Language",
      tableEyebrow: "Unofficial local table",
      save: "Save",
      reset: "Reset",
      restartGame: "Restart",
      setupEyebrow: "Hot-seat setup",
      startTitle: "Start a local game",
      startDescription: "Generic, rules-compatible cards and tiles are used. No official artwork, logos, card scans, or Board Game Arena assets are included.",
      startModeNew: "New game",
      startModeReplay: "Import replay",
      replayJsonLabel: "Replay JSON",
      replayFileLabel: "Replay JSON file",
      startReplayPlaceholder: "Paste a complete replay JSON payload here.",
      startReplayBody: "Load a complete replay chain, step through it, then continue from any visible record if needed.",
      players: "Players",
      players2: "2 players",
      players3: "3 players",
      players4: "4 players",
      playerName: "Player {n} name",
      smartAi: "Smart AI",
      aiTakeover: "AI takeover",
      aiLevel: "Intelligence level",
      aiLevelEasy: "Casual",
      aiLevelBalanced: "Balanced",
      aiLevelExpert: "Expert",
      aiBadgeFormat: "DinoBoard AI: {level}",
      randomAiBadgeFormat: "Random AI: {level}",
      rulesetModules: "Modules",
      rulesetModulesHint: "Base game starts with every module off.",
      orientModule: "Orient",
      strongholdsModule: "Strongholds",
      startGame: "Start game",
      resumeSave: "Resume save",
      clearSave: "Clear save",
      quickStarts: "Quick starts",
      start2p: "Start 2P",
      start3p: "Start 3P",
      start4p: "Start 4P",
      currentPlayer: "Current player",
      round: "Round",
      state: "State",
      move: "Move",
      aiPlayers: "AI players",
      aiUnavailableTitle: "DinoBoard AI",
      aiUnavailableBody: "DinoBoard smart AI currently supports only 2-player base Splendor. Expansion tables use random legal AI for now.",
      returnTokens: "Return tokens",
      returnTokensBody: "The active player must return tokens until they hold 10 or fewer before nobles or the next turn resolve.",
      chooseOneNoble: "Choose one noble",
      chooseOneNobleBody: "If several nobles are eligible, the active player receives exactly one.",
      choosePayment: "Choose payment",
      choosePaymentBody: "Select the exact tokens to spend. Gold can replace any needed color.",
      bank: "Bank",
      noTakeSelected: "No take selected.",
      selectedTokens: "Selected: {tokens}. Legal take requires 3 different, every available color if fewer than 3 remain, or 2 matching from a stack with 4+.",
      confirmTake: "Confirm take",
      clear: "Clear",
      nobles: "Nobles",
      noblesHint: "Permanent bonuses only. No replenishment.",
      market: "Market",
      marketHint: "Buy, reserve, or reserve blind from a deck.",
      baseMarketTab: "Base",
      orientMarketTab: "Orient",
      orientMarketHint: "Buy, reserve, and resolve The Orient cards.",
      orientAbilityPlaceholder: "Orient ability",
      orientActionsPending: "Actions pending",
      orientAbilityPending: "Ability pending",
      orientDoubleBonus: "Double bonus",
      orientVirtualGold: "2 virtual gold",
      orientCopyBonus: "Copy bonus",
      orientFreeCard: "Free tier {tier}",
      orientDiscardCost: "Discard {count}",
      orientVirtualGoldZone: "Orient gold",
      orientChoiceTitle: "Orient ability",
      orientChoiceBody: "Resolve this card's required effect before the turn continues.",
      orientChooseCopy: "Choose a bonus card to copy",
      orientChooseFree: "Choose a free tier {tier} card",
      orientUseVirtual: "Use Orient gold",
      orientPaymentDiscard: "Discard cards",
      orientDiscardPriorityHint: "Discard cards with the wild mark before regular cards.",
      orientDiscardPriorityBadge: "First",
      orientVirtualSelected: "Orient gold card x{count}",
      paymentNeeds: "Cost",
      paymentPlayerTokens: "Your tokens",
      paymentVirtualHint: "One Orient gold card may be discarded for up to 2 wild gold in this purchase.",
      paymentVirtualOverpayHint: "The Orient gold card has unused value. If a real token is not needed, tap it again to keep it.",
      orientNoChoices: "No legal Orient choice is available.",
      orientDirectClickHint: "Click a highlighted market card to resolve this ability.",
      orientCopyDirectClickHint: "Open your bonus preview, then click a highlighted purchased card to copy it.",
      strongholdActionTitle: "Stronghold move",
      strongholdActionBody: "After buying a card, place, move, or remove one stronghold.",
      strongholdPlace: "Place",
      strongholdMove: "Move",
      strongholdRemove: "Remove",
      strongholdBlocked: "Stronghold",
      strongholdStock: "Strongholds",
      strongholdSelectTarget: "Select a market card for your stronghold.",
      strongholdSelectSource: "Select one of your strongholds, or an opponent card with exactly one stronghold.",
      strongholdConquestTitle: "Conquest available",
      strongholdConquestBody: "Click a card with 3 of your strongholds to buy it now, or continue without conquest.",
      strongholdConquest: "Conquest",
      strongholdConquestSkip: "Continue",
      strongholdNoLegalTarget: "That card is not a legal stronghold target.",
      strongholdPlaceTargets: "Place targets",
      strongholdMoveSources: "Move from",
      strongholdMoveTargets: "Move targets",
      strongholdRemoveTargets: "Remove targets",
      orientSlotLabel: "Slot {slot}",
      actionLog: "Action log",
      logSafeMode: "Masked",
      logFullMode: "Full",
      logStart: "Table started",
      logMove: "Move {move}",
      logTakeTokensTitle: "Take tokens",
      logReserveTitle: "Reserve card",
      logBuyTitle: "Buy card",
      logDiscardTitle: "Return token",
      logNobleTitle: "Noble",
      logGameTitle: "Game",
      logStrongholdPlaceTitle: "Place stronghold",
      logStrongholdMoveTitle: "Move stronghold",
      logStrongholdRemoveTitle: "Remove stronghold",
      logStrongholdTarget: "Target",
      logStrongholdFrom: "From",
      logStrongholdTo: "To",
      logBlindCard: "Blind tier {tier}",
      logUnknownCard: "Unknown card",
      logGoldTaken: "Gold taken",
      logPayment: "Payment",
      logRandomAi: "Random AI",
      logDinoBoardAi: "DinoBoard AI",
      logBlindReserve: "Blind reserve",
      logFaceUpReserve: "Face-up reserve",
      handoffAction: "Action",
      bonusCardsTitle: "{color} cards",
      bonusCardsEmpty: "No purchased cards in this color.",
      showHide: "Show / hide",
      ruleGuardrails: "Rule guardrails",
      ruleGuardrailsBody: "One action per turn: take exactly 3 different non-gold tokens, take exactly 2 matching non-gold tokens from a stack that had at least 4, reserve one card with gold if available, or buy one market/reserved card. The first player to 15 prestige triggers the final round so all players get equal turns. Ties use fewer purchased cards only; remaining ties are shared.",
      privateHand: "Private hand",
      reservedCards: "Reserved cards",
      bgaTools: "BGA-style tools",
      exportImportReplay: "Export, import, and replay",
      liveTable: "Live table",
      replayMove: "Replay move {current} / {total}",
      bgaDescription: "This uses a stable ZephyrLabs schema inspired by public BGA Studio concepts: a gamedatas object, notification-like move log, and next_move_id. The exact private BGA Splendor protocol is not public, so this is BGA-style compatibility, not official BGA protocol parity.",
      exportState: "Export state",
      importState: "Import state",
      exportReplay: "Export replay",
      importReplayFile: "Import JSON file",
      loadReplay: "Load replay",
      prevMove: "Prev move",
      nextMove: "Next move",
      replayAutoplay: "Autoplay",
      replayPause: "Pause",
      replayJumpLabel: "Move",
      replayJump: "Jump",
      continueFromReplay: "Continue from here",
      exitReplay: "Exit replay",
      jsonPlaceholder: "Exported JSON appears here. Paste state or replay JSON here before importing/loading.",
      fileIoHint: "Exports download as .json files. Import buttons read a selected .json file directly.",
      bgaCaptureTitle: "BGA replay capture",
      bgaCaptureBody: "Use the tool provided in BoardReplayLab to crawl and convert replay JSON.",
      bgaTableImportTitle: "Import by BGA table ID",
      bgaTableImportBody: "Enter a table ID to try direct import. If the server cannot access BGA, use the tool provided in BoardReplayLab and import its generated JSON file.",
      bgaTableIdLabel: "BGA table ID",
      bgaTableIdPlaceholder: "123456789",
      importBgaTable: "Import table ID",
      openBgaReview: "Open BGA review",
      downloadBgaCaptureScript: "Download capture script",
      openBgaCrawlerGithub: "Script download",
      downloadCapturedJson: "Download captured JSON",
      bgaCaptureStatus: "Credentials stay on BGA. This site does not ask for or store your BGA password.",
      bgaTableImportStatus: "Expansion tables and unsupported BGA captures will fail instead of loading incorrect data.",
      affordable: "Affordable",
      needTokens: "Need tokens",
      buy: "Buy",
      buyShort: "Buy",
      reserve: "Reserve",
      reserveShort: "Res.",
      choose: "Choose",
      tier: "Tier",
      deckCards: "Cards left",
      reserveDeck: "Reserve",
      noFaceUpCards: "No face-up cards remain.",
      noReservedCards: "No reserved cards",
      noActiveReserved: "No reserved cards for the active player.",
      blindReserve: "Blind reserve",
      faceUpReserve: "Face-up reserve",
      blind: "Blind",
      faceUp: "Face-up",
      aiSmartUnavailable: "DinoBoard AI",
      tokens: "Tokens",
      bonuses: "Bonuses",
      reserved: "Reserved",
      purchasedSummary: "Purchased cards: {cards}. Nobles: {nobles}.",
      prestige: "prestige",
      none: "None",
      noNoblesRemain: "No nobles remain.",
      gameReplay: "Replay",
      gameFinished: "Finished",
      gameDiscard: "Discard required",
      gameNoble: "Noble choice",
      gamePayment: "Payment choice",
      gameAiThinking: "AI thinking",
      gameTurnTransition: "Turn handoff",
      gameReplayStep: "Replay step",
      handoffContinue: "Continue",
      gameFinal: "Final round ({turns} turns left)",
      gameProgress: "In progress",
      msgSaveSerializeFailed: "Save failed: table state could not be serialized.",
      msgSaveStorageFailed: "Save failed: localStorage is unavailable or full.",
      msgSavedInvalidCleared: "Saved data was invalid and has been cleared.",
      msgSavedParseCleared: "Saved data could not be parsed and has been cleared.",
      msgResolveStepFirst: "Resolve the current required step before taking another action.",
      msgGoldReserveOnly: "Gold can only be gained when reserving a card.",
      msgTakeShape: "A take action is either exactly 3 different tokens or exactly 2 matching tokens.",
      msgBankStackLow: "That bank stack does not have enough tokens.",
      msgTwoSameWhole: "Two matching tokens must be the whole action.",
      msgTwoSameOnly: "You can take only two matching tokens.",
      msgTwoSameNeedFour: "Two matching tokens require at least 4 in that bank stack before taking.",
      msgThreeDifferent: "Three-token takes must use different colors.",
      msgSelectLegalTake: "Select 3 different non-gold tokens, every available color if fewer than 3 remain, or exactly 2 matching tokens from a stack with 4+.",
      msgReserveLimit: "A player can reserve at most 3 cards.",
      msgMarketGone: "That market card is no longer available.",
      msgDeckEmpty: "That deck is empty.",
      msgNotEnoughForCard: "Not enough tokens or gold for that card.",
      msgOrientAbilityPending: "Resolve the pending Orient ability first.",
      msgOrientCopyNeedsBonus: "Copy a bonus first.",
      msgOrientDiscardNeedsCards: "Discard {count} {color} cards first.",
      msgOrientChooseCopy: "Choose a card for {card} to copy.",
      msgOrientChooseFree: "Choose a free tier {tier} card.",
      msgChoosePayment: "Choose the payment for {card}.",
      msgPaymentInvalid: "This payment does not exactly cover the card cost.",
      msgPaymentCleared: "Payment selection cleared.",
      msgPaymentCancelled: "Payment cancelled.",
      confirmPurchase: "Confirm purchase",
      cancelPayment: "Cancel",
      clearPayment: "Clear payment",
      noPaymentNeeded: "No payment required.",
      paymentNeed: "Need {count}",
      paymentRemaining: "{count} left",
      paymentSelected: "Selected: {selected}",
      paymentUseColor: "Use {token}",
      paymentUseGold: "Use gold",
      msgMustDiscard: "{player} has {count} tokens and must return down to 10.",
      msgStillMustDiscard: "{player} still has {count} tokens. Return down to 10.",
      msgMultipleNobles: "{player} is eligible for multiple nobles. Choose one.",
      msgNobleNotEligible: "That noble is not eligible.",
      msgNoActiveTableExport: "No active table to export.",
      msgExportPreparing: "Preparing export file...",
      msgExportFailed: "Export failed: {message}",
      msgStateExported: "Current state exported.",
      msgReplayExported: "Replay exported.",
      msgFileReadFailed: "File read failed: {message}",
      msgImportFailedSchema: "Import failed: expected a Gem Table state or gamedatas.source_state using {schema}.",
      msgStateImported: "State imported.",
      msgLoadReplayExpected: "Load replay failed: expected { schema, gamedatas, moves }.",
      msgLoadReplaySource: "Load replay failed: gamedatas.source_state is required for this static viewer.",
      msgReplayLoaded: "Replay loaded. Use Next move and Prev move to inspect snapshots.",
      msgContinueFromReplay: "Replay snapshot converted to a live table. Reload the saved JSON to replay from the beginning.",
      msgBgaTableIdRequired: "Enter a numeric BGA table ID first.",
      msgBgaReviewOpened: "BGA review opened. Log in on BGA if prompted, then use BoardReplayLab if you need an external JSON capture.",
      msgBgaTableFetching: "Trying to import BGA table {table}.",
      msgBgaDirectImportFailed: "Direct BGA table import failed. Use the tool provided in BoardReplayLab, then import the generated JSON file.",
      msgBgaServerUnavailable: "Replay server is not available. Use the tool provided in BoardReplayLab and import the generated JSON file.",
      msgBgaServerQueued: "Server is crawling BGA table {table}. Keep this page open.",
      msgBgaServerDone: "Server captured the replay JSON. Download is ready.",
      msgBgaServerFailed: "Server crawl failed: {message}",
      msgBgaCaptureUnsupported: "Replay JSON is ready to download, but this BGA capture could not be adapted into the current Gem Table replay schema.",
      msgBgaExpansionUnsupported: "Replay JSON is ready to download, but an active expansion flag was detected, so it cannot be imported into the base-game table.",
      msgRulesetUnsupported: "This replay uses unsupported Splendor modules: {modules}. Current Gem Table supports base game plus The Orient and Strongholds.",
      msgInitialReplayPosition: "Initial replay position.",
      msgReplayAtMove: "Replay at move {move}: {type}.",
      msgReplayJumped: "Jumped to move {move}.",
      msgReplayJumpInvalid: "Enter a move number between 0 and {total}.",
      msgReplayAutoplayStarted: "Autoplay started.",
      msgReplayAutoplayStopped: "Autoplay paused.",
      msgReturnedLiveTable: "Returned to live table.",
      msgJsonParseFailed: "JSON parse failed: {message}",
      msgChoosePlayerCount: "Choose 2, 3, or 4 players.",
      msgGameStarted: "Game started.",
      msgSwitchingPlayer: "Turn ends. Next player in {seconds}s.",
      msgSwitchingReady: "Handoff ready. Continue when the table is clear.",
      msgAiThinking: "{player} is thinking.",
      msgReplayStepAnimating: "Replaying move {move} ({seconds}s).",
      msgRandomAiEnabled: "DinoBoard smart AI supports 2-player tables; unsupported AI seats use random legal AI.",
      msgDinoBoardAiEnabled: "DinoBoard AI connected for {player}.",
      msgDinoBoardUnavailable: "DinoBoard AI unavailable: {message}",
      msgCannotDisableActiveAi: "AI takeover cannot be disabled during that AI player's turn.",
      msgNoValidSavedTable: "No valid saved table found.",
      msgSavedResumed: "Saved table resumed.",
      msgSavedCleared: "Saved data cleared.",
      msgNoLiveTableSave: "No live table to save.",
      msgGameSaved: "Game saved.",
      logTook: "{player} took {tokens}.",
      logReserved: "{player} reserved {card}.",
      logReservedGold: "{player} reserved {card} and took gold.",
      logBlindTierCard: "a blind tier {tier} card",
      logBought: "{player} bought {card} for {points} prestige.",
      logReturned: "{player} returned {token}.",
      logReceivedNoble: "{player} received {noble} for {points} prestige.",
      logFinalRoundBegins: "{player} reached 15 prestige. Final round begins.",
      logSharedWin: "Shared win: {players}.",
      logWinner: "Winner: {player}."
    }
  };

  /*
  I18N["zh-Hans"] = Object.assign({}, I18N.en, {
    languageLabel: "语言",
    tableEyebrow: "非官方本地桌",
    save: "保存",
    reset: "重置",
    setupEyebrow: "热座设置",
    startTitle: "开始本地游戏",
    startDescription: "使用通用且兼容规则的卡牌和板块。不包含官方美术、Logo、卡牌扫描图或 Board Game Arena 资源。",
    players: "玩家",
    players2: "2 人",
    players3: "3 人",
    players4: "4 人",
    playerName: "玩家 {n} 名称",
    smartAi: "智能 AI",
    startGame: "开始游戏",
    resumeSave: "恢复存档",
    clearSave: "清除存档",
    quickStarts: "快速开始",
    start2p: "开始 2 人",
    start3p: "开始 3 人",
    start4p: "开始 4 人",
    currentPlayer: "当前玩家",
    round: "回合",
    state: "状态",
    move: "步数",
    aiPlayers: "AI 玩家",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard \u667a\u80fd AI \u76ee\u524d\u53ea\u652f\u6301 2 \u4eba\u57fa\u7840\u7248\u7480\u74a8\u5b9d\u77f3\uff1b\u6269\u5c55\u5c40\u6682\u65f6\u4f7f\u7528\u968f\u673a\u5408\u6cd5 AI\u3002",
    returnTokens: "归还宝石",
    returnTokensBody: "当前玩家必须归还宝石，直到持有数量不超过 10 个，之后才会结算贵族或进入下一回合。",
    chooseOneNoble: "选择一位贵族",
    chooseOneNobleBody: "如果同时满足多位贵族条件，当前玩家只能获得其中一位。",
    choosePayment: "选择支付",
    choosePaymentBody: "选择这次购买实际花费的宝石。黄金可以代替任意一种所需颜色。",
    bank: "银行",
    noTakeSelected: "尚未选择拿取。",
    selectedTokens: "已选择：{tokens}。合法拿取为 3 个不同颜色，或从数量不少于 4 的同色堆拿 2 个。",
    confirmTake: "确认拿取",
    clear: "清除",
    nobles: "贵族",
    noblesHint: "只计算永久加成。贵族不会补充。",
    market: "市场",
    marketHint: "购买、预约，或从牌堆暗抽预约。",
    actionLog: "行动日志",
    showHide: "显示 / 隐藏",
    ruleGuardrails: "规则限制",
    ruleGuardrailsBody: "每回合一个行动：拿 3 个不同非黄金宝石；从至少有 4 个的同色堆拿 2 个；预约一张牌并在可用时拿黄金；或购买一张市场/保留牌。首位达到 15 分的玩家触发最终轮，保证每位玩家回合数相同。平局先比较购买牌更少者，仍相同则共享胜利。",
    privateHand: "私人手牌",
    reservedCards: "保留牌",
    bgaTools: "BGA 风格工具",
    exportImportReplay: "导出、导入与回放",
    liveTable: "实时牌桌",
    replayMove: "回放步数 {current} / {total}",
    bgaDescription: "这里使用稳定的 ZephyrLabs schema，参考公开 BGA Studio 概念：gamedatas 对象、类似通知的行动记录和 next_move_id。BGA 的私有璀璨宝石协议并未公开，因此这是 BGA-style 兼容，不是官方协议级复刻。",
    exportState: "导出状态",
    importState: "导入状态",
    exportReplay: "导出回放",
    loadReplay: "载入回放",
    prevMove: "上一步",
    nextMove: "下一步",
    exitReplay: "退出回放",
    jsonPlaceholder: "导出的 JSON 会显示在这里。导入或载入回放前，也可以把状态/回放 JSON 粘贴到这里。",
    affordable: "可购买",
    needTokens: "宝石不足",
    buy: "购买",
    reserve: "预约",
    choose: "选择",
    tier: "等级",
    deckCards: "牌堆剩余",
    reserveDeck: "预约",
    noFaceUpCards: "没有剩余明牌。",
    noReservedCards: "无保留牌",
    noActiveReserved: "当前玩家没有保留牌。",
    blindReserve: "暗牌预约",
    faceUpReserve: "明牌预约",
    blind: "暗牌",
    faceUp: "明牌",
    aiSmartUnavailable: "DinoBoard AI",
    tokens: "宝石",
    bonuses: "加成",
    reserved: "保留",
    purchasedSummary: "购买牌：{cards}。贵族：{nobles}。",
    none: "无",
    noNoblesRemain: "没有剩余贵族。",
    gameReplay: "回放",
    gameFinished: "已结束",
    gameDiscard: "需要弃宝石",
    gameNoble: "选择贵族",
    gameFinal: "最终轮（剩余 {turns} 回合）",
    gameProgress: "进行中"
  });

  I18N["zh-Hant"] = Object.assign({}, I18N["zh-Hans"], {
    languageLabel: "語言",
    setupEyebrow: "熱座設定",
    startTitle: "開始本地遊戲",
    startDescription: "使用通用且相容規則的卡牌和板塊。不包含官方美術、Logo、卡牌掃描圖或 Board Game Arena 資源。",
    players2: "2 人",
    players3: "3 人",
    players4: "4 人",
    playerName: "玩家 {n} 名稱",
    smartAi: "智慧 AI",
    resumeSave: "恢復存檔",
    clearSave: "清除存檔",
    currentPlayer: "當前玩家",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard \u667a\u6167 AI \u76ee\u524d\u53ea\u652f\u63f4 2 \u4eba\u57fa\u790e\u7248\u7480\u74a8\u5bf6\u77f3\uff1b\u64f4\u5145\u5c40\u66ab\u6642\u4f7f\u7528\u96a8\u6a5f\u5408\u6cd5 AI\u3002",
    noTakeSelected: "尚未選擇拿取。",
    selectedTokens: "已選擇：{tokens}。合法拿取為 3 個不同顏色，或從數量不少於 4 的同色堆拿 2 個。",
    confirmTake: "確認拿取",
    noblesHint: "只計算永久加成。貴族不會補充。",
    marketHint: "購買、預約，或從牌堆暗抽預約。",
    actionLog: "行動日誌",
    ruleGuardrails: "規則限制",
    ruleGuardrailsBody: "每回合一個行動：拿 3 個不同非黃金寶石；從至少有 4 個的同色堆拿 2 個；預約一張牌並在可用時拿黃金；或購買一張市場/保留牌。首位達到 15 分的玩家觸發最終輪，保證每位玩家回合數相同。平局先比較購買牌更少者，仍相同則共享勝利。",
    privateHand: "私人手牌",
    bgaDescription: "這裡使用穩定的 ZephyrLabs schema，參考公開 BGA Studio 概念：gamedatas 物件、類似通知的行動記錄和 next_move_id。BGA 的私有璀璨寶石協議並未公開，因此這是 BGA-style 相容，不是官方協議級復刻。",
    loadReplay: "載入回放",
    jsonPlaceholder: "匯出的 JSON 會顯示在這裡。匯入或載入回放前，也可以把狀態/回放 JSON 貼到這裡。",
    affordable: "可購買",
    needTokens: "寶石不足",
    buy: "購買",
    reserve: "預約",
    reserveDeck: "預約",
    blindReserve: "暗牌預約",
    faceUpReserve: "明牌預約",
    aiSmartUnavailable: "DinoBoard AI",
    purchasedSummary: "購買牌：{cards}。貴族：{nobles}。"
  });

  I18N.ja = Object.assign({}, I18N.en, {
    languageLabel: "言語",
    tableEyebrow: "非公式ローカルテーブル",
    save: "保存",
    reset: "リセット",
    setupEyebrow: "ホットシート設定",
    startTitle: "ローカルゲームを開始",
    startDescription: "ルール互換の汎用カードとタイルを使用しています。公式アート、ロゴ、カード画像、Board Game Arena の素材は含みません。",
    players: "プレイヤー",
    players2: "2人",
    players3: "3人",
    players4: "4人",
    playerName: "プレイヤー {n} 名",
    smartAi: "スマートAI",
    startGame: "開始",
    resumeSave: "セーブ再開",
    clearSave: "セーブ削除",
    quickStarts: "クイック開始",
    currentPlayer: "現在のプレイヤー",
    round: "ラウンド",
    state: "状態",
    move: "手番",
    aiPlayers: "AI プレイヤー",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard smart AI currently supports only 2-player base Splendor. Expansion tables use random legal AI for now.",
    returnTokens: "トークンを返す",
    returnTokensBody: "現在のプレイヤーは所持トークンが10個以下になるまで返してから、貴族または次の手番を解決します。",
    chooseOneNoble: "貴族を1人選ぶ",
    chooseOneNobleBody: "複数の貴族条件を満たす場合、現在のプレイヤーは1人だけ獲得します。",
    bank: "銀行",
    noTakeSelected: "取得は未選択です。",
    selectedTokens: "選択済み: {tokens}。合法な取得は異なる3色、または4個以上ある同色から2個です。",
    confirmTake: "取得確定",
    clear: "クリア",
    nobles: "貴族",
    noblesHint: "永久ボーナスのみを参照します。補充はありません。",
    market: "市場",
    marketHint: "購入、予約、または山札から伏せ予約できます。",
    actionLog: "アクションログ",
    showHide: "表示 / 非表示",
    ruleGuardrails: "ルール制限",
    ruleGuardrailsBody: "1手番につき1アクションです。異なる非ゴールド3個を取る、4個以上ある同色から2個を取る、カードを予約して可能ならゴールドを取る、または市場/予約カードを1枚購入します。誰かが15点に達すると最終ラウンドが始まり、全員の手番数が揃います。同点は購入カード数が少ない方を優先し、それでも同じなら同時勝利です。",
    privateHand: "非公開ハンド",
    reservedCards: "予約カード",
    bgaTools: "BGA風ツール",
    exportImportReplay: "エクスポート、インポート、リプレイ",
    liveTable: "ライブテーブル",
    replayMove: "リプレイ {current} / {total}",
    exportState: "状態を出力",
    importState: "状態を入力",
    exportReplay: "リプレイ出力",
    loadReplay: "リプレイ読込",
    prevMove: "前の手",
    nextMove: "次の手",
    exitReplay: "リプレイ終了",
    jsonPlaceholder: "出力JSONがここに表示されます。インポート/読込前に状態またはリプレイJSONを貼り付けできます。",
    affordable: "購入可",
    needTokens: "トークン不足",
    buy: "購入",
    reserve: "予約",
    choose: "選択",
    tier: "レベル",
    deckCards: "山札残り",
    reserveDeck: "予約",
    noFaceUpCards: "公開カードは残っていません。",
    noReservedCards: "予約カードなし",
    noActiveReserved: "現在のプレイヤーに予約カードはありません。",
    blindReserve: "伏せ予約",
    faceUpReserve: "公開予約",
    blind: "伏せ",
    faceUp: "公開",
    aiSmartUnavailable: "DinoBoard AI",
    tokens: "トークン",
    bonuses: "ボーナス",
    reserved: "予約",
    purchasedSummary: "購入カード: {cards}。貴族: {nobles}。",
    none: "なし",
    noNoblesRemain: "貴族は残っていません。",
    gameReplay: "リプレイ",
    gameFinished: "終了",
    gameDiscard: "返却が必要",
    gameNoble: "貴族選択",
    gameFinal: "最終ラウンド（残り {turns} 手番）",
    gameProgress: "進行中"
  });

  I18N.fr = Object.assign({}, I18N.en, {
    languageLabel: "Langue",
    tableEyebrow: "Table locale non officielle",
    save: "Sauver",
    reset: "Réinitialiser",
    setupEyebrow: "Configuration hot-seat",
    startTitle: "Démarrer une partie locale",
    startDescription: "Cartes et tuiles génériques compatibles avec les règles. Aucun visuel officiel, logo, scan de carte ou asset Board Game Arena n'est inclus.",
    players: "Joueurs",
    players2: "2 joueurs",
    players3: "3 joueurs",
    players4: "4 joueurs",
    playerName: "Nom du joueur {n}",
    smartAi: "IA intelligente",
    startGame: "Démarrer",
    resumeSave: "Reprendre",
    clearSave: "Effacer",
    quickStarts: "Démarrages rapides",
    currentPlayer: "Joueur actif",
    round: "Tour",
    state: "État",
    move: "Coup",
    aiPlayers: "Joueurs IA",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard AI prend seulement en charge le jeu de base a 2 joueurs. Les extensions utilisent l'IA aleatoire pour l'instant.",
    returnTokens: "Rendre des jetons",
    chooseOneNoble: "Choisir un noble",
    bank: "Banque",
    noTakeSelected: "Aucune prise sélectionnée.",
    confirmTake: "Confirmer",
    clear: "Effacer",
    nobles: "Nobles",
    market: "Marché",
    actionLog: "Journal",
    showHide: "Afficher / masquer",
    ruleGuardrails: "Règles",
    privateHand: "Main privée",
    reservedCards: "Cartes réservées",
    bgaTools: "Outils style BGA",
    exportImportReplay: "Export, import et replay",
    liveTable: "Table active",
    replayMove: "Replay {current} / {total}",
    exportState: "Exporter l'état",
    importState: "Importer l'état",
    exportReplay: "Exporter replay",
    loadReplay: "Charger replay",
    prevMove: "Coup précédent",
    nextMove: "Coup suivant",
    exitReplay: "Quitter replay",
    affordable: "Achetable",
    needTokens: "Jetons requis",
    buy: "Acheter",
    reserve: "Réserver",
    choose: "Choisir",
    tier: "Niveau",
    deckCards: "Cartes du paquet",
    reserveDeck: "Réserver",
    noFaceUpCards: "Aucune carte visible restante.",
    noReservedCards: "Aucune carte réservée",
    noActiveReserved: "Aucune carte réservée pour le joueur actif.",
    blindReserve: "Réservation cachée",
    faceUpReserve: "Réservation visible",
    blind: "Cachée",
    faceUp: "Visible",
    aiSmartUnavailable: "DinoBoard AI",
    tokens: "Jetons",
    bonuses: "Bonus",
    reserved: "Réservées",
    purchasedSummary: "Cartes achetées : {cards}. Nobles : {nobles}.",
    none: "Aucun",
    noNoblesRemain: "Aucun noble restant.",
    gameReplay: "Replay",
    gameFinished: "Terminée",
    gameDiscard: "Défausse requise",
    gameNoble: "Choix noble",
    gameFinal: "Dernier tour ({turns} tours restants)",
    gameProgress: "En cours"
  });

  I18N.de = Object.assign({}, I18N.en, {
    languageLabel: "Sprache",
    tableEyebrow: "Inoffizieller lokaler Tisch",
    save: "Speichern",
    reset: "Zurücksetzen",
    setupEyebrow: "Hot-Seat Setup",
    startTitle: "Lokales Spiel starten",
    startDescription: "Es werden generische, regelkompatible Karten und Plättchen verwendet. Keine offiziellen Grafiken, Logos, Kartenscans oder Board Game Arena Assets.",
    players: "Spieler",
    players2: "2 Spieler",
    players3: "3 Spieler",
    players4: "4 Spieler",
    playerName: "Name Spieler {n}",
    smartAi: "Smarte KI",
    startGame: "Starten",
    resumeSave: "Fortsetzen",
    clearSave: "Spielstand löschen",
    quickStarts: "Schnellstart",
    currentPlayer: "Aktiv",
    round: "Rd.",
    state: "Phase",
    move: "Zug",
    aiPlayers: "KI-Spieler",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard AI unterstuetzt derzeit nur das 2-Spieler-Basisspiel. Erweiterungen nutzen vorerst Zufalls-KI.",
    returnTokens: "Marker zurückgeben",
    chooseOneNoble: "Einen Adligen wählen",
    bank: "Bank",
    noTakeSelected: "Keine Auswahl.",
    confirmTake: "Nehmen bestätigen",
    clear: "Löschen",
    nobles: "Adlige",
    market: "Markt",
    actionLog: "Aktionslog",
    showHide: "Ein-/ausblenden",
    ruleGuardrails: "Regeln",
    privateHand: "Private Hand",
    reservedCards: "Reservierte Karten",
    bgaTools: "BGA-Stil Werkzeuge",
    exportImportReplay: "Export, Import und Replay",
    liveTable: "Live-Tisch",
    replayMove: "Replay {current} / {total}",
    exportState: "Status exportieren",
    importState: "Status importieren",
    exportReplay: "Replay exportieren",
    loadReplay: "Replay laden",
    prevMove: "Vorheriger Zug",
    nextMove: "Nächster Zug",
    exitReplay: "Replay verlassen",
    affordable: "Kaufbar",
    needTokens: "Marker fehlen",
    buy: "Kaufen",
    reserve: "Reservieren",
    choose: "Wählen",
    tier: "Stufe",
    deckCards: "Deckkarten",
    reserveDeck: "Reservieren",
    noReservedCards: "Keine reservierten Karten",
    blindReserve: "Verdeckte Reservierung",
    faceUpReserve: "Offene Reservierung",
    blind: "Verdeckt",
    faceUp: "Offen",
    aiSmartUnavailable: "DinoBoard AI",
    tokens: "Marker",
    bonuses: "Boni",
    reserved: "Reserviert",
    purchasedSummary: "Gekaufte Karten: {cards}. Adlige: {nobles}.",
    none: "Keine",
    gameFinished: "Beendet",
    gameProgress: "Läuft"
  });

  I18N.es = Object.assign({}, I18N.en, {
    languageLabel: "Idioma",
    tableEyebrow: "Mesa local no oficial",
    save: "Guardar",
    reset: "Reiniciar",
    setupEyebrow: "Configuración hot-seat",
    startTitle: "Iniciar partida local",
    startDescription: "Se usan cartas y losetas genéricas compatibles con las reglas. No se incluyen arte oficial, logos, escaneos de cartas ni recursos de Board Game Arena.",
    players: "Jugadores",
    players2: "2 jugadores",
    players3: "3 jugadores",
    players4: "4 jugadores",
    playerName: "Nombre jugador {n}",
    smartAi: "IA inteligente",
    startGame: "Iniciar",
    resumeSave: "Continuar",
    clearSave: "Borrar guardado",
    quickStarts: "Inicio rápido",
    currentPlayer: "Jugador actual",
    round: "Ronda",
    state: "Estado",
    move: "Movimiento",
    aiPlayers: "Jugadores IA",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard AI solo admite partidas base de 2 jugadores. Las expansiones usan IA aleatoria por ahora.",
    returnTokens: "Devolver fichas",
    chooseOneNoble: "Elegir un noble",
    bank: "Banco",
    noTakeSelected: "No hay toma seleccionada.",
    confirmTake: "Confirmar toma",
    clear: "Limpiar",
    nobles: "Nobles",
    market: "Mercado",
    actionLog: "Registro",
    showHide: "Mostrar / ocultar",
    ruleGuardrails: "Reglas",
    privateHand: "Mano privada",
    reservedCards: "Cartas reservadas",
    bgaTools: "Herramientas estilo BGA",
    exportImportReplay: "Exportar, importar y repetir",
    liveTable: "Mesa activa",
    replayMove: "Repetición {current} / {total}",
    exportState: "Exportar estado",
    importState: "Importar estado",
    exportReplay: "Exportar repetición",
    loadReplay: "Cargar repetición",
    prevMove: "Movimiento anterior",
    nextMove: "Movimiento siguiente",
    exitReplay: "Salir de repetición",
    affordable: "Comprable",
    needTokens: "Faltan fichas",
    buy: "Comprar",
    reserve: "Reservar",
    choose: "Elegir",
    tier: "Nivel",
    deckCards: "Cartas del mazo",
    reserveDeck: "Reservar",
    noReservedCards: "Sin cartas reservadas",
    blindReserve: "Reserva oculta",
    faceUpReserve: "Reserva visible",
    blind: "Oculta",
    faceUp: "Visible",
    aiSmartUnavailable: "DinoBoard AI",
    tokens: "Fichas",
    bonuses: "Bonos",
    reserved: "Reservadas",
    purchasedSummary: "Cartas compradas: {cards}. Nobles: {nobles}.",
    none: "Ninguno",
    gameFinished: "Finalizada",
    gameProgress: "En curso"
  });

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
  var pendingPayment = null;
  var messageText = "";
  var startMessageText = "";
  var messageKind = "";
  var pendingFlight = null;

  var el = {};

  */

  I18N["zh-Hans"] = Object.assign({}, I18N.en, {
    languageLabel: "\u8bed\u8a00",
    tableEyebrow: "\u975e\u5b98\u65b9\u672c\u5730\u684c",
    save: "\u4fdd\u5b58",
    reset: "\u91cd\u7f6e",
    restartGame: "\u91cd\u65b0\u5f00\u59cb",
    setupEyebrow: "\u70ed\u5ea7\u8bbe\u7f6e",
    startTitle: "\u5f00\u59cb\u672c\u5730\u6e38\u620f",
    players: "\u73a9\u5bb6",
    players2: "2 \u4eba",
    players3: "3 \u4eba",
    players4: "4 \u4eba",
    playerName: "\u73a9\u5bb6 {n} \u540d\u79f0",
    smartAi: "\u667a\u80fd AI",
    startGame: "\u5f00\u59cb\u6e38\u620f",
    resumeSave: "\u6062\u590d\u5b58\u6863",
    clearSave: "\u6e05\u9664\u5b58\u6863",
    currentPlayer: "\u5f53\u524d\u73a9\u5bb6",
    round: "\u56de\u5408",
    state: "\u72b6\u6001",
    move: "\u6b65\u6570",
    aiPlayers: "AI \u73a9\u5bb6",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard \u667a\u80fd AI \u76ee\u524d\u53ea\u652f\u6301 2 \u4eba\u57fa\u7840\u7248\u7480\u74a8\u5b9d\u77f3\uff1b\u6269\u5c55\u5c40\u6682\u65f6\u4f7f\u7528\u968f\u673a\u5408\u6cd5 AI\u3002",
    bank: "\u94f6\u884c",
    confirmTake: "\u786e\u8ba4\u62ff\u53d6",
    clear: "\u6e05\u9664",
    nobles: "\u8d35\u65cf",
    market: "\u5e02\u573a",
    actionLog: "\u884c\u52a8\u65e5\u5fd7",
    showHide: "\u663e\u793a / \u9690\u85cf",
    privateHand: "\u79c1\u4eba\u624b\u724c",
    reservedCards: "\u4fdd\u7559\u724c",
    buy: "\u8d2d\u4e70",
    reserve: "\u9884\u7ea6",
    choose: "\u9009\u62e9",
    tier: "\u7b49\u7ea7",
    reserveDeck: "\u9884\u7ea6",
    blind: "\u6697\u724c",
    faceUp: "\u660e\u724c",
    tokens: "\u5b9d\u77f3",
    bonuses: "\u52a0\u6210",
    reserved: "\u4fdd\u7559",
    none: "\u65e0",
    gameReplay: "\u56de\u653e",
    gameFinished: "\u5df2\u7ed3\u675f",
    gameProgress: "\u8fdb\u884c\u4e2d"
  });

  I18N["zh-Hant"] = Object.assign({}, I18N["zh-Hans"], {
    languageLabel: "\u8a9e\u8a00",
    setupEyebrow: "\u71b1\u5ea7\u8a2d\u5b9a",
    startTitle: "\u958b\u59cb\u672c\u5730\u904a\u6232",
    smartAi: "\u667a\u6167 AI",
    currentPlayer: "\u7576\u524d\u73a9\u5bb6",
    restartGame: "\u91cd\u65b0\u958b\u59cb",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard \u667a\u6167 AI \u76ee\u524d\u53ea\u652f\u63f4 2 \u4eba\u57fa\u790e\u7248\u7480\u74a8\u5bf6\u77f3\uff1b\u64f4\u5145\u5c40\u66ab\u6642\u4f7f\u7528\u96a8\u6a5f\u5408\u6cd5 AI\u3002",
    actionLog: "\u884c\u52d5\u65e5\u8a8c",
    privateHand: "\u79c1\u4eba\u624b\u724c",
    buy: "\u8cfc\u8cb7",
    reserve: "\u9810\u7d04",
    gameProgress: "\u9032\u884c\u4e2d"
  });

  I18N.ja = Object.assign({}, I18N.en, {
    languageLabel: "\u8a00\u8a9e",
    save: "\u4fdd\u5b58",
    reset: "\u30ea\u30bb\u30c3\u30c8",
    startTitle: "\u30ed\u30fc\u30ab\u30eb\u30b2\u30fc\u30e0\u3092\u958b\u59cb",
    players: "\u30d7\u30ec\u30a4\u30e4\u30fc",
    currentPlayer: "\u73fe\u5728\u306e\u30d7\u30ec\u30a4\u30e4\u30fc",
    round: "\u30e9\u30a6\u30f3\u30c9",
    state: "\u72b6\u614b",
    move: "\u624b\u756a",
    aiUnavailableTitle: "DinoBoard AI",
    bank: "\u9280\u884c",
    nobles: "\u8cb4\u65cf",
    market: "\u5e02\u5834",
    actionLog: "\u30a2\u30af\u30b7\u30e7\u30f3\u30ed\u30b0",
    buy: "\u8cfc\u5165",
    reserve: "\u4e88\u7d04",
    choose: "\u9078\u629e"
  });

  I18N.fr = Object.assign({}, I18N.en, {
    languageLabel: "Langue",
    save: "Sauver",
    reset: "Reinitialiser",
    startTitle: "Demarrer une partie locale",
    players: "Joueurs",
    currentPlayer: "Joueur actif",
    round: "Tour",
    state: "Etat",
    move: "Coup",
    aiUnavailableTitle: "DinoBoard AI",
    bank: "Banque",
    nobles: "Nobles",
    market: "Marche",
    actionLog: "Journal",
    buy: "Acheter",
    reserve: "Reserver",
    choose: "Choisir"
  });

  I18N.de = Object.assign({}, I18N.en, {
    languageLabel: "Sprache",
    save: "Speichern",
    reset: "Zuruecksetzen",
    startTitle: "Lokales Spiel starten",
    players: "Spieler",
    currentPlayer: "Aktiv",
    round: "Rd.",
    state: "Phase",
    move: "Zug",
    aiUnavailableTitle: "DinoBoard AI",
    bank: "Bank",
    nobles: "Adlige",
    market: "Markt",
    actionLog: "Aktionslog",
    buy: "Kaufen",
    reserve: "Reservieren",
    choose: "Waehlen"
  });

  I18N.es = Object.assign({}, I18N.en, {
    languageLabel: "Idioma",
    save: "Guardar",
    reset: "Reiniciar",
    startTitle: "Iniciar partida local",
    players: "Jugadores",
    currentPlayer: "Jugador actual",
    round: "Ronda",
    state: "Estado",
    move: "Movimiento",
    aiUnavailableTitle: "DinoBoard AI",
    bank: "Banco",
    nobles: "Nobles",
    market: "Mercado",
    actionLog: "Registro",
    buy: "Comprar",
    reserve: "Reservar",
    choose: "Elegir"
  });

  Object.assign(I18N["zh-Hans"], {
    startDescription: "使用通用、规则兼容的卡牌与板块。不包含官方图片、标识、卡牌扫描或 Board Game Arena 素材。",
    quickStarts: "快速开局",
    start2p: "开始 2 人",
    start3p: "开始 3 人",
    start4p: "开始 4 人",
    aiTakeover: "AI 接管",
    aiLevel: "智能水平",
    aiLevelEasy: "休闲",
    aiLevelBalanced: "均衡",
    aiLevelExpert: "高阶",
    aiBadgeFormat: "DinoBoard AI\uff1a{level}",
    randomAiBadgeFormat: "\u968f\u673a AI\uff1a{level}",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard \u667a\u80fd AI \u76ee\u524d\u53ea\u652f\u6301 2 \u4eba\u57fa\u7840\u7248\u7480\u74a8\u5b9d\u77f3\uff1b\u6269\u5c55\u5c40\u6682\u65f6\u4f7f\u7528\u968f\u673a\u5408\u6cd5 AI\u3002",
    returnTokens: "归还宝石",
    returnTokensBody: "当前玩家必须把宝石归还到 10 枚或更少，之后才会结算贵族或进入下一回合。",
    chooseOneNoble: "选择一位贵族",
    chooseOneNobleBody: "如果同时满足多位贵族条件，当前玩家只能获得其中一位。",
    noTakeSelected: "尚未选择拿取。",
    selectedTokens: "已选择：{tokens}。合法拿取需要 3 枚不同宝石，或从剩余至少 4 枚的同色堆拿 2 枚。",
    noblesHint: "只看永久加成。贵族不会补充。",
    marketHint: "购买、预约，或从牌堆暗抽预约。",
    ruleGuardrails: "规则限制",
    ruleGuardrailsBody: "每回合只能执行一个动作：拿 3 枚不同的非黄金宝石；从拿取前至少有 4 枚的同色宝石堆拿 2 枚；预约 1 张牌并在有黄金时获得 1 枚黄金；或购买 1 张市场/保留区牌。首位达到 15 声望的玩家会触发最终轮，确保所有玩家回合数相同。平局只比较已购买牌数量，更少者胜；仍平则共享胜利。",
    bgaTools: "BGA 风格工具",
    exportImportReplay: "导出、导入与回放",
    liveTable: "实时桌面",
    replayMove: "回放第 {current} / {total} 步",
    bgaDescription: "这里使用稳定的 ZephyrLabs schema，参考公开 BGA Studio 概念：gamedatas 对象、类似通知的操作日志，以及 next_move_id。BGA 的璀璨宝石私有协议并不公开，因此这是 BGA 风格兼容，不是官方 BGA 协议等价复刻。",
    exportState: "导出状态",
    importState: "导入状态",
    exportReplay: "导出回放",
    loadReplay: "载入回放",
    prevMove: "上一步",
    nextMove: "下一步",
    exitReplay: "退出回放",
    jsonPlaceholder: "导出的 JSON 会显示在这里。导入或载入前，也可以把状态或回放 JSON 粘贴到这里。",
    affordable: "可购买",
    needTokens: "缺少宝石",
    deckCards: "牌堆剩余",
    noFaceUpCards: "没有剩余明牌。",
    noReservedCards: "没有保留牌",
    noActiveReserved: "当前玩家没有保留牌。",
    blindReserve: "暗牌预约",
    faceUpReserve: "明牌预约",
    aiSmartUnavailable: "DinoBoard AI",
    purchasedSummary: "已购牌：{cards}。贵族：{nobles}。",
    prestige: "声望",
    noNoblesRemain: "没有剩余贵族。",
    gameDiscard: "需要归还",
    gameNoble: "选择贵族",
    gamePayment: "选择支付",
    gameFinal: "最终轮（剩余 {turns} 回合）",
    msgSaveSerializeFailed: "保存失败：无法序列化当前桌面状态。",
    msgSaveStorageFailed: "保存失败：localStorage 不可用或空间已满。",
    msgSavedInvalidCleared: "存档数据无效，已清除。",
    msgSavedParseCleared: "存档数据无法解析，已清除。",
    msgResolveStepFirst: "请先处理当前必须完成的步骤，再执行其他动作。",
    msgGoldReserveOnly: "黄金只能在预约卡牌时获得。",
    msgTakeShape: "拿取动作只能是 3 枚不同宝石，或 2 枚相同宝石。",
    msgBankStackLow: "银行中该颜色宝石数量不足。",
    msgTwoSameWhole: "拿取 2 枚同色宝石时，整个动作只能拿这 2 枚。",
    msgTwoSameOnly: "最多只能拿 2 枚相同宝石。",
    msgTwoSameNeedFour: "拿取 2 枚同色宝石前，该宝石堆至少需要有 4 枚。",
    msgThreeDifferent: "拿取 3 枚宝石时必须颜色不同。",
    msgSelectLegalTake: "请选择 3 枚不同的非黄金宝石，或从剩余至少 4 枚的同色堆选择 2 枚。",
    msgReserveLimit: "每位玩家最多只能预约 3 张牌。",
    msgMarketGone: "这张市场牌已经不可用。",
    msgDeckEmpty: "该牌堆已空。",
    msgNotEnoughForCard: "购买这张牌的宝石或黄金不足。",
    msgChoosePayment: "请选择购买 {card} 的支付方式。",
    msgPaymentInvalid: "当前支付没有刚好覆盖这张牌的花费。",
    msgPaymentCleared: "已清空支付选择。",
    msgPaymentCancelled: "已取消支付。",
    confirmPurchase: "确认购买",
    cancelPayment: "取消",
    clearPayment: "清空支付",
    noPaymentNeeded: "这张牌不需要支付。",
    paymentNeed: "需要 {count}",
    paymentRemaining: "剩余 {count}",
    paymentSelected: "已选：{selected}",
    paymentUseColor: "使用 {token}",
    paymentUseGold: "使用黄金",
    msgMustDiscard: "{player} 当前有 {count} 枚宝石，必须归还到 10 枚。",
    msgStillMustDiscard: "{player} 仍有 {count} 枚宝石。请归还到 10 枚。",
    msgMultipleNobles: "{player} 同时满足多位贵族条件，请选择一位。",
    msgNobleNotEligible: "这位贵族当前不符合获得条件。",
    msgNoActiveTableExport: "没有可导出的进行中桌面。",
    msgStateExported: "当前状态已导出。",
    msgReplayExported: "回放已导出。",
    msgImportFailedSchema: "导入失败：需要 Gem Table 状态，或使用 {schema} 的 gamedatas.source_state。",
    msgStateImported: "状态已导入。",
    msgLoadReplayExpected: "载入回放失败：需要 { schema, gamedatas, moves }。",
    msgLoadReplaySource: "载入回放失败：这个静态查看器需要 gamedatas.source_state。",
    msgReplayLoaded: "回放已载入。使用下一步和上一步查看快照。",
    msgInitialReplayPosition: "回放初始位置。",
    msgReplayAtMove: "回放第 {move} 步：{type}。",
    msgReturnedLiveTable: "已返回实时桌面。",
    msgJsonParseFailed: "JSON 解析失败：{message}",
    msgChoosePlayerCount: "请选择 2、3 或 4 位玩家。",
    msgGameStarted: "游戏已开始。",
    gameAiThinking: "AI \u601d\u8003\u4e2d",
    gameTurnTransition: "\u56de\u5408\u4ea4\u63a5",
    msgSwitchingPlayer: "\u672c\u56de\u5408\u7ed3\u675f\uff0c{seconds} \u79d2\u540e\u5207\u6362\u5230\u4e0b\u4e00\u4f4d\u73a9\u5bb6\u3002",
    msgAiThinking: "{player} \u6b63\u5728\u601d\u8003\u3002",
    msgSelectLegalTake: "\u8bf7\u9009\u62e9 3 \u79cd\u4e0d\u540c\u7684\u975e\u91d1\u5e01\u5b9d\u77f3\uff1b\u5982\u679c\u94f6\u884c\u53ea\u5269\u5c11\u4e8e 3 \u79cd\u989c\u8272\uff0c\u5219\u9009\u5b8c\u6240\u6709\u53ef\u7528\u989c\u8272\uff1b\u6216\u4ece\u6570\u91cf\u81f3\u5c11 4 \u7684\u540c\u8272\u5806\u91cc\u9009 2 \u679a\u3002",
    msgRandomAiEnabled: "\u5df2\u542f\u7528 AI \u63a5\u7ba1\uff1a2 \u4eba\u5c40\u4e2d\u5148\u9009\u4e2d\u7684 AI \u4f7f\u7528 DinoBoard\uff0c\u5176\u4ed6 AI \u4f7f\u7528\u968f\u673a\u7b56\u7565\u3002",
    msgCannotDisableActiveAi: "\u8be5 AI \u73a9\u5bb6\u7684\u56de\u5408\u8fdb\u884c\u4e2d\uff0c\u6682\u65f6\u4e0d\u80fd\u5173\u95ed AI \u63a5\u7ba1\u3002",
    msgNoValidSavedTable: "没有找到有效存档。",
    msgSavedResumed: "已恢复存档桌面。",
    msgSavedCleared: "存档已清除。",
    msgNoLiveTableSave: "没有可保存的实时桌面。",
    msgGameSaved: "游戏已保存。",
    logTook: "{player} 拿取了 {tokens}。",
    logReserved: "{player} 预约了 {card}。",
    logReservedGold: "{player} 预约了 {card}，并获得 1 枚黄金。",
    logBlindTierCard: "一张 {tier} 级暗牌",
    logBought: "{player} 购买了 {card}，获得 {points} 点声望。",
    logReturned: "{player} 归还了 {token}。",
    logReceivedNoble: "{player} 获得了 {noble}，得到 {points} 点声望。",
    logFinalRoundBegins: "{player} 达到 15 声望，最终轮开始。",
    logSharedWin: "共同获胜：{players}。",
    logWinner: "胜者：{player}。"
  });

  Object.assign(I18N["zh-Hant"], {
    tableEyebrow: "非官方本地桌",
    save: "保存",
    reset: "重置",
    startDescription: "使用通用、規則相容的卡牌與板塊。不包含官方圖片、標識、卡牌掃描或 Board Game Arena 素材。",
    players: "玩家",
    players2: "2 人",
    players3: "3 人",
    players4: "4 人",
    playerName: "玩家 {n} 名稱",
    startGame: "開始遊戲",
    resumeSave: "恢復存檔",
    clearSave: "清除存檔",
    quickStarts: "快速開局",
    start2p: "開始 2 人",
    start3p: "開始 3 人",
    start4p: "開始 4 人",
    aiTakeover: "AI 接管",
    aiLevel: "智慧水平",
    aiLevelEasy: "休閒",
    aiLevelBalanced: "均衡",
    aiLevelExpert: "高階",
    aiBadgeFormat: "DinoBoard AI\uff1a{level}",
    randomAiBadgeFormat: "\u96a8\u6a5f AI\uff1a{level}",
    round: "回合",
    state: "狀態",
    move: "步數",
    aiPlayers: "AI 玩家",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard \u667a\u6167 AI \u76ee\u524d\u53ea\u652f\u63f4 2 \u4eba\u57fa\u790e\u7248\u7480\u74a8\u5bf6\u77f3\uff1b\u64f4\u5145\u5c40\u66ab\u6642\u4f7f\u7528\u96a8\u6a5f\u5408\u6cd5 AI\u3002",
    gameAiThinking: "AI \u601d\u8003\u4e2d",
    gameTurnTransition: "\u56de\u5408\u4ea4\u63a5",
    msgSwitchingPlayer: "\u672c\u56de\u5408\u7d50\u675f\uff0c{seconds} \u79d2\u5f8c\u5207\u63db\u5230\u4e0b\u4e00\u4f4d\u73a9\u5bb6\u3002",
    msgAiThinking: "{player} \u6b63\u5728\u601d\u8003\u3002",
    msgSelectLegalTake: "\u8acb\u9078\u64c7 3 \u7a2e\u4e0d\u540c\u7684\u975e\u91d1\u5e63\u5bf6\u77f3\uff1b\u5982\u679c\u9280\u884c\u53ea\u5269\u5c11\u65bc 3 \u7a2e\u984f\u8272\uff0c\u5247\u9078\u5b8c\u6240\u6709\u53ef\u7528\u984f\u8272\uff1b\u6216\u5f9e\u6578\u91cf\u81f3\u5c11 4 \u7684\u540c\u8272\u5806\u88e1\u9078 2 \u679a\u3002",
    msgRandomAiEnabled: "\u5df2\u555f\u7528 AI \u63a5\u7ba1\uff1a2 \u4eba\u5c40\u4e2d\u5148\u9078\u4e2d\u7684 AI \u4f7f\u7528 DinoBoard\uff0c\u5176\u4ed6 AI \u4f7f\u7528\u96a8\u6a5f\u7b56\u7565\u3002",
    msgCannotDisableActiveAi: "\u8a72 AI \u73a9\u5bb6\u7684\u56de\u5408\u9032\u884c\u4e2d\uff0c\u66ab\u6642\u4e0d\u80fd\u95dc\u9589 AI \u63a5\u7ba1\u3002",
    returnTokens: "歸還寶石",
    returnTokensBody: "當前玩家必須把寶石歸還到 10 枚或更少，之後才會結算貴族或進入下一回合。",
    chooseOneNoble: "選擇一位貴族",
    chooseOneNobleBody: "如果同時滿足多位貴族條件，當前玩家只能獲得其中一位。",
    bank: "銀行",
    noTakeSelected: "尚未選擇拿取。",
    selectedTokens: "已選擇：{tokens}。合法拿取需要 3 枚不同寶石，或從剩餘至少 4 枚的同色堆拿 2 枚。",
    confirmTake: "確認拿取",
    clear: "清除",
    nobles: "貴族",
    noblesHint: "只看永久加成。貴族不會補充。",
    market: "市場",
    marketHint: "購買、預約，或從牌堆暗抽預約。",
    showHide: "顯示 / 隱藏",
    ruleGuardrails: "規則限制",
    ruleGuardrailsBody: "每回合只能執行一個動作：拿 3 枚不同的非黃金寶石；從拿取前至少有 4 枚的同色寶石堆拿 2 枚；預約 1 張牌並在有黃金時獲得 1 枚黃金；或購買 1 張市場/保留區牌。首位達到 15 聲望的玩家會觸發最終輪，確保所有玩家回合數相同。平局只比較已購買牌數量，更少者勝；仍平則共享勝利。",
    reservedCards: "保留牌",
    bgaTools: "BGA 風格工具",
    exportImportReplay: "匯出、匯入與回放",
    liveTable: "即時桌面",
    replayMove: "回放第 {current} / {total} 步",
    bgaDescription: "這裡使用穩定的 ZephyrLabs schema，參考公開 BGA Studio 概念：gamedatas 物件、類似通知的操作日誌，以及 next_move_id。BGA 的璀璨寶石私有協定並不公開，因此這是 BGA 風格相容，不是官方 BGA 協定等價復刻。",
    exportState: "匯出狀態",
    importState: "匯入狀態",
    exportReplay: "匯出回放",
    loadReplay: "載入回放",
    prevMove: "上一步",
    nextMove: "下一步",
    exitReplay: "退出回放",
    jsonPlaceholder: "匯出的 JSON 會顯示在這裡。匯入或載入前，也可以把狀態或回放 JSON 貼到這裡。",
    affordable: "可購買",
    needTokens: "缺少寶石",
    choose: "選擇",
    tier: "等級",
    deckCards: "牌堆剩餘",
    reserveDeck: "預約",
    noFaceUpCards: "沒有剩餘明牌。",
    noReservedCards: "沒有保留牌",
    noActiveReserved: "當前玩家沒有保留牌。",
    blind: "暗牌",
    faceUp: "明牌",
    aiSmartUnavailable: "DinoBoard AI",
    tokens: "寶石",
    bonuses: "加成",
    reserved: "保留",
    purchasedSummary: "已購牌：{cards}。貴族：{nobles}。",
    prestige: "聲望",
    none: "無",
    noNoblesRemain: "沒有剩餘貴族。",
    gameReplay: "回放",
    gameFinished: "已結束",
    gameDiscard: "需要歸還",
    gameNoble: "選擇貴族",
    gameFinal: "最終輪（剩餘 {turns} 回合）",
    gameProgress: "進行中"
  });

  Object.assign(I18N.ja, {
    tableEyebrow: "非公式ローカル卓",
    setupEyebrow: "ホットシート設定",
    startDescription: "ルール互換の汎用カードとタイルを使います。公式画像、ロゴ、カードスキャン、Board Game Arena アセットは含みません。",
    players2: "2人",
    players3: "3人",
    players4: "4人",
    playerName: "プレイヤー {n} 名",
    smartAi: "スマートAI",
    startGame: "ゲーム開始",
    restartGame: "Restart",
    resumeSave: "保存を再開",
    clearSave: "保存を消去",
    quickStarts: "クイック開始",
    start2p: "2人で開始",
    start3p: "3人で開始",
    start4p: "4人で開始",
    aiTakeover: "AIに任せる",
    aiLevel: "AIレベル",
    aiLevelEasy: "カジュアル",
    aiLevelBalanced: "バランス",
    aiLevelExpert: "上級",
    aiBadgeFormat: "DinoBoard AI: {level}",
    aiPlayers: "AIプレイヤー",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard smart AI currently supports only 2-player base Splendor. Expansion tables use random legal AI for now.",
    returnTokens: "トークンを返す",
    returnTokensBody: "現在のプレイヤーは、貴族判定または次の手番に進む前にトークンを10個以下まで返します。",
    chooseOneNoble: "貴族を1人選ぶ",
    chooseOneNobleBody: "複数の貴族条件を同時に満たした場合、現在のプレイヤーは1人だけ受け取ります。",
    noTakeSelected: "取得は未選択です。",
    selectedTokens: "選択中：{tokens}。合法な取得は3色各1個、または4個以上ある同色から2個です。",
    noblesHint: "永続ボーナスのみ参照。貴族は補充されません。",
    marketHint: "購入、予約、または山札から伏せ予約。",
    showHide: "表示 / 非表示",
    ruleGuardrails: "ルール制限",
    ruleGuardrailsBody: "1手番に実行できる行動は1つだけです。異なる非金トークン3個を取る、4個以上ある同色から2個取る、カードを1枚予約して可能なら金を1個得る、または市場/予約カードを1枚購入します。最初に15威信へ到達したプレイヤーが最終ラウンドを開始し、全員の手番数をそろえます。同点は購入済みカードが少ない方を優先し、それでも同点なら勝利を共有します。",
    privateHand: "手元",
    reservedCards: "予約カード",
    bgaTools: "BGA風ツール",
    exportImportReplay: "エクスポート、インポート、リプレイ",
    liveTable: "ライブ卓",
    replayMove: "リプレイ {current} / {total}",
    bgaDescription: "公開されている BGA Studio の概念を参考にした安定した ZephyrLabs schema を使います。gamedatas オブジェクト、通知風の操作ログ、next_move_id を含みます。BGA の璀璨宝石の非公開プロトコルは公開されていないため、これはBGA風互換であり、公式BGAプロトコルの完全互換ではありません。",
    exportState: "状態を書き出す",
    importState: "状態を読み込む",
    exportReplay: "リプレイを書き出す",
    loadReplay: "リプレイを読み込む",
    prevMove: "前の手",
    nextMove: "次の手",
    exitReplay: "リプレイ終了",
    jsonPlaceholder: "書き出した JSON がここに表示されます。読み込み前に状態またはリプレイ JSON を貼り付けることもできます。",
    affordable: "購入可能",
    needTokens: "不足トークン",
    tier: "レベル",
    deckCards: "山札残り",
    reserveDeck: "予約",
    noFaceUpCards: "公開カードは残っていません。",
    noReservedCards: "予約カードなし",
    noActiveReserved: "現在のプレイヤーに予約カードはありません。",
    blindReserve: "伏せ予約",
    faceUpReserve: "公開予約",
    aiSmartUnavailable: "スマートAIは一時的に利用できません",
    reserved: "予約",
    purchasedSummary: "購入カード：{cards}。貴族：{nobles}。",
    prestige: "威信",
    noNoblesRemain: "貴族は残っていません。",
    gameDiscard: "返却待ち",
    gameNoble: "貴族選択",
    gameFinal: "最終ラウンド（残り {turns} 手番）",
    gameProgress: "進行中"
  });

  Object.assign(I18N.fr, {
    setupEyebrow: "Configuration hot-seat",
    startDescription: "Cartes et tuiles generiques compatibles avec les regles. Aucun visuel officiel, logo, scan de carte ou asset Board Game Arena n'est inclus.",
    players2: "2 joueurs",
    players3: "3 joueurs",
    players4: "4 joueurs",
    playerName: "Nom du joueur {n}",
    smartAi: "IA intelligente",
    startGame: "Demarrer",
    restartGame: "Redemarrer",
    resumeSave: "Reprendre",
    clearSave: "Effacer la sauvegarde",
    quickStarts: "Demarrages rapides",
    start2p: "Demarrer 2J",
    start3p: "Demarrer 3J",
    start4p: "Demarrer 4J",
    aiTakeover: "IA prend le relais",
    aiLevel: "Niveau IA",
    aiLevelEasy: "Detendu",
    aiLevelBalanced: "Equilibre",
    aiLevelExpert: "Expert",
    aiBadgeFormat: "DinoBoard AI: {level}",
    aiPlayers: "Joueurs IA",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard AI prend seulement en charge le jeu de base a 2 joueurs. Les extensions utilisent l'IA aleatoire pour l'instant.",
    returnTokens: "Rendre des jetons",
    returnTokensBody: "Le joueur actif doit revenir a 10 jetons ou moins avant les nobles ou le prochain tour.",
    chooseOneNoble: "Choisir un noble",
    chooseOneNobleBody: "Si plusieurs nobles sont eligibles, le joueur actif en recoit exactement un.",
    noTakeSelected: "Aucune prise selectionnee.",
    selectedTokens: "Selection : {tokens}. Une prise legale demande 3 jetons differents ou 2 identiques depuis une pile a 4+.",
    noblesHint: "Bonus permanents seulement. Pas de renouvellement.",
    marketHint: "Acheter, reserver, ou reserver a l'aveugle depuis une pioche.",
    showHide: "Afficher / masquer",
    ruleGuardrails: "Regles",
    ruleGuardrailsBody: "Une action par tour : prendre exactement 3 jetons non-or differents, prendre exactement 2 jetons non-or identiques depuis une pile qui en avait au moins 4, reserver une carte avec un or si disponible, ou acheter une carte du marche/reservee. Le premier joueur a 15 prestige declenche le dernier tour pour egaliser les tours. Les egalites utilisent seulement le plus petit nombre de cartes achetees; les egalites restantes sont partagees.",
    privateHand: "Main privee",
    reservedCards: "Cartes reservees",
    bgaTools: "Outils style BGA",
    exportImportReplay: "Export, import et replay",
    liveTable: "Table active",
    replayMove: "Replay {current} / {total}",
    bgaDescription: "Schema ZephyrLabs stable inspire des concepts publics de BGA Studio : objet gamedatas, journal de coups type notifications et next_move_id. Le protocole prive BGA Splendor n'est pas public; c'est une compatibilite style BGA, pas une parite officielle.",
    exportState: "Exporter l'etat",
    importState: "Importer l'etat",
    exportReplay: "Exporter replay",
    loadReplay: "Charger replay",
    prevMove: "Coup precedent",
    nextMove: "Coup suivant",
    exitReplay: "Quitter replay",
    jsonPlaceholder: "Le JSON exporte apparait ici. Collez un etat ou replay JSON avant import/chargement.",
    noActiveReserved: "Aucune carte reservee pour le joueur actif.",
    aiSmartUnavailable: "DinoBoard AI",
    prestige: "prestige",
    gameFinal: "Dernier tour ({turns} tours restants)"
  });

Object.assign(I18N.de, {
    setupEyebrow: "Hot-Seat Setup",
    startDescription: "Es werden generische, regelkompatible Karten und Platten verwendet. Keine offiziellen Grafiken, Logos, Kartenscans oder Board Game Arena Assets.",
    players2: "2 Spieler",
    players3: "3 Spieler",
    players4: "4 Spieler",
    playerName: "Name Spieler {n}",
    smartAi: "Smarte KI",
    startGame: "Starten",
    currentPlayer: "Aktiv",
    round: "Rd.",
    state: "Phase",
    move: "Zug",
    restartGame: "Neu",
    resumeSave: "Fortsetzen",
    clearSave: "Spielstand loeschen",
    quickStarts: "Schnellstart",
    start2p: "2S starten",
    start3p: "3S starten",
    start4p: "4S starten",
    aiTakeover: "KI uebernimmt",
    aiLevel: "KI-Niveau",
    aiLevelEasy: "Locker",
    aiLevelBalanced: "Ausgewogen",
    aiLevelExpert: "Experte",
    aiBadgeFormat: "DinoBoard AI: {level}",
    aiPlayers: "KI-Spieler",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard AI unterstuetzt derzeit nur das 2-Spieler-Basisspiel. Erweiterungen nutzen vorerst Zufalls-KI.",
    returnTokens: "Marker zurueckgeben",
    returnTokensBody: "Der aktive Spieler muss auf 10 oder weniger Marker zurueckgeben, bevor Adlige oder der naechste Zug abgewickelt werden.",
    chooseOneNoble: "Einen Adligen waehlen",
    chooseOneNobleBody: "Sind mehrere Adlige moeglich, erhaelt der aktive Spieler genau einen.",
    noTakeSelected: "Keine Auswahl.",
    selectedTokens: "Auswahl: {tokens}. Legal sind 3 verschiedene Marker oder 2 gleiche aus einem Stapel mit 4+.",
    noblesHint: "Nur permanente Boni. Keine Auffuellung.",
    marketHint: "Kaufen, reservieren oder verdeckt vom Stapel reservieren.",
    showHide: "Ein-/ausblenden",
    ruleGuardrails: "Regeln",
    ruleGuardrailsBody: "Eine Aktion pro Zug: genau 3 verschiedene Nicht-Gold-Marker nehmen, genau 2 gleiche Nicht-Gold-Marker aus einem Stapel nehmen, der vorher mindestens 4 hatte, eine Karte reservieren und falls moeglich Gold nehmen, oder eine Markt-/Reservekarte kaufen. Der erste Spieler mit 15 Prestige startet die Schlussrunde, damit alle gleich viele Zuege haben. Gleichstaende nutzen nur weniger gekaufte Karten; weitere Gleichstaende werden geteilt.",
    privateHand: "Private Hand",
    reservedCards: "Reservierte Karten",
    bgaTools: "BGA-Stil Werkzeuge",
    exportImportReplay: "Export, Import und Replay",
    liveTable: "Live-Tisch",
    replayMove: "Replay {current} / {total}",
    bgaDescription: "Nutzt ein stabiles ZephyrLabs Schema nach oeffentlichen BGA Studio Konzepten: gamedatas Objekt, benachrichtigungsartiges Zuglog und next_move_id. Das private BGA Splendor Protokoll ist nicht oeffentlich; dies ist BGA-Stil Kompatibilitaet, keine offizielle Paritaet.",
    exportState: "Status exportieren",
    importState: "Status importieren",
    exportReplay: "Replay exportieren",
    loadReplay: "Replay laden",
    prevMove: "Vorheriger Zug",
    nextMove: "Naechster Zug",
    exitReplay: "Replay verlassen",
    jsonPlaceholder: "Exportiertes JSON erscheint hier. Vor Import/Laden kann Status- oder Replay-JSON eingefuegt werden.",
    noActiveReserved: "Keine reservierten Karten fuer den aktiven Spieler.",
    aiSmartUnavailable: "DinoBoard AI",
    prestige: "Prestige",
    gameFinal: "Schlussrunde ({turns} Zuege uebrig)"
  });

  Object.assign(I18N.es, {
    setupEyebrow: "Configuracion hot-seat",
    startDescription: "Se usan cartas y losetas genericas compatibles con las reglas. No se incluyen artes oficiales, logos, escaneos de cartas ni assets de Board Game Arena.",
    players2: "2 jugadores",
    players3: "3 jugadores",
    players4: "4 jugadores",
    playerName: "Nombre jugador {n}",
    smartAi: "IA inteligente",
    startGame: "Iniciar",
    restartGame: "Reiniciar",
    resumeSave: "Continuar guardado",
    clearSave: "Borrar guardado",
    quickStarts: "Inicios rapidos",
    start2p: "Iniciar 2J",
    start3p: "Iniciar 3J",
    start4p: "Iniciar 4J",
    aiTakeover: "IA controla",
    aiLevel: "Nivel IA",
    aiLevelEasy: "Casual",
    aiLevelBalanced: "Equilibrado",
    aiLevelExpert: "Experto",
    aiBadgeFormat: "DinoBoard AI: {level}",
    aiPlayers: "Jugadores IA",
    aiUnavailableTitle: "DinoBoard AI",
    aiUnavailableBody: "DinoBoard AI solo admite partidas base de 2 jugadores. Las expansiones usan IA aleatoria por ahora.",
    returnTokens: "Devolver fichas",
    returnTokensBody: "El jugador activo debe devolver fichas hasta tener 10 o menos antes de resolver nobles o el siguiente turno.",
    chooseOneNoble: "Elegir un noble",
    chooseOneNobleBody: "Si varios nobles son elegibles, el jugador activo recibe exactamente uno.",
    noTakeSelected: "No hay toma seleccionada.",
    selectedTokens: "Seleccion: {tokens}. Una toma legal requiere 3 fichas distintas o 2 iguales desde una pila con 4+.",
    noblesHint: "Solo bonos permanentes. Sin reposicion.",
    marketHint: "Comprar, reservar o reservar a ciegas desde un mazo.",
    showHide: "Mostrar / ocultar",
    ruleGuardrails: "Reglas",
    ruleGuardrailsBody: "Una accion por turno: tomar exactamente 3 fichas no oro distintas, tomar exactamente 2 fichas no oro iguales desde una pila que tenia al menos 4, reservar una carta con oro si hay disponible, o comprar una carta del mercado/reservada. El primer jugador con 15 prestigio activa la ronda final para igualar turnos. Los empates usan solo menos cartas compradas; los empates restantes se comparten.",
    privateHand: "Mano privada",
    reservedCards: "Cartas reservadas",
    bgaTools: "Herramientas estilo BGA",
    exportImportReplay: "Exportar, importar y replay",
    liveTable: "Mesa en vivo",
    replayMove: "Replay {current} / {total}",
    bgaDescription: "Usa un schema estable de ZephyrLabs inspirado en conceptos publicos de BGA Studio: objeto gamedatas, registro de movimientos tipo notificacion y next_move_id. El protocolo privado de BGA Splendor no es publico; esto es compatibilidad estilo BGA, no paridad oficial.",
    exportState: "Exportar estado",
    importState: "Importar estado",
    exportReplay: "Exportar replay",
    loadReplay: "Cargar replay",
    prevMove: "Movimiento anterior",
    nextMove: "Movimiento siguiente",
    exitReplay: "Salir del replay",
    jsonPlaceholder: "El JSON exportado aparece aqui. Pega JSON de estado o replay antes de importar/cargar.",
    noActiveReserved: "No hay cartas reservadas para el jugador activo.",
    aiSmartUnavailable: "IA temporalmente no disponible",
    prestige: "prestigio",
    gameFinal: "Ronda final ({turns} turnos restantes)"
  });

  Object.assign(I18N["zh-Hans"], {
    logSafeMode: "\u8131\u654f",
    logFullMode: "\u5b8c\u6574",
    logStart: "\u724c\u5c40\u5f00\u59cb",
    logMove: "\u7b2c {move} \u6b65",
    logTakeTokensTitle: "\u62ff\u53d6\u5b9d\u77f3",
    logReserveTitle: "\u9884\u7ea6\u5361\u724c",
    logBuyTitle: "\u8d2d\u4e70\u5361\u724c",
    logDiscardTitle: "\u5f52\u8fd8\u5b9d\u77f3",
    logNobleTitle: "\u8d35\u65cf",
    logGameTitle: "\u724c\u5c40",
    logStrongholdPlaceTitle: "\u653e\u7f6e\u8981\u585e",
    logStrongholdMoveTitle: "\u79fb\u52a8\u8981\u585e",
    logStrongholdRemoveTitle: "\u79fb\u9664\u8981\u585e",
    logStrongholdTarget: "\u76ee\u6807",
    logStrongholdFrom: "\u4ece",
    logStrongholdTo: "\u5230",
    logBlindCard: "{tier} \u7ea7\u6697\u724c",
    logUnknownCard: "\u672a\u77e5\u5361\u724c",
    logGoldTaken: "\u83b7\u5f97\u9ec4\u91d1",
    logPayment: "\u652f\u4ed8",
    logRandomAi: "\u968f\u673a AI",
    logDinoBoardAi: "DinoBoard AI",
    logBlindReserve: "\u6697\u724c\u9884\u7ea6",
    logFaceUpReserve: "\u660e\u724c\u9884\u7ea6"
  });

  Object.assign(I18N["zh-Hant"], {
    logSafeMode: "\u812b\u654f",
    logFullMode: "\u5b8c\u6574",
    logStart: "\u724c\u5c40\u958b\u59cb",
    logMove: "\u7b2c {move} \u6b65",
    logTakeTokensTitle: "\u62ff\u53d6\u5bf6\u77f3",
    logReserveTitle: "\u9810\u7d04\u5361\u724c",
    logBuyTitle: "\u8cfc\u8cb7\u5361\u724c",
    logDiscardTitle: "\u6b78\u9084\u5bf6\u77f3",
    logNobleTitle: "\u8cb4\u65cf",
    logGameTitle: "\u724c\u5c40",
    logStrongholdPlaceTitle: "\u653e\u7f6e\u8981\u585e",
    logStrongholdMoveTitle: "\u79fb\u52d5\u8981\u585e",
    logStrongholdRemoveTitle: "\u79fb\u9664\u8981\u585e",
    logStrongholdTarget: "\u76ee\u6a19",
    logStrongholdFrom: "\u5f9e",
    logStrongholdTo: "\u5230",
    logBlindCard: "{tier} \u7d1a\u6697\u724c",
    logUnknownCard: "\u672a\u77e5\u5361\u724c",
    logGoldTaken: "\u7372\u5f97\u9ec3\u91d1",
    logPayment: "\u652f\u4ed8",
    logRandomAi: "\u96a8\u6a5f AI",
    logDinoBoardAi: "DinoBoard AI",
    logBlindReserve: "\u6697\u724c\u9810\u7d04",
    logFaceUpReserve: "\u660e\u724c\u9810\u7d04"
  });

  Object.assign(I18N["zh-Hans"], {
    buyShort: "\u4e70",
    reserveShort: "\u7ea6",
    startModeNew: "\u65b0\u6e38\u620f",
    startModeReplay: "\u5bfc\u5165\u56de\u653e",
    replayJsonLabel: "\u56de\u653e JSON",
    replayFileLabel: "\u56de\u653e JSON \u6587\u4ef6",
    startReplayPlaceholder: "\u5728\u8fd9\u91cc\u7c98\u8d34\u5b8c\u6574\u7684\u56de\u653e JSON\u3002",
    startReplayBody: "\u5bfc\u5165\u5b8c\u6574\u56de\u653e\u94fe\u540e\uff0c\u53ef\u4ee5\u9010\u6b65\u67e5\u770b\uff0c\u4e5f\u53ef\u4ee5\u5728\u67d0\u4e2a\u8bb0\u5f55\u70b9\u7ee7\u7eed\u6e38\u620f\u3002",
    fileIoHint: "\u5bfc\u51fa\u4f1a\u76f4\u63a5\u4e0b\u8f7d .json \u6587\u4ef6\uff0c\u5bfc\u5165\u6309\u94ae\u4f1a\u76f4\u63a5\u8bfb\u53d6\u9009\u62e9\u7684 .json \u6587\u4ef6\u3002",
    importReplayFile: "\u5bfc\u5165 JSON \u6587\u4ef6",
    bgaTableImportTitle: "\u901a\u8fc7 BGA table ID \u5bfc\u5165",
    bgaTableImportBody: "\u8f93\u5165 table ID \u540e\u5c1d\u8bd5\u76f4\u63a5\u5bfc\u5165\u3002\u5982\u679c\u670d\u52a1\u5668\u65e0\u6cd5\u8bbf\u95ee BGA\uff0c\u8bf7\u4f7f\u7528 BoardReplayLab \u91cc\u63d0\u4f9b\u7684\u5de5\u5177\u751f\u6210 JSON \u540e\u518d\u5bfc\u5165\u3002",
    importBgaTable: "\u5bfc\u5165 table ID",
    openBgaCrawlerGithub: "\u811a\u672c\u4e0b\u8f7d",
    downloadCapturedJson: "\u4e0b\u8f7d\u91c7\u96c6 JSON",
    bgaTableImportStatus: "\u6269\u5c55\u724c\u5c40\u548c\u4e0d\u652f\u6301\u7684 BGA \u6570\u636e\u4f1a\u663e\u793a\u5bfc\u5165\u5931\u8d25\uff0c\u4e0d\u4f1a\u8f7d\u5165\u9519\u8bef\u6570\u636e\u3002",
    bgaCaptureTitle: "BGA \u56de\u653e\u91c7\u96c6",
    bgaCaptureBody: "\u8bf7\u4f7f\u7528 BoardReplayLab \u91cc\u63d0\u4f9b\u7684\u5de5\u5177\u722c\u53d6\u5e76\u8f6c\u6362\u56de\u653e JSON\u3002",
    bgaTableIdLabel: "BGA \u724c\u684c ID",
    openBgaReview: "\u6253\u5f00 BGA \u56de\u653e",
    downloadBgaCaptureScript: "\u4e0b\u8f7d\u91c7\u96c6\u811a\u672c",
    bgaCaptureStatus: "\u8d26\u53f7\u5bc6\u7801\u53ea\u5728 BGA \u5b98\u65b9\u9875\u9762\u8f93\u5165\uff0c\u672c\u7ad9\u4e0d\u4f1a\u8be2\u95ee\u6216\u4fdd\u5b58\u4f60\u7684 BGA \u5bc6\u7801\u3002",
    continueFromReplay: "\u4ece\u6b64\u7ee7\u7eed",
    gameReplayStep: "\u56de\u653e\u6b65\u9aa4",
    msgReplayStepAnimating: "\u6b63\u5728\u56de\u653e\u7b2c {move} \u6b65\uff08{seconds}s\uff09\u3002",
    msgExportPreparing: "\u6b63\u5728\u51c6\u5907\u5bfc\u51fa\u6587\u4ef6...",
    msgExportFailed: "\u5bfc\u51fa\u5931\u8d25\uff1a{message}",
    msgFileReadFailed: "\u6587\u4ef6\u8bfb\u53d6\u5931\u8d25\uff1a{message}",
    msgBgaTableIdRequired: "\u8bf7\u5148\u8f93\u5165\u6570\u5b57\u683c\u5f0f\u7684 BGA \u724c\u684c ID\u3002",
    msgBgaReviewOpened: "\u5df2\u6253\u5f00 BGA \u56de\u653e\u9875\u3002\u5982\u679c\u8981\u6c42\u767b\u5f55\uff0c\u8bf7\u5728 BGA \u9875\u9762\u5b8c\u6210\u767b\u5f55\uff0c\u7136\u540e\u4f7f\u7528\u91c7\u96c6\u811a\u672c\u5bfc\u51fa\u3002",
    msgBgaTableFetching: "\u6b63\u5728\u5c1d\u8bd5\u5bfc\u5165 BGA \u724c\u684c {table}\u3002",
    msgBgaDirectImportFailed: "\u76f4\u63a5\u5bfc\u5165 BGA table \u5931\u8d25\u3002\u8bf7\u4f7f\u7528 BoardReplayLab \u91cc\u63d0\u4f9b\u7684\u5de5\u5177\u751f\u6210 JSON \u540e\u518d\u5bfc\u5165\u3002",
    msgBgaServerUnavailable: "\u56de\u653e\u670d\u52a1\u5668\u4e0d\u53ef\u7528\u3002\u8bf7\u4f7f\u7528 BoardReplayLab \u91cc\u63d0\u4f9b\u7684\u5de5\u5177\u751f\u6210 JSON \u540e\u518d\u5bfc\u5165\u3002",
    msgBgaServerQueued: "\u670d\u52a1\u5668\u6b63\u5728\u722c\u53d6 BGA \u724c\u684c {table}\uff0c\u8bf7\u4fdd\u6301\u9875\u9762\u6253\u5f00\u3002",
    msgBgaServerDone: "\u670d\u52a1\u5668\u5df2\u751f\u6210\u56de\u653e JSON\uff0c\u53ef\u4ee5\u4e0b\u8f7d\u3002",
    msgBgaServerFailed: "\u670d\u52a1\u5668\u722c\u53d6\u5931\u8d25\uff1a{message}",
    msgBgaCaptureUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f7d\uff1b\u4f46\u8fd9\u4efd BGA \u91c7\u96c6\u6570\u636e\u65e0\u6cd5\u9002\u914d\u6210\u5f53\u524d Gem Table \u56de\u653e\u683c\u5f0f\u3002",
    msgBgaExpansionUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f7d\uff1b\u4f46\u68c0\u6d4b\u5230\u6269\u5c55\u5df2\u542f\u7528\uff0c\u4e0d\u80fd\u5bfc\u5165\u5f53\u524d\u57fa\u7840\u7248\u724c\u684c\u3002",
    msgContinueFromReplay: "\u5df2\u5c06\u5f53\u524d\u56de\u653e\u8282\u70b9\u8f6c\u4e3a\u53ef\u7ee7\u7eed\u7684\u724c\u5c40\u3002\u5982\u9700\u56de\u653e\uff0c\u8bf7\u91cd\u65b0\u4ece\u5934\u8f7d\u5165\u4fdd\u7559\u7684 JSON\u3002"
  });

  Object.assign(I18N["zh-Hans"], {
    handoffAction: "\u52a8\u4f5c",
    handoffContinue: "\u7ee7\u7eed",
    msgSwitchingReady: "\u56de\u5408\u4ea4\u63a5\u5df2\u5c31\u7eea\uff0c\u786e\u8ba4\u540e\u5207\u6362\u5230\u4e0b\u4e00\u4f4d\u73a9\u5bb6\u3002",
    replayAutoplay: "\u81ea\u52a8\u64ad\u653e",
    replayPause: "\u6682\u505c",
    replayJumpLabel: "\u6b65\u6570",
    replayJump: "\u8df3\u8f6c",
    msgReplayJumped: "\u5df2\u8df3\u8f6c\u5230\u7b2c {move} \u6b65\u3002",
    msgReplayJumpInvalid: "\u8bf7\u8f93\u5165 0 \u5230 {total} \u4e4b\u95f4\u7684\u6b65\u6570\u3002",
    msgReplayAutoplayStarted: "\u5df2\u5f00\u59cb\u81ea\u52a8\u64ad\u653e\u3002",
    msgReplayAutoplayStopped: "\u5df2\u6682\u505c\u81ea\u52a8\u64ad\u653e\u3002",
    bonusCardsTitle: "{color} \u5361\u724c",
    bonusCardsEmpty: "\u8fd8\u6ca1\u6709\u8fd9\u4e2a\u989c\u8272\u7684\u5df2\u8d2d\u5361\u3002",
    orientMarketHint: "\u8d2d\u4e70\u3001\u9884\u7ea6\u5e76\u7ed3\u7b97\u4e1c\u65b9\u724c\u6548\u679c\u3002",
    orientVirtualGold: "2 \u865a\u62df\u9ec4\u91d1",
    orientCopyBonus: "\u590d\u5236\u52a0\u6210",
    orientFreeCard: "\u514d\u8d39 {tier} \u7ea7\u724c",
    orientDiscardCost: "\u5f03 {count}",
    orientVirtualGoldZone: "\u4e1c\u65b9\u91d1",
    orientChoiceTitle: "\u4e1c\u65b9\u80fd\u529b",
    orientChoiceBody: "\u5148\u7ed3\u7b97\u8fd9\u5f20\u724c\u7684\u5fc5\u8981\u80fd\u529b\u3002",
    orientChooseCopy: "\u9009\u62e9\u8981\u590d\u5236\u7684\u52a0\u6210\u724c",
    orientChooseFree: "\u9009\u62e9\u4e00\u5f20\u514d\u8d39 {tier} \u7ea7\u724c",
    orientUseVirtual: "\u865a\u62df\u91d1",
    orientPaymentDiscard: "\u5f03\u724c",
    orientDiscardPriorityHint: "\u5148\u5f03\u5e26\u4e07\u80fd\u6807\u8bb0\u7684\u724c\uff0c\u518d\u5f03\u666e\u901a\u724c\u3002",
    orientDiscardPriorityBadge: "\u5148",
      orientNoChoices: "\u6ca1\u6709\u53ef\u9009\u7684\u4e1c\u65b9\u80fd\u529b\u76ee\u6807\u3002",
      orientDirectClickHint: "\u76f4\u63a5\u70b9\u51fb\u5e02\u573a\u91cc\u9ad8\u4eae\u7684\u5361\u724c\u6765\u7ed3\u7b97\u8fd9\u4e2a\u80fd\u529b\u3002",
      orientCopyDirectClickHint: "\u6253\u5f00\u5956\u52b1\u9884\u89c8\uff0c\u7136\u540e\u76f4\u63a5\u70b9\u51fb\u9ad8\u4eae\u7684\u5df2\u8d2d\u5361\u6765\u590d\u5236\u3002",
    strongholdPlace: "\u653e\u7f6e",
    strongholdMove: "\u79fb\u52a8",
    strongholdRemove: "\u79fb\u9664",
    msgOrientAbilityPending: "\u8bf7\u5148\u7ed3\u7b97\u5f85\u5904\u7406\u7684\u4e1c\u65b9\u80fd\u529b\u3002",
    msgOrientCopyNeedsBonus: "\u5148\u590d\u5236\u4e00\u5f20\u52a0\u6210\u724c\u3002",
    msgOrientDiscardNeedsCards: "\u5148\u5f03 {count} \u5f20 {color} \u724c\u3002",
    msgOrientChooseCopy: "\u4e3a {card} \u9009\u62e9\u8981\u590d\u5236\u7684\u724c\u3002",
    msgOrientChooseFree: "\u9009\u62e9\u4e00\u5f20\u514d\u8d39 {tier} \u7ea7\u724c\u3002",
    strongholdPlaceTargets: "\u53ef\u653e\u7f6e\u76ee\u6807",
    strongholdMoveSources: "\u4ece\u8fd9\u4e9b\u5361\u79fb\u52a8",
    strongholdMoveTargets: "\u53ef\u79fb\u52a8\u5230",
    strongholdRemoveTargets: "\u53ef\u79fb\u9664\u76ee\u6807"
  });

  Object.assign(I18N["zh-Hant"], {
    buyShort: "\u8cb7",
    reserveShort: "\u7d04",
    startModeNew: "\u65b0\u904a\u6232",
    startModeReplay: "\u532f\u5165\u56de\u653e",
    replayJsonLabel: "\u56de\u653e JSON",
    replayFileLabel: "\u56de\u653e JSON \u6a94\u6848",
    startReplayPlaceholder: "\u5728\u9019\u88e1\u8cbc\u4e0a\u5b8c\u6574\u7684\u56de\u653e JSON\u3002",
    startReplayBody: "\u532f\u5165\u5b8c\u6574\u56de\u653e\u93c8\u5f8c\uff0c\u53ef\u4ee5\u9010\u6b65\u67e5\u770b\uff0c\u4e5f\u53ef\u4ee5\u5728\u67d0\u500b\u8a18\u9304\u9ede\u7e7c\u7e8c\u904a\u6232\u3002",
    fileIoHint: "\u532f\u51fa\u6703\u76f4\u63a5\u4e0b\u8f09 .json \u6a94\u6848\uff0c\u532f\u5165\u6309\u9215\u6703\u76f4\u63a5\u8b80\u53d6\u9078\u64c7\u7684 .json \u6a94\u6848\u3002",
    importReplayFile: "\u532f\u5165 JSON \u6a94\u6848",
    bgaTableImportTitle: "\u901a\u904e BGA table ID \u532f\u5165",
    bgaTableImportBody: "\u8f38\u5165 table ID \u5f8c\u5617\u8a66\u76f4\u63a5\u532f\u5165\u3002\u5982\u679c\u4f3a\u670d\u5668\u7121\u6cd5\u8a2a\u554f BGA\uff0c\u8acb\u4f7f\u7528 BoardReplayLab \u88e1\u63d0\u4f9b\u7684\u5de5\u5177\u7522\u751f JSON \u5f8c\u518d\u532f\u5165\u3002",
    importBgaTable: "\u532f\u5165 table ID",
    openBgaCrawlerGithub: "\u8173\u672c\u4e0b\u8f09",
    downloadCapturedJson: "\u4e0b\u8f09\u63a1\u96c6 JSON",
    bgaTableImportStatus: "\u64f4\u5145\u724c\u5c40\u548c\u4e0d\u652f\u63f4\u7684 BGA \u8cc7\u6599\u6703\u986f\u793a\u532f\u5165\u5931\u6557\uff0c\u4e0d\u6703\u8f09\u5165\u932f\u8aa4\u8cc7\u6599\u3002",
    bgaCaptureTitle: "BGA \u56de\u653e\u63a1\u96c6",
    bgaCaptureBody: "\u8acb\u4f7f\u7528 BoardReplayLab \u88e1\u63d0\u4f9b\u7684\u5de5\u5177\u722c\u53d6\u4e26\u8f49\u63db\u56de\u653e JSON\u3002",
    bgaTableIdLabel: "BGA \u724c\u684c ID",
    openBgaReview: "\u6253\u958b BGA \u56de\u653e",
    downloadBgaCaptureScript: "\u4e0b\u8f09\u63a1\u96c6\u8173\u672c",
    bgaCaptureStatus: "\u5e33\u865f\u5bc6\u78bc\u53ea\u5728 BGA \u5b98\u65b9\u9801\u9762\u8f38\u5165\uff0c\u672c\u7ad9\u4e0d\u6703\u8a62\u554f\u6216\u4fdd\u5b58\u4f60\u7684 BGA \u5bc6\u78bc\u3002",
    continueFromReplay: "\u5f9e\u6b64\u7e7c\u7e8c",
    gameReplayStep: "\u56de\u653e\u6b65\u9a5f",
    msgReplayStepAnimating: "\u6b63\u5728\u56de\u653e\u7b2c {move} \u6b65\uff08{seconds}s\uff09\u3002",
    msgExportPreparing: "\u6b63\u5728\u6e96\u5099\u532f\u51fa\u6a94\u6848...",
    msgExportFailed: "\u532f\u51fa\u5931\u6557\uff1a{message}",
    msgFileReadFailed: "\u6a94\u6848\u8b80\u53d6\u5931\u6557\uff1a{message}",
    msgBgaTableIdRequired: "\u8acb\u5148\u8f38\u5165\u6578\u5b57\u683c\u5f0f\u7684 BGA \u724c\u684c ID\u3002",
    msgBgaReviewOpened: "\u5df2\u6253\u958b BGA \u56de\u653e\u9801\u3002\u5982\u679c\u8981\u6c42\u767b\u5165\uff0c\u8acb\u5728 BGA \u9801\u9762\u5b8c\u6210\u767b\u5165\uff0c\u7136\u5f8c\u4f7f\u7528\u63a1\u96c6\u8173\u672c\u532f\u51fa\u3002",
    msgBgaTableFetching: "\u6b63\u5728\u5617\u8a66\u532f\u5165 BGA \u724c\u684c {table}\u3002",
    msgBgaDirectImportFailed: "\u76f4\u63a5\u532f\u5165 BGA table \u5931\u6557\u3002\u8acb\u4f7f\u7528 BoardReplayLab \u88e1\u63d0\u4f9b\u7684\u5de5\u5177\u7522\u751f JSON \u5f8c\u518d\u532f\u5165\u3002",
    msgBgaServerUnavailable: "\u56de\u653e\u4f3a\u670d\u5668\u4e0d\u53ef\u7528\u3002\u8acb\u4f7f\u7528 BoardReplayLab \u88e1\u63d0\u4f9b\u7684\u5de5\u5177\u7522\u751f JSON \u5f8c\u518d\u532f\u5165\u3002",
    msgBgaServerQueued: "\u4f3a\u670d\u5668\u6b63\u5728\u722c\u53d6 BGA \u724c\u684c {table}\uff0c\u8acb\u4fdd\u6301\u9801\u9762\u958b\u555f\u3002",
    msgBgaServerDone: "\u4f3a\u670d\u5668\u5df2\u7522\u751f\u56de\u653e JSON\uff0c\u53ef\u4ee5\u4e0b\u8f09\u3002",
    msgBgaServerFailed: "\u4f3a\u670d\u5668\u722c\u53d6\u5931\u6557\uff1a{message}",
    msgBgaCaptureUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f09\uff1b\u4f46\u9019\u4efd BGA \u63a1\u96c6\u8cc7\u6599\u7121\u6cd5\u9069\u914d\u6210\u76ee\u524d Gem Table \u56de\u653e\u683c\u5f0f\u3002",
    msgBgaExpansionUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f09\uff1b\u4f46\u6aa2\u6e2c\u5230\u64f4\u5145\u5df2\u555f\u7528\uff0c\u4e0d\u80fd\u532f\u5165\u76ee\u524d\u57fa\u790e\u7248\u724c\u684c\u3002",
    msgContinueFromReplay: "\u5df2\u5c07\u7576\u524d\u56de\u653e\u7bc0\u9ede\u8f49\u70ba\u53ef\u7e7c\u7e8c\u7684\u724c\u5c40\u3002\u5982\u9700\u56de\u653e\uff0c\u8acb\u91cd\u65b0\u5f9e\u982d\u8f09\u5165\u4fdd\u7559\u7684 JSON\u3002"
  });

  Object.assign(I18N["zh-Hant"], {
    handoffAction: "\u52d5\u4f5c",
    handoffContinue: "\u7e7c\u7e8c",
    msgSwitchingReady: "\u56de\u5408\u4ea4\u63a5\u5df2\u5c31\u7dd2\uff0c\u78ba\u8a8d\u5f8c\u5207\u63db\u5230\u4e0b\u4e00\u4f4d\u73a9\u5bb6\u3002",
    replayAutoplay: "\u81ea\u52d5\u64ad\u653e",
    replayPause: "\u66ab\u505c",
    replayJumpLabel: "\u6b65\u6578",
    replayJump: "\u8df3\u8f49",
    msgReplayJumped: "\u5df2\u8df3\u8f49\u5230\u7b2c {move} \u6b65\u3002",
    msgReplayJumpInvalid: "\u8acb\u8f38\u5165 0 \u5230 {total} \u4e4b\u9593\u7684\u6b65\u6578\u3002",
    msgReplayAutoplayStarted: "\u5df2\u958b\u59cb\u81ea\u52d5\u64ad\u653e\u3002",
    msgReplayAutoplayStopped: "\u5df2\u66ab\u505c\u81ea\u52d5\u64ad\u653e\u3002",
    bonusCardsTitle: "{color} \u5361\u724c",
    bonusCardsEmpty: "\u9084\u6c92\u6709\u9019\u500b\u984f\u8272\u7684\u5df2\u8cfc\u5361\u3002",
    orientMarketHint: "\u8cfc\u8cb7\u3001\u9810\u7d04\u4e26\u7d50\u7b97\u6771\u65b9\u724c\u6548\u679c\u3002",
    orientVirtualGold: "2 \u865b\u64ec\u9ec3\u91d1",
    orientCopyBonus: "\u8907\u88fd\u52a0\u6210",
    orientFreeCard: "\u514d\u8cbb {tier} \u7d1a\u724c",
    orientDiscardCost: "\u68c4 {count}",
    orientVirtualGoldZone: "\u6771\u65b9\u91d1",
    orientChoiceTitle: "\u6771\u65b9\u80fd\u529b",
    orientChoiceBody: "\u5148\u7d50\u7b97\u9019\u5f35\u724c\u7684\u5fc5\u8981\u80fd\u529b\u3002",
    orientChooseCopy: "\u9078\u64c7\u8981\u8907\u88fd\u7684\u52a0\u6210\u724c",
    orientChooseFree: "\u9078\u64c7\u4e00\u5f35\u514d\u8cbb {tier} \u7d1a\u724c",
    orientUseVirtual: "\u865b\u64ec\u91d1",
    orientPaymentDiscard: "\u68c4\u724c",
    orientDiscardPriorityHint: "\u5148\u68c4\u5e36\u842c\u80fd\u6a19\u8a18\u7684\u724c\uff0c\u518d\u68c4\u666e\u901a\u724c\u3002",
    orientDiscardPriorityBadge: "\u5148",
      orientNoChoices: "\u6c92\u6709\u53ef\u9078\u7684\u6771\u65b9\u80fd\u529b\u76ee\u6a19\u3002",
      orientDirectClickHint: "\u76f4\u63a5\u9ede\u64ca\u5e02\u5834\u88e1\u9ad8\u4eae\u7684\u5361\u724c\u4f86\u7d50\u7b97\u9019\u500b\u80fd\u529b\u3002",
      orientCopyDirectClickHint: "\u6253\u958b\u734e\u52f5\u9810\u89bd\uff0c\u7136\u5f8c\u76f4\u63a5\u9ede\u64ca\u9ad8\u4eae\u7684\u5df2\u8cfc\u5361\u4f86\u8907\u88fd\u3002",
    strongholdPlace: "\u653e\u7f6e",
    strongholdMove: "\u79fb\u52d5",
    strongholdRemove: "\u79fb\u9664",
    msgOrientAbilityPending: "\u8acb\u5148\u7d50\u7b97\u5f85\u8655\u7406\u7684\u6771\u65b9\u80fd\u529b\u3002",
    msgOrientCopyNeedsBonus: "\u5148\u8907\u88fd\u4e00\u5f35\u52a0\u6210\u724c\u3002",
    msgOrientDiscardNeedsCards: "\u5148\u68c4 {count} \u5f35 {color} \u724c\u3002",
    msgOrientChooseCopy: "\u70ba {card} \u9078\u64c7\u8981\u8907\u88fd\u7684\u724c\u3002",
    msgOrientChooseFree: "\u9078\u64c7\u4e00\u5f35\u514d\u8cbb {tier} \u7d1a\u724c\u3002",
    strongholdPlaceTargets: "\u53ef\u653e\u7f6e\u76ee\u6a19",
    strongholdMoveSources: "\u5f9e\u9019\u4e9b\u5361\u79fb\u52d5",
    strongholdMoveTargets: "\u53ef\u79fb\u52d5\u5230",
    strongholdRemoveTargets: "\u53ef\u79fb\u9664\u76ee\u6a19"
  });

  Object.assign(I18N.ja, {
    buyShort: "\u8cb7",
    reserveShort: "\u4e88",
    bgaCaptureTitle: "BGA \u30ea\u30d7\u30ec\u30a4\u53d6\u5f97",
    bgaCaptureBody: "BoardReplayLab \u306e\u30c4\u30fc\u30eb\u3067\u56de\u653e JSON \u3092\u53d6\u5f97\u30fb\u5909\u63db\u3057\u307e\u3059\u3002",
    bgaTableIdLabel: "BGA table ID",
    openBgaReview: "BGA \u56de\u653e\u3092\u958b\u304f",
    downloadBgaCaptureScript: "\u53d6\u5f97\u30b9\u30af\u30ea\u30d7\u30c8",
    bgaCaptureStatus: "\u30d1\u30b9\u30ef\u30fc\u30c9\u306f BGA \u516c\u5f0f\u30da\u30fc\u30b8\u3067\u306e\u307f\u5165\u529b\u3057\u307e\u3059\u3002\u672c\u30b5\u30a4\u30c8\u306f\u4fdd\u5b58\u3057\u307e\u305b\u3093\u3002",
    orientCopyBonus: "\u30dc\u30fc\u30ca\u30b9\u8907\u88fd",
    orientUseVirtual: "\u4eee\u91d1",
    orientPaymentDiscard: "\u30ab\u30fc\u30c9\u7834\u68c4",
    orientChoiceTitle: "\u6771\u65b9\u80fd\u529b"
  });

  Object.assign(I18N.fr, {
    buyShort: "Ach.",
    reserveShort: "Res.",
    downloadBgaCaptureScript: "Script capture",
    openBgaReview: "Ouvrir BGA",
    orientUseVirtual: "Or virt.",
    orientPaymentDiscard: "Defausse"
  });

  Object.assign(I18N.de, {
    buyShort: "Kauf",
    reserveShort: "Res.",
    downloadBgaCaptureScript: "Capture-Skript",
    openBgaReview: "BGA offnen",
    orientUseVirtual: "Virt. Gold",
    orientPaymentDiscard: "Ablegen"
  });

  Object.assign(I18N.es, {
    buyShort: "Com.",
    reserveShort: "Res.",
    downloadBgaCaptureScript: "Script captura",
    openBgaReview: "Abrir BGA",
    orientUseVirtual: "Oro virt.",
    orientPaymentDiscard: "Descartar"
  });

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
  var pendingPayment = null;
  var pendingOrientAction = null;
  var logMode = "safe";
  var startMode = "new";
  var messageText = "";
  var startMessageText = "";
  var messageKind = "";
  var pendingFlight = null;
  var aiTurnTimer = null;
  var dinoboardAi = null;
  var aiTurnInProgress = false;
  var activeAiProvider = null;
  var aiSelectionSequence = 0;
  var aiDisplayCurrentOverride = null;
  var lastHumanPlayerIndex = 0;
  var turnAdvanceTimer = null;
  var handDockSwitchTimer = null;
  var handDockReenterTimer = null;
  var turnSwitchInProgress = false;
  var replayStepTimer = null;
  var replayAutoTimer = null;
  var replayAutoplay = false;
  var replayJumpClickValue = null;
  var activeMarketPage = BASE_MARKET_ID;
  var overlayRefreshTimer = null;
  var overlayProgressFrame = null;
  var activeBgaReplayJobId = "";
  var activeBgaReplayPollTimer = null;
  var tapPreviewIgnoreCloseUntil = 0;
  var marketSwipeStart = null;
  var el = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function t(key, params) {
    var value = (I18N[currentLocale] && I18N[currentLocale][key]) || I18N.en[key] || key;
    Object.keys(params || {}).forEach(function (name) {
      value = value.replace(new RegExp("\\{" + name + "\\}", "g"), params[name]);
    });
    return value;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLocale;
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.dataset.i18n, { n: node.dataset.i18nN || "" });
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder, { n: node.dataset.i18nN || "" }));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
    });
    if (el.languageSelect) {
      el.languageSelect.value = currentLocale;
      el.languageSelect.setAttribute("aria-label", t("languageLabel"));
    }
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

  function createBaseRuleset() {
    var modules = {};
    EXPANSION_MODULES.forEach(function (module) {
      modules[module] = false;
    });
    return {
      schema: RULESET_SCHEMA,
      id: BASE_RULESET_ID,
      name: "Splendor base",
      modules: modules,
      supported_by_engine: true
    };
  }

  function createRuleset(options) {
    var ruleset = createBaseRuleset();
    var modules = options && options.modules || {};
    EXPANSION_MODULES.forEach(function (module) {
      if (modules[module] === true) ruleset.modules[module] = true;
    });
    if (modules.orient === true && modules.strongholds === true) {
      ruleset.id = ORIENT_STRONGHOLDS_RULESET_ID;
      ruleset.name = "Splendor base + Orient + Strongholds";
    } else if (modules.orient === true) {
      ruleset.id = ORIENT_RULESET_ID;
      ruleset.name = "Splendor base + Orient";
    } else if (modules.strongholds === true) {
      ruleset.id = STRONGHOLDS_RULESET_ID;
      ruleset.name = "Splendor base + Strongholds";
    }
    ruleset.supported_by_engine = rulesetSupportedByEngine(ruleset);
    return ruleset;
  }

  function normalizeRuleset(ruleset) {
    var normalized = createBaseRuleset();
    if (!ruleset || typeof ruleset !== "object") return normalized;
    if (typeof ruleset.id === "string" && ruleset.id) normalized.id = ruleset.id;
    if (typeof ruleset.name === "string" && ruleset.name) normalized.name = ruleset.name;
    var modules = ruleset.modules && typeof ruleset.modules === "object" ? ruleset.modules : {};
    EXPANSION_MODULES.forEach(function (module) {
      normalized.modules[module] = modules[module] === true;
    });
    if (normalized.modules.orient && normalized.modules.strongholds) {
      if (normalized.id === BASE_RULESET_ID || normalized.id === ORIENT_RULESET_ID || normalized.id === STRONGHOLDS_RULESET_ID) normalized.id = ORIENT_STRONGHOLDS_RULESET_ID;
      if (normalized.name === "Splendor base" || normalized.name === "Splendor base + Orient" || normalized.name === "Splendor base + Strongholds") normalized.name = "Splendor base + Orient + Strongholds";
    } else if (normalized.modules.orient) {
      if (normalized.id === BASE_RULESET_ID) normalized.id = ORIENT_RULESET_ID;
      if (normalized.name === "Splendor base") normalized.name = "Splendor base + Orient";
    } else if (normalized.modules.strongholds) {
      if (normalized.id === BASE_RULESET_ID) normalized.id = STRONGHOLDS_RULESET_ID;
      if (normalized.name === "Splendor base") normalized.name = "Splendor base + Strongholds";
    }
    normalized.supported_by_engine = rulesetSupportedByEngine(normalized);
    return normalized;
  }

  function activeRulesetModules(ruleset) {
    var normalized = ruleset && ruleset.modules ? ruleset : normalizeRuleset(ruleset);
    return EXPANSION_MODULES.filter(function (module) {
      return normalized.modules && normalized.modules[module] === true;
    });
  }

  function unsupportedRulesetModules(ruleset) {
    return activeRulesetModules(ruleset).filter(function (module) {
      return ENGINE_SUPPORTED_MODULES.indexOf(module) < 0;
    });
  }

  function rulesetSupportedByEngine(ruleset) {
    return unsupportedRulesetModules(ruleset).length === 0;
  }

  function orientEnabledForRuleset(ruleset) {
    return normalizeRuleset(ruleset).modules.orient === true;
  }

  function strongholdsEnabledForRuleset(ruleset) {
    return normalizeRuleset(ruleset).modules.strongholds === true;
  }

  function dinoBoardSupportsRuleset(ruleset) {
    return activeRulesetModules(ruleset).length === 0;
  }

  function ensureStateRuleset(game) {
    if (game && typeof game === "object") {
      game.ruleset = normalizeRuleset(game.ruleset);
      ensureModuleState(game);
      ensureMarketStructure(game);
    }
    return game;
  }

  var SOURCE_CARD_ROWS = {
    black: [
      [0, 0, 1, 1, 1, 1],
      [0, 0, 0, 1, 0, 2],
      [0, 0, 2, 0, 0, 2],
      [0, 1, 0, 3, 0, 1],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 1, 1, 2, 1],
      [0, 0, 2, 1, 2, 0],
      [1, 0, 0, 0, 4, 0],
      [1, 0, 3, 0, 2, 2],
      [1, 2, 3, 0, 0, 3],
      [2, 0, 0, 2, 1, 4],
      [2, 0, 5, 0, 0, 0],
      [2, 0, 0, 3, 0, 5],
      [3, 6, 0, 0, 0, 0],
      [3, 0, 3, 3, 3, 5],
      [4, 0, 0, 7, 0, 0],
      [4, 3, 0, 6, 0, 3],
      [5, 3, 0, 7, 0, 0]
    ],
    blue: [
      [0, 2, 1, 0, 0, 0],
      [0, 1, 1, 2, 0, 1],
      [0, 1, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 3],
      [0, 3, 0, 0, 0, 0],
      [0, 0, 1, 2, 0, 2],
      [0, 2, 0, 0, 0, 2],
      [1, 0, 0, 4, 0, 0],
      [1, 0, 0, 3, 2, 2],
      [1, 3, 0, 0, 2, 3],
      [2, 0, 5, 0, 3, 0],
      [2, 0, 0, 0, 5, 0],
      [2, 4, 2, 1, 0, 0],
      [3, 0, 0, 0, 6, 0],
      [3, 5, 3, 3, 0, 3],
      [4, 0, 7, 0, 0, 0],
      [4, 3, 6, 0, 3, 0],
      [5, 0, 7, 0, 3, 0]
    ],
    green: [
      [0, 0, 2, 0, 1, 0],
      [0, 0, 0, 2, 2, 0],
      [0, 0, 1, 0, 3, 1],
      [0, 1, 1, 1, 1, 0],
      [0, 2, 1, 1, 1, 0],
      [0, 2, 0, 2, 1, 0],
      [0, 0, 0, 3, 0, 0],
      [1, 4, 0, 0, 0, 0],
      [1, 0, 3, 3, 0, 2],
      [1, 2, 2, 0, 3, 0],
      [2, 1, 4, 0, 2, 0],
      [2, 0, 0, 0, 0, 5],
      [2, 0, 0, 0, 5, 3],
      [3, 0, 0, 0, 0, 6],
      [3, 3, 5, 3, 3, 0],
      [4, 0, 3, 0, 6, 3],
      [4, 0, 0, 0, 7, 0],
      [5, 0, 0, 0, 7, 3]
    ],
    red: [
      [0, 0, 3, 0, 0, 0],
      [0, 3, 1, 1, 0, 0],
      [0, 0, 0, 0, 2, 1],
      [0, 2, 2, 0, 0, 1],
      [0, 1, 2, 0, 1, 1],
      [0, 1, 1, 0, 1, 1],
      [0, 0, 2, 2, 0, 0],
      [1, 0, 4, 0, 0, 0],
      [1, 3, 0, 2, 3, 0],
      [1, 3, 2, 2, 0, 0],
      [2, 0, 1, 0, 4, 2],
      [2, 5, 3, 0, 0, 0],
      [2, 5, 0, 0, 0, 0],
      [3, 0, 0, 6, 0, 0],
      [3, 3, 3, 0, 5, 3],
      [4, 0, 0, 0, 0, 7],
      [4, 0, 0, 3, 3, 6],
      [5, 0, 0, 3, 0, 7]
    ],
    white: [
      [0, 1, 0, 0, 2, 2],
      [0, 1, 0, 2, 0, 0],
      [0, 1, 0, 1, 1, 1],
      [0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 2, 2],
      [0, 1, 0, 1, 1, 2],
      [0, 1, 3, 0, 1, 0],
      [1, 0, 0, 0, 0, 4],
      [1, 2, 0, 2, 0, 3],
      [1, 0, 2, 3, 3, 0],
      [2, 2, 0, 4, 0, 1],
      [2, 0, 0, 5, 0, 0],
      [2, 3, 0, 5, 0, 0],
      [3, 0, 6, 0, 0, 0],
      [3, 3, 0, 5, 3, 3],
      [4, 7, 0, 0, 0, 0],
      [4, 6, 3, 3, 0, 0],
      [5, 7, 3, 0, 0, 0]
    ]
  };

  function sourceRowTier(index) {
    if (index < 8) return 1;
    if (index < 14) return 2;
    return 3;
  }

  function sourceRowCost(row) {
    return normalizeCost({
      black: row[1],
      white: row[2],
      red: row[3],
      blue: row[4],
      green: row[5]
    });
  }

  function buildDevelopmentCards() {
    var cardsByTier = { 1: [], 2: [], 3: [] };
    var counters = { 1: 0, 2: 0, 3: 0 };
    ["black", "blue", "green", "red", "white"].forEach(function (color) {
      SOURCE_CARD_ROWS[color].forEach(function (row, index) {
        var tier = sourceRowTier(index);
        counters[tier] += 1;
        cardsByTier[tier].push({
          id: "t" + tier + "-" + String(counters[tier]).padStart(2, "0"),
          tier: tier,
          color: color,
          points: row[0],
          cost: sourceRowCost(row)
        });
      });
    });
    return cardsByTier;
  }

  var DEVELOPMENT_CARDS = buildDevelopmentCards();

  var ORIENT_CARDDB_ROWS = [
    [201, 11, 5, 0, "CCCRR", 1, 0, 0, ""],
    [202, 11, 5, 0, "RRRSS", 1, 0, 0, ""],
    [203, 11, 5, 0, "SSSEE", 1, 0, 0, ""],
    [204, 11, 5, 0, "EEEOO", 1, 0, 0, ""],
    [205, 11, 5, 0, "OOOCC", 1, 0, 0, ""],
    [206, 11, 6, 0, "RRR", 0, 0, 0, ""],
    [207, 11, 6, 0, "EEE", 0, 0, 0, ""],
    [208, 11, 6, 0, "SSS", 0, 0, 0, ""],
    [209, 11, 6, 0, "CCC", 0, 0, 0, ""],
    [210, 11, 6, 0, "OOO", 0, 0, 0, ""],
    [211, 12, 0, 1, "RRRREEE", 0, 0, 2, ""],
    [212, 12, 1, 1, "OOOORRR", 0, 0, 2, ""],
    [213, 12, 2, 1, "CCCCOOO", 0, 0, 2, ""],
    [214, 12, 3, 1, "SSSSCCC", 0, 0, 2, ""],
    [215, 12, 4, 1, "EEEESSS", 0, 0, 2, ""],
    [216, 12, 5, 1, "RRRREEEC", 1, 1, 0, ""],
    [217, 12, 5, 1, "SSSSOOOR", 1, 1, 0, ""],
    [218, 12, 5, 1, "OOOORRRE", 1, 1, 0, ""],
    [219, 12, 5, 1, "EEEECCCS", 1, 1, 0, ""],
    [220, 12, 5, 1, "CCCCSSSO", 1, 1, 0, ""],
    [221, 13, 4, 3, "", 0, 0, 1, "SS"],
    [222, 13, 2, 3, "", 0, 0, 1, "OO"],
    [223, 13, 3, 3, "", 0, 0, 1, "CC"],
    [224, 13, 0, 3, "", 0, 0, 1, "EE"],
    [225, 13, 1, 3, "", 0, 0, 1, "RR"],
    [226, 13, 0, 1, "SSSSSSEEER", 0, 2, 1, ""],
    [227, 13, 1, 1, "EEEEEERRRO", 0, 2, 1, ""],
    [228, 13, 2, 1, "RRRRRROOOC", 0, 2, 1, ""],
    [229, 13, 3, 1, "OOOOOOCCCS", 0, 2, 1, ""],
    [230, 13, 4, 1, "CCCCCCSSSE", 0, 2, 1, ""]
  ];

  function costFromBgaCodes(value) {
    var cost = emptyCounts(false);
    String(value || "").split("").forEach(function (code) {
      var color = BGA_COST_COLOR[code];
      if (color) cost[color] += 1;
    });
    return normalizeCost(cost);
  }

  function orientAbilitiesForRow(row, color, costCardColor) {
    var abilities = [];
    if (row.symbolCopy) {
      abilities.push({
        id: "orient-copy-bonus",
        timing: "on_acquire",
        effect: "copy_bonus",
        status: "implemented",
        requires_choice: true,
        immediate_choice: true
      });
    }
    if (row.type === 6) {
      abilities.push({
        id: "orient-virtual-gold",
        timing: "future_payment",
        effect: "virtual_gold_2",
        status: "implemented",
        virtual_gold: 2,
        immediate_choice: false
      });
    }
    if (row.nbBonus === 2) {
      abilities.push({
        id: "orient-double-bonus",
        timing: "on_acquire",
        effect: "double_bonus",
        status: "implemented",
        bonus_color: color,
        bonus_count: 2,
        immediate_choice: false
      });
    }
    if (row.symbolTake) {
      abilities.push({
        id: "orient-free-tier-" + row.symbolTake,
        timing: "on_acquire",
        effect: "take_level_free",
        status: "implemented",
        free_tier: row.symbolTake,
        requires_choice: true,
        immediate_choice: true
      });
    }
    if (costCardColor) {
      abilities.push({
        id: "orient-discard-card-cost",
        timing: "on_buy",
        effect: "discard_cards_cost",
        status: "implemented",
        color: costCardColor,
        count: 2,
        immediate_choice: false
      });
    }
    if (!abilities.length) {
      abilities.push({
        id: "orient-fixed-bonus",
        timing: "on_acquire",
        effect: "fixed_bonus",
        status: "implemented",
        bonus_color: color,
        bonus_count: row.nbBonus || 1,
        immediate_choice: false
      });
    }
    return abilities;
  }

  function buildOrientCards() {
    var cardsByTier = { 1: [], 2: [], 3: [] };
    ORIENT_CARDDB_ROWS.forEach(function (raw) {
      var row = {
        id: raw[0],
        lvl: raw[1],
        type: raw[2],
        points: raw[3],
        cost: raw[4],
        symbolCopy: raw[5],
        symbolTake: raw[6],
        nbBonus: raw[7],
        costCard: raw[8]
      };
      var tier = row.lvl - 10;
      var color = row.type >= 0 && row.type <= 4 ? COLORS[row.type] : (row.type === 5 ? "wild" : "gold");
      var costCard = costFromBgaCodes(row.costCard);
      var costCardColor = COLORS.find(function (entry) { return costCard[entry] > 0; }) || "";
      var orientBonus = emptyCounts(false);
      if (row.type >= 0 && row.type <= 4 && row.nbBonus > 0) orientBonus[color] = row.nbBonus;
      cardsByTier[tier].push({
        id: "orient-" + row.id,
        bga_id: String(row.id),
        tier: tier,
        color: color,
        printed_color: row.type >= 0 && row.type <= 4 ? color : null,
        points: row.points,
        cost: costFromBgaCodes(row.cost),
        module: ORIENT_MARKET_ID,
        catalog_schema: ORIENT_CATALOG_SCHEMA,
        bga_carddb: clone(row),
        orient_effective: {
          bonus: orientBonus,
          virtual_gold: row.type === 6,
          virtual_gold_value: row.type === 6 ? 2 : 0
        },
        orient_cost_card: costCardColor ? { color: costCardColor, count: costCard[costCardColor] || 2 } : null,
        abilities: orientAbilitiesForRow(row, color, costCardColor)
      });
    });
    return cardsByTier;
  }

  var ORIENT_CARDS = buildOrientCards();

  function localOrientCardByBgaId(id) {
    var value = String(id || "");
    for (var tier = 1; tier <= 3; tier += 1) {
      var found = (ORIENT_CARDS[tier] || []).find(function (card) {
        return String(card.bga_id || "") === value || card.id === "orient-" + value;
      });
      if (found) return found;
    }
    return null;
  }

  var DINOBOARD_CARDS = [
    [1, 1, 0, [0, 0, 0, 0, 3]], [1, 1, 0, [1, 0, 0, 0, 2]], [1, 1, 0, [0, 0, 2, 0, 2]],
    [1, 1, 0, [1, 0, 2, 2, 0]], [1, 1, 0, [0, 1, 3, 1, 0]], [1, 1, 0, [1, 0, 1, 1, 1]],
    [1, 1, 0, [1, 0, 1, 2, 1]], [1, 1, 1, [0, 0, 0, 4, 0]], [1, 3, 0, [3, 0, 0, 0, 0]],
    [1, 3, 0, [0, 2, 1, 0, 0]], [1, 3, 0, [2, 0, 0, 2, 0]], [1, 3, 0, [2, 0, 1, 0, 2]],
    [1, 3, 0, [1, 0, 0, 1, 3]], [1, 3, 0, [1, 1, 1, 0, 1]], [1, 3, 0, [2, 1, 1, 0, 1]],
    [1, 3, 1, [4, 0, 0, 0, 0]], [1, 4, 0, [0, 0, 3, 0, 0]], [1, 4, 0, [0, 0, 2, 1, 0]],
    [1, 4, 0, [2, 0, 2, 0, 0]], [1, 4, 0, [2, 2, 0, 1, 0]], [1, 4, 0, [0, 0, 1, 3, 1]],
    [1, 4, 0, [1, 1, 1, 1, 0]], [1, 4, 0, [1, 2, 1, 1, 0]], [1, 4, 1, [0, 4, 0, 0, 0]],
    [1, 0, 0, [0, 3, 0, 0, 0]], [1, 0, 0, [0, 0, 0, 2, 1]], [1, 0, 0, [0, 2, 0, 0, 2]],
    [1, 0, 0, [0, 2, 2, 0, 1]], [1, 0, 0, [3, 1, 0, 0, 1]], [1, 0, 0, [0, 1, 1, 1, 1]],
    [1, 0, 0, [0, 1, 2, 1, 1]], [1, 0, 1, [0, 0, 4, 0, 0]], [1, 2, 0, [0, 0, 0, 3, 0]],
    [1, 2, 0, [2, 1, 0, 0, 0]], [1, 2, 0, [0, 2, 0, 2, 0]], [1, 2, 0, [0, 1, 0, 2, 2]],
    [1, 2, 0, [1, 3, 1, 0, 0]], [1, 2, 0, [1, 1, 0, 1, 1]], [1, 2, 0, [1, 1, 0, 1, 2]],
    [1, 2, 1, [0, 0, 0, 0, 4]], [2, 1, 1, [0, 2, 2, 3, 0]], [2, 1, 1, [0, 2, 3, 0, 3]],
    [2, 1, 2, [0, 5, 0, 0, 0]], [2, 1, 2, [5, 3, 0, 0, 0]], [2, 1, 2, [2, 0, 0, 1, 4]],
    [2, 1, 3, [0, 6, 0, 0, 0]], [2, 3, 1, [2, 0, 0, 2, 3]], [2, 3, 1, [0, 3, 0, 2, 3]],
    [2, 3, 2, [0, 0, 0, 0, 5]], [2, 3, 2, [3, 0, 0, 0, 5]], [2, 3, 2, [1, 4, 2, 0, 0]],
    [2, 3, 3, [0, 0, 0, 6, 0]], [2, 4, 1, [3, 2, 2, 0, 0]], [2, 4, 1, [3, 0, 3, 0, 2]],
    [2, 4, 2, [5, 0, 0, 0, 0]], [2, 4, 2, [0, 0, 5, 3, 0]], [2, 4, 2, [0, 1, 4, 2, 0]],
    [2, 4, 3, [0, 0, 0, 0, 6]], [2, 0, 1, [0, 0, 3, 2, 2]], [2, 0, 1, [2, 3, 0, 3, 0]],
    [2, 0, 2, [0, 0, 0, 5, 0]], [2, 0, 2, [0, 0, 0, 5, 3]], [2, 0, 2, [0, 0, 1, 4, 2]],
    [2, 0, 3, [6, 0, 0, 0, 0]], [2, 2, 1, [2, 3, 0, 0, 2]], [2, 2, 1, [3, 0, 2, 3, 0]],
    [2, 2, 2, [0, 0, 5, 0, 0]], [2, 2, 2, [0, 5, 3, 0, 0]], [2, 2, 2, [4, 2, 0, 0, 1]],
    [2, 2, 3, [0, 0, 6, 0, 0]], [3, 1, 3, [3, 0, 3, 3, 5]], [3, 1, 4, [7, 0, 0, 0, 0]],
    [3, 1, 4, [6, 3, 0, 0, 3]], [3, 1, 5, [7, 3, 0, 0, 0]], [3, 3, 3, [3, 5, 3, 0, 3]],
    [3, 3, 4, [0, 0, 7, 0, 0]], [3, 3, 4, [0, 3, 6, 3, 0]], [3, 3, 5, [0, 0, 7, 3, 0]],
    [3, 4, 3, [3, 3, 5, 3, 0]], [3, 4, 4, [0, 0, 0, 7, 0]], [3, 4, 4, [0, 0, 3, 6, 3]],
    [3, 4, 5, [0, 0, 0, 7, 3]], [3, 0, 3, [0, 3, 3, 5, 3]], [3, 0, 4, [0, 0, 0, 0, 7]],
    [3, 0, 4, [3, 0, 0, 3, 6]], [3, 0, 5, [3, 0, 0, 0, 7]], [3, 2, 3, [5, 3, 0, 3, 3]],
    [3, 2, 4, [0, 7, 0, 0, 0]], [3, 2, 4, [3, 6, 3, 0, 0]], [3, 2, 5, [0, 7, 3, 0, 0]]
  ];

  var DINOBOARD_NOBLES = [
    [0, 0, 4, 4, 0], [0, 0, 0, 4, 4], [0, 4, 4, 0, 0], [4, 0, 0, 0, 4],
    [4, 4, 0, 0, 0], [3, 0, 0, 3, 3], [3, 3, 3, 0, 0], [0, 0, 3, 3, 3],
    [0, 3, 3, 3, 0], [3, 3, 0, 0, 3], [4, 0, 0, 4, 0], [0, 3, 3, 0, 3]
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function cloneOr(value, fallback) {
    return typeof value === "undefined" ? fallback : clone(value);
  }

  function firstDefined() {
    for (var index = 0; index < arguments.length; index += 1) {
      if (arguments[index] !== undefined && arguments[index] !== null) return arguments[index];
    }
    return undefined;
  }

  function dinoboardApiBase() {
    var value = "";
    try {
      value = new URLSearchParams(window.location.search).get("dinoboardApi") || "";
    } catch (error) {
      value = "";
    }
    return String(value || "/api/dinoboard").replace(/\/+$/, "");
  }

  function cardSignature(tier, color, points, cost) {
    return [tier, COLORS.indexOf(color), points, COLORS.map(function (entry) {
      return Number(cost && cost[entry]) || 0;
    }).join(",")].join("|");
  }

  var DINOBOARD_CARD_BY_SIGNATURE = (function () {
    var map = {};
    DINOBOARD_CARDS.forEach(function (entry, index) {
      map[[entry[0], entry[1], entry[2], entry[3].join(",")].join("|")] = index;
    });
    return map;
  })();

  function gemTableCardToDinoId(card) {
    if (!card) return -1;
    if (Number.isInteger(card.dinoboard_id)) return card.dinoboard_id;
    var key = cardSignature(card.tier, card.color, Number(card.points) || 0, card.cost || {});
    if (!Object.prototype.hasOwnProperty.call(DINOBOARD_CARD_BY_SIGNATURE, key)) {
      throw new Error("Unmapped card " + (card.id || key));
    }
    return DINOBOARD_CARD_BY_SIGNATURE[key];
  }

  function nobleToDinoId(noble) {
    if (!noble) return -1;
    if (Number.isInteger(noble.dinoboard_id)) return noble.dinoboard_id;
    var req = noble.req || noble.requirements || {};
    var key = COLORS.map(function (color) { return Number(req[color]) || 0; }).join(",");
    var index = DINOBOARD_NOBLES.findIndex(function (entry) {
      return entry.join(",") === key;
    });
    return index >= 0 ? index : -1;
  }

  function tokenArray(tokens) {
    return ALL_TOKENS.map(function (color) {
      return Math.max(0, Number(tokens && tokens[color]) || 0);
    });
  }

  function buildDinoBoardSnapshotFields(game) {
    var players = game.players || [];
    var market = game.market || {};
    return {
      current_player: Math.max(0, Number(game.current) || 0),
      first_player: 0,
      plies: Math.max(0, Number(game.next_move_id || 1) - 1),
      final_round_remaining: game.finalTurnsLeft === null || game.finalTurnsLeft === undefined ? -1 : Number(game.finalTurnsLeft),
      stage: game.awaitingDiscard ? 1 : game.awaitingNobleChoice ? 2 : 0,
      pending_returns: game.awaitingDiscard ? 1 : 0,
      pending_nobles_size: game.awaitingNobleChoice ? game.awaitingNobleChoice.length : 0,
      pending_noble_slots: [0, 0, 0],
      winner: -1,
      terminal: !!game.gameOver,
      shared_victory: false,
      nobles_size: Math.min(3, (game.nobles || []).length),
      scores: players.map(scoreFor),
      bank: tokenArray(game.bank || {}),
      player_points: players.map(scoreFor),
      player_cards_count: players.map(function (player) { return (player.purchased || []).length; }),
      player_nobles_count: players.map(function (player) { return (player.nobles || []).length; }),
      reserved_size: players.map(function (player) { return (player.reserved || []).length; }),
      tableau_size: [1, 2, 3].map(function (tier) { return (market[tier] || []).filter(Boolean).length; }),
      deck_sizes: [1, 2, 3].map(function (tier) { return (game.decks && game.decks[tier] || []).length; }),
      nobles: [0, 1, 2].map(function (index) { return nobleToDinoId((game.nobles || [])[index]); }),
      player_gems: players.map(function (player) { return tokenArray(player.tokens || {}); }),
      player_bonuses: players.map(function (player) {
        return COLORS.map(function (color) { return Number(player.bonuses && player.bonuses[color]) || 0; });
      }),
      tableau: [1, 2, 3].map(function (tier) {
        return [0, 1, 2, 3].map(function (index) { return gemTableCardToDinoId((market[tier] || [])[index]); });
      }),
      reserved_visible: players.map(function (player) {
        return [0, 1, 2].map(function (index) {
          var card = (player.reserved || [])[index];
          return card && card.reserved_public !== false && card.reserved_from !== "deck" ? 1 : 0;
        });
      }),
      reserved: players.map(function (player) {
        return [0, 1, 2].map(function (index) { return gemTableCardToDinoId((player.reserved || [])[index]); });
      })
    };
  }

  var DINOBOARD_SCALARS = ["current_player", "first_player", "plies", "final_round_remaining", "stage", "pending_returns", "pending_nobles_size", "winner", "terminal", "shared_victory", "nobles_size"];
  var DINOBOARD_VECTORS = { pending_noble_slots: 3, scores: 2, bank: 6, player_points: 2, player_cards_count: 2, player_nobles_count: 2, reserved_size: 2, tableau_size: 3, deck_sizes: 3, nobles: 3 };
  var DINOBOARD_MATRICES = { player_gems: [2, 6], player_bonuses: [2, 5], tableau: [3, 4], reserved_visible: [2, 3], reserved: [2, 3] };

  function addDinoScalar(snapshot, name, value) {
    snapshot[name] = [[], value];
  }

  function addDinoVector(snapshot, name, values) {
    snapshot[name] = [];
    values.forEach(function (value, index) {
      snapshot[name].push([index], value);
    });
  }

  function addDinoMatrix(snapshot, name, values, visibleSlice) {
    snapshot[name] = [];
    values.forEach(function (row, rowIndex) {
      row.forEach(function (value, colIndex) {
        var flatIndex = rowIndex * row.length + colIndex;
        if (visibleSlice && !visibleSlice[flatIndex]) return;
        snapshot[name].push([rowIndex, colIndex], value);
      });
    });
  }

  function dinoOnes(length) {
    return Array.from({ length: length }, function () { return 1; });
  }

  function reservedVizSlice(fields, perspective) {
    var slice = [];
    for (var player = 0; player < 2; player += 1) {
      for (var slot = 0; slot < 3; slot += 1) {
        slice.push(player === perspective || fields.reserved_visible[player][slot] ? 1 : 0);
      }
    }
    return slice;
  }

  function buildDinoBoardPublicSnapshot(game, perspective) {
    var fields = buildDinoBoardSnapshotFields(game);
    var reservedViz = reservedVizSlice(fields, perspective);
    var snapshot = {};
    DINOBOARD_SCALARS.forEach(function (name) { addDinoScalar(snapshot, name, fields[name]); });
    Object.keys(DINOBOARD_VECTORS).forEach(function (name) { addDinoVector(snapshot, name, fields[name]); });
    Object.keys(DINOBOARD_MATRICES).forEach(function (name) {
      addDinoMatrix(snapshot, name, fields[name], name === "reserved" ? reservedViz : null);
    });
    snapshot.__viz__ = {};
    DINOBOARD_SCALARS.forEach(function (name) { snapshot.__viz__[name] = [1]; });
    Object.keys(DINOBOARD_VECTORS).forEach(function (name) { snapshot.__viz__[name] = dinoOnes(DINOBOARD_VECTORS[name]); });
    Object.keys(DINOBOARD_MATRICES).forEach(function (name) {
      var shape = DINOBOARD_MATRICES[name];
      snapshot.__viz__[name] = name === "reserved" ? reservedViz : dinoOnes(shape[0] * shape[1]);
    });
    return snapshot;
  }

  function dinoBoardInitialObservation(game, perspective) {
    return {
      public_snapshot: buildDinoBoardPublicSnapshot(game, perspective),
      tracker_init: {}
    };
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

  function stableStringify(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
    var keys = Object.keys(value).filter(function (key) {
      return typeof value[key] !== "undefined";
    }).sort();
    return "{" + keys.map(function (key) {
      return JSON.stringify(key) + ":" + stableStringify(value[key]);
    }).join(",") + "}";
  }

  function hashString32(text) {
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function generateTableSeed() {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      var values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] >>> 0;
    }
    return (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0;
  }

  function normalizeTableSeed(value) {
    var seed = Number(value);
    return Number.isFinite(seed) ? seed >>> 0 : generateTableSeed();
  }

  function generateDeck(tier, size) {
    var deck = (DEVELOPMENT_CARDS[tier] || []).map(clone);
    if (deck.length !== size && window.console && window.console.warn) {
      window.console.warn("Unexpected development deck size", tier, deck.length, size);
    }
    return deck;
  }

  function generateOrientDeck(tier) {
    return (ORIENT_CARDS[tier] || []).map(clone);
  }

  function emptyTieredMarket() {
    return { 1: [], 2: [], 3: [] };
  }

  function createDeckDrawState() {
    return {
      base: { 1: 0, 2: 0, 3: 0 },
      orient: { 1: 0, 2: 0, 3: 0 }
    };
  }

  function normalizeDeckDrawState(value) {
    var normalized = createDeckDrawState();
    [BASE_MARKET_ID, ORIENT_MARKET_ID].forEach(function (marketId) {
      var source = value && value[marketId] || {};
      [1, 2, 3].forEach(function (tier) {
        normalized[marketId][tier] = Math.max(0, Math.floor(Number(source[tier] || source[String(tier)]) || 0));
      });
    });
    return normalized;
  }

  function inferDeckDrawState(game) {
    var inferred = createDeckDrawState();
    [1, 2, 3].forEach(function (tier) {
      var baseRemaining = game && game.decks && Array.isArray(game.decks[tier]) ? game.decks[tier].length : TIER_SIZES[tier];
      var orientTotal = (ORIENT_CARDS[tier] || []).length;
      var orientRemaining = game && game.orient_decks && Array.isArray(game.orient_decks[tier]) ? game.orient_decks[tier].length : orientTotal;
      inferred[BASE_MARKET_ID][tier] = Math.max(0, TIER_SIZES[tier] - baseRemaining);
      inferred[ORIENT_MARKET_ID][tier] = Math.max(0, orientTotal - orientRemaining);
    });
    return inferred;
  }

  function deckDrawStateFor(game, marketId, tier) {
    if (!game.deck_draw_state || typeof game.deck_draw_state !== "object") {
      game.deck_draw_state = inferDeckDrawState(game);
    }
    game.deck_draw_state = normalizeDeckDrawState(game.deck_draw_state);
    var bucket = marketId === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID;
    return {
      bucket: bucket,
      tier: Number(tier) || 1,
      count: game.deck_draw_state[bucket][Number(tier) || 1] || 0
    };
  }

  function cardDrawKey(card) {
    return String(card && (card.id || card.bga_id || card.bga_card_id) || "");
  }

  function sortedDeckCandidates(deck) {
    return deck.slice().sort(function (a, b) {
      return cardDrawKey(a).localeCompare(cardDrawKey(b));
    });
  }

  function cardIdSnapshot(card) {
    if (!card) return null;
    return {
      id: card.id || "",
      bga_id: card.bga_id || "",
      module: card.module || BASE_MARKET_ID,
      copied_color: card.copied_color || ""
    };
  }

  function cardListSnapshot(cards) {
    return (cards || []).map(cardIdSnapshot);
  }

  function tieredCardSnapshot(tiered) {
    return {
      1: cardListSnapshot(tiered && tiered[1]),
      2: cardListSnapshot(tiered && tiered[2]),
      3: cardListSnapshot(tiered && tiered[3])
    };
  }

  function countSnapshot(counts) {
    var snapshot = {};
    ALL_TOKENS.forEach(function (color) {
      if (counts && typeof counts[color] !== "undefined") snapshot[color] = Number(counts[color]) || 0;
    });
    return snapshot;
  }

  function strongholdDrawSnapshot(strongholds) {
    var placements = strongholds && strongholds.placements || {};
    return Object.keys(placements).sort().map(function (slotId) {
      var holders = Array.isArray(placements[slotId]) ? placements[slotId].slice().sort() : [];
      return [slotId, holders];
    });
  }

  function playerDrawSnapshot(player) {
    return {
      id: player && player.id || "",
      tokens: countSnapshot(player && player.tokens),
      bonuses: countSnapshot(player && player.bonuses),
      reserved: cardListSnapshot(player && player.reserved),
      purchased: cardListSnapshot(player && player.purchased),
      nobles: (player && player.nobles || []).map(function (noble) { return noble && noble.id || ""; }),
      orient_effects: clone(player && player.orient_effects || {})
    };
  }

  function drawStatePayload(game, marketId, tier, context, candidateDeck) {
    var ruleset = normalizeRuleset(game && game.ruleset);
    return {
      table_seed: Number(game && game.table_seed) || 0,
      draw_target: {
        market_id: marketId === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID,
        tier: Number(tier) || 1,
        reason: context && context.reason || "",
        slot_index: Number.isFinite(Number(context && context.slot_index)) ? Number(context.slot_index) : null
      },
      ruleset: {
        id: ruleset.id,
        modules: clone(ruleset.modules || {})
      },
      turn: {
        current: Number(game && game.current) || 0,
        round: Number(game && game.round) || 1,
        end_triggered: !!(game && game.endTriggered),
        final_turns_left: game && game.finalTurnsLeft
      },
      bank: countSnapshot(game && game.bank),
      players: (game && game.players || []).map(playerDrawSnapshot),
      market: tieredCardSnapshot(game && game.market),
      orient_market: tieredCardSnapshot(game && game.orient_market),
      nobles: (game && game.nobles || []).map(function (noble) { return noble && noble.id || ""; }),
      strongholds: strongholdDrawSnapshot(game && game.strongholds),
      candidate_ids: sortedDeckCandidates(candidateDeck || []).map(cardDrawKey)
    };
  }

  function deckDrawSeed(game, marketId, tier, context, candidateDeck) {
    var tableSeed = Number(game && game.table_seed);
    if (!Number.isFinite(tableSeed)) tableSeed = LEGACY_TABLE_SEED_FALLBACK;
    var stateHash = hashString32(stableStringify(drawStatePayload(game, marketId, tier, context, candidateDeck)));
    return (tableSeed ^ stateHash) >>> 0;
  }

  function deckForMarket(game, marketId, tier) {
    var decks = marketId === ORIENT_MARKET_ID ? game.orient_decks : game.decks;
    return decks && decks[tier] || null;
  }

  function drawCardFromDeck(game, marketId, tier, context) {
    var deck = deckForMarket(game, marketId, tier);
    if (!Array.isArray(deck) || deck.length === 0) return null;
    var drawState = deckDrawStateFor(game, marketId, tier);
    var candidates = sortedDeckCandidates(deck);
    var rng = makeRng(deckDrawSeed(game, drawState.bucket, drawState.tier, context || {}, candidates));
    var candidateIndex = Math.floor(rng() * candidates.length);
    var selected = candidates[candidateIndex] || null;
    var selectedKey = cardDrawKey(selected);
    var deckIndex = deck.findIndex(function (card) {
      return cardDrawKey(card) === selectedKey;
    });
    var card = deckIndex >= 0 ? deck.splice(deckIndex, 1)[0] || null : deck.splice(candidateIndex, 1)[0] || null;
    game.deck_draw_state[drawState.bucket][drawState.tier] = drawState.count + 1;
    return card;
  }

  function marketSlotIdFor(marketId, tier, index) {
    return marketId + "-t" + tier + "-s" + (index + 1);
  }

  function deckSlotIdFor(marketId, tier) {
    return marketId + "-t" + tier + "-deck";
  }

  function createMarketSlotGroup(marketId, count) {
    var slots = { 1: [], 2: [], 3: [] };
    [1, 2, 3].forEach(function (tier) {
      for (var index = 0; index < count; index += 1) {
        slots[tier].push(marketSlotIdFor(marketId, tier, index));
      }
    });
    return slots;
  }

  function createMarketSlots() {
    return {
      base: createMarketSlotGroup(BASE_MARKET_ID, BASE_MARKET_SLOT_COUNT),
      orient: createMarketSlotGroup(ORIENT_MARKET_ID, ORIENT_MARKET_SLOT_COUNT)
    };
  }

  function createModuleState(ruleset) {
    var orientEnabled = orientEnabledForRuleset(ruleset);
    var strongholdsEnabled = strongholdsEnabledForRuleset(ruleset);
    return {
      orient: {
        enabled: orientEnabled,
        status: orientEnabled ? "supported" : "disabled",
        catalog_schema: ORIENT_CATALOG_SCHEMA,
        card_count: [1, 2, 3].reduce(function (sum, tier) {
          return sum + (ORIENT_CARDS[tier] || []).length;
        }, 0),
        market_slot_count: ORIENT_MARKET_SLOT_COUNT,
        deck_initialized: false,
        event_schema: MOVE_EVENT_SCHEMA
      },
      strongholds: {
        enabled: strongholdsEnabled,
        status: strongholdsEnabled ? "supported" : "disabled",
        tokens_per_player: 3,
        event_schema: MOVE_EVENT_SCHEMA
      }
    };
  }

  function ensureModuleState(game) {
    if (!game) return null;
    var base = createModuleState(game.ruleset);
    var existing = game.module_state && typeof game.module_state === "object" ? game.module_state : {};
    var orient = existing.orient && typeof existing.orient === "object" ? existing.orient : {};
    var strongholds = existing.strongholds && typeof existing.strongholds === "object" ? existing.strongholds : {};
    game.module_state = {
      orient: Object.assign({}, base.orient, orient, {
        enabled: base.orient.enabled,
        status: base.orient.enabled ? (orient.status === "placeholder_market" ? "supported" : orient.status || "supported") : "disabled",
        catalog_schema: ORIENT_CATALOG_SCHEMA,
        market_slot_count: ORIENT_MARKET_SLOT_COUNT,
        event_schema: MOVE_EVENT_SCHEMA
      }),
      strongholds: Object.assign({}, base.strongholds, strongholds, {
        enabled: base.strongholds.enabled,
        status: base.strongholds.enabled ? (strongholds.status || "supported") : "disabled",
        tokens_per_player: 3,
        event_schema: MOVE_EVENT_SCHEMA
      })
    };
    return game.module_state;
  }

  function normalizeTieredMarket(value) {
    var market = emptyTieredMarket();
    [1, 2, 3].forEach(function (tier) {
      var cards = value && (value[tier] || value[String(tier)]);
      market[tier] = Array.isArray(cards) ? cards.filter(function (card) { return typeof card !== "undefined"; }) : [];
    });
    return market;
  }

  function normalizeTieredDecks(value) {
    var decks = emptyTieredMarket();
    [1, 2, 3].forEach(function (tier) {
      var cards = value && (value[tier] || value[String(tier)]);
      decks[tier] = Array.isArray(cards) ? cards : [];
    });
    return decks;
  }

  function ensureMarketSlotGroup(game, marketId, slotCount, market) {
    if (!game.market_slots[marketId] || typeof game.market_slots[marketId] !== "object") {
      game.market_slots[marketId] = {};
    }
    [1, 2, 3].forEach(function (tier) {
      var existing = game.market_slots[marketId][tier] || game.market_slots[marketId][String(tier)] || [];
      var target = Math.max(Array.isArray(market && market[tier]) ? market[tier].length : 0, slotCount);
      if (!Array.isArray(existing)) existing = [];
      while (existing.length < target) {
        existing.push(marketSlotIdFor(marketId, tier, existing.length));
      }
      game.market_slots[marketId][tier] = existing;
    });
  }

  function tieredCardsHaveAny(value) {
    return [1, 2, 3].some(function (tier) {
      var cards = value && (value[tier] || value[String(tier)]);
      return Array.isArray(cards) && cards.some(Boolean);
    });
  }

  function orientDecksAlreadyInitialized(game) {
    if (!game) return false;
    var orientState = game.module_state && game.module_state.orient || {};
    return orientState.deck_initialized === true ||
      tieredCardsHaveAny(game.orient_market) ||
      tieredCardsHaveAny(game.orient_decks) ||
      Number(game.next_move_id || 1) > 1 ||
      !!game.bga_deck_unknown;
  }

  function setOrientDecksInitialized(game) {
    if (!game) return;
    if (!game.module_state || typeof game.module_state !== "object") {
      game.module_state = createModuleState(game.ruleset);
    }
    if (!game.module_state.orient || typeof game.module_state.orient !== "object") {
      game.module_state.orient = createModuleState(game.ruleset).orient;
    }
    game.module_state.orient.deck_initialized = true;
  }

  function ensureMarketStructure(game) {
    if (!game) return game;
    if (!Number.isFinite(Number(game.table_seed))) game.table_seed = generateTableSeed();
    if (!game.market) game.market = emptyTieredMarket();
    if (!game.decks) game.decks = emptyTieredMarket();
    game.market = normalizeTieredMarket(game.market);
    game.decks = normalizeTieredDecks(game.decks);
    game.orient_market = normalizeTieredMarket(game.orient_market);
    game.orient_decks = normalizeTieredDecks(game.orient_decks);
    game.deck_draw_state = game.deck_draw_state && typeof game.deck_draw_state === "object"
      ? normalizeDeckDrawState(game.deck_draw_state)
      : inferDeckDrawState(game);
    if (!game.market_slots || typeof game.market_slots !== "object") game.market_slots = createMarketSlots();
    ensureMarketSlotGroup(game, BASE_MARKET_ID, BASE_MARKET_SLOT_COUNT, game.market);
    ensureMarketSlotGroup(game, ORIENT_MARKET_ID, ORIENT_MARKET_SLOT_COUNT, game.orient_market);
    if (orientEnabledForRuleset(game.ruleset)) {
      var orientWasInitialized = orientDecksAlreadyInitialized(game);
      var generatedOrientDecks = false;
      [1, 2, 3].forEach(function (tier) {
        if (!orientWasInitialized && game.orient_market[tier].length === 0 && game.orient_decks[tier].length === 0) {
          game.orient_decks[tier] = generateOrientDeck(tier);
          refillOrientMarket(game, tier);
          generatedOrientDecks = true;
        }
      });
      if (generatedOrientDecks || orientWasInitialized) setOrientDecksInitialized(game);
    }
    return game;
  }

  function marketSlotId(game, marketId, tier, index) {
    ensureMarketStructure(game);
    var group = game.market_slots && game.market_slots[marketId] && game.market_slots[marketId][tier];
    return group && group[index] || marketSlotIdFor(marketId, tier, index);
  }

  function removeMarketSlotId(game, marketId, tier, index) {
    ensureMarketStructure(game);
    var group = game.market_slots && game.market_slots[marketId] && game.market_slots[marketId][tier];
    if (Array.isArray(group)) group.splice(index, 1);
  }

  function emptySeenCards() {
    return { 1: [], 2: [], 3: [] };
  }

  function localDevelopmentCardById(id) {
    var value = String(id || "");
    for (var tier = 1; tier <= 3; tier += 1) {
      var found = (DEVELOPMENT_CARDS[tier] || []).find(function (card) {
        return card.id === value;
      });
      if (found) return found;
    }
    return null;
  }

  function localDevelopmentCardFor(card) {
    if (!card || card.hidden) return null;
    var byId = localDevelopmentCardById(card.id);
    if (byId) return byId;
    if (!card.cost || COLORS.indexOf(card.color) < 0) return null;
    return bgaLocalCardMatch(card.tier, card.color, card.points, card.cost) || null;
  }

  function normalizeSeenCards(value) {
    var seen = emptySeenCards();
    [1, 2, 3].forEach(function (tier) {
      var list = value && value[tier] || value && value[String(tier)] || [];
      if (!Array.isArray(list)) return;
      list.forEach(function (id) {
        var local = localDevelopmentCardById(id);
        if (local && seen[tier].indexOf(local.id) < 0) seen[tier].push(local.id);
      });
    });
    return seen;
  }

  function ensureSeenCards(game) {
    if (!game.seen_cards) game.seen_cards = emptySeenCards();
    game.seen_cards = normalizeSeenCards(game.seen_cards);
    return game.seen_cards;
  }

  function rememberSeenCard(game, card) {
    if (!game) return null;
    var local = localDevelopmentCardFor(card);
    if (!local) return null;
    var seen = ensureSeenCards(game);
    if (seen[local.tier].indexOf(local.id) < 0) seen[local.tier].push(local.id);
    return local.id;
  }

  function rememberSeenCards(game, cards) {
    (cards || []).forEach(function (card) {
      rememberSeenCard(game, card);
    });
  }

  function isBgaHiddenCard(card) {
    return !!(card && (card.hidden || /^bga-hidden-/i.test(String(card.id || ""))));
  }

  function collectSeenCardsByTier(game) {
    var seen = normalizeSeenCards(game && game.seen_cards);
    function add(card) {
      var local = localDevelopmentCardFor(card);
      if (local && seen[local.tier].indexOf(local.id) < 0) seen[local.tier].push(local.id);
    }
    [1, 2, 3].forEach(function (tier) {
      (game && game.market && game.market[tier] || []).forEach(add);
    });
    (game && game.players || []).forEach(function (player) {
      (player.reserved || []).forEach(add);
      (player.purchased || []).forEach(add);
    });
    if (game) game.seen_cards = clone(seen);
    return seen;
  }

  function rebuildUnknownBgaDecksForLive(game) {
    if (!game || !game.decks || !game.market) return;
    var hasUnknown = !!game.bga_deck_unknown;
    [1, 2, 3].forEach(function (tier) {
      hasUnknown = hasUnknown ||
        (game.decks[tier] || []).some(isBgaHiddenCard) ||
        (game.market[tier] || []).some(isBgaHiddenCard);
    });
    if (!hasUnknown) return;
    var seen = collectSeenCardsByTier(game);
    var existingSeed = Number(game.table_seed);
    var seed = Number.isFinite(existingSeed) ? existingSeed : generateTableSeed();
    game.table_seed = seed;
    game.deck_draw_state = normalizeDeckDrawState(game.deck_draw_state);
    [1, 2, 3].forEach(function (tier) {
      var hiddenMarketSlots = [];
      (game.market[tier] || []).forEach(function (card, index) {
        if (isBgaHiddenCard(card)) hiddenMarketSlots.push(index);
      });
      var candidates = (DEVELOPMENT_CARDS[tier] || []).filter(function (card) {
        return seen[tier].indexOf(card.id) < 0;
      }).map(clone);
      game.decks[tier] = candidates;
      game.deck_draw_state[BASE_MARKET_ID][tier] = Math.max(
        game.deck_draw_state[BASE_MARKET_ID][tier] || 0,
        TIER_SIZES[tier] - candidates.length
      );
      hiddenMarketSlots.forEach(function (index) {
        var replacement = drawCardFromDeck(game, BASE_MARKET_ID, tier, { reason: "bga-hidden-market", slot_index: index });
        if (replacement) {
          game.market[tier][index] = replacement;
          rememberSeenCard(game, replacement);
        } else {
          game.market[tier].splice(index, 1);
        }
      });
    });
    game.bga_deck_unknown = false;
    game.bga_continued_deck_seed = seed;
    collectSeenCardsByTier(game);
  }

  function tokenCountForPlayers(playerCount) {
    if (playerCount === 2) return 4;
    if (playerCount === 3) return 5;
    return 7;
  }

  function playerId(index) {
    return "p" + (index + 1);
  }

  function normalizeAiLevel(level) {
    return AI_LEVELS.indexOf(level) >= 0 ? level : "balanced";
  }

  function nextAiSelectionOrder() {
    aiSelectionSequence += 1;
    return aiSelectionSequence;
  }

  function createGame(playerCount, names, aiSettings, options) {
    var tokenCount = tokenCountForPlayers(playerCount);
    var aiConfig = aiSettings || [];
    var tableSeed = normalizeTableSeed(options && options.seed);
    var ruleset = createRuleset(options || {});
    var decks = {
      1: generateDeck(1, TIER_SIZES[1]),
      2: generateDeck(2, TIER_SIZES[2]),
      3: generateDeck(3, TIER_SIZES[3])
    };
    var orientDecks = orientEnabledForRuleset(ruleset) ? {
      1: generateOrientDeck(1),
      2: generateOrientDeck(2),
      3: generateOrientDeck(3)
    } : emptyTieredMarket();
    var game = {
      schema: SCHEMA,
      created_at: new Date().toISOString(),
      mode: "live",
      playerCount: playerCount,
      ruleset: ruleset,
      module_state: createModuleState(ruleset),
      table_seed: tableSeed,
      next_move_id: 1,
      players: Array.from({ length: playerCount }, function (_, index) {
        var aiLevel = normalizeAiLevel(aiConfig[index] && (aiConfig[index].level || aiConfig[index].mode));
        return {
          id: playerId(index),
          name: cleanName(names[index], index),
          tokens: emptyCounts(true),
          bonuses: emptyCounts(false),
          reserved: [],
          purchased: [],
          nobles: [],
          ai: {
            enabled: !!(aiConfig[index] && aiConfig[index].enabled),
            mode: aiConfig[index] && aiConfig[index].enabled ? aiLevel : null,
            level: aiLevel,
            selected_order: aiConfig[index] && aiConfig[index].selected_order || (aiConfig[index] && aiConfig[index].enabled ? nextAiSelectionOrder() : null),
            provider: "random",
            available: false
          }
        };
      }),
      bank: emptyCounts(true),
      decks: decks,
      market: { 1: [], 2: [], 3: [] },
      orient_decks: orientDecks,
      orient_market: emptyTieredMarket(),
      deck_draw_state: createDeckDrawState(),
      market_slots: createMarketSlots(),
      strongholds: { placements: {} },
      seen_cards: emptySeenCards(),
      nobles: shuffle(NOBLE_POOL, tableSeed + 9111).slice(0, playerCount + 1),
      current: 0,
      round: 1,
      log: [],
      moves: [],
      initial_gamedatas: null,
      awaitingDiscard: false,
      awaitingOrientAction: null,
      awaitingStrongholdAction: null,
      awaitingStrongholdConquest: null,
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
      rememberSeenCards(game, game.market[tier]);
      if (orientEnabledForRuleset(game.ruleset)) refillOrientMarket(game, tier);
    });
    if (orientEnabledForRuleset(game.ruleset)) setOrientDecksInitialized(game);
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
      game.market[tier].push(drawCardFromDeck(game, BASE_MARKET_ID, tier, { reason: "initial-market", slot_index: game.market[tier].length }));
    }
  }

  function refillOrientMarket(game, tier) {
    if (!game.orient_market) game.orient_market = emptyTieredMarket();
    if (!game.orient_decks) game.orient_decks = emptyTieredMarket();
    while (game.orient_market[tier].length < ORIENT_MARKET_SLOT_COUNT && game.orient_decks[tier].length > 0) {
      game.orient_market[tier].push(drawCardFromDeck(game, ORIENT_MARKET_ID, tier, { reason: "initial-market", slot_index: game.orient_market[tier].length }));
    }
  }

  function fillMarketSlot(game, tier, index) {
    if (!game || !game.market[tier]) return null;
    var replacement = game.decks[tier] && game.decks[tier].length ? drawCardFromDeck(game, BASE_MARKET_ID, tier, { reason: "market-refill", slot_index: index }) : null;
    if (replacement) {
      game.market[tier][index] = replacement;
      rememberSeenCard(game, replacement);
      return replacement;
    }
    game.market[tier].splice(index, 1);
    removeMarketSlotId(game, BASE_MARKET_ID, tier, index);
    return null;
  }

  function fillOrientMarketSlot(game, tier, index) {
    if (!game || !game.orient_market || !game.orient_market[tier]) return null;
    var replacement = game.orient_decks[tier] && game.orient_decks[tier].length ? drawCardFromDeck(game, ORIENT_MARKET_ID, tier, { reason: "market-refill", slot_index: index }) : null;
    if (replacement) {
      game.orient_market[tier][index] = replacement;
      rememberSeenCard(game, replacement);
      return replacement;
    }
    game.orient_market[tier].splice(index, 1);
    removeMarketSlotId(game, ORIENT_MARKET_ID, tier, index);
    return null;
  }

  function parseMarketActionValue(value) {
    var parts = String(value || "").split(":");
    var marketId = parts.length === 3 ? parts[0] : BASE_MARKET_ID;
    return {
      marketId: marketId === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID,
      tier: Number(parts.length === 3 ? parts[1] : parts[0]),
      index: Number(parts.length === 3 ? parts[2] : parts[1])
    };
  }

  function parseDeckActionValue(value) {
    var parts = String(value || "").split(":");
    if (parts.length >= 2 && parts[0] === ORIENT_MARKET_ID) {
      return { marketId: ORIENT_MARKET_ID, tier: Number(parts[1]) || 1 };
    }
    return { marketId: BASE_MARKET_ID, tier: Number(parts[0]) || 1 };
  }

  function marketCardAt(game, ref) {
    var market = ref.marketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
    return market && market[ref.tier] && market[ref.tier][ref.index];
  }

  function fillMarketSlotById(game, ref) {
    if (ref.marketId === ORIENT_MARKET_ID) return fillOrientMarketSlot(game, ref.tier, ref.index);
    return fillMarketSlot(game, ref.tier, ref.index);
  }

  function ensureStrongholds(game) {
    if (!game.strongholds || typeof game.strongholds !== "object") game.strongholds = { placements: {} };
    if (!game.strongholds.placements || typeof game.strongholds.placements !== "object") game.strongholds.placements = {};
    if (!game.strongholds.tokens || typeof game.strongholds.tokens !== "object") game.strongholds.tokens = {};
    return game.strongholds;
  }

  function strongholdsAtSlot(game, slotId) {
    var strongholds = ensureStrongholds(game);
    if (!Array.isArray(strongholds.placements[slotId])) strongholds.placements[slotId] = [];
    var holders = strongholds.placements[slotId];
    for (var index = holders.length - 1; index >= 0; index -= 1) {
      var playerIndex = Number(holders[index]);
      if (!Number.isInteger(playerIndex) || !game.players[playerIndex]) {
        holders.splice(index, 1);
      } else {
        holders[index] = playerIndex;
      }
    }
    return holders;
  }

  function strongholdSummaryFromHolders(holders, perspective) {
    var summary = {
      players: [],
      counts: {},
      count: 0,
      owner: "",
      locked: false
    };
    (Array.isArray(holders) ? holders : []).forEach(function (holder) {
      var playerIndex = Number(holder);
      if (!Number.isInteger(playerIndex)) return;
      summary.counts[playerIndex] = (summary.counts[playerIndex] || 0) + 1;
      summary.count += 1;
    });
    summary.players = Object.keys(summary.counts).map(function (key) {
      return Number(key);
    }).sort(function (a, b) { return a - b; });
    summary.owner = summary.players.length === 1 ? String(summary.players[0]) : "";
    summary.locked = summary.players.some(function (playerIndex) {
      return Number.isInteger(Number(perspective)) && playerIndex !== Number(perspective);
    });
    return summary;
  }

  function strongholdSlotSummary(game, slotId, perspective) {
    if (!game || !slotId) return strongholdSummaryFromHolders([], perspective);
    return strongholdSummaryFromHolders(strongholdsAtSlot(game, slotId), perspective);
  }

  function strongholdDataAttrs(summary) {
    summary = summary || strongholdSummaryFromHolders([], null);
    var players = summary.players || [];
    var counts = players.map(function (playerIndex) {
      return playerIndex + ":" + (summary.counts && summary.counts[playerIndex] || 0);
    }).join(",");
    return [
      ' data-stronghold-players="' + escapeHtml(players.join(",")) + '"',
      ' data-stronghold-count="' + escapeHtml(summary.count || 0) + '"',
      ' data-stronghold-owner="' + escapeHtml(summary.owner || "") + '"',
      ' data-stronghold-counts="' + escapeHtml(counts) + '"',
      ' data-stronghold-locked="' + (summary.locked ? "true" : "false") + '"'
    ].join("");
  }

  function strongholdBadgeHtml(summary) {
    summary = summary || strongholdSummaryFromHolders([], null);
    if (!summary.count) return "";
    return '<div class="stronghold-stack" data-stronghold-count="' + escapeHtml(summary.count) + '">' + summary.players.map(function (playerIndex) {
      var color = strongholdPlayerColor(playerIndex);
      var count = summary.counts[playerIndex] || 0;
      return [
        '<span class="stronghold-token" data-player-index="' + playerIndex + '" data-stronghold-count="' + count + '" style="' + gemStyle(color) + '">',
        '<span class="stronghold-token-symbol">' + escapeHtml(playerStrongholdSymbol(playerIndex)) + "</span>",
        '<span class="stronghold-token-count">' + escapeHtml(count) + "</span>",
        "</span>"
      ].join("");
    }).join("") + "</div>";
  }

  function clearStrongholdsAtSlot(game, slotId) {
    if (!slotId || !game || !game.strongholds || !game.strongholds.placements) return [];
    var removed = strongholdsAtSlot(game, slotId).slice();
    delete game.strongholds.placements[slotId];
    Object.keys(game.strongholds.tokens || {}).forEach(function (tokenId) {
      var token = game.strongholds.tokens[tokenId];
      if (token && token.slot_id === slotId) {
        token.location = "draw";
        token.slot_id = null;
        token.card_bga_id = "";
      }
    });
    return removed;
  }

  function playerStrongholdsOnBoard(game, playerIndex) {
    var placements = ensureStrongholds(game).placements;
    return Object.keys(placements).reduce(function (count, slotId) {
      return count + strongholdsAtSlot(game, slotId).filter(function (index) { return index === playerIndex; }).length;
    }, 0);
  }

  function playerStrongholdSupply(game, playerIndex) {
    return Math.max(0, 3 - playerStrongholdsOnBoard(game, playerIndex));
  }

  function strongholdPlayerColor(playerIndex) {
    return COLORS[playerIndex % COLORS.length];
  }

  function playerStrongholdSymbol(playerIndex) {
    return ["◆", "▲", "●", "■"][playerIndex % 4];
  }

  function strongholdSlotHasOpponent(game, slotId, playerIndex) {
    return strongholdsAtSlot(game, slotId).some(function (holder) {
      return holder !== playerIndex;
    });
  }

  function playerStrongholdSymbol(playerIndex) {
    return String((Number(playerIndex) || 0) + 1);
  }

  function canPlaceOrMoveStrongholdToSlot(game, slotId, playerIndex) {
    var holders = strongholdsAtSlot(game, slotId);
    if (holders.some(function (holder) { return holder !== playerIndex; })) return false;
    return holders.filter(function (holder) { return holder === playerIndex; }).length < 3;
  }

  function canRemoveOpponentStrongholdAtSlot(game, slotId, playerIndex) {
    var holders = strongholdsAtSlot(game, slotId);
    return holders.length === 1 && holders[0] !== playerIndex;
  }

  function strongholdConquestSlotEligible(game, slotId, playerIndex) {
    var holders = strongholdsAtSlot(game, slotId);
    return holders.length === 3 && holders.every(function (holder) { return holder === playerIndex; });
  }

  function strongholdAccessStatus(slotId, playerIndex) {
    if (!state || !strongholdsEnabledForRuleset(state.ruleset) || !slotId) return { ok: true };
    var summary = strongholdSlotSummary(state, slotId, playerIndex);
    if (!summary.count || !summary.locked) return { ok: true };
    return { ok: false, reason: t("strongholdBlocked") };
  }

  function strongholdActionKindForSlot(slotId, playerIndex) {
    if (!state || !state.awaitingStrongholdAction || !slotId) return "";
    var selectedSource = state.awaitingStrongholdAction.selected_source_slot_id || "";
    if (selectedSource) {
      if (selectedSource === slotId) return "source";
      return canPlaceOrMoveStrongholdToSlot(state, slotId, playerIndex) ? "move-target" : "";
    }
    if (playerStrongholdSupply(state, playerIndex) > 0 && canPlaceOrMoveStrongholdToSlot(state, slotId, playerIndex)) {
      return "place";
    }
    if (strongholdsAtSlot(state, slotId).indexOf(playerIndex) >= 0) return "source";
    if (canRemoveOpponentStrongholdAtSlot(state, slotId, playerIndex)) return "remove";
    return "";
  }

  function marketRefsForStrongholds(game) {
    var refs = [];
    [BASE_MARKET_ID, ORIENT_MARKET_ID].forEach(function (marketId) {
      if (marketId === ORIENT_MARKET_ID && !orientEnabledForRuleset(game.ruleset)) return;
      var market = marketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
      [3, 2, 1].forEach(function (tier) {
        (market[tier] || []).forEach(function (card, index) {
          if (!card) return;
          refs.push({ marketId: marketId, tier: tier, index: index, card: card, slotId: marketSlotId(game, marketId, tier, index) });
        });
      });
    });
    return refs;
  }

  function activePlayer() {
    return state && state.players[state.current];
  }

  function isAiPlayer(player) {
    return !!(player && player.ai && player.ai.enabled);
  }

  function aiToggleLockedForPlayer(playerIndex) {
    var player = state && state.players && state.players[playerIndex];
    return !!(state && state.mode !== "replay" && !state.gameOver && state.current === playerIndex && isAiPlayer(player));
  }

  function fallbackVisiblePlayerIndex() {
    if (!state || !state.players.length) return 0;
    if (typeof aiDisplayCurrentOverride === "number") return aiDisplayCurrentOverride;
    if (typeof lastHumanPlayerIndex === "number" && state.players[lastHumanPlayerIndex]) return lastHumanPlayerIndex;
    return (state.current + state.players.length - 1) % state.players.length;
  }

  function displayCurrentIndex() {
    if (!state) return 0;
    if (state.aiThinking && typeof state.aiThinking.display_current === "number") {
      return state.aiThinking.display_current;
    }
    if (state.turnTransition && typeof state.turnTransition.display_current === "number") {
      return state.turnTransition.display_current;
    }
    if (isAiPlayer(activePlayer())) return fallbackVisiblePlayerIndex();
    return state.current;
  }

  function displayPlayer() {
    return state && state.players[displayCurrentIndex()] || activePlayer();
  }

  function scoreFor(player) {
    return player.purchased.reduce(function (sum, card) {
      return sum + card.points;
    }, 0) + player.nobles.reduce(function (sum, noble) {
      return sum + noble.points;
    }, 0);
  }

  function cardIsOrient(card) {
    return !!(card && card.module === ORIENT_MARKET_ID);
  }

  function orientCardAbilities(card, effect) {
    var abilities = Array.isArray(card && card.abilities) ? card.abilities : [];
    return effect ? abilities.filter(function (ability) { return ability && ability.effect === effect; }) : abilities;
  }

  function orientCardHasAbility(card, effect) {
    return orientCardAbilities(card, effect).length > 0;
  }

  function cardPrimaryBonusColor(card) {
    var bonuses = effectiveCardBonuses(card);
    return COLORS.find(function (color) { return bonuses[color] > 0; }) || "";
  }

  function orientDiscardCost(card) {
    if (!cardIsOrient(card) || !card.orient_cost_card) return null;
    var color = card.orient_cost_card.color;
    var count = Number(card.orient_cost_card.count) || 2;
    return COLORS.indexOf(color) >= 0 ? { color: color, count: count } : null;
  }

  function orientDiscardCostCandidates(player, card) {
    var requirement = orientDiscardCost(card);
    if (!player || !requirement) return [];
    return (player.purchased || []).filter(function (candidate) {
      return candidate && candidate.id !== card.id && cardPrimaryBonusColor(candidate) === requirement.color;
    }).sort(function (a, b) {
      var aCopied = a.copied_color === requirement.color ? 0 : 1;
      var bCopied = b.copied_color === requirement.color ? 0 : 1;
      return aCopied - bCopied || String(a.id).localeCompare(String(b.id));
    });
  }

  function orientDiscardSelectionHasPriority(player, card, selectedIds) {
    var requirement = orientDiscardCost(card);
    if (!requirement) return true;
    var priorityIds = orientDiscardCostCandidates(player, card).filter(function (candidate) {
      return candidate.copied_color === requirement.color;
    }).map(function (candidate) {
      return candidate.id;
    });
    var requiredPriority = priorityIds.slice(0, Math.min(priorityIds.length, requirement.count));
    return requiredPriority.every(function (cardId) {
      return selectedIds.indexOf(cardId) >= 0;
    });
  }

  function orientCopyCandidates(player, card) {
    if (!player || !orientCardHasAbility(card, "copy_bonus")) return [];
    return (player.purchased || []).filter(function (candidate) {
      return candidate && candidate.id !== card.id && !!cardPrimaryBonusColor(candidate);
    });
  }

  function orientCardNeedsManualChoice(card) {
    return cardIsOrient(card) && (orientCardHasAbility(card, "copy_bonus") || orientCardHasAbility(card, "take_level_free"));
  }

  function orientAbilityBuyStatus(card, player) {
    if (!cardIsOrient(card)) return { ok: true, reason: "" };
    if (player && orientCardHasAbility(card, "copy_bonus") && orientCopyCandidates(player, card).length === 0) {
      return { ok: false, reason: t("msgOrientCopyNeedsBonus") };
    }
    var discardCost = orientDiscardCost(card);
    if (player && discardCost && orientDiscardCostCandidates(player, card).length < discardCost.count) {
      return { ok: false, reason: t("msgOrientDiscardNeedsCards", { count: discardCost.count, color: TOKEN_LABEL[discardCost.color] }) };
    }
    return { ok: true, reason: "" };
  }

  function orientAbilityBuyStatusLegacy(card) {
    if (!cardIsOrient(card)) return { ok: true, reason: "" };
    var abilities = Array.isArray(card.abilities) ? card.abilities : [];
    var safeEffects = ["double_bonus", "virtual_gold_placeholder", "no_bonus_placeholder", "metadata"];
    for (var index = 0; index < abilities.length; index += 1) {
      var ability = abilities[index] || {};
      var effect = String(ability.effect || "");
      var status = String(ability.status || "");
      var safe = status === "implemented" || status === "metadata" || ability.immediate_choice === false || safeEffects.indexOf(effect) >= 0;
      var pendingChoice = ability.requires_choice === true || (status === "pending" && ability.immediate_choice !== false && safeEffects.indexOf(effect) < 0);
      if (!safe || pendingChoice) {
        return { ok: false, reason: t("orientAbilityPending") };
      }
    }
    return { ok: true, reason: "" };
  }

  function effectiveCardBonuses(card) {
    var bonuses = emptyCounts(false);
    if (!card) return bonuses;
    if (cardIsOrient(card)) {
      if (card.copied_color && COLORS.indexOf(card.copied_color) >= 0) {
        bonuses[card.copied_color] = 1;
        return bonuses;
      }
      var explicit = card.orient_effective && card.orient_effective.bonus || card.effective_bonuses;
      COLORS.forEach(function (color) {
        bonuses[color] = Math.max(0, Number(explicit && explicit[color]) || 0);
      });
      (card.abilities || []).forEach(function (ability) {
        if (!ability || (ability.effect !== "double_bonus" && ability.effect !== "fixed_bonus")) return;
        var color = ability.bonus_color || card.printed_color || card.color;
        if (COLORS.indexOf(color) >= 0 && bonuses[color] === 0) {
          bonuses[color] = Math.max(1, Number(ability.bonus_count) || (ability.effect === "double_bonus" ? 2 : 1));
        }
      });
      var fallbackColor = card.printed_color || card.color;
      if (!COLORS.some(function (color) { return bonuses[color] > 0; }) && COLORS.indexOf(fallbackColor) >= 0) {
        bonuses[fallbackColor] = Math.max(1, Number(card.bga_carddb && card.bga_carddb.nbBonus) || 1);
      }
      return bonuses;
    }
    if (COLORS.indexOf(card.color) >= 0) bonuses[card.color] = 1;
    return bonuses;
  }

  function orientVirtualGoldMetadata(card) {
    if (!cardIsOrient(card)) return null;
    var hasVirtualGold = !!(card.orient_effective && card.orient_effective.virtual_gold);
    (card.abilities || []).forEach(function (ability) {
      if (ability && (ability.effect === "virtual_gold_placeholder" || ability.effect === "virtual_gold_2")) hasVirtualGold = true;
    });
    return hasVirtualGold ? {
      card_id: card.id,
      value: 2,
      status: "available",
      source: ORIENT_MARKET_ID
    } : null;
  }

  function ensurePlayerOrientEffects(player) {
    if (!player.orient_effects || typeof player.orient_effects !== "object") {
      player.orient_effects = { virtual_gold_cards: [] };
    }
    if (!Array.isArray(player.orient_effects.virtual_gold_cards)) player.orient_effects.virtual_gold_cards = [];
    return player.orient_effects;
  }

  function applyCardBonuses(player, card) {
    var bonuses = effectiveCardBonuses(card);
    COLORS.forEach(function (color) {
      player.bonuses[color] = (Number(player.bonuses[color]) || 0) + (bonuses[color] || 0);
    });
    var virtualGold = orientVirtualGoldMetadata(card);
    if (virtualGold) {
      var effects = ensurePlayerOrientEffects(player);
      if (!effects.virtual_gold_cards.some(function (entry) { return entry.card_id === virtualGold.card_id; })) {
        effects.virtual_gold_cards.push(virtualGold);
      }
    }
    return bonuses;
  }

  function removeCardBonuses(player, card) {
    var bonuses = effectiveCardBonuses(card);
    COLORS.forEach(function (color) {
      player.bonuses[color] = Math.max(0, (Number(player.bonuses[color]) || 0) - (bonuses[color] || 0));
    });
    var virtualGold = orientVirtualGoldMetadata(card);
    if (virtualGold && player.orient_effects && Array.isArray(player.orient_effects.virtual_gold_cards)) {
      player.orient_effects.virtual_gold_cards = player.orient_effects.virtual_gold_cards.filter(function (entry) {
        return entry.card_id !== virtualGold.card_id;
      });
    }
    return bonuses;
  }

  function purchaseRecordCard(card) {
    if (!cardIsOrient(card)) return card;
    var record = clone(card);
    record.effective_bonuses = effectiveCardBonuses(card);
    var virtualGold = orientVirtualGoldMetadata(card);
    if (virtualGold) record.orient_payment_effect = virtualGold;
    return record;
  }

  function availableOrientVirtualGoldCards(player) {
    return (player && player.purchased || []).filter(function (card) {
      return !!orientVirtualGoldMetadata(card);
    });
  }

  function orientVirtualGoldCapacity(player) {
    return availableOrientVirtualGoldCards(player).reduce(function (sum, card) {
      var meta = orientVirtualGoldMetadata(card);
      return sum + (Number(meta && meta.value) || 0);
    }, 0);
  }

  function orientVirtualGoldCardCount(player) {
    return availableOrientVirtualGoldCards(player).length;
  }

  function orientVirtualGoldPaymentCapacity(player) {
    return orientVirtualGoldCardCount(player) > 0 ? 2 : 0;
  }

  function selectedVirtualGoldCardIds(player, payment) {
    var availableIds = availableOrientVirtualGoldCards(player).map(function (card) { return card.id; });
    var selected = Array.isArray(payment && payment.selected_virtual_card_ids) ? payment.selected_virtual_card_ids : [];
    return selected.filter(function (cardId, index) {
      return selected.indexOf(cardId) === index && availableIds.indexOf(cardId) >= 0;
    }).slice(0, 1);
  }

  function selectedVirtualGoldValue(player, payment) {
    return selectedVirtualGoldCardIds(player, payment).reduce(function (sum, cardId) {
      var card = availableOrientVirtualGoldCards(player).find(function (candidate) { return candidate.id === cardId; });
      var meta = orientVirtualGoldMetadata(card);
      return sum + (Number(meta && meta.value) || 0);
    }, 0);
  }

  function paymentVirtualCards(player, payment) {
    if (paymentVirtualTotal(payment) <= 0) return [];
    var selected = selectedVirtualGoldCardIds(player, payment);
    if (selected.length) return selected;
    return availableOrientVirtualGoldCards(player).slice(0, 1).map(function (card) { return card.id; });
  }

  function removePurchasedCardsByIds(player, cardIds) {
    var removed = [];
    (cardIds || []).forEach(function (cardId) {
      var index = (player.purchased || []).findIndex(function (card) {
        return card && card.id === cardId;
      });
      if (index < 0) return;
      var card = player.purchased.splice(index, 1)[0];
      removeCardBonuses(player, card);
      removed.push(card);
    });
    return removed;
  }

  function totalTokens(player) {
    return ALL_TOKENS.reduce(function (sum, color) {
      return sum + (Number(player.tokens[color]) || 0);
    }, 0);
  }

  function canAct(options) {
    var allowAi = !!(options && options.allowAi) || aiTurnInProgress;
    return !!state && state.mode !== "replay" && !state.gameOver && !state.turnTransition && (allowAi || !state.aiThinking) && (allowAi || !isAiPlayer(activePlayer())) && !state.awaitingDiscard && !state.awaitingNobleChoice && !pendingPayment && !state.awaitingOrientAction && !state.awaitingStrongholdAction && !state.awaitingStrongholdConquest;
  }

  function aiSelectionOrder(player, index) {
    var order = Number(player && player.ai && player.ai.selected_order);
    return Number.isFinite(order) && order > 0 ? order : index + 1;
  }

  function enabledAiSeats(game) {
    var seats = [];
    (game && game.players || []).forEach(function (player, index) {
      if (player.ai && player.ai.enabled) seats.push(index);
    });
    return seats;
  }

  function dinoBoardAiSeatFor(game) {
    if (!game || game.players.length !== 2 || !dinoBoardSupportsRuleset(game.ruleset)) return -1;
    var seats = enabledAiSeats(game);
    if (!seats.length) return -1;
    seats.sort(function (a, b) {
      return aiSelectionOrder(game.players[a], a) - aiSelectionOrder(game.players[b], b) || a - b;
    });
    return seats[0];
  }

  function aiProviderForPlayer(game, playerIndex) {
    var player = game && game.players && game.players[playerIndex];
    if (!player || !player.ai || !player.ai.enabled) return "";
    return dinoBoardAiSeatFor(game) === playerIndex ? "dinoboard" : "random";
  }

  function activeAiProviderName() {
    return state ? aiProviderForPlayer(state, state.current) : "";
  }

  function aiMoveArgs(args) {
    if (!aiTurnInProgress) return args || {};
    return Object.assign({}, args || {}, {
      ai: true,
      ai_provider: activeAiProvider || activeAiProviderName() || "random"
    });
  }

  function syncDinoBoardAiAvailability(game) {
    var aiSeat = dinoBoardAiSeatFor(game);
    (game && game.players || []).forEach(function (player, index) {
      if (!player.ai) return;
      if (player.ai.enabled && !player.ai.selected_order) player.ai.selected_order = aiSelectionOrder(player, index);
      player.ai.provider = player.ai.enabled ? (index === aiSeat ? "dinoboard" : "random") : "random";
      player.ai.available = player.ai.enabled && index === aiSeat;
    });
    return aiSeat;
  }

  function closeDinoBoardSession() {
    var existing = dinoboardAi;
    dinoboardAi = null;
    if (!existing || !existing.sessionId) return;
    try {
      fetch(existing.apiBase + "/ai/sessions/" + encodeURIComponent(existing.sessionId), { method: "DELETE" });
    } catch (error) {
      // Best-effort cleanup only.
    }
  }

  function setDinoBoardUnavailable(message) {
    if (dinoboardAi) dinoboardAi.disabled = true;
    else dinoboardAi = { apiBase: dinoboardApiBase(), aiSeat: -1, sessionId: "", pending: Promise.resolve(), observed: {}, disabled: true };
    if (state && state.players) {
      state.players.forEach(function (player) {
        if (player.ai) player.ai.available = false;
      });
    }
    if (message) showMessage(t("msgDinoBoardUnavailable", { message: message }));
  }

  function dinoFetchJson(path, options) {
    var ai = dinoboardAi;
    if (!ai) return Promise.reject(new Error("DinoBoard AI is not configured."));
    return fetch(ai.apiBase + path, Object.assign({
      method: "GET",
      headers: { "Content-Type": "application/json" }
    }, options || {})).then(function (response) {
      return response.text().then(function (text) {
        var body = text ? JSON.parse(text) : {};
        if (!response.ok) {
          throw new Error(body && body.detail || response.status + " " + response.statusText);
        }
        return body;
      });
    });
  }

  function previousMoveSourceState() {
    if (!state) return null;
    if (state.moves && state.moves.length) {
      var last = state.moves[state.moves.length - 1];
      return last && last.state_after && (last.state_after.source_state || last.state_after);
    }
    return state.initial_gamedatas && (state.initial_gamedatas.source_state || state.initial_gamedatas);
  }

  function moveActorIndex(move, beforeState) {
    var players = beforeState && beforeState.players || state && state.players || [];
    return players.findIndex(function (player) {
      return String(player.id) === String(move.player_id);
    });
  }

  function dinoTakeComboIndex(combos, colors) {
    var ordered = colors.slice().sort(function (a, b) { return COLORS.indexOf(a) - COLORS.indexOf(b); }).join("|");
    var index = combos.findIndex(function (combo) { return combo.join("|") === ordered; });
    if (index < 0) throw new Error("Unsupported token combo " + ordered);
    return index;
  }

  var DINO_TAKE_THREE = [
    ["white", "blue", "green"], ["white", "blue", "red"], ["white", "blue", "black"],
    ["white", "green", "red"], ["white", "green", "black"], ["white", "red", "black"],
    ["blue", "green", "red"], ["blue", "green", "black"], ["blue", "red", "black"],
    ["green", "red", "black"]
  ];
  var DINO_TAKE_TWO = [
    ["white", "blue"], ["white", "green"], ["white", "red"], ["white", "black"],
    ["blue", "green"], ["blue", "red"], ["blue", "black"],
    ["green", "red"], ["green", "black"],
    ["red", "black"]
  ];

  function encodeDinoBoardAction(move, beforeState) {
    var args = move.args || {};
    if (move.type === "buyMarket") return Number(args.tier - 1) * 4 + Number(firstDefined(args.market_index, args.index, 0));
    if (move.type === "reserveMarket") return 12 + Number(args.tier - 1) * 4 + Number(firstDefined(args.market_index, args.index, 0));
    if (move.type === "reserveDeck") return 24 + Number(args.tier - 1);
    if (move.type === "buyReserved") return 27 + Number(firstDefined(args.reserved_index, args.index, 0));
    if (move.type === "discardToken") return 63 + ALL_TOKENS.indexOf(args.color);
    if (move.type === "chooseNoble") {
      var slot = firstDefined(args.noble_slot, args.index);
      if (slot === undefined && beforeState && beforeState.nobles) {
        slot = beforeState.nobles.findIndex(function (noble) {
          return noble && (noble.id === args.noble_id || noble.name === args.noble_id);
        });
      }
      return 60 + Math.max(0, Number(slot) || 0);
    }
    if (move.type === "takeTokens") {
      var counts = emptyCounts(false);
      (args.colors || []).forEach(function (color) {
        if (COLORS.indexOf(color) >= 0) counts[color] += 1;
      });
      var colors = COLORS.filter(function (color) { return counts[color] > 0; });
      if (colors.length === 3 && colors.every(function (color) { return counts[color] === 1; })) return 30 + dinoTakeComboIndex(DINO_TAKE_THREE, colors);
      if (colors.length === 2 && colors.every(function (color) { return counts[color] === 1; })) return 40 + dinoTakeComboIndex(DINO_TAKE_TWO, colors);
      if (colors.length === 1 && counts[colors[0]] === 1) return 50 + COLORS.indexOf(colors[0]);
      if (colors.length === 1 && counts[colors[0]] === 2) return 55 + COLORS.indexOf(colors[0]);
    }
    if (move.type === "pass") return 69;
    throw new Error("Unsupported action for DinoBoard observe: " + move.type);
  }

  function dinoBoardEvents(beforeState, afterState, move, aiSeat) {
    var events = [];
    var before = beforeState ? buildDinoBoardSnapshotFields(beforeState) : null;
    var after = afterState ? buildDinoBoardSnapshotFields(afterState) : null;
    if (before && after) {
      after.tableau.forEach(function (row, tier) {
        row.forEach(function (cardId, slot) {
          if (cardId !== before.tableau[tier][slot]) {
            events.push({ kind: "deck_flip", payload: { tier: tier, slot: slot, card_id: cardId } });
          }
        });
      });
    }
    var actorIndex = moveActorIndex(move, beforeState);
    if (move.type === "reserveDeck" && actorIndex === aiSeat) {
      var reserved = afterState.players[actorIndex].reserved || [];
      var card = reserved[reserved.length - 1];
      events.push({ kind: "self_reserve_deck", payload: { player: actorIndex, slot: reserved.length - 1, card_id: gemTableCardToDinoId(card) } });
    }
    if (move.type === "buyReserved" && actorIndex !== aiSeat && beforeState && beforeState.players[actorIndex]) {
      var index = Number(firstDefined((move.args || {}).reserved_index, (move.args || {}).index, 0));
      var beforeCard = beforeState.players[actorIndex].reserved[index];
      if (beforeCard && (beforeCard.reserved_public === false || beforeCard.reserved_from === "deck")) {
        events.push({ kind: "opp_buy_reserved_reveal", payload: { player: actorIndex, slot: index, card_id: gemTableCardToDinoId(beforeCard) } });
      }
    }
    return events;
  }

  function observeDinoBoardMove(move, beforeState, afterState) {
    if (!dinoboardAi || dinoboardAi.disabled || !move || !afterState) return Promise.resolve();
    var moveKey = String(move.move_id);
    if (dinoboardAi.observed[moveKey]) return Promise.resolve();
    var payload = {
      action_id: encodeDinoBoardAction(move, beforeState),
      events: dinoBoardEvents(beforeState, afterState, move, dinoboardAi.aiSeat),
      public_snapshot: buildDinoBoardPublicSnapshot(afterState, dinoboardAi.aiSeat)
    };
    return dinoFetchJson("/ai/sessions/" + encodeURIComponent(dinoboardAi.sessionId) + "/observe", {
      method: "POST",
      body: JSON.stringify(payload)
    }).then(function () {
      dinoboardAi.observed[moveKey] = true;
    });
  }

  function queueDinoBoardObserve(move, beforeState, afterState) {
    if (!state || !dinoboardAi || dinoboardAi.disabled) return;
    var queuedMove = clone(move);
    var queuedBefore = clone(beforeState);
    var queuedAfter = clone(afterState);
    dinoboardAi.pending = dinoboardAi.pending.then(function () {
      return ensureDinoBoardSession();
    }).then(function () {
      return observeDinoBoardMove(queuedMove, queuedBefore, queuedAfter);
    }).catch(function (error) {
      setDinoBoardUnavailable(error.message);
      render();
    });
  }

  function createDinoBoardSession() {
    if (!state) return Promise.resolve();
    var aiSeat = syncDinoBoardAiAvailability(state);
    if (aiSeat < 0) {
      dinoboardAi = null;
      return Promise.resolve();
    }
    var baseState = state.initial_gamedatas && (state.initial_gamedatas.source_state || state.initial_gamedatas) || compactSourceState(state);
    dinoboardAi = {
      apiBase: dinoboardApiBase(),
      aiSeat: aiSeat,
      sessionId: "",
      pending: Promise.resolve(),
      observed: {},
      disabled: false
    };
    var ai = dinoboardAi;
    var aiPlayer = state.players[aiSeat];
    var creation = dinoFetchJson("/ai/sessions", {
      method: "POST",
      body: JSON.stringify({
        game_id: "splendor_2p",
        my_seat: aiSeat,
        strength: normalizeAiLevel(aiPlayer && aiPlayer.ai && (aiPlayer.ai.level || aiPlayer.ai.mode)),
        initial_observation: dinoBoardInitialObservation(baseState, aiSeat)
      })
    }).then(function (session) {
      if (dinoboardAi !== ai) throw new Error("DinoBoard AI session was replaced.");
      ai.sessionId = session.session_id;
      var previous = baseState;
      var chain = Promise.resolve();
      (state.moves || []).forEach(function (move) {
        var after = move.state_after && (move.state_after.source_state || move.state_after);
        if (!after) return;
        var before = previous;
        chain = chain.then(function () {
          return observeDinoBoardMove(move, before, after);
        });
        previous = after;
      });
      return chain;
    }).then(function () {
      var player = state && state.players && state.players[aiSeat];
      if (player) showMessage(t("msgDinoBoardAiEnabled", { player: player.name }), "ok");
    }).catch(function (error) {
      setDinoBoardUnavailable(error.message);
      throw error;
    });
    ai.pending = creation;
    return creation;
  }

  function ensureDinoBoardSession() {
    if (!state || dinoBoardAiSeatFor(state) < 0) return Promise.reject(new Error("DinoBoard AI requires a 2-player table; unsupported AI seats use random AI."));
    if (dinoboardAi && dinoboardAi.disabled) return Promise.reject(new Error("DinoBoard AI is unavailable."));
    if (dinoboardAi && dinoboardAi.sessionId && !dinoboardAi.disabled) return Promise.resolve();
    if (dinoboardAi && dinoboardAi.pending) return dinoboardAi.pending;
    return createDinoBoardSession();
  }

  function resetDinoBoardAiForCurrentState(notifyUnsupported) {
    closeDinoBoardSession();
    if (!state || state.mode === "replay") return;
    var aiSeat = syncDinoBoardAiAvailability(state);
    var hasAi = (state.players || []).some(function (player) { return player.ai && player.ai.enabled; });
    if (aiSeat < 0) {
      if (hasAi && notifyUnsupported) showMessage(t("aiUnavailableBody"));
      return;
    }
    createDinoBoardSession().then(function () {
      saveState();
      render();
    }).catch(function () {
      saveState();
      render();
    });
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

  function setStartMode(mode) {
    startMode = mode === "replay" ? "replay" : "new";
    if (el.startForm) el.startForm.hidden = startMode !== "new";
    if (el.startReplayPanel) el.startReplayPanel.hidden = startMode !== "replay";
    if (el.startModeNew) {
      el.startModeNew.classList.toggle("active", startMode === "new");
      el.startModeNew.setAttribute("aria-selected", startMode === "new" ? "true" : "false");
    }
    if (el.startModeReplay) {
      el.startModeReplay.classList.toggle("active", startMode === "replay");
      el.startModeReplay.setAttribute("aria-selected", startMode === "replay" ? "true" : "false");
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

  function loadLanguagePreference() {
    var saved = storageGetItem(LANGUAGE_KEY);
    currentLocale = I18N[saved] ? saved : "en";
  }

  function saveLanguagePreference() {
    storageSetItem(LANGUAGE_KEY, currentLocale);
  }

  function saveState() {
    if (!state || state.mode === "replay") return;
    var serialized = "";
    try {
      serialized = JSON.stringify(compactStateForPersistence(state) || state);
    } catch (error) {
      showMessage(t("msgSaveSerializeFailed"));
      return;
    }
    if (!storageSetItem(STORAGE_KEY, serialized)) {
      showMessage(t("msgSaveStorageFailed"));
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
        showStartMessage(t("msgSavedInvalidCleared"));
        return null;
      }
      ensureStateRuleset(parsed);
      parsed.mode = "live";
      return parsed;
    } catch (error) {
      storageRemoveItem(STORAGE_KEY);
      showStartMessage(t("msgSavedParseCleared"));
      return null;
    }
  }

  function validateState(candidate) {
    if (!candidate || candidate.schema !== SCHEMA) return false;
    if (!rulesetSupportedByEngine(candidate.ruleset)) return false;
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
      var row = document.createElement("div");
      row.className = "player-setup-row";
      var label = document.createElement("label");
      var labelText = document.createElement("span");
      labelText.dataset.i18n = "playerName";
      labelText.dataset.i18nN = String(index + 1);
      labelText.textContent = t("playerName", { n: index + 1 });
      var input = document.createElement("input");
      input.name = "playerName";
      input.autocomplete = "off";
      input.maxLength = 28;
      input.dataset.i18nPlaceholder = "playerName";
      input.dataset.i18nN = String(index + 1);
      input.placeholder = t("playerName", { n: index + 1 });
      label.append(labelText);
      label.append(input);
      var aiControl = document.createElement("div");
      aiControl.className = "ai-control";
      var aiLabel = document.createElement("label");
      aiLabel.className = "ai-toggle";
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "playerAi";
      checkbox.value = String(index);
      aiLabel.append(checkbox);
      var aiText = document.createElement("span");
      aiText.dataset.i18n = "aiTakeover";
      aiText.textContent = t("aiTakeover");
      aiLabel.append(aiText);
      var levelLabel = document.createElement("label");
      levelLabel.className = "ai-level";
      var levelText = document.createElement("span");
      levelText.dataset.i18n = "aiLevel";
      levelText.textContent = t("aiLevel");
      var levelSelect = document.createElement("select");
      levelSelect.name = "playerAiLevel";
      [
        ["easy", "aiLevelEasy"],
        ["balanced", "aiLevelBalanced"],
        ["expert", "aiLevelExpert"]
      ].forEach(function (entry) {
        var option = document.createElement("option");
        option.value = entry[0];
        option.dataset.i18n = entry[1];
        option.textContent = t(entry[1]);
        if (entry[0] === "balanced") option.selected = true;
        levelSelect.append(option);
      });
      function syncAiLevel() {
        aiControl.classList.toggle("active", checkbox.checked);
      }
      function handleSetupAiToggle() {
        if (checkbox.checked && !checkbox.dataset.aiSelectedOrder) {
          checkbox.dataset.aiSelectedOrder = String(nextAiSelectionOrder());
        } else if (!checkbox.checked) {
          delete checkbox.dataset.aiSelectedOrder;
        }
        syncAiLevel();
        if (checkbox.checked) showStartMessage(t("msgRandomAiEnabled"), "ok");
      }
      checkbox.addEventListener("change", handleSetupAiToggle);
      checkbox.addEventListener("input", syncAiLevel);
      checkbox.addEventListener("click", syncAiLevel);
      syncAiLevel();
      levelLabel.append(levelText);
      levelLabel.append(levelSelect);
      aiControl.append(aiLabel);
      aiControl.append(levelLabel);
      row.append(label);
      row.append(aiControl);
      el.playerNameFields.append(row);
    }
  }

  function gemStyle(color) {
    if (color === "wild") {
      return "--gem:#b9f7ff;--gem2:#ffbf45";
    }
    return "--gem:" + GEM_HEX[color];
  }

  function colorMarkHtml(color, extraClass) {
    if (color === "wild") {
      return [
        '<span class="wild-element-mark ' + escapeHtml(extraClass || "") + '" aria-label="' + escapeHtml(TOKEN_LABEL.wild) + '">',
        "&#21325;",
        "</span>"
      ].join("");
    }
    return escapeHtml(TOKEN_LABEL[color] || "");
  }

  function queueFlightFromElement(source, color, label, targetSelector) {
    if (!source || !source.getBoundingClientRect) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var rect = source.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pendingFlight = {
      color: color || "gold",
      label: label || "",
      targetSelector: targetSelector || ".active-hand-panel",
      targetElement: targetSelector && targetSelector.getBoundingClientRect ? targetSelector : null,
      from: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: Math.min(rect.width, 120),
        height: Math.min(rect.height, 160)
      }
    };
  }

  function queueFlightFromSelector(selector, color, label, targetSelector) {
    queueFlightFromElement(selector ? document.querySelector(selector) : null, color, label, targetSelector);
  }

  function cardElementForFlight(card) {
    if (!card) return null;
    return Array.from(document.querySelectorAll("[data-card-id]")).find(function (node) {
      return node.dataset.cardId === card.id;
    }) || null;
  }

  function playerPanelTarget(suffix) {
    return '.player-card[data-player-index="' + state.current + '"] ' + suffix;
  }

  function playerPanelTargetForPlayerId(playerId, suffix) {
    var playerIndex = state && state.players ? state.players.findIndex(function (player) {
      return player.id === playerId;
    }) : -1;
    if (playerIndex < 0) playerIndex = state ? state.current : 0;
    return '.player-card[data-player-index="' + playerIndex + '"] ' + suffix;
  }

  function flushPendingFlight() {
    if (!pendingFlight || !document.body) return;
    var flight = pendingFlight;
    pendingFlight = null;
    var schedule = window.requestAnimationFrame || function (callback) {
      return window.setTimeout(callback, 16);
    };
    schedule(function () {
      var target = flight.targetElement;
      if (!target && typeof flight.targetSelector === "string") target = document.querySelector(flight.targetSelector);
      target = target || el.activeHandPanel || el.players;
      if (!target || !target.getBoundingClientRect) return;
      var rect = target.getBoundingClientRect();
      var node = document.createElement("div");
      node.className = "flight-card";
      node.style.setProperty("--gem", GEM_HEX[flight.color] || GEM_HEX.gold);
      node.style.setProperty("--from-x", flight.from.x + "px");
      node.style.setProperty("--from-y", flight.from.y + "px");
      node.style.setProperty("--to-x", rect.left + rect.width / 2 + "px");
      node.style.setProperty("--to-y", rect.top + rect.height / 2 + "px");
      node.style.setProperty("--w", Math.max(62, flight.from.width * 0.82) + "px");
      node.style.setProperty("--h", Math.max(82, flight.from.height * 0.82) + "px");
      node.textContent = flight.label;
      document.body.append(node);
      node.addEventListener("animationend", function () {
        node.remove();
      }, { once: true });
      window.setTimeout(function () {
        if (node.parentNode) node.remove();
      }, 1600);
    });
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
      return '<span class="cost-pill" data-color="' + color + '" style="' + gemStyle(color) + '" aria-label="' + color + " cost " + cost[color] + '"><span class="gem-dot"></span><span>' + cost[color] + "</span></span>";
    });
    return parts.length ? parts.join("") : '<span class="muted">Free</span>';
  }

  function hasCost(cost) {
    return COLORS.some(function (color) {
      return (cost && cost[color] || 0) > 0;
    });
  }

  function requirementHtml(cost) {
    var parts = COLORS.filter(function (color) {
      return (cost[color] || 0) > 0;
    }).map(function (color) {
      return '<span class="requirement-tile" data-color="' + color + '" style="' + gemStyle(color) + '" aria-label="' + color + " requirement " + cost[color] + '"><span>' + cost[color] + "</span></span>";
    });
    return parts.length ? parts.join("") : '<span class="muted">Free</span>';
  }

  function bonusCardsPreviewHtml(player, color) {
    if (!player) return "";
    var cards = player.purchased.filter(function (card) {
      return effectiveCardBonuses(card)[color] > 0;
    });
    var title = t("bonusCardsTitle", { color: TOKEN_LABEL[color] });
    var body = cards.length ? cards.map(function (card) {
      var copyChoice = orientCopyChoiceForPurchasedCard(player, card);
      var copyAttrs = copyChoice ? ' data-orient-copy-card="' + escapeHtml(card.id) + '"' : "";
      return [
        '<span class="bonus-card-row' + (copyChoice ? " orient-copy-target" : "") + '"' + copyAttrs + '>',
        '<span class="bonus-card-main"><strong>' + escapeHtml(card.id) + '</strong><span>' + t("tier") + " " + card.tier + " / " + card.points + " " + t("prestige") + "</span></span>",
        '<span class="bonus-card-cost">' + costHtml(card.cost) + "</span>",
        "</span>"
      ].join("");
    }).join("") : '<span class="muted compact">' + t("bonusCardsEmpty") + "</span>";
    return '<span class="bonus-preview" role="tooltip"><span class="bonus-preview-title">' + escapeHtml(title) + "</span>" + body + "</span>";
  }

  function bonusDisplaySummary(counts, player, color) {
    var total = Number(counts && counts[color]) || 0;
    if (!player || !Array.isArray(player.purchased)) {
      return { cards: total, extra: 0, total: total };
    }
    var cards = 0;
    player.purchased.forEach(function (card) {
      var amount = Number(effectiveCardBonuses(card)[color]) || 0;
      if (amount <= 0) return;
      cards += 1;
    });
    var extra = Math.max(0, total - cards);
    return { cards: cards, extra: extra, total: total };
  }

  function bonusesHtml(counts, player) {
    return COLORS.map(function (color) {
      var previewAttrs = player ? ' data-bonus-preview-toggle="true" tabindex="0" role="button"' : "";
      var summary = bonusDisplaySummary(counts, player, color);
      var extraBadge = summary.extra > 0 ? '<span class="bonus-extra-badge">+' + summary.extra + "</span>" : "";
      var copyColor = orientCopyChoiceForColor(player, color);
      return '<span class="bonus-pill' + (copyColor ? " orient-copy-color" : "") + '" data-color="' + color + '" data-bonus-cards="' + summary.cards + '" data-bonus-extra="' + summary.extra + '" data-bonus-total="' + summary.total + '" style="' + gemStyle(color) + '" aria-label="' + color + " bonus " + summary.total + " from " + summary.cards + " cards" + (summary.extra ? " plus " + summary.extra : "") + '"' + previewAttrs + '><span class="bonus-label">' + TOKEN_LABEL[color] + '</span><span class="bonus-count">' + summary.cards + "</span>" + extraBadge + bonusCardsPreviewHtml(player, color) + "</span>";
    }).join("");
  }

  function tokensHtml(counts, asButtons, actionName, compact) {
    return ALL_TOKENS.map(function (color) {
      var value = Number(counts[color]) || 0;
      if (asButtons) {
        return '<button class="token-button" type="button" data-' + actionName + '="' + color + '" data-color="' + color + '" style="' + gemStyle(color) + '" ' + (value <= 0 ? "disabled" : "") + ">" + TOKEN_LABEL[color] + " " + value + "</button>";
      }
      if (compact) {
        return '<span class="token token-compact" data-color="' + color + '" style="' + gemStyle(color) + '" aria-label="' + color + " token " + value + '"><span>' + value + "</span></span>";
      }
      return '<span class="token" data-color="' + color + '" style="' + gemStyle(color) + '">' + TOKEN_LABEL[color] + " " + value + "</span>";
    }).join("");
  }

  function paymentNeeds(player, card) {
    var needs = emptyCounts(false);
    COLORS.forEach(function (color) {
      needs[color] = Math.max((card.cost[color] || 0) - (player.bonuses[color] || 0), 0);
    });
    return needs;
  }

  function emptyPaymentPlan() {
    return {
      selected_tokens: emptyCounts(true),
      selected_virtual_card_ids: [],
      colored: emptyCounts(false),
      gold: emptyCounts(false),
      virtual: emptyCounts(false),
      discard_cards: []
    };
  }

  function paymentGoldTotal(payment) {
    return COLORS.reduce(function (sum, color) {
      return sum + (Number(payment && payment.gold && payment.gold[color]) || 0);
    }, 0);
  }

  function paymentVirtualTotal(payment) {
    return COLORS.reduce(function (sum, color) {
      return sum + (Number(payment && payment.virtual && payment.virtual[color]) || 0);
    }, 0);
  }

  function paymentSpend(payment) {
    var spend = emptyCounts(true);
    COLORS.forEach(function (color) {
      spend[color] = Number(payment && payment.colored && payment.colored[color]) || 0;
    });
    spend.gold = paymentGoldTotal(payment);
    return spend;
  }

  function paymentSelectedText(payment) {
    var parts = [];
    var selected = paymentSelectedTokenCounts(payment);
    ALL_TOKENS.forEach(function (color) {
      var count = Number(selected[color]) || 0;
      if (count > 0) parts.push(TOKEN_LABEL[color] + " " + count);
    });
    var selectedVirtual = Array.isArray(payment && payment.selected_virtual_card_ids) ? payment.selected_virtual_card_ids.length : 0;
    if (selectedVirtual > 0) parts.push(t("orientVirtualSelected", { count: selectedVirtual }));
    (payment && payment.discard_cards || []).forEach(function (cardId) {
      parts.push(t("orientPaymentDiscard") + " " + cardId);
    });
    return parts.length ? parts.join(", ") : "-";
  }

  function paymentSelectedTokenCounts(payment) {
    var selected = emptyCounts(true);
    if (payment && payment.selected_tokens) {
      ALL_TOKENS.forEach(function (color) {
        selected[color] = Math.max(0, Number(payment.selected_tokens[color]) || 0);
      });
      return selected;
    }
    COLORS.forEach(function (color) {
      selected[color] = Math.max(0, Number(payment && payment.colored && payment.colored[color]) || 0);
    });
    selected.gold = paymentGoldTotal(payment);
    return selected;
  }

  function paymentTokenUsefulMax(context, payment, color) {
    if (!context || !context.player || !context.card || ALL_TOKENS.indexOf(color) < 0) return 0;
    var selected = paymentSelectedTokenCounts(payment);
    var needs = paymentNeeds(context.player, context.card);
    var available = Number(context.player.tokens[color]) || 0;
    if (color !== "gold") return Math.min(available, needs[color] || 0);
    var coloredCovered = COLORS.reduce(function (sum, neededColor) {
      return sum + Math.min(Number(selected[neededColor]) || 0, needs[neededColor] || 0);
    }, 0);
    var totalNeed = COLORS.reduce(function (sum, neededColor) {
      return sum + (needs[neededColor] || 0);
    }, 0);
    return Math.min(available, Math.max(0, totalNeed - coloredCovered));
  }

  function normalizePaymentPlan(player, card, payment) {
    var needs = paymentNeeds(player, card);
    var normalized = emptyPaymentPlan();
    var selected = paymentSelectedTokenCounts(payment);
    ALL_TOKENS.forEach(function (color) {
      normalized.selected_tokens[color] = Math.min(selected[color], Math.max(0, Number(player.tokens[color]) || 0));
    });
    var selectedVirtualIds = selectedVirtualGoldCardIds(player, payment);
    if (!selectedVirtualIds.length && paymentVirtualTotal(payment) > 0) {
      selectedVirtualIds = availableOrientVirtualGoldCards(player).slice(0, 1).map(function (card) { return card.id; });
    }
    normalized.selected_virtual_card_ids = selectedVirtualIds;
    var remaining = emptyCounts(false);
    COLORS.forEach(function (color) {
      var colored = Math.min(normalized.selected_tokens[color] || 0, needs[color]);
      normalized.colored[color] = colored;
      remaining[color] = Math.max(needs[color] - colored, 0);
    });
    var goldLeft = normalized.selected_tokens.gold || 0;
    COLORS.forEach(function (color) {
      var gold = Math.min(goldLeft, remaining[color]);
      normalized.gold[color] = gold;
      goldLeft -= gold;
      remaining[color] -= gold;
    });
    var virtualLeft = selectedVirtualGoldValue(player, normalized);
    COLORS.forEach(function (color) {
      var virtual = Math.min(virtualLeft, remaining[color]);
      normalized.virtual[color] = virtual;
      virtualLeft -= virtual;
      remaining[color] -= virtual;
    });
    var discardRequirement = orientDiscardCost(card);
    if (discardRequirement) {
      var candidates = orientDiscardCostCandidates(player, card);
      var selected = Array.isArray(payment && payment.discard_cards) ? payment.discard_cards.slice() : [];
      var candidateIds = candidates.map(function (candidate) { return candidate.id; });
      normalized.discard_cards = selected.filter(function (cardId, index) {
        return selected.indexOf(cardId) === index && candidateIds.indexOf(cardId) >= 0;
      }).slice(0, discardRequirement.count);
    }
    return normalized;
  }

  function paymentIsLegal(player, card, payment) {
    if (!player || !card || !payment) return false;
    var needs = paymentNeeds(player, card);
    var normalized = normalizePaymentPlan(player, card, payment);
    var selected = paymentSelectedTokenCounts(normalized);
    if (selected.gold > (player.tokens.gold || 0)) return false;
    if (selectedVirtualGoldCardIds(player, normalized).length > 1) return false;
    var rowsCovered = COLORS.every(function (color) {
      var colored = Number(normalized.colored && normalized.colored[color]) || 0;
      var gold = Number(normalized.gold && normalized.gold[color]) || 0;
      var virtual = Number(normalized.virtual && normalized.virtual[color]) || 0;
      if (selected[color] > (player.tokens[color] || 0)) return false;
      if (selected[color] !== colored) return false;
      return colored + gold + virtual === needs[color];
    });
    if (!rowsCovered) return false;
    if (selected.gold !== paymentGoldTotal(normalized)) return false;
    if (normalized.selected_virtual_card_ids.length && paymentVirtualTotal(normalized) <= 0) return false;
    var discardRequirement = orientDiscardCost(card);
    if (!discardRequirement) return true;
    var selectedDiscards = Array.isArray(normalized.discard_cards) ? normalized.discard_cards : [];
    if (selectedDiscards.length !== discardRequirement.count) return false;
    return orientDiscardSelectionHasPriority(player, card, selectedDiscards);
  }

  function paymentMoveArgs(payment, player) {
    var virtualIds = paymentVirtualCards(player, payment);
    return {
      tokens: paymentSpend(payment),
      gold_as: clone(payment.gold || emptyCounts(false)),
      virtual_as: clone(payment.virtual || emptyCounts(false)),
      virtual_card_ids: virtualIds,
      discarded_card_ids: Array.isArray(payment.discard_cards) ? payment.discard_cards.slice() : []
    };
  }

  function autoPaymentPlan(player, card) {
    var needs = paymentNeeds(player, card);
    var payment = emptyPaymentPlan();
    var goldLeft = player.tokens.gold || 0;
    var needsLeft = emptyCounts(false);
    COLORS.forEach(function (color) {
      var colored = Math.min(player.tokens[color] || 0, needs[color]);
      payment.selected_tokens[color] = colored;
      needsLeft[color] = Math.max(needs[color] - colored, 0);
      var gold = Math.min(goldLeft, needsLeft[color]);
      payment.selected_tokens.gold += gold;
      goldLeft -= gold;
      needsLeft[color] -= gold;
    });
    if (COLORS.some(function (color) { return needsLeft[color] > 0; })) {
      var virtualCard = availableOrientVirtualGoldCards(player)[0];
      if (virtualCard) payment.selected_virtual_card_ids = [virtualCard.id];
    }
    var discardRequirement = orientDiscardCost(card);
    if (discardRequirement) {
      payment.discard_cards = orientDiscardCostCandidates(player, card).slice(0, discardRequirement.count).map(function (candidate) {
        return candidate.id;
      });
    }
    return normalizePaymentPlan(player, card, payment);
  }

  function affordability(player, card) {
    var needs = paymentNeeds(player, card);
    var pay = emptyCounts(true);
    var goldNeeded = 0;
    COLORS.forEach(function (color) {
      var needed = needs[color];
      var coloredPay = Math.min(player.tokens[color] || 0, needed);
      pay[color] = coloredPay;
      goldNeeded += needed - coloredPay;
    });
    pay.gold = goldNeeded;
    var paymentOk = goldNeeded <= (player.tokens.gold || 0) + orientVirtualGoldPaymentCapacity(player);
    var discardRequirement = orientDiscardCost(card);
    var discardOk = !discardRequirement || orientDiscardCostCandidates(player, card).length >= discardRequirement.count;
    return { ok: paymentOk && discardOk, pay: pay };
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

  function orientAbilityLabel(card) {
    if (!cardIsOrient(card)) return "";
    var ability = Array.isArray(card.abilities) && card.abilities[0] || {};
    if (ability.effect === "double_bonus") return t("orientDoubleBonus");
    if (ability.effect === "virtual_gold_placeholder" || ability.effect === "virtual_gold_2") return t("orientVirtualGold");
    if (ability.effect === "copy_bonus" && orientCardHasAbility(card, "take_level_free")) {
      return t("orientFreeCard", { tier: orientCardAbilities(card, "take_level_free")[0].free_tier || 1 });
    }
    if (ability.effect === "copy_bonus") return t("orientCopyBonus");
    if (ability.effect === "take_level_free") return t("orientFreeCard", { tier: ability.free_tier || 1 });
    if (ability.effect === "discard_cards_cost") {
      return t("orientDiscardCost", { count: ability.count || 2, color: TOKEN_LABEL[ability.color] || "" });
    }
    if (!orientAbilityBuyStatus(card).ok) return t("orientAbilityPending");
    return t("orientAbilityPlaceholder");
  }

  function orientAbilityShortLabel(ability) {
    if (!ability) return "";
    if (ability.effect === "double_bonus") return "2x";
    if (ability.effect === "virtual_gold_placeholder" || ability.effect === "virtual_gold_2") return "Au2";
    if (ability.effect === "copy_bonus") return "Copy";
    if (ability.effect === "take_level_free") return "Free T" + (ability.free_tier || 1);
    if (ability.effect === "fixed_bonus") return "";
    return orientAbilityLabel({ module: ORIENT_MARKET_ID, abilities: [ability] });
  }

  function orientCardOrdinal(card) {
    var tier = Number(card && card.tier) || 0;
    var cards = ORIENT_CARDS[tier] || [];
    var rawId = String(card && card.id || "");
    var rawBgaId = String(card && card.bga_id || rawId.replace(/^orient-/, ""));
    var index = cards.findIndex(function (entry) {
      return entry && (entry.id === rawId || String(entry.bga_id || "") === rawBgaId);
    });
    return index >= 0 ? String(index + 1).padStart(2, "0") : rawBgaId;
  }

  function orientCardDisplayId(card) {
    return "orient-t" + (card && card.tier || "") + "-" + orientCardOrdinal(card);
  }

  function orientDiscardCostHtml(card) {
    var discardCost = orientDiscardCost(card);
    if (!discardCost) return "";
    var tiles = Array.from({ length: discardCost.count }).map(function () {
      return '<span class="orient-discard-dot" data-color="' + discardCost.color + '" style="' + gemStyle(discardCost.color) + '"></span>';
    }).join("");
    var title = t("msgOrientDiscardNeedsCards", { count: discardCost.count, color: TOKEN_LABEL[discardCost.color] });
    return '<span class="orient-discard-chip" title="' + escapeHtml(title) + '"><span class="orient-discard-icons">' + tiles + "</span></span>";
  }

  function orientAbilityHtml(card) {
    if (!cardIsOrient(card)) return "";
    var discard = orientDiscardCostHtml(card);
    if (discard) return discard;
    var chips = orientCardAbilities(card).map(function (ability) {
      var label = orientAbilityShortLabel(ability);
      if (!label) return "";
      var title = orientAbilityLabel({ module: ORIENT_MARKET_ID, abilities: [ability] });
      return '<span class="orient-ability-chip" title="' + escapeHtml(title) + '">' + escapeHtml(label) + "</span>";
    }).filter(Boolean);
    return chips.length ? '<div class="orient-ability-row">' + chips.join("") + "</div>" : "";
  }

  function renderCard(card, controls) {
    controls = controls || {};
    var buyAttr = controls.buy && !controls.buyDisabled ? 'data-' + controls.buy + '="' + controls.value + '"' : "";
    var reserveAttr = controls.reserve && !controls.reserveDisabled ? 'data-' + controls.reserve + '="' + controls.value + '"' : "";
    var afford = controls.afford;
    var affordText = controls.statusText || (afford ? (afford.ok ? t("affordable") : t("needTokens")) : "");
    var cardModule = card.module === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID;
    var moduleTitle = card && card.bga_id ? ' title="' + escapeHtml("BGA card id: " + card.bga_id) + '"' : "";
    var moduleBadge = cardModule === ORIENT_MARKET_ID ? '<span class="card-module-badge"' + moduleTitle + ">" + escapeHtml(orientCardDisplayId(card)) + "</span>" : "";
    var abilityBadge = cardModule === ORIENT_MARKET_ID ? orientAbilityHtml(card) : "";
    var strongholdSummary = controls.strongholdSummary || strongholdSummaryFromHolders(controls.strongholds || [], state && state.current);
    var strongholdBadge = strongholdBadgeHtml(strongholdSummary);
    var strongholdAttrs = strongholdDataAttrs(strongholdSummary);
    var strongholdTarget = controls.value ? ' data-stronghold-target="' + escapeHtml(controls.value) + '"' : "";
    var orientFreeAttr = controls.orientFreeValue && !controls.orientChoiceDisabled ? ' data-orient-free-card="' + escapeHtml(controls.orientFreeValue) + '"' : "";
    var orientChoiceReasonAttr = controls.orientChoiceReason ? ' data-orient-choice-reason="' + escapeHtml(controls.orientChoiceReason) + '"' : "";
    var slotAttr = controls.slotId ? ' data-market-slot-id="' + escapeHtml(controls.slotId) + '"' : "";
    var costRow = hasCost(card.cost) ? '<div class="cost-row">' + costHtml(card.cost) + "</div>" : "";
    var strongholdSelectedSource = state && state.awaitingStrongholdAction && state.awaitingStrongholdAction.selected_source_slot_id && controls.slotId === state.awaitingStrongholdAction.selected_source_slot_id;
    var strongholdLockMark = controls.strongholdBlocked ? '<span class="stronghold-lock-text" title="' + escapeHtml(t("strongholdBlocked")) + '" aria-label="' + escapeHtml(t("strongholdBlocked")) + '">&#128274;</span>' : "";
    var idHtml = cardModule === ORIENT_MARKET_ID ? "" : '<span class="card-id">' + card.id + "</span>";
    var titleMarks = '<span class="card-title-marks">' + colorMarkHtml(card.color, "card-color-mark") + strongholdLockMark + "</span>";
    var cardClasses = ["dev-card"];
    if (strongholdSelectedSource) cardClasses.push("stronghold-selected-source");
    if (controls.conquestEligible) cardClasses.push("stronghold-conquest-target");
    if (controls.strongholdBlocked) cardClasses.push("stronghold-blocked");
    if (controls.strongholdActionKind) cardClasses.push("stronghold-action-" + controls.strongholdActionKind);
    if (controls.orientChoiceTarget) cardClasses.push("orient-choice-target");
    if (controls.orientChoiceDisabled) cardClasses.push("orient-choice-disabled");
    var actions = [];
    if (controls.buy) {
      var buyTitle = controls.buyDisabledReason ? ' title="' + escapeHtml(controls.buyDisabledReason) + '"' : "";
      actions.push('<button type="button" data-short-label="' + escapeHtml(t("buyShort")) + '"' + buyTitle + " " + buyAttr + " " + (controls.buyDisabled ? "disabled" : "") + ">" + escapeHtml(t("buyShort")) + "</button>");
    }
    if (controls.reserve) {
      actions.push('<button type="button" data-short-label="' + escapeHtml(t("reserveShort")) + '" ' + reserveAttr + " " + (controls.reserveDisabled ? "disabled" : "") + ">" + escapeHtml(t("reserveShort")) + "</button>");
    }
    return [
      '<article class="' + cardClasses.join(" ") + '" data-card-id="' + escapeHtml(card.id) + '" data-card-color="' + card.color + '" data-card-module="' + cardModule + '"' + strongholdTarget + orientFreeAttr + orientChoiceReasonAttr + slotAttr + strongholdAttrs + ' style="' + gemStyle(card.color) + '">',
      '<h3><span class="card-title-main"><span class="card-title-line"><span class="card-tier-text">' + t("tier") + " " + card.tier + "</span>" + titleMarks + "</span>" + idHtml + '</span><span class="points">' + card.points + "</span></h3>",
      strongholdBadge,
      moduleBadge,
      costRow,
      abilityBadge,
      affordText ? '<p class="card-affordability compact">' + affordText + "</p>" : "",
      actions.length ? '<div class="card-actions">' + actions.join("") + "</div>" : "",
      "</article>"
    ].join("");
  }

  function renderMarketEmptySlot(label, controls) {
    controls = controls || {};
    var strongholdSummary = controls.strongholdSummary || strongholdSummaryFromHolders([], state && state.current);
    var slotAttr = controls.slotId ? ' data-market-slot-id="' + escapeHtml(controls.slotId) + '"' : "";
    return '<div class="market-empty-slot"' + slotAttr + strongholdDataAttrs(strongholdSummary) + '><span>' + escapeHtml(label || t("noFaceUpCards")) + "</span></div>";
  }

  function renderNoble(noble, choiceMode) {
    var button = choiceMode ? '<button type="button" class="primary" data-choose-noble="' + noble.id + '">' + t("choose") + "</button>" : "";
    return [
      '<article class="noble-card" data-noble-id="' + escapeHtml(noble.id) + '">',
      "<strong>" + noble.points + " " + t("prestige") + "</strong>",
      '<div class="cost-row requirement-row">' + requirementHtml(noble.req) + "</div>",
      button,
      "</article>"
    ].join("");
  }

  function orientVirtualGoldZoneHtml(player) {
    var cards = availableOrientVirtualGoldCards(player);
    if (!cards.length) return "";
    var title = cards.map(function (card) { return card.id; }).join(", ");
    return [
      '<div class="orient-virtual-gold-row">',
      '<span class="label">' + escapeHtml(t("orientVirtualGoldZone")) + "</span>",
      '<span class="orient-virtual-card compact" style="' + gemStyle("gold") + '" title="' + escapeHtml(title) + '">',
      '<span class="orient-virtual-card-face">*</span>',
      '<span class="orient-virtual-token-pair"><span></span><span></span></span>',
      '<span class="orient-virtual-count">x' + cards.length + "</span>",
      "</span>",
      "</div>"
    ].join("");
  }

  function strongholdStockHtml(playerIndex) {
    if (!state || !strongholdsEnabledForRuleset(state.ruleset)) return "";
    var color = strongholdPlayerColor(playerIndex);
    return [
      '<div class="stronghold-stock" style="' + gemStyle(color) + '">',
      '<span class="label">' + escapeHtml(t("strongholdStock")) + "</span>",
      '<span class="stronghold-stock-token">' + escapeHtml(playerStrongholdSymbol(playerIndex)) + "</span>",
      '<span class="stronghold-stock-count">x' + playerStrongholdSupply(state, playerIndex) + "</span>",
      "</div>"
    ].join("");
  }

  function renderBank() {
    var awaitingDiscard = !!state.awaitingDiscard;
    var player = activePlayer();
    if (el.bankDiscard) {
      el.bankDiscard.hidden = !awaitingDiscard;
      if (awaitingDiscard && player) {
        el.bankDiscardSummary.textContent = t("msgMustDiscard", { player: player.name, count: totalTokens(player) });
        el.bankDiscardTokens.innerHTML = tokensHtml(player.tokens, true, "discard-color");
        if (el.bankPanel) el.bankPanel.open = true;
      } else {
        el.bankDiscardSummary.textContent = "";
        el.bankDiscardTokens.innerHTML = "";
      }
    }
    if (el.bankTakeActions) el.bankTakeActions.hidden = awaitingDiscard;
    el.bankTokens.innerHTML = ALL_TOKENS.map(function (color) {
      var disabled = awaitingDiscard || color === "gold" || !canAct() || state.bank[color] <= 0;
      return '<button class="token-button" type="button" data-bank-color="' + color + '" data-color="' + color + '" style="' + gemStyle(color) + '" ' + (disabled ? "disabled" : "") + ">" + TOKEN_LABEL[color] + " " + state.bank[color] + "</button>";
    }).join("");

    el.takeSummary.textContent = awaitingDiscard && player ? t("msgMustDiscard", { player: player.name, count: totalTokens(player) }) : takeSummaryText();
    el.confirmTake.disabled = awaitingDiscard || !canAct() || !pendingTakeIsLegal();
    el.clearTake.disabled = awaitingDiscard || !canAct() || pendingTake.length === 0;
  }

  function takeSummaryText() {
    if (pendingTake.length === 0) return t("noTakeSelected");
    return t("selectedTokens", { tokens: pendingTake.map(function (color) {
      return TOKEN_LABEL[color];
    }).join(", ") });
  }

  function renderMarketTabs() {
    if (!el.marketTabBase || !el.marketTabOrient) return;
    var orientEnabled = !!(state && orientEnabledForRuleset(state.ruleset));
    if (!orientEnabled && activeMarketPage === ORIENT_MARKET_ID) activeMarketPage = BASE_MARKET_ID;
    if (el.marketTabs) {
      el.marketTabs.classList.toggle("market-page-base", activeMarketPage === BASE_MARKET_ID);
      el.marketTabs.classList.toggle("market-page-orient", activeMarketPage === ORIENT_MARKET_ID);
      el.marketTabs.classList.toggle("market-has-orient", orientEnabled);
    }
    [
      [el.marketTabBase, BASE_MARKET_ID, true],
      [el.marketTabOrient, ORIENT_MARKET_ID, orientEnabled]
    ].forEach(function (entry) {
      var button = entry[0];
      var page = entry[1];
      var enabled = entry[2];
      button.classList.toggle("active", activeMarketPage === page);
      button.disabled = !enabled;
      button.setAttribute("aria-selected", activeMarketPage === page ? "true" : "false");
      button.setAttribute("aria-disabled", enabled ? "false" : "true");
    });
  }

  function renderBaseMarket() {
    var active = displayPlayer();
    return [3, 2, 1].map(function (tier) {
      var cards = state.market[tier].map(function (card, index) {
        var slotId = marketSlotId(state, BASE_MARKET_ID, tier, index);
        var strongholdSummary = strongholdSlotSummary(state, slotId, state.current);
        if (!card) return renderMarketEmptySlot(t("orientActionsPending"), { slotId: slotId, strongholdSummary: strongholdSummary });
        var afford = affordability(active, card);
        var strongholdAccess = strongholdAccessStatus(slotId, state.current);
        var strongholdActionKind = strongholdActionKindForSlot(slotId, state.current);
        var orientChoice = orientFreeChoiceForSlot(BASE_MARKET_ID, tier, index, slotId);
        return renderCard(card, {
          buy: "buy-market",
          reserve: "reserve-market",
          value: tier + ":" + index,
          slotId: slotId,
          afford: afford,
          strongholdSummary: strongholdSummary,
          strongholdBlocked: !strongholdAccess.ok,
          strongholdActionKind: strongholdActionKind,
          conquestEligible: !!(state.awaitingStrongholdConquest && strongholdConquestSlotEligible(state, slotId, state.current) && afford.ok),
          buyDisabled: !canAct() || !afford.ok || !strongholdAccess.ok,
          buyDisabledReason: strongholdAccess.reason,
          reserveDisabled: !canAct() || active.reserved.length >= 3 || !strongholdAccess.ok,
          orientChoiceTarget: !!orientChoice,
          orientChoiceDisabled: !!(orientChoice && !orientChoice.ok),
          orientChoiceReason: orientChoice && orientChoice.reason,
          orientFreeValue: orientChoice && orientChoice.value
        });
      }).join("");
      return [
        '<section class="tier">',
        '<div class="deck-box">',
        '<span class="label">' + t("tier") + " " + tier + "</span>",
        "<strong>" + state.decks[tier].length + "</strong>",
        '<span class="muted compact">' + t("deckCards") + "</span>",
        '<button type="button" data-reserve-deck="' + tier + '" data-short-label="' + escapeHtml(t("reserveShort")) + '" ' + (!canAct() || active.reserved.length >= 3 || state.decks[tier].length === 0 ? "disabled" : "") + ">" + escapeHtml(t("reserveShort")) + "</button>",
        "</div>",
        '<div class="card-grid">' + (cards || '<span class="muted">' + t("noFaceUpCards") + "</span>") + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderOrientMarket() {
    ensureStateRuleset(state);
    var active = displayPlayer();
    return [3, 2, 1].map(function (tier) {
      var cards = (state.orient_market[tier] || []).map(function (card, index) {
        var slotId = marketSlotId(state, ORIENT_MARKET_ID, tier, index);
        var strongholdSummary = strongholdSlotSummary(state, slotId, state.current);
        if (!card) return renderMarketEmptySlot(t("orientActionsPending"), { slotId: slotId, strongholdSummary: strongholdSummary });
        var afford = affordability(active, card);
        var abilityStatus = orientAbilityBuyStatus(card, active);
        var strongholdAccess = strongholdAccessStatus(slotId, state.current);
        var strongholdActionKind = strongholdActionKindForSlot(slotId, state.current);
        var buyReason = abilityStatus.ok ? "" : t("msgOrientAbilityPending");
        var orientChoice = orientFreeChoiceForSlot(ORIENT_MARKET_ID, tier, index, slotId);
        return renderCard(card, {
          buy: "buy-market",
          reserve: "reserve-market",
          value: ORIENT_MARKET_ID + ":" + tier + ":" + index,
          slotId: slotId,
          afford: afford,
          strongholdSummary: strongholdSummary,
          strongholdBlocked: !strongholdAccess.ok,
          strongholdActionKind: strongholdActionKind,
          conquestEligible: !!(state.awaitingStrongholdConquest && strongholdConquestSlotEligible(state, slotId, state.current) && afford.ok),
          statusText: abilityStatus.ok ? "" : abilityStatus.reason,
          buyDisabled: !canAct() || !afford.ok || !abilityStatus.ok || !strongholdAccess.ok,
          buyDisabledReason: strongholdAccess.reason || buyReason,
          reserveDisabled: !canAct() || active.reserved.length >= 3 || !strongholdAccess.ok,
          orientChoiceTarget: !!orientChoice,
          orientChoiceDisabled: !!(orientChoice && !orientChoice.ok),
          orientChoiceReason: orientChoice && orientChoice.reason,
          orientFreeValue: orientChoice && orientChoice.value
        });
      }).join("");
      var deckCount = state.orient_decks && state.orient_decks[tier] ? state.orient_decks[tier].length : 0;
      return [
        '<section class="tier orient-tier">',
        '<div class="deck-box" data-market-deck="' + ORIENT_MARKET_ID + '" data-tier="' + tier + '">',
        '<span class="label">' + t("orientModule") + " " + t("tier") + " " + tier + "</span>",
        "<strong>" + deckCount + "</strong>",
        '<span class="muted compact">' + t("deckCards") + "</span>",
        '<button type="button" data-reserve-deck="' + ORIENT_MARKET_ID + ":" + tier + '" data-short-label="' + escapeHtml(t("reserveShort")) + '" ' + (!canAct() || active.reserved.length >= 3 || deckCount === 0 ? "disabled" : "") + ">" + escapeHtml(t("reserveShort")) + "</button>",
        "</div>",
        '<div class="card-grid">' + (cards || '<span class="muted">' + t("noFaceUpCards") + "</span>") + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderMarket() {
    renderMarketTabs();
    var orientEnabled = orientEnabledForRuleset(state.ruleset);
    el.market.classList.toggle("market-page-base", activeMarketPage === BASE_MARKET_ID);
    el.market.classList.toggle("market-page-orient", activeMarketPage === ORIENT_MARKET_ID);
    el.market.classList.toggle("market-has-orient", orientEnabled);
    if (orientEnabled) {
      el.market.innerHTML = [
        '<div class="market-stack">',
        '<section class="market-page market-page-base-panel" data-market-section="base">',
        '<div class="market-page-heading"><strong>' + escapeHtml(t("baseMarketTab")) + "</strong></div>",
        renderBaseMarket(),
        "</section>",
        '<section class="market-page market-page-orient-panel" data-market-section="orient">',
        '<div class="market-page-heading"><strong>' + escapeHtml(t("orientMarketTab")) + "</strong></div>",
        renderOrientMarket(),
        "</section>",
        "</div>"
      ].join("");
      scheduleMarketOrientWrapSync();
      return;
    }
    el.market.classList.remove("market-orient-wrapped");
    el.market.innerHTML = renderBaseMarket();
  }

  function syncMarketOrientWrap() {
    if (!el.market) return;
    var basePanel = el.market.querySelector(".market-page-base-panel");
    var orientPanel = el.market.querySelector(".market-page-orient-panel");
    if (!basePanel || !orientPanel) {
      el.market.classList.remove("market-orient-wrapped");
      return;
    }
    var baseRect = basePanel.getBoundingClientRect();
    var orientRect = orientPanel.getBoundingClientRect();
    var wrapped = orientRect.top > baseRect.top + 4;
    el.market.classList.toggle("market-orient-wrapped", wrapped);
  }

  function scheduleMarketOrientWrapSync() {
    if (marketOrientWrapSyncScheduled) return;
    marketOrientWrapSyncScheduled = true;
    var schedule = window.requestAnimationFrame || function (callback) {
      return window.setTimeout(callback, 16);
    };
    schedule(function () {
      marketOrientWrapSyncScheduled = false;
      syncMarketOrientWrap();
    });
  }

  function syncMarketPageClasses() {
    if (!el.market) return;
    var orientEnabled = state && orientEnabledForRuleset(state.ruleset);
    el.market.classList.toggle("market-page-base", activeMarketPage === BASE_MARKET_ID);
    el.market.classList.toggle("market-page-orient", activeMarketPage === ORIENT_MARKET_ID);
    el.market.classList.toggle("market-has-orient", !!orientEnabled);
    if (el.marketTabs) {
      el.marketTabs.classList.toggle("market-page-base", activeMarketPage === BASE_MARKET_ID);
      el.marketTabs.classList.toggle("market-page-orient", activeMarketPage === ORIENT_MARKET_ID);
      el.marketTabs.classList.toggle("market-has-orient", !!orientEnabled);
    }
    var basePanel = el.market.querySelector(".market-page-base-panel");
    var orientPanel = el.market.querySelector(".market-page-orient-panel");
    if (basePanel) basePanel.setAttribute("aria-hidden", activeMarketPage === BASE_MARKET_ID ? "false" : "true");
    if (orientPanel) orientPanel.setAttribute("aria-hidden", activeMarketPage === ORIENT_MARKET_ID ? "false" : "true");
  }

  function switchMarketPage(page) {
    if (!state || page === activeMarketPage) return;
    if (page === ORIENT_MARKET_ID && !orientEnabledForRuleset(state.ruleset)) return;
    activeMarketPage = page === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID;
    syncMarketPageClasses();
    renderMarketTabs();
  }

  function marketSwipePoint(event) {
    return event.touches && event.touches[0] || event.changedTouches && event.changedTouches[0] || event;
  }

  function clearMarketSwipeDrag() {
    if (!el.market) return;
    el.market.classList.remove("market-dragging");
    el.market.style.removeProperty("--market-drag-x");
  }

  function handleMarketSwipeStart(event) {
    if (!state || !orientEnabledForRuleset(state.ruleset)) return;
    if (!(window.matchMedia && window.matchMedia("(max-width: 1180px)").matches)) return;
    if (event.type === "pointerdown" && event.button !== undefined && event.button !== 0) return;
    var point = marketSwipePoint(event);
    marketSwipeStart = { x: point.clientX, y: point.clientY, page: activeMarketPage, dragging: false };
  }

  function handleMarketSwipeMove(event) {
    if (!marketSwipeStart || !el.market) return;
    var point = marketSwipePoint(event);
    var dx = point.clientX - marketSwipeStart.x;
    var dy = point.clientY - marketSwipeStart.y;
    var absDx = Math.abs(dx);
    if (!marketSwipeStart.dragging && (absDx < 10 || absDx < Math.abs(dy) * 1.15)) return;
    var width = el.market.getBoundingClientRect().width || window.innerWidth || 1;
    var allowedDx = marketSwipeStart.page === BASE_MARKET_ID ? Math.min(0, dx) : Math.max(0, dx);
    var clampedDx = Math.max(-width, Math.min(width, allowedDx));
    marketSwipeStart.dragging = true;
    el.market.classList.add("market-dragging");
    el.market.style.setProperty("--market-drag-x", Math.round(clampedDx) + "px");
  }

  function handleMarketSwipeEnd(event) {
    if (!marketSwipeStart) return;
    var point = marketSwipePoint(event);
    var dx = point.clientX - marketSwipeStart.x;
    var dy = point.clientY - marketSwipeStart.y;
    marketSwipeStart = null;
    if (Math.abs(dx) < 58 || Math.abs(dx) < Math.abs(dy) * 1.35) {
      clearMarketSwipeDrag();
      return;
    }
    if (dx < 0) switchMarketPage(ORIENT_MARKET_ID);
    else switchMarketPage(BASE_MARKET_ID);
    clearMarketSwipeDrag();
  }

  function handleMarketSwipeCancel() {
    marketSwipeStart = null;
    clearMarketSwipeDrag();
  }

  function reservedSourceText(card) {
    return card && card.reserved_from === "deck" ? t("blindReserve") : t("faceUpReserve");
  }

  function cardPreviewHtml(card) {
    if (!card) return "";
    return [
      '<span class="reserve-preview" role="tooltip" style="' + gemStyle(card.color) + '">',
      '<span class="reserve-preview-title">',
      "<strong>" + t("tier") + " " + card.tier + " " + colorMarkHtml(card.color, "card-color-mark") + "</strong>",
      '<span>' + card.points + " " + t("prestige") + "</span>",
      "</span>",
      '<span class="card-id">' + escapeHtml(card.id) + "</span>",
      '<span class="reserve-preview-cost requirement-row">' + requirementHtml(card.cost) + "</span>",
      "</span>"
    ].join("");
  }

  function reservedPreviewHtml(card) {
    if (!card || card.reserved_from === "deck") return "";
    return cardPreviewHtml(card);
  }

  function renderReservedSummary(player) {
    if (!player.reserved.length) return '<span class="muted">' + t("noReservedCards") + "</span>";
    return player.reserved.map(function (card, index) {
      var blind = card.reserved_from === "deck";
      var color = blind ? "gold" : card.color;
      var previewAttrs = blind ? "" : ' data-reserve-preview-toggle="true" tabindex="0" role="button"';
      return [
        '<span class="reserve-badge ' + (blind ? "blind" : "face-up") + '" style="' + gemStyle(color) + '"' + previewAttrs + '>',
        '<span class="reserve-slot" data-color="' + color + '">' + (index + 1) + "</span>",
        blind ? t("blind") : t("faceUp"),
        reservedPreviewHtml(card),
        "</span>"
      ].join("");
    }).join("");
  }

  function renderActiveReserved() {
    var player = displayPlayer();
    var playerIndex = displayCurrentIndex();
    if (!player) return;
    el.activeHandMeta.innerHTML = [
      '<span class="active-hand-chip">' + escapeHtml(player.name) + " (" + player.reserved.length + "/3)</span>",
      '<span class="active-hand-chip token-count">' + escapeHtml(t("tokens")) + " " + totalTokens(player) + "/10</span>"
    ].join("");
    el.activeTokenRow.innerHTML = tokensHtml(player.tokens, false, null, true);
    el.activeBonusRow.innerHTML = bonusesHtml(player.bonuses, player);
    if (el.activeVirtualGold) el.activeVirtualGold.innerHTML = orientVirtualGoldZoneHtml(player);
    if (!player.reserved.length) {
      el.activeReserved.innerHTML = '<span class="muted">' + t("noActiveReserved") + "</span>";
      return;
    }
    el.activeReserved.innerHTML = player.reserved.map(function (card, cardIndex) {
      var afford = affordability(player, card);
      return [
        '<div class="active-reserved-item">',
        '<span class="reserve-origin ' + (card.reserved_from === "deck" ? "blind" : "face-up") + '">' + reservedSourceText(card) + "</span>",
        renderCard(card, {
          buy: "buy-reserved",
          value: playerIndex + ":" + cardIndex,
          afford: afford,
          buyDisabled: !canAct() || !afford.ok
        }),
        "</div>"
      ].join("");
    }).join("");
  }

  function renderPlayers() {
    syncDinoBoardAiAvailability(state);
    var visibleIndex = displayCurrentIndex();
    el.players.innerHTML = state.players.map(function (player, playerIndex) {
      var reservedCards = renderReservedSummary(player);
      var nobleText = player.nobles.length ? player.nobles.map(function (noble) { return noble.name; }).join(", ") : t("none");
      var aiBadgeKey = player.ai && player.ai.provider === "dinoboard" ? "aiBadgeFormat" : "randomAiBadgeFormat";
      var aiBadge = player.ai && player.ai.enabled ? '<span class="ai-badge">' + escapeHtml(t(aiBadgeKey, { level: aiLevelLabel(player.ai.level || player.ai.mode) })) + "</span>" : "";
      return [
        '<article class="player-card ' + (playerIndex === visibleIndex ? "active" : "") + '" data-player-index="' + playerIndex + '">',
        '<div class="player-top"><div><h3>' + escapeHtml(player.name) + "</h3>" + aiBadge + '</div><strong class="score-line">' + scoreFor(player) + " " + t("prestige") + "</strong></div>",
        playerAiControlsHtml(player, playerIndex),
        '<div class="player-resource-panel">',
        '<span class="label">' + t("tokens") + " (" + totalTokens(player) + '/10)</span><div class="token-row">' + tokensHtml(player.tokens, false, null, true) + "</div>",
        '<span class="label">' + t("bonuses") + '</span><div class="bonus-row">' + bonusesHtml(player.bonuses, player) + "</div>",
        orientVirtualGoldZoneHtml(player),
        strongholdStockHtml(playerIndex),
        "</div>",
        '<div><span class="label">' + t("reserved") + " (" + player.reserved.length + '/3)</span><div class="reserved-list">' + reservedCards + "</div></div>",
        '<div class="purchased-summary" style="' + gemStyle("gold") + '"><span>' + escapeHtml(t("purchasedSummary", { cards: player.purchased.length, nobles: nobleText })) + "</span></div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderNobles() {
    el.nobles.innerHTML = state.nobles.length ? state.nobles.map(function (noble) {
      return renderNoble(noble, false);
    }).join("") : '<span class="muted">' + t("noNoblesRemain") + "</span>";
  }

  function renderDiscard() {
    el.discardPanel.hidden = true;
    el.discardTokens.innerHTML = "";
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

  function pendingPaymentContext() {
    if (!pendingPayment || !state) return null;
    var player = activePlayer();
    var parts = String(pendingPayment.value || "").split(":");
    var card = null;
    var context = null;
    if (pendingPayment.source === "market") {
      var marketRef = parseMarketActionValue(pendingPayment.value);
      card = marketCardAt(state, marketRef);
      context = { type: "buyMarket", player: player, card: card, tier: marketRef.tier, index: marketRef.index, market_id: marketRef.marketId };
    } else if (pendingPayment.source === "strongholdConquest") {
      var conquestRef = parseMarketActionValue(pendingPayment.value);
      card = marketCardAt(state, conquestRef);
      context = { type: "strongholdConquest", player: player, card: card, tier: conquestRef.tier, index: conquestRef.index, market_id: conquestRef.marketId, parent: pendingPayment.parent || null };
    } else if (pendingPayment.source === "reserved") {
      var playerIndex = Number(parts[0]);
      var reservedIndex = Number(parts[1]);
      if (playerIndex !== state.current) return null;
      card = player && player.reserved[reservedIndex];
      context = { type: "buyReserved", player: player, card: card, index: reservedIndex };
    }
    if (!context || !context.card || context.card.id !== pendingPayment.card_id) return null;
    pendingPayment.payment = normalizePaymentPlan(context.player, context.card, pendingPayment.payment);
    return context;
  }

  function orientDiscardCandidateIsPriority(candidate, requirement) {
    return !!(candidate && requirement && candidate.copied_color === requirement.color);
  }

  function discardCandidateMiniCardHtml(candidate, requirement, active) {
    var bonusColor = cardPrimaryBonusColor(candidate) || requirement.color;
    var priority = orientDiscardCandidateIsPriority(candidate, requirement);
    var classes = ["payment-discard-card"];
    var points = Number(candidate.points) || 0;
    if (active) classes.push("active");
    if (priority) classes.push("priority");
    var priorityBadge = priority ? [
      '<span class="payment-discard-priority-badge">',
      colorMarkHtml("wild", "payment-discard-wild"),
      '<span>' + escapeHtml(t("orientDiscardPriorityBadge")) + "</span>",
      "</span>"
    ].join("") : "";
    return [
      '<button type="button" class="' + classes.join(" ") + '" data-payment-toggle-discard-card="' + escapeHtml(candidate.id) + '" style="' + gemStyle(bonusColor) + '" aria-label="' + escapeHtml(candidate.id + " " + t("tier") + " " + candidate.tier + " " + points + " " + t("prestige")) + '">',
      '<span class="payment-discard-card-face">',
      '<span class="payment-discard-card-top">',
      '<span class="payment-discard-bonus" data-color="' + bonusColor + '" style="' + gemStyle(bonusColor) + '"><span class="gem-dot"></span><span>' + colorMarkHtml(bonusColor) + "</span></span>",
      '<span class="payment-discard-card-points">' + points + "</span>",
      "</span>",
      '<span class="payment-discard-card-id">' + escapeHtml(candidate.id) + "</span>",
      '<span class="payment-discard-card-meta">',
      '<span>' + escapeHtml(t("tier")) + " " + escapeHtml(candidate.tier || "") + "</span>",
      '<span class="payment-discard-prestige"><span></span>' + points + "</span>",
      "</span>",
      priorityBadge,
      "</span>",
      "</button>"
    ].join("");
  }

  function paymentRowsHtml(context) {
    var player = context.player;
    var needs = paymentNeeds(player, context.card);
    var payment = pendingPayment.payment;
    var rows = [];
    var selected = paymentSelectedTokenCounts(payment);
    var selectedVirtualIds = selectedVirtualGoldCardIds(player, payment);
    var needsHtml = requirementHtml(needs) || '<span class="muted compact">' + escapeHtml(t("noPaymentNeeded")) + "</span>";
    var tokenButtons = ALL_TOKENS.map(function (color) {
      var available = Number(player.tokens[color]) || 0;
      var chosen = Number(selected[color]) || 0;
      var usefulMax = paymentTokenUsefulMax(context, payment, color);
      var disabled = available <= 0 || (chosen <= 0 && usefulMax <= 0);
      return [
        '<button type="button" class="payment-token-choice ' + (chosen ? "active" : "") + '" data-payment-token-color="' + color + '" data-color="' + color + '" style="' + gemStyle(color) + '" ' + (disabled ? "disabled" : "") + ">",
        '<span class="token payment-token-dot" data-color="' + color + '" style="' + gemStyle(color) + '">' + TOKEN_LABEL[color] + "</span>",
        '<span class="payment-token-count">' + chosen + "/" + available + "</span>",
        "</button>"
      ].join("");
    }).join("");
    var virtualCards = availableOrientVirtualGoldCards(player);
    var virtualHtml = virtualCards.length ? [
      '<div class="payment-virtual-grid">',
      virtualCards.map(function (card) {
        var active = selectedVirtualIds.indexOf(card.id) >= 0;
        return [
          '<button type="button" class="payment-virtual-choice ' + (active ? "active" : "") + '" data-payment-toggle-virtual-card="' + escapeHtml(card.id) + '" style="' + gemStyle("gold") + '">',
          '<span class="orient-virtual-card-face">*</span>',
          '<span class="orient-virtual-token-pair"><span></span><span></span></span>',
          '<span class="card-id">' + escapeHtml(card.id) + "</span>",
          "</button>"
        ].join("");
      }).join(""),
      "</div>",
      '<p class="muted compact">' + escapeHtml(t("paymentVirtualHint")) + "</p>"
    ].join("") : "";
    var overpay = selectedVirtualGoldValue(player, payment) > paymentVirtualTotal(payment) && selectedVirtualIds.length > 0 && ALL_TOKENS.some(function (color) {
      return (selected[color] || 0) > 0;
    });
    rows.push([
      '<div class="payment-choice-board">',
      '<div class="payment-choice-section"><span class="label">' + escapeHtml(t("paymentNeeds")) + '</span><div class="payment-needs">' + needsHtml + "</div></div>",
      '<div class="payment-choice-section"><span class="label">' + escapeHtml(t("paymentPlayerTokens")) + '</span><div class="payment-token-grid">' + tokenButtons + "</div></div>",
      virtualHtml ? '<div class="payment-choice-section"><span class="label">' + escapeHtml(t("orientVirtualGoldZone")) + "</span>" + virtualHtml + "</div>" : "",
      overpay ? '<p class="payment-hint">' + escapeHtml(t("paymentVirtualOverpayHint")) + "</p>" : "",
      "</div>"
    ].filter(Boolean).join(""));
    var discardRequirement = orientDiscardCost(context.card);
    if (discardRequirement) {
      var selected = payment.discard_cards || [];
      var candidates = orientDiscardCostCandidates(player, context.card);
      var hasPriorityCandidate = candidates.some(function (candidate) {
        return orientDiscardCandidateIsPriority(candidate, discardRequirement);
      });
      rows.push([
        '<div class="payment-discard-row" style="' + gemStyle(discardRequirement.color) + '">',
        '<div class="payment-discard-head">',
        '<strong>' + escapeHtml(t("orientPaymentDiscard")) + "</strong>",
        '<span>' + escapeHtml(t("orientDiscardCost", { count: discardRequirement.count, color: TOKEN_LABEL[discardRequirement.color] })) + "</span>",
        "</div>",
        hasPriorityCandidate ? '<p class="payment-discard-hint">' + colorMarkHtml("wild", "payment-discard-wild") + '<span>' + escapeHtml(t("orientDiscardPriorityHint")) + "</span></p>" : "",
        '<div class="payment-discard-cards">',
        candidates.map(function (candidate) {
          var active = selected.indexOf(candidate.id) >= 0;
          return discardCandidateMiniCardHtml(candidate, discardRequirement, active);
        }).join("") || '<span class="muted compact">' + escapeHtml(t("orientNoChoices")) + "</span>",
        "</div>",
        "</div>"
      ].join(""));
    }
    return rows.length ? rows.join("") : '<p class="muted compact">' + t("noPaymentNeeded") + "</p>";
  }

  function renderPaymentChoice() {
    el.paymentPanel.hidden = !pendingPayment;
    if (!pendingPayment) {
      el.paymentCard.innerHTML = "";
      el.paymentOptions.innerHTML = "";
      el.paymentSummary.textContent = "";
      return;
    }
    if (el.activeHandPanel) el.activeHandPanel.open = true;
    var context = pendingPaymentContext();
    if (!context) {
      pendingPayment = null;
      el.paymentPanel.hidden = true;
      return;
    }
    el.paymentCard.innerHTML = renderCard(context.card, { afford: affordability(context.player, context.card) });
    el.paymentOptions.innerHTML = paymentRowsHtml(context);
    el.paymentSummary.textContent = t("paymentSelected", { selected: paymentSelectedText(pendingPayment.payment) });
    el.confirmPayment.disabled = !paymentIsLegal(context.player, context.card, pendingPayment.payment);
  }

  function orientCurrentTask() {
    var action = state && state.awaitingOrientAction;
    return action && Array.isArray(action.queue) ? action.queue[0] : null;
  }

  function orientMarketChoiceList(tier) {
    var choices = [];
    [BASE_MARKET_ID, ORIENT_MARKET_ID].forEach(function (marketId) {
      var market = marketId === ORIENT_MARKET_ID ? state.orient_market : state.market;
      (market && market[tier] || []).forEach(function (card, index) {
        if (!card) return;
        choices.push({ marketId: marketId, tier: tier, index: index, card: card, slotId: marketSlotId(state, marketId, tier, index) });
      });
    });
    return choices;
  }

  function orientFreeChoiceForSlot(marketId, tier, index, slotId) {
    var action = state && state.awaitingOrientAction;
    var task = orientCurrentTask();
    if (!action || !task || task.type !== "free_card") return null;
    if ((Number(tier) || 0) !== (Number(task.tier) || 0)) return null;
    var value = [marketId, tier, index].join(":");
    var access = strongholdAccessStatus(slotId, state.current);
    return {
      value: value,
      ok: !!access.ok,
      reason: access.reason || t("strongholdBlocked")
    };
  }

  function orientCopyChoiceForPurchasedCard(player, card) {
    var action = state && state.awaitingOrientAction;
    var task = orientCurrentTask();
    var active = activePlayer();
    if (!action || !task || task.type !== "copy_bonus" || !player || !card || !active || player.id !== active.id) return false;
    var target = findPlayerPurchasedCard(player, task.card_id);
    if (!target) return false;
    return orientCopyCandidates(player, target).some(function (candidate) {
      return candidate && candidate.id === card.id;
    });
  }

  function orientCopyChoiceForColor(player, color) {
    return !!(player && player.purchased || []).some(function (card) {
      return effectiveCardBonuses(card)[color] > 0 && orientCopyChoiceForPurchasedCard(player, card);
    });
  }

  function renderOrientCopyOptions(player, card) {
    var candidates = orientCopyCandidates(player, card);
    return candidates.map(function (candidate) {
      var color = cardPrimaryBonusColor(candidate);
      return [
        '<button type="button" class="orient-choice-card" data-orient-copy-card="' + escapeHtml(candidate.id) + '" style="' + gemStyle(color || "gold") + '">',
        renderCard(candidate, {}),
        '<span class="orient-choice-note">' + TOKEN_LABEL[color] + "</span>",
        "</button>"
      ].join("");
    }).join("") || '<p class="muted compact">' + t("orientNoChoices") + "</p>";
  }

  function renderOrientFreeOptions(tier) {
    var choices = orientMarketChoiceList(tier);
    return choices.map(function (choice) {
      var value = [choice.marketId, choice.tier, choice.index].join(":");
      var strongholdAccess = strongholdAccessStatus(choice.slotId, state.current);
      return [
        '<button type="button" class="orient-choice-card" data-orient-free-card="' + escapeHtml(value) + '" ' + (!strongholdAccess.ok ? "disabled" : "") + ">",
        renderCard(choice.card, {
          value: value,
          slotId: choice.slotId,
          strongholdSummary: strongholdSlotSummary(state, choice.slotId, state.current),
          strongholdBlocked: !strongholdAccess.ok
        }),
        "</button>"
      ].join("");
    }).join("") || '<p class="muted compact">' + t("orientNoChoices") + "</p>";
  }

  function renderOrientAction() {
    if (!el.orientActionPanel) return;
    var action = state && state.awaitingOrientAction;
    pendingOrientAction = action || null;
    el.orientActionPanel.hidden = !action;
    if (!action) {
      el.orientActionOptions.innerHTML = "";
      return;
    }
    var task = orientCurrentTask();
    if (el.activeHandPanel && (!task || (task.type !== "free_card" && task.type !== "copy_bonus"))) el.activeHandPanel.open = true;
    var player = activePlayer();
    var card = task && findPlayerPurchasedCard(player, task.card_id);
    var title = t("orientChoiceTitle");
    var body = t("orientChoiceBody");
    var html = "";
    if (!task || !card) {
      html = '<p class="muted compact">' + t("orientNoChoices") + "</p>";
    } else if (task.type === "copy_bonus") {
      body = t("msgOrientChooseCopy", { card: card.id });
      html = '<p class="orient-direct-choice-note">' + escapeHtml(t("orientCopyDirectClickHint")) + "</p>";
    } else if (task.type === "free_card") {
      body = t("msgOrientChooseFree", { tier: task.tier });
      html = '<p class="orient-direct-choice-note">' + escapeHtml(t("orientDirectClickHint")) + "</p>";
    }
    if (el.orientActionTitle) el.orientActionTitle.textContent = title;
    if (el.orientActionSummary) el.orientActionSummary.textContent = body;
    el.orientActionOptions.classList.toggle("orient-action-options-direct", !!(task && (task.type === "free_card" || task.type === "copy_bonus")));
    el.orientActionOptions.innerHTML = html;
  }

  function renderStrongholdTargetButton(ref, kind, label) {
    var value = [ref.marketId, ref.tier, ref.index].join(":");
    var blocked = kind === "remove";
    return [
      '<button type="button" class="stronghold-choice" data-stronghold-' + kind + '="' + escapeHtml(value) + '">',
      '<span class="stronghold-choice-title">' + escapeHtml(label) + "</span>",
      renderCard(ref.card, {
        value: value,
        slotId: ref.slotId,
        strongholdSummary: strongholdSlotSummary(state, ref.slotId, state.current),
        strongholdBlocked: blocked
      }),
      "</button>"
    ].join("");
  }

  function strongholdChoiceGroupHtml(titleKey, refs, kind, labelKey) {
    if (!refs.length) return "";
    return [
      '<section class="stronghold-choice-group">',
      '<span class="stronghold-choice-group-title">' + escapeHtml(t(titleKey)) + "</span>",
      '<div class="stronghold-choice-grid">',
      refs.map(function (ref) {
        return renderStrongholdTargetButton(ref, kind, t(labelKey));
      }).join(""),
      "</div>",
      "</section>"
    ].join("");
  }

  function strongholdActionOptionsHtml() {
    if (!state || !state.awaitingStrongholdAction) return "";
    return '<div class="stronghold-selection-hint">' + escapeHtml(strongholdActionPrompt()) + "</div>";
  }

  function renderStrongholdAction() {
    if (!el.strongholdActionPanel) return;
    var conquest = state && state.awaitingStrongholdConquest;
    if (conquest) {
      el.strongholdActionPanel.hidden = false;
      if (el.strongholdActionTitle) el.strongholdActionTitle.textContent = t("strongholdConquestTitle");
      if (el.strongholdActionSummary) el.strongholdActionSummary.textContent = t("strongholdConquestBody");
      if (el.strongholdActionOptions) {
        el.strongholdActionOptions.innerHTML = '<button type="button" class="stronghold-skip" data-stronghold-conquest-skip="true">' + escapeHtml(t("strongholdConquestSkip")) + "</button>";
      }
      return;
    }
    var action = state && state.awaitingStrongholdAction;
    if (action) {
      el.strongholdActionPanel.hidden = false;
      if (el.strongholdActionTitle) el.strongholdActionTitle.textContent = t("strongholdActionTitle");
      if (el.strongholdActionSummary) el.strongholdActionSummary.textContent = strongholdActionPrompt();
      if (el.strongholdActionOptions) {
        el.strongholdActionOptions.innerHTML = strongholdActionOptionsHtml();
      }
      if (!messageText) showMessage(strongholdActionPrompt(), "ok");
      return;
    }
    el.strongholdActionPanel.hidden = true;
    if (el.strongholdActionOptions) el.strongholdActionOptions.innerHTML = "";
  }

  function strongholdActionPrompt() {
    if (!state || !state.awaitingStrongholdAction) return "";
    if (playerStrongholdSupply(state, state.current) > 0) return t("strongholdSelectTarget");
    return state.awaitingStrongholdAction.selected_source_slot_id ? t("strongholdSelectTarget") : t("strongholdSelectSource");
  }

  function findPlayerPurchasedCard(player, cardId) {
    return (player && player.purchased || []).find(function (card) {
      return card && card.id === cardId;
    }) || null;
  }

  function findDevelopmentCardById(cardId) {
    var id = String(cardId || "");
    for (var tier = 1; tier <= 3; tier += 1) {
      var found = (DEVELOPMENT_CARDS[tier] || []).find(function (card) {
        return card.id === id;
      }) || (ORIENT_CARDS[tier] || []).find(function (card) {
        return card.id === id;
      });
      if (found) return found;
    }
    return null;
  }

  function replayStateForMove(move) {
    return move && move.state_after && (move.state_after.source_state || move.state_after) || state;
  }

  function marketRefFromSlotId(game, slotId) {
    if (!game || !slotId) return null;
    ensureMarketStructure(game);
    var target = String(slotId);
    var markets = [BASE_MARKET_ID, ORIENT_MARKET_ID];
    for (var m = 0; m < markets.length; m += 1) {
      var marketId = markets[m];
      var groups = game.market_slots && game.market_slots[marketId] || {};
      for (var tier = 1; tier <= 3; tier += 1) {
        var slots = groups[tier] || groups[String(tier)] || [];
        var index = Array.isArray(slots) ? slots.indexOf(target) : -1;
        if (index >= 0) return { marketId: marketId, tier: tier, index: index, slotId: target };
      }
    }
    var compactMatch = target.match(/^(base|orient)-t(\d+)-s(\d+)$/);
    if (compactMatch) {
      return {
        marketId: compactMatch[1] === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID,
        tier: Number(compactMatch[2]) || 1,
        index: Math.max(0, (Number(compactMatch[3]) || 1) - 1),
        slotId: target
      };
    }
    var bgaStyleMatch = target.match(/^(base|orient):t(\d+):s(\d+)$/);
    if (bgaStyleMatch) {
      return {
        marketId: bgaStyleMatch[1] === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID,
        tier: Number(bgaStyleMatch[2]) || 1,
        index: Math.max(0, Number(bgaStyleMatch[3]) || 0),
        slotId: target
      };
    }
    return null;
  }

  function cardForMarketSlotId(game, slotId) {
    var ref = marketRefFromSlotId(game, slotId);
    return ref ? marketCardAt(game, ref) : null;
  }

  function strongholdEffectTitleKey(effect) {
    if (effect && effect.type === "place") return "logStrongholdPlaceTitle";
    if (effect && effect.type === "remove") return "logStrongholdRemoveTitle";
    return "logStrongholdMoveTitle";
  }

  function strongholdMoveTitleKey(move) {
    var effects = move && move.args && move.args.stronghold_effects || [];
    return strongholdEffectTitleKey(effects[0]);
  }

  function playerNameForMove(move) {
    var fromNotification = move && move.notification && move.notification.args && move.notification.args.player_name;
    if (fromNotification) return fromNotification;
    var player = state && state.players && state.players.find(function (entry) {
      return entry.id === move.player_id;
    });
    return player ? player.name : t("players");
  }

  function moveTitle(move) {
    if (move && move.type === "strongholdMove") return t(strongholdMoveTitleKey(move));
    var byType = {
      takeTokens: "logTakeTokensTitle",
      reserveMarket: "logReserveTitle",
      reserveDeck: "logReserveTitle",
      buyMarket: "logBuyTitle",
      buyReserved: "logBuyTitle",
      strongholdConquest: "strongholdConquest",
      discardToken: "logDiscardTitle",
      chooseNoble: "logNobleTitle"
    };
    return t(byType[move.type] || "logGameTitle");
  }

  function logTokenChip(color, count, compact) {
    var amount = Number(count) || 0;
    if (amount <= 0) return "";
    return '<span class="token log-token" data-color="' + color + '" style="' + gemStyle(color) + '">' + TOKEN_LABEL[color] + (compact ? "" : " " + amount) + "</span>";
  }

  function logTokenSet(counts, includeGoldAs) {
    var chips = ALL_TOKENS.map(function (color) {
      return logTokenChip(color, counts && counts[color], false);
    }).filter(Boolean);
    if (includeGoldAs) {
      COLORS.forEach(function (color) {
        var gold = Number(includeGoldAs[color]) || 0;
        if (gold > 0) chips.push('<span class="log-payment-route" style="' + gemStyle(color) + '">' + TOKEN_LABEL.gold + " -> " + TOKEN_LABEL[color] + " " + gold + "</span>");
      });
    }
    return chips.length ? '<span class="log-token-set">' + chips.join("") + "</span>" : "";
  }

  function logPaymentSet(payment) {
    if (!payment) return "";
    var html = logTokenSet(payment.tokens, payment.gold_as);
    var virtualChips = [];
    COLORS.forEach(function (color) {
      var amount = Number(payment.virtual_as && payment.virtual_as[color]) || 0;
      if (amount > 0) {
        virtualChips.push('<span class="log-payment-route" style="' + gemStyle(color) + '">' + escapeHtml(t("orientUseVirtual")) + " -> " + TOKEN_LABEL[color] + " " + amount + "</span>");
      }
    });
    (payment.discarded_card_ids || []).forEach(function (cardId) {
      virtualChips.push('<span class="log-source-chip">' + escapeHtml(t("orientPaymentDiscard")) + " " + escapeHtml(cardId) + "</span>");
    });
    return html + (virtualChips.length ? '<span class="log-token-set">' + virtualChips.join("") + "</span>" : "");
  }

  function logStrongholdEffects(effects) {
    return (effects || []).map(function (effect) {
      var playerIndex = Number(effect.player_index) || 0;
      var color = strongholdPlayerColor(playerIndex);
      var label = effect.type === "place" ? t("strongholdPlace") : effect.type === "move" ? t("strongholdMove") : t("strongholdRemove");
      var text = playerStrongholdSymbol(playerIndex) + " " + label;
      if (effect.type === "remove" && Number.isInteger(Number(effect.removed_player_index))) {
        text += " " + playerStrongholdSymbol(Number(effect.removed_player_index));
      }
      return '<span class="log-source-chip stronghold-log-chip" style="' + gemStyle(color) + '">' + escapeHtml(text) + "</span>";
    }).join("");
  }

  function logCardBadge(cardId, options) {
    var card = findDevelopmentCardById(cardId) || options && options.card;
    var hidden = options && options.hidden;
    var tier = options && options.tier || card && card.tier || "?";
    if (hidden) {
      return [
        '<span class="log-card-badge blind" style="' + gemStyle("gold") + '">',
        '<span class="reserve-slot" data-color="gold" style="' + gemStyle("gold") + '">?</span>',
        escapeHtml(t("logBlindCard", { tier: tier })),
        "</span>"
      ].join("");
    }
    if (!card) {
      return '<span class="log-card-badge blind" style="' + gemStyle("gold") + '">' + escapeHtml(t("logUnknownCard")) + "</span>";
    }
    return [
      '<span class="log-card-badge" style="' + gemStyle(card.color) + '" data-log-card-preview-toggle="true" tabindex="0" role="button">',
      '<span class="reserve-slot" data-color="' + card.color + '" style="' + gemStyle(card.color) + '">' + colorMarkHtml(card.color, "reserve-slot-mark") + "</span>",
      escapeHtml(card.id),
      cardPreviewHtml(card),
      "</span>"
    ].join("");
  }

  function logStrongholdSlotTarget(move, slotId, labelKey) {
    if (!slotId) return "";
    var card = cardForMarketSlotId(replayStateForMove(move), slotId);
    var target = card
      ? logCardBadge(card.id, { card: card, tier: card.tier })
      : '<span class="log-source-chip">' + escapeHtml(slotId) + "</span>";
    return '<span class="log-source-chip">' + escapeHtml(t(labelKey)) + "</span>" + target;
  }

  function logStrongholdMoveBody(move) {
    var effects = move && move.args && move.args.stronghold_effects || [];
    if (!effects.length) return move.notification && move.notification.log ? escapeHtml(move.notification.log) : escapeHtml(t("logStrongholdMoveTitle"));
    return effects.map(function (effect) {
      var chunks = [logStrongholdEffects([effect])];
      if (effect.type === "move") {
        chunks.push(logStrongholdSlotTarget(move, effect.from_slot_id, "logStrongholdFrom"));
        chunks.push(logStrongholdSlotTarget(move, effect.slot_id, "logStrongholdTo"));
      } else {
        chunks.push(logStrongholdSlotTarget(move, effect.slot_id, "logStrongholdTarget"));
      }
      return chunks.filter(Boolean).join("");
    }).join("");
  }

  function renderLogMoveBody(move) {
    return renderMoveBody(move, logMode);
  }

  function renderMoveBody(move, mode) {
    var args = move.args || {};
    if (move.type === "takeTokens") {
      return logTokenSet((args.colors || []).reduce(function (counts, color) {
        counts[color] = (counts[color] || 0) + 1;
        return counts;
      }, {}));
    }
    if (move.type === "discardToken") {
      return args.returned ? logTokenSet(args.returned) : logTokenChip(args.color, 1, false);
    }
    if (move.type === "reserveMarket" || move.type === "reserveDeck") {
      var hiddenReserve = mode === "safe" && move.type === "reserveDeck";
      return [
        '<span class="log-source-chip">' + escapeHtml(t(move.type === "reserveDeck" ? "logBlindReserve" : "logFaceUpReserve")) + "</span>",
        logCardBadge(args.card_id, { hidden: hiddenReserve, tier: args.tier, card: args.card }),
        args.took_gold ? '<span class="log-source-chip gold">' + escapeHtml(t("logGoldTaken")) + " " + logTokenChip("gold", 1, true) + "</span>" : ""
      ].filter(Boolean).join("");
    }
    if (move.type === "buyMarket" || move.type === "buyReserved" || move.type === "strongholdConquest") {
      var hiddenBuy = mode === "safe" && move.type === "buyReserved" && args.reserved_from === "deck";
      var orientEffects = (args.orient_effects || []).map(function (effect) {
        if (effect.type === "copy_bonus") {
          return '<span class="log-source-chip">' + escapeHtml(t("orientCopyBonus")) + " " + TOKEN_LABEL[effect.color] + "</span>";
        }
        if (effect.type === "free_card") {
          return '<span class="log-source-chip">' + escapeHtml(t("orientFreeCard", { tier: effect.tier })) + " " + escapeHtml(effect.card_id) + "</span>";
        }
        return "";
      }).filter(Boolean).join("");
      return [
        logCardBadge(args.card_id, { hidden: hiddenBuy, tier: args.tier, card: args.card }),
        args.payment ? '<span class="log-source-chip">' + escapeHtml(t("logPayment")) + "</span>" : "",
        args.payment ? logPaymentSet(args.payment) : "",
        orientEffects,
        logStrongholdEffects(args.stronghold_effects),
        args.conquest ? '<span class="log-source-chip stronghold-log-chip">' + escapeHtml(t("strongholdConquest")) + "</span>" : "",
        args.noble_id ? '<span class="log-source-chip">' + escapeHtml(t("logNobleTitle")) + "</span>" : "",
        args.noble_id ? '<span class="log-source-chip">' + escapeHtml(args.noble && args.noble.name || args.noble_id) + "</span>" : ""
      ].filter(Boolean).join("");
    }
    if (move.type === "strongholdMove") {
      return logStrongholdMoveBody(move);
    }
    if (move.type === "chooseNoble") {
      return '<span class="log-source-chip">' + escapeHtml(args.noble && args.noble.name || args.noble_id || t("logNobleTitle")) + "</span>";
    }
    return move.notification && move.notification.log ? escapeHtml(move.notification.log) : escapeHtml(t("logGameTitle"));
  }

  function renderTransitionAction(transition) {
    if (!transition || !transition.type) return "";
    var move = {
      type: transition.type,
      player_id: transition.actor && transition.actor.id,
      args: transition.args || {},
      notification: {
        args: transition.actor ? { player_name: transition.actor.name } : {}
      }
    };
    return [
      '<span class="handoff-action-label">' + escapeHtml(t("handoffAction")) + "</span>",
      '<span class="handoff-action-title">' + escapeHtml(moveTitle(move)) + "</span>",
      renderMoveBody(move, "safe")
    ].filter(Boolean).join("");
  }

  function renderLogMove(move) {
    var moveArgs = move.notification && move.notification.args || {};
    var aiLabel = "";
    if (moveArgs.ai) aiLabel = t(moveArgs.ai_provider === "dinoboard" ? "logDinoBoardAi" : "logRandomAi");
    return [
      '<li><article class="log-entry">',
      '<div class="log-entry-head">',
      '<span class="log-entry-title">' + escapeHtml(moveTitle(move)) + "</span>",
      '<span class="log-entry-meta">' + escapeHtml(t("logMove", { move: move.move_id })) + "</span>",
      "</div>",
      '<div class="log-entry-actor">' + escapeHtml(playerNameForMove(move)) + (aiLabel ? ' · ' + escapeHtml(aiLabel) : "") + "</div>",
      '<div class="log-entry-body">' + renderLogMoveBody(move) + "</div>",
      "</article></li>"
    ].join("");
  }

  function replayMovesThroughCurrentStep() {
    if (!replayData || !Array.isArray(replayData.moves) || replayIndex < 0) return [];
    return replayData.moves.slice(0, replayIndex + 1).filter(Boolean);
  }

  function replayDeckElement(tier) {
    var ref = parseDeckActionValue(tier);
    var value = ref.marketId === ORIENT_MARKET_ID ? ORIENT_MARKET_ID + ":" + ref.tier : String(ref.tier);
    var button = document.querySelector('[data-reserve-deck="' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]');
    return button && button.closest(".deck-box") || null;
  }

  function replayPlayerSourceElement(playerId, suffix) {
    return document.querySelector(playerPanelTargetForPlayerId(playerId, suffix)) || null;
  }

  function replayMoveActor(move) {
    var player = state && state.players ? state.players.find(function (candidate) {
      return candidate.id === move.player_id;
    }) : null;
    var notificationName = move && move.notification && move.notification.args && move.notification.args.player_name;
    return {
      id: move && move.player_id || player && player.id || "",
      name: player && player.name || notificationName || t("players")
    };
  }

  function replayMoveFlightLabel(move) {
    var args = move && move.args || {};
    if (move.type === "takeTokens") {
      var colors = Array.isArray(args.colors) ? args.colors : [];
      return colors.map(function (color) { return TOKEN_LABEL[color] || ""; }).filter(Boolean).join(" ") || t("tokens");
    }
    if (move.type === "discardToken") {
      var returnedColors = args.returned ? bgaTokenListFromCounts(args.returned) : [];
      var discardColors = returnedColors.length ? returnedColors : [args.color];
      return discardColors.map(function (color) { return TOKEN_LABEL[color] || ""; }).filter(Boolean).join(" ") || t("tokens");
    }
    if (move.type === "reserveDeck") return t("blind");
    if (move.type === "reserveMarket") return t("reserve");
    if (move.type === "buyMarket" || move.type === "buyReserved" || move.type === "strongholdConquest") return t("buy");
    if (move.type === "strongholdMove") return t(strongholdMoveTitleKey(move));
    if (move.type === "chooseNoble") return t("logNobleTitle");
    return moveTitle(move);
  }

  function queueReplayMoveFlight(move, delta) {
    if (!move || delta <= 0 || replayIndex + delta < 0) return;
    var args = move.args || {};
    var source = null;
    var color = "gold";
    var targetSelector = playerPanelTargetForPlayerId(move.player_id, ".player-resource-panel");
    if (move.type === "takeTokens") {
      var firstColor = Array.isArray(args.colors) && args.colors[0] || "gold";
      color = firstColor;
      source = document.querySelector('[data-bank-color="' + firstColor + '"]') || el.bankTokens || el.bankPanel;
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".player-resource-panel");
    } else if (move.type === "discardToken") {
      var discardList = args.returned ? bgaTokenListFromCounts(args.returned) : [];
      color = discardList[0] || args.color || "gold";
      source = replayPlayerSourceElement(move.player_id, '.token[data-color="' + color + '"]') || replayPlayerSourceElement(move.player_id, ".player-resource-panel");
      targetSelector = ".bank-tokens";
    } else if (move.type === "reserveDeck") {
      color = "gold";
      source = replayDeckElement(args.market_id === ORIENT_MARKET_ID ? ORIENT_MARKET_ID + ":" + args.tier : args.tier) || el.market;
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".reserved-list");
    } else if (move.type === "reserveMarket") {
      color = args.card && args.card.color || "gold";
      source = cardElementForFlight(args.card || { id: args.card_id }) || el.market;
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".reserved-list");
    } else if (move.type === "buyMarket" || move.type === "buyReserved" || move.type === "strongholdConquest") {
      color = args.card && args.card.color || "gold";
      source = cardElementForFlight(args.card || { id: args.card_id }) || (move.type === "buyReserved" ? el.activeHandPanel : el.market);
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".purchased-summary");
    } else if (move.type === "strongholdMove") {
      var effect = args.stronghold_effects && args.stronghold_effects[0] || {};
      var actor = replayMoveActor(move);
      var targetCard = cardForMarketSlotId(replayStateForMove(move), effect.slot_id);
      color = strongholdPlayerColor(Number(effect.player_index) || 0);
      if (effect.type === "place") {
        source = replayPlayerSourceElement(actor.id, ".stronghold-stock-token") || replayPlayerSourceElement(actor.id, ".player-card");
        targetSelector = targetCard ? '[data-card-id="' + String(targetCard.id).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]' : ".market-panel";
      } else if (effect.type === "remove") {
        source = targetCard ? cardElementForFlight(targetCard) : el.market;
        targetSelector = playerPanelTargetForPlayerId(actor.id, ".stronghold-stock");
      } else {
        var sourceCard = cardForMarketSlotId(replayStateForMove(move), effect.from_slot_id);
        source = sourceCard ? cardElementForFlight(sourceCard) : el.market;
        targetSelector = targetCard ? '[data-card-id="' + String(targetCard.id).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]' : ".market-panel";
      }
    } else if (move.type === "chooseNoble") {
      source = document.querySelector('[data-noble-id="' + String(args.noble_id || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]') || document.querySelector(".noble-card") || el.nobles;
      color = "gold";
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".purchased-summary");
    } else {
      source = el.market || el.gamePanel;
    }
    queueFlightFromElement(source, color, replayMoveFlightLabel(move), targetSelector);
  }

  function nextMoveIdAfterMoves(game, moves) {
    var currentNext = Number(game && game.next_move_id) || 1;
    var moveMax = Array.isArray(moves) ? moves.reduce(function (max, move) {
      return Math.max(max, Number(move && move.move_id) || 0);
    }, 0) : 0;
    return Math.max(currentNext, moveMax + 1);
  }

  function renderLog() {
    if (el.logSafeMode) {
      el.logSafeMode.classList.toggle("active", logMode === "safe");
      el.logSafeMode.setAttribute("aria-pressed", logMode === "safe" ? "true" : "false");
    }
    if (el.logFullMode) {
      el.logFullMode.classList.toggle("active", logMode === "full");
      el.logFullMode.setAttribute("aria-pressed", logMode === "full" ? "true" : "false");
    }
    var sourceMoves = state.mode === "replay" ? replayMovesThroughCurrentStep() : state.moves;
    var moves = sourceMoves.slice().reverse();
    if (!moves.length) {
      el.actionLog.innerHTML = '<li><article class="log-entry"><div class="log-entry-head"><span class="log-entry-title">' + escapeHtml(t("logStart")) + '</span><span class="log-entry-meta">0</span></div><div class="log-entry-body">' + escapeHtml(state.log[0] || t("logStart")) + "</div></article></li>";
      return;
    }
    el.actionLog.innerHTML = moves.map(renderLogMove).join("");
  }

  function renderReplayStatus() {
    if (!state || state.mode !== "replay") {
      replayAutoplay = false;
      clearReplayAutoTimer();
      el.replayStatus.textContent = t("liveTable");
      el.prevMove.disabled = true;
      el.nextMove.disabled = true;
      if (el.replayAutoplay) {
        el.replayAutoplay.disabled = true;
        el.replayAutoplay.textContent = t("replayAutoplay");
      }
      if (el.replayJumpInput) {
        el.replayJumpInput.disabled = true;
        el.replayJumpInput.value = "0";
        el.replayJumpInput.max = "0";
      }
      if (el.replayJump) el.replayJump.disabled = true;
      if (el.continueReplay) el.continueReplay.disabled = true;
      el.exitReplay.disabled = true;
      return;
    }
    var total = replayData && replayData.moves ? replayData.moves.length : 0;
    var animating = !!(state.turnTransition && state.turnTransition.replay);
    el.replayStatus.textContent = t("replayMove", { current: Math.max(0, replayIndex + 1), total: total });
    el.prevMove.disabled = animating || replayIndex < 0;
    el.nextMove.disabled = animating || !replayData || replayIndex >= total - 1;
    if (el.replayAutoplay) {
      el.replayAutoplay.disabled = !replayData || (replayIndex >= total - 1 && !replayAutoplay);
      el.replayAutoplay.textContent = replayAutoplay ? t("replayPause") : t("replayAutoplay");
      el.replayAutoplay.setAttribute("aria-pressed", replayAutoplay ? "true" : "false");
    }
    if (el.replayJumpInput) {
      el.replayJumpInput.disabled = animating || !replayData;
      el.replayJumpInput.max = String(total);
      if (document.activeElement !== el.replayJumpInput) {
        el.replayJumpInput.value = String(Math.max(0, replayIndex + 1));
      }
    }
    if (el.replayJump) el.replayJump.disabled = animating || !replayData;
    if (el.continueReplay) el.continueReplay.disabled = animating || !replayData;
    el.exitReplay.disabled = animating;
  }

  function syncDockWidth() {
    if (!el.activeHandPanel) return;
    var topPanel = byId("table-top-panel");
    if (!topPanel || topPanel.hidden || !topPanel.getBoundingClientRect) return;
    var rect = topPanel.getBoundingClientRect();
    if (rect.width > 0) {
      el.activeHandPanel.style.setProperty("--table-dock-width", rect.width + "px");
    }
  }

  function syncTopDockOffset() {
    var root = document.documentElement;
    var topPanel = byId("table-top-panel");
    var isMobile = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
    if (!state || !isMobile || !topPanel || topPanel.hidden || !topPanel.getBoundingClientRect) {
      root.style.removeProperty("--table-top-dock-height");
      return;
    }
    var rect = topPanel.getBoundingClientRect();
    var offset = Math.ceil(rect.height + Math.max(rect.top, 0) + 8);
    root.style.setProperty("--table-top-dock-height", offset + "px");
  }

  function clearMobileTopStick() {
    var topPanel = byId("table-top-panel");
    if (topPanel) topPanel.classList.remove("mobile-top-stuck");
    if (el.tableTopSentinel) el.tableTopSentinel.style.height = "0px";
  }

  function syncMobileTopStick() {
    var topPanel = byId("table-top-panel");
    var sentinel = el.tableTopSentinel;
    var gamePanel = el.gamePanel;
    var isMobile = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
    if (!state || !isMobile || !topPanel || !sentinel || !gamePanel || gamePanel.hidden || !topPanel.getBoundingClientRect) {
      clearMobileTopStick();
      return;
    }
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || document.body.scrollTop || 0;
    var topOffset = 6;
    var sentinelRect = sentinel.getBoundingClientRect();
    var panelHeight = Math.ceil(topPanel.getBoundingClientRect().height || topPanel.offsetHeight || 0);
    var gameRect = gamePanel.getBoundingClientRect();
    var start = scrollTop + sentinelRect.top - topOffset;
    var end = scrollTop + gameRect.bottom - panelHeight - topOffset - 14;
    var shouldStick = scrollTop >= start && scrollTop <= end && panelHeight > 0;
    topPanel.classList.toggle("mobile-top-stuck", shouldStick);
    sentinel.style.height = shouldStick ? panelHeight + 8 + "px" : "0px";
  }

  function updateBoardProgress() {
    var nav = byId("board-progress");
    if (!nav) return;
    var links = Array.from(nav.querySelectorAll("[data-progress-target]"));
    syncBoardProgressOrder(nav, links);
    links = Array.from(nav.querySelectorAll("[data-progress-target]"));
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || document.body.scrollTop || 0;
    var maxScroll = Math.max((doc.scrollHeight || 0) - window.innerHeight, 1);
    var progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
    var center = window.innerHeight * 0.48;
    var activeId = "";
    var bestDistance = Infinity;
    links.forEach(function (link) {
      var section = byId(link.dataset.progressTarget);
      if (!section) return;
      var rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var sectionCenter = rect.top + rect.height / 2;
      var distance = Math.abs(sectionCenter - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        activeId = section.id;
      }
    });
    nav.style.setProperty("--progress", progress.toFixed(4));
    links.forEach(function (link) {
      link.classList.toggle("active", link.dataset.progressTarget === activeId);
    });
  }

  function boardSectionSortKey(link) {
    var section = byId(link.dataset.progressTarget);
    if (!section) return { top: Number.MAX_SAFE_INTEGER, left: Number.MAX_SAFE_INTEGER };
    var rect = section.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    return {
      top: Math.round(rect.top + scrollTop),
      left: Math.round(rect.left)
    };
  }

  function syncBoardProgressOrder(nav, links) {
    var sorted = links.slice().sort(function (a, b) {
      var aKey = boardSectionSortKey(a);
      var bKey = boardSectionSortKey(b);
      if (aKey.top !== bKey.top) return aKey.top - bKey.top;
      return aKey.left - bKey.left;
    });
    var changed = sorted.some(function (link, index) {
      return link !== links[index];
    });
    if (!changed) return;
    sorted.forEach(function (link) {
      nav.appendChild(link);
    });
  }

  function handleWindowScroll() {
    syncMobileTopStick();
    updateBoardProgress();
  }

  function render() {
    var saved = loadSavedState();
    el.resumeGame.hidden = !saved || !!state;
    el.startMessage.textContent = startMessageText;
    document.body.classList.toggle("game-active", !!state);
    document.documentElement.classList.toggle("game-active-root", !!state);
    document.body.classList.toggle("turn-locked", !!(state && (state.turnTransition || state.aiThinking)));
    document.body.classList.toggle("replay-mode", !!(state && state.mode === "replay"));
    var currentOrientTask = orientCurrentTask();
    document.body.classList.toggle("orient-free-selecting", !!(currentOrientTask && currentOrientTask.type === "free_card"));
    document.body.classList.toggle("orient-copy-selecting", !!(currentOrientTask && currentOrientTask.type === "copy_bonus"));
    document.body.classList.toggle("stronghold-selecting", !!(state && state.awaitingStrongholdAction));
    document.body.classList.toggle("stronghold-conquest-selecting", !!(state && state.awaitingStrongholdConquest));

    if (!state) {
      el.startPanel.hidden = false;
      el.gamePanel.hidden = true;
      setStartMode(startMode);
      renderHandoffOverlay();
      renderReplayStatus();
      syncTopDockOffset();
      return;
    }

    ensureStateRuleset(state);
    if (!state.turnTransition && !state.aiThinking && !isAiPlayer(activePlayer())) {
      lastHumanPlayerIndex = state.current;
    }

    el.startPanel.hidden = true;
    el.gamePanel.hidden = false;
    el.currentPlayer.textContent = displayPlayer().name;
    el.roundLabel.textContent = String(state.round);
    el.moveLabel.textContent = String((state.next_move_id || 1) - 1);
    el.gameStateLabel.textContent = gameStateText();
    if (state.turnTransition) {
      messageText = state.turnTransition.replay
        ? t("msgReplayStepAnimating", { move: state.turnTransition.move_id || "", seconds: replayStepSecondsRemaining() })
        : t("msgSwitchingPlayer", { seconds: transitionSecondsRemaining() });
      messageKind = "ok";
    } else if (state.aiThinking) {
      messageText = t("msgAiThinking", { player: activePlayer().name });
      messageKind = "ok";
    }
    el.message.textContent = messageText;
    el.message.classList.toggle("ok", messageKind === "ok");

    renderBank();
    renderNobles();
    renderMarket();
    renderPlayers();
    renderActiveReserved();
    renderDiscard();
    renderNobleChoice();
    renderPaymentChoice();
    renderOrientAction();
    renderStrongholdAction();
    renderLog();
    renderReplayStatus();
    renderHandoffOverlay();
    syncDockWidth();
    syncTopDockOffset();
    syncMobileTopStick();
    flushPendingFlight();
    updateBoardProgress();
    scheduleTurnTransitionTimer();
    scheduleAiTurn();
  }

  function scrollToGameTable() {
    if (!el.gamePanel || el.gamePanel.hidden) return;
    var target = el.gamePanel;
    var schedule = window.requestAnimationFrame || function (callback) {
      return window.setTimeout(callback, 16);
    };
    schedule(function () {
      if (!target || !target.scrollIntoView) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function gameStateText() {
    if (state.mode === "replay") return t("gameReplay");
    if (state.gameOver) return t("gameFinished");
    if (state.aiThinking) return t("gameAiThinking");
    if (state.turnTransition) return t("gameTurnTransition");
    if (pendingPayment) return t("gamePayment");
    if (state.awaitingDiscard) return t("gameDiscard");
    if (state.awaitingOrientAction) return t("orientAbilityPending");
    if (state.awaitingStrongholdAction) return t("strongholdActionTitle");
    if (state.awaitingStrongholdConquest) return t("strongholdConquestTitle");
    if (state.awaitingNobleChoice) return t("gameNoble");
    if (state.endTriggered) return t("gameFinal", { turns: state.finalTurnsLeft });
    return t("gameProgress");
  }

  function reservePreviewTapMode() {
    return !!(window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse), (max-width: 760px)").matches);
  }

  function holdTapPreviewOpen() {
    tapPreviewIgnoreCloseUntil = Date.now() + 650;
  }

  function closeTapPreviews(except, force) {
    if (!except && !force && Date.now() < tapPreviewIgnoreCloseUntil) return;
    Array.from(document.querySelectorAll(".reserve-badge.preview-open, .log-card-badge.preview-open")).forEach(function (badge) {
      if (badge !== except) badge.classList.remove("preview-open");
    });
  }

  function closeBonusPreviews(except) {
    Array.from(document.querySelectorAll(".bonus-pill.preview-open")).forEach(function (pill) {
      if (pill !== except) pill.classList.remove("preview-open");
    });
  }

  function aiLevelLabel(level) {
    var keyByLevel = {
      easy: "aiLevelEasy",
      balanced: "aiLevelBalanced",
      expert: "aiLevelExpert"
    };
    return t(keyByLevel[normalizeAiLevel(level)] || "aiLevelBalanced");
  }

  function aiLevelOptionsHtml(currentLevel) {
    var selectedLevel = normalizeAiLevel(currentLevel);
    var labels = {
      easy: "aiLevelEasy",
      balanced: "aiLevelBalanced",
      expert: "aiLevelExpert"
    };
    return AI_LEVELS.map(function (level) {
      return '<option value="' + level + '" data-i18n="' + labels[level] + '" ' + (level === selectedLevel ? "selected" : "") + ">" + t(labels[level]) + "</option>";
    }).join("");
  }

  function playerAiControlsHtml(player, playerIndex) {
    var ai = player.ai || { enabled: false, level: "balanced" };
    var level = normalizeAiLevel(ai.level || ai.mode);
    var locked = ai.enabled && aiToggleLockedForPlayer(playerIndex);
    var lockTitle = locked ? ' title="' + escapeHtml(t("msgCannotDisableActiveAi")) + '"' : "";
    var lockAttrs = locked ? ' disabled aria-disabled="true"' : "";
    return [
      '<div class="player-ai-control ' + (ai.enabled ? "active" : "") + '"' + lockTitle + '>',
      '<label class="ai-toggle compact-toggle">',
      '<input type="checkbox" data-player-ai-toggle="' + playerIndex + '" ' + (ai.enabled ? "checked" : "") + lockAttrs + ">",
      '<span data-i18n="aiTakeover">' + t("aiTakeover") + "</span>",
      "</label>",
      '<label class="ai-level compact-level">',
      '<span data-i18n="aiLevel">' + t("aiLevel") + "</span>",
      '<select data-player-ai-level="' + playerIndex + '" aria-label="' + escapeHtml(t("aiLevel")) + '">',
      aiLevelOptionsHtml(level),
      "</select>",
      "</label>",
      "</div>"
    ].join("");
  }

  function availableTakeColors() {
    if (!state) return [];
    return COLORS.filter(function (color) {
      return state.bank[color] > 0;
    });
  }

  function differentTakeTargetCount() {
    return Math.min(3, availableTakeColors().length);
  }

  function pendingTakeIsLegal() {
    if (!state || pendingTake.length === 0) return false;
    if (pendingTake.length === 2 && pendingTake[0] === pendingTake[1]) {
      return state.bank[pendingTake[0]] >= 4;
    }
    if (pendingTake.length === differentTakeTargetCount()) {
      var unique = new Set(pendingTake);
      return unique.size === pendingTake.length;
    }
    return false;
  }

  function selectTake(color) {
    if (!canAct()) {
      showMessage(t("msgResolveStepFirst"));
      render();
      return;
    }
    if (color === "gold") {
      showMessage(t("msgGoldReserveOnly"));
      render();
      return;
    }
    if (pendingTake.length >= 3) {
      showMessage(t("msgTakeShape"));
      render();
      return;
    }
    var already = pendingTake.filter(function (item) { return item === color; }).length;
    if (state.bank[color] <= already) {
      showMessage(t("msgBankStackLow"));
      render();
      return;
    }
    if (already > 0) {
      if (pendingTake.some(function (item) { return item !== color; })) {
        showMessage(t("msgTwoSameWhole"));
        render();
        return;
      }
      if (already >= 2) {
        showMessage(t("msgTwoSameOnly"));
        render();
        return;
      }
      if (state.bank[color] < 4) {
        showMessage(t("msgTwoSameNeedFour"));
        render();
        return;
      }
    } else if (pendingTake.length === 2 && pendingTake[0] === pendingTake[1]) {
      showMessage(t("msgTwoSameWhole"));
      render();
      return;
    } else if (pendingTake.indexOf(color) >= 0) {
      showMessage(t("msgThreeDifferent"));
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
      showMessage(t("msgSelectLegalTake"));
      render();
      return;
    }
    var player = activePlayer();
    var taken = pendingTake.slice();
    queueFlightFromSelector(".bank-tokens", taken[0] || "gold", t("tokens"), playerPanelTarget(".player-resource-panel"));
    taken.forEach(function (color) {
      state.bank[color] -= 1;
      player.tokens[color] += 1;
    });
    pendingTake = [];
    logEntry(t("logTook", { player: player.name, tokens: taken.map(function (color) { return TOKEN_LABEL[color]; }).join(", ") }));
    afterAction("takeTokens", { colors: taken });
  }

  function reserveMarket(value, trigger) {
    if (!canAct()) return;
    var ref = parseMarketActionValue(value);
    var player = activePlayer();
    if (player.reserved.length >= 3) {
      showMessage(t("msgReserveLimit"));
      render();
      return;
    }
    var card = marketCardAt(state, ref);
    if (!card) {
      showMessage(t("msgMarketGone"));
      render();
      return;
    }
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var strongholdAccess = strongholdAccessStatus(slotId, state.current);
    if (!strongholdAccess.ok) {
      showMessage(strongholdAccess.reason || t("strongholdBlocked"));
      render();
      return;
    }
    queueFlightFromElement(trigger && trigger.closest(".dev-card"), card.color, t("reserve"), playerPanelTarget(".reserved-list"));
    clearStrongholdsAtSlot(state, slotId);
    fillMarketSlotById(state, ref);
    reserveCard(player, card, "reserveMarket", { card_id: card.id, card: card, tier: ref.tier, market_index: ref.index, market_id: ref.marketId, market_slot_id: slotId });
  }

  function reserveDeck(tier, trigger) {
    if (!canAct()) return;
    var ref = parseDeckActionValue(tier);
    var player = activePlayer();
    if (player.reserved.length >= 3) {
      showMessage(t("msgReserveLimit"));
      render();
      return;
    }
    var card = drawCardFromDeck(state, ref.marketId, ref.tier, { reason: "reserve-deck" });
    if (!card) {
      showMessage(t("msgDeckEmpty"));
      render();
      return;
    }
    queueFlightFromElement(trigger && trigger.closest(".deck-box"), "gold", t("blind"), playerPanelTarget(".reserved-list"));
    reserveCard(player, card, "reserveDeck", {
      card_id: card.id,
      card: card,
      tier: ref.tier,
      market_id: ref.marketId,
      deck_slot_id: deckSlotIdFor(ref.marketId, ref.tier)
    });
  }

  function reserveCard(player, card, type, args) {
    var reservedCard = clone(card);
    reservedCard.reserved_from = type === "reserveDeck" ? "deck" : "market";
    reservedCard.reserved_public = type !== "reserveDeck";
    reservedCard.market_id = args.market_id || BASE_MARKET_ID;
    if (args.market_slot_id) reservedCard.market_slot_id = args.market_slot_id;
    if (args.deck_slot_id) reservedCard.deck_slot_id = args.deck_slot_id;
    player.reserved.push(reservedCard);
    var tookGold = false;
    if (state.bank.gold > 0) {
      state.bank.gold -= 1;
      player.tokens.gold += 1;
      tookGold = true;
    }
    var reserveText = type === "reserveDeck" ? t("logBlindTierCard", { tier: card.tier }) : card.id;
    logEntry(t(tookGold ? "logReservedGold" : "logReserved", { player: player.name, card: reserveText }));
    args.took_gold = tookGold;
    afterAction(type, args);
  }

  function removeMarketCardForDeferredRefill(game, ref) {
    if (!game || !ref) return null;
    ensureMarketStructure(game);
    var market = ref.marketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
    if (!market || !market[ref.tier] || !market[ref.tier][ref.index]) return null;
    market[ref.tier][ref.index] = null;
    return { marketId: ref.marketId, tier: ref.tier, index: ref.index };
  }

  function refillDeferredMarketSlots(slots) {
    (slots || []).forEach(function (slot) {
      fillMarketSlotById(state, slot);
    });
  }

  function appendDeferredMarketRefills(args, slots) {
    if (!args) return;
    var validSlots = (slots || []).filter(Boolean);
    if (!validSlots.length) return;
    if (!Array.isArray(args._deferred_refills)) args._deferred_refills = [];
    args._deferred_refills = args._deferred_refills.concat(validSlots);
  }

  function flushDeferredMarketRefills(args) {
    if (!args || !Array.isArray(args._deferred_refills)) return;
    var refills = args._deferred_refills.filter(Boolean);
    delete args._deferred_refills;
    refillDeferredMarketSlots(refills);
  }

  function orientTasksForCard(card) {
    if (!cardIsOrient(card)) return [];
    var tasks = [];
    if (orientCardHasAbility(card, "copy_bonus")) {
      tasks.push({ type: "copy_bonus", card_id: card.id });
    }
    orientCardAbilities(card, "take_level_free").forEach(function (ability) {
      tasks.push({ type: "free_card", card_id: card.id, tier: Number(ability.free_tier) || 1 });
    });
    return tasks;
  }

  function orientActionEffects(action) {
    if (!action) return [];
    if (!Array.isArray(action.effects)) action.effects = [];
    return action.effects;
  }

  function beginOrientAction(moveType, args, actor, tasks, deferredRefills) {
    var queue = (tasks || []).filter(Boolean);
    if (!queue.length) {
      appendDeferredMarketRefills(args, deferredRefills);
      afterAction(moveType, args);
      return;
    }
    state.awaitingOrientAction = {
      move_type: moveType,
      args: args || {},
      actor: actor,
      queue: queue,
      effects: [],
      deferred_refills: (deferredRefills || []).filter(Boolean)
    };
    pendingOrientAction = state.awaitingOrientAction;
    pendingPayment = null;
    showMessage(queue[0].type === "free_card" ? t("msgOrientChooseFree", { tier: queue[0].tier }) : queue[0].type === "copy_bonus" ? t("msgOrientChooseCopy", { card: queue[0].card_id }) : t("msgOrientAbilityPending"), "ok");
    render();
  }

  function finishOrientTask() {
    var action = state && state.awaitingOrientAction;
    if (!action) return;
    action.queue.shift();
    if (action.queue.length) {
      showMessage(action.queue[0].type === "free_card" ? t("msgOrientChooseFree", { tier: action.queue[0].tier }) : action.queue[0].type === "copy_bonus" ? t("msgOrientChooseCopy", { card: action.queue[0].card_id }) : t("msgOrientAbilityPending"), "ok");
      render();
      return;
    }
    var args = action.args || {};
    if (action.effects && action.effects.length) args.orient_effects = clone(action.effects);
    appendDeferredMarketRefills(args, action.deferred_refills);
    var moveType = action.move_type;
    state.awaitingOrientAction = null;
    pendingOrientAction = null;
    showMessage("");
    afterAction(moveType, args);
  }

  function resolveOrientCopy(cardId) {
    var action = state && state.awaitingOrientAction;
    var task = orientCurrentTask();
    var player = activePlayer();
    var target = task && findPlayerPurchasedCard(player, task.card_id);
    var source = findPlayerPurchasedCard(player, cardId);
    if (!action || !task || task.type !== "copy_bonus" || !target || !source) return;
    var color = cardPrimaryBonusColor(source);
    if (!color) return;
    var previousColor = target.copied_color;
    if (previousColor && player.bonuses[previousColor] > 0) player.bonuses[previousColor] -= 1;
    target.copied_color = color;
    target.copied_from_id = source.id;
    target.color = color;
    target.effective_bonuses = emptyCounts(false);
    target.effective_bonuses[color] = 1;
    player.bonuses[color] = (player.bonuses[color] || 0) + 1;
    orientActionEffects(action).push({ type: "copy_bonus", card_id: target.id, copied_from_id: source.id, color: color });
    logEntry(player.name + " resolved Orient copy for " + target.id + " as " + TOKEN_LABEL[color] + ".");
    finishOrientTask();
  }

  function resolveOrientFreeCard(value, trigger) {
    var action = state && state.awaitingOrientAction;
    var task = orientCurrentTask();
    var player = activePlayer();
    if (!action || !task || task.type !== "free_card") return;
    var ref = parseMarketActionValue(value);
    if (ref.tier !== task.tier) return;
    var card = marketCardAt(state, ref);
    if (!card) return;
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var strongholdAccess = strongholdAccessStatus(slotId, state.current);
    if (!strongholdAccess.ok) {
      showMessage(strongholdAccess.reason || t("strongholdBlocked"));
      render();
      return;
    }
    var strongholdsReturned = clearStrongholdsAtSlot(state, slotId);
    removeMarketCardForDeferredRefill(state, ref);
    action.deferred_refills.push({ marketId: ref.marketId, tier: ref.tier, index: ref.index });
    var acquired = purchaseRecordCard(card);
    player.purchased.push(acquired);
    applyCardBonuses(player, acquired);
    var source = trigger && trigger.closest(".orient-choice-card") || cardElementForFlight(card);
    queueFlightFromElement(source, card.color, t("orientFreeCard", { tier: ref.tier }), playerPanelTarget(".purchased-summary"));
    orientActionEffects(action).push({ type: "free_card", source_card_id: task.card_id, card_id: acquired.id, tier: ref.tier, market_id: ref.marketId, market_slot_id: slotId, strongholds_returned: strongholdsReturned, card: clone(acquired) });
    logEntry(player.name + " took " + acquired.id + " for free with an Orient ability.");
    var nested = orientTasksForCard(acquired);
    action.queue.splice.apply(action.queue, [1, 0].concat(nested));
    finishOrientTask();
  }

  function scrollToPaymentPanel() {
    if (!el.paymentPanel || el.paymentPanel.hidden) return;
    if (el.activeHandPanel) el.activeHandPanel.open = true;
  }

  function beginPaymentChoice(source, value, card) {
    var player = activePlayer();
    var abilityStatus = orientAbilityBuyStatus(card, player);
    if (!abilityStatus.ok) {
      showMessage(abilityStatus.reason || t("msgOrientAbilityPending"));
      render();
      return false;
    }
    var afford = affordability(player, card);
    if (!afford.ok) {
      showMessage(t("msgNotEnoughForCard"));
      render();
      return false;
    }
    pendingTake = [];
    pendingPayment = {
      source: source,
      value: String(value),
      card_id: card.id,
      payment: emptyPaymentPlan()
    };
    showMessage(t("msgChoosePayment", { card: card.id }), "ok");
    render();
    scrollToPaymentPanel();
    return true;
  }

  function paymentSourceElement(payment) {
    if (!payment) return null;
    var attr = payment.source === "market" ? "data-buy-market" : "data-buy-reserved";
    var value = String(payment.value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    var button = document.querySelector("[" + attr + '="' + value + '"]');
    return button && button.closest(".dev-card");
  }

  function adjustPayment(kind, color, delta) {
    if (!pendingPayment) return;
    var context = pendingPaymentContext();
    if (!context) {
      render();
      return;
    }
    var needs = paymentNeeds(context.player, context.card);
    var payment = pendingPayment.payment;
    var selected = (payment.colored[color] || 0) + (payment.gold[color] || 0) + (payment.virtual[color] || 0);
    if (kind === "colored") {
      if (delta > 0 && selected < needs[color] && (payment.colored[color] || 0) < (context.player.tokens[color] || 0)) {
        payment.colored[color] += 1;
      } else if (delta < 0 && payment.colored[color] > 0) {
        payment.colored[color] -= 1;
      }
    } else if (kind === "gold") {
      if (delta > 0 && selected < needs[color] && paymentGoldTotal(payment) < (context.player.tokens.gold || 0)) {
        payment.gold[color] += 1;
      } else if (delta < 0 && payment.gold[color] > 0) {
        payment.gold[color] -= 1;
      }
    } else if (kind === "virtual") {
      if (delta > 0 && selected < needs[color] && paymentVirtualTotal(payment) < orientVirtualGoldCapacity(context.player)) {
        payment.virtual[color] += 1;
      } else if (delta < 0 && payment.virtual[color] > 0) {
        payment.virtual[color] -= 1;
      }
    }
    pendingPayment.payment = normalizePaymentPlan(context.player, context.card, payment);
    showMessage(t("msgChoosePayment", { card: context.card.id }), "ok");
    render();
  }

  function cyclePaymentToken(color) {
    if (!pendingPayment || ALL_TOKENS.indexOf(color) < 0) return;
    var context = pendingPaymentContext();
    if (!context) {
      render();
      return;
    }
    var payment = pendingPayment.payment;
    if (!payment.selected_tokens) payment.selected_tokens = emptyCounts(true);
    var max = paymentTokenUsefulMax(context, payment, color);
    var current = Number(payment.selected_tokens[color]) || 0;
    if (max <= 0 && current <= 0) return;
    payment.selected_tokens[color] = current >= max ? 0 : current + 1;
    pendingPayment.payment = normalizePaymentPlan(context.player, context.card, payment);
    showMessage(t("msgChoosePayment", { card: context.card.id }), "ok");
    render();
  }

  function togglePaymentVirtualCard(cardId) {
    if (!pendingPayment) return;
    var context = pendingPaymentContext();
    if (!context) {
      render();
      return;
    }
    var payment = pendingPayment.payment;
    var current = selectedVirtualGoldCardIds(context.player, payment);
    payment.selected_virtual_card_ids = current.indexOf(cardId) >= 0 ? [] : [cardId];
    pendingPayment.payment = normalizePaymentPlan(context.player, context.card, payment);
    showMessage(t("msgChoosePayment", { card: context.card.id }), "ok");
    render();
  }

  function togglePaymentDiscardCard(cardId) {
    if (!pendingPayment) return;
    var context = pendingPaymentContext();
    if (!context) {
      render();
      return;
    }
    var requirement = orientDiscardCost(context.card);
    if (!requirement) return;
    var payment = pendingPayment.payment;
    var selected = Array.isArray(payment.discard_cards) ? payment.discard_cards.slice() : [];
    var index = selected.indexOf(cardId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else if (selected.length < requirement.count) {
      selected.push(cardId);
    }
    payment.discard_cards = selected;
    pendingPayment.payment = normalizePaymentPlan(context.player, context.card, payment);
    showMessage(t("msgChoosePayment", { card: context.card.id }), "ok");
    render();
  }

  function clearPaymentSelection() {
    if (!pendingPayment) return;
    pendingPayment.payment = emptyPaymentPlan();
    showMessage(t("msgPaymentCleared"), "ok");
    render();
  }

  function cancelPayment() {
    if (!pendingPayment) return;
    if (pendingPayment.source === "strongholdConquest" && pendingPayment.parent) {
      state.awaitingStrongholdConquest = clone(pendingPayment.parent);
    }
    pendingPayment = null;
    showMessage(t("msgPaymentCancelled"), "ok");
    render();
  }

  function completePurchase(context, payment, sourceElement, options) {
    var card = context.card;
    var purchasedCard = purchaseRecordCard(card);
    var flightSource = sourceElement || cardElementForFlight(card) || el.market;
    var player = context.player;
    var actor = { id: player.id, name: player.name };
    var paymentArgs = paymentMoveArgs(payment, player);
    var usedVirtualCards = paymentArgs.virtual_card_ids || [];
    var discardedCostCards = payment.discard_cards || [];
    var args = {
      card_id: card.id,
      payment: paymentArgs
    };
    if (options && options.ai) args.ai = true;
    if (context.type === "strongholdConquest" && context.parent) {
      args.conquest_parent = clone(context.parent);
      args.conquest = true;
    }
    spendForCard(player, paymentSpend(payment));
    var removedVirtual = removePurchasedCardsByIds(player, usedVirtualCards);
    var removedDiscard = removePurchasedCardsByIds(player, discardedCostCards);
    if (removedVirtual.length) {
      args.payment.virtual_cards = removedVirtual.map(function (removed) { return clone(removed); });
    }
    if (removedDiscard.length) {
      args.orient_discarded_cards = removedDiscard.map(function (removed) { return clone(removed); });
    }
    player.purchased.push(purchasedCard);
    applyCardBonuses(player, purchasedCard);
    logEntry(t("logBought", { player: player.name, card: card.id, points: card.points }));
    var deferredRefills = [];
    if (context.type === "buyMarket" || context.type === "strongholdConquest") {
      args.tier = context.tier;
      args.market_index = context.index;
      args.market_id = context.market_id || BASE_MARKET_ID;
      args.market_slot_id = marketSlotId(state, args.market_id, context.tier, context.index);
      args.card = purchasedCard;
      args.strongholds_returned = clearStrongholdsAtSlot(state, args.market_slot_id);
      deferredRefills.push(removeMarketCardForDeferredRefill(state, { marketId: args.market_id, tier: context.tier, index: context.index }));
    } else {
      args.tier = card.tier;
      args.reserved_index = context.index;
      args.card = purchasedCard;
      args.reserved_from = card.reserved_from || "market";
      args.market_id = card.market_id || BASE_MARKET_ID;
      if (card.market_slot_id) args.market_slot_id = card.market_slot_id;
      if (card.deck_slot_id) args.deck_slot_id = card.deck_slot_id;
      player.reserved.splice(context.index, 1);
    }
    queueFlightFromElement(flightSource, card.color, t("buy"), playerPanelTarget(".purchased-summary"));
    pendingPayment = null;
    showMessage("");
    beginOrientAction(context.type, args, actor, orientTasksForCard(purchasedCard), deferredRefills);
  }

  function confirmPayment() {
    if (!pendingPayment || !state || state.mode === "replay" || state.gameOver) return;
    var context = pendingPaymentContext();
    if (!context) {
      pendingPayment = null;
      showMessage(t("msgMarketGone"));
      render();
      return;
    }
    var payment = clone(pendingPayment.payment);
    payment = normalizePaymentPlan(context.player, context.card, payment);
    if (!paymentIsLegal(context.player, context.card, payment)) {
      showMessage(t("msgPaymentInvalid"));
      render();
      return;
    }
    var sourceElement = paymentSourceElement(pendingPayment);
    completePurchase(context, payment, sourceElement);
  }

  function buyMarket(value) {
    if (!canAct()) return;
    var ref = parseMarketActionValue(value);
    var card = marketCardAt(state, ref);
    if (!card) {
      showMessage(t("msgMarketGone"));
      render();
      return;
    }
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var strongholdAccess = strongholdAccessStatus(slotId, state.current);
    if (!strongholdAccess.ok) {
      showMessage(strongholdAccess.reason || t("strongholdBlocked"));
      render();
      return;
    }
    var abilityStatus = orientAbilityBuyStatus(card, activePlayer());
    if (!abilityStatus.ok) {
      showMessage(t("msgOrientAbilityPending"));
      render();
      return;
    }
    beginPaymentChoice("market", value, card);
  }

  function buyReserved(value) {
    if (!canAct()) return;
    var parts = value.split(":");
    var playerIndex = Number(parts[0]);
    var index = Number(parts[1]);
    if (playerIndex !== state.current) return;
    var player = activePlayer();
    var card = player.reserved[index];
    if (!card) {
      showMessage(t("msgMarketGone"));
      render();
      return;
    }
    var abilityStatus = orientAbilityBuyStatus(card, player);
    if (!abilityStatus.ok) {
      showMessage(t("msgOrientAbilityPending"));
      render();
      return;
    }
    beginPaymentChoice("reserved", value, card);
  }

  function afterAction(type, args) {
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if (aiTurnInProgress) args = aiMoveArgs(args);
    resolveStrongholdsOrTurn(type, args, actor);
  }

  function resolveTokenCapOrNoblesOrTurn(type, args, actor) {
    var player = activePlayer();
    if (totalTokens(player) > 10) {
      state.awaitingDiscard = true;
      showMessage(t("msgMustDiscard", { player: player.name, count: totalTokens(player) }));
      recordMove(type, args, actor);
      saveState();
      render();
      return;
    }
    resolveNoblesOrTurn(type, args, actor);
  }

  function resolveConquestOrTokenCapOrTurn(type, args, actor) {
    if (type !== "strongholdConquest" && strongholdsEnabledForRuleset(state.ruleset) && beginStrongholdConquestIfAvailable({ move_type: type, args: args || {}, actor: actor || {} })) return;
    resolveTokenCapOrNoblesOrTurn(type, args, actor);
  }

  function actionAcquiredDevelopmentCard(type, args) {
    return !!(args && args.card_id && (type === "buyMarket" || type === "buyReserved" || type === "strongholdConquest"));
  }

  function resolveStrongholdsOrTurn(type, args, actor) {
    if (strongholdsEnabledForRuleset(state.ruleset) && actionAcquiredDevelopmentCard(type, args)) {
      state.awaitingStrongholdAction = {
        move_type: type,
        args: args || {},
        actor: actor || {},
        effects: []
      };
      pendingPayment = null;
      showMessage(t("strongholdActionBody"), "ok");
      saveState();
      render();
      return;
    }
    flushDeferredMarketRefills(args);
    resolveConquestOrTokenCapOrTurn(type, args, actor);
  }

  function strongholdConquestChoices(game, playerIndex) {
    if (!strongholdsEnabledForRuleset(game.ruleset)) return [];
    return marketRefsForStrongholds(game).filter(function (ref) {
      var card = marketCardAt(game, ref);
      if (!card || !strongholdConquestSlotEligible(game, ref.slotId, playerIndex)) return false;
      var player = game.players[playerIndex];
      return affordability(player, card).ok && orientAbilityBuyStatus(card, player).ok;
    });
  }

  function beginStrongholdConquestIfAvailable(parentAction) {
    var playerIndex = state.current;
    var choices = strongholdConquestChoices(state, playerIndex);
    if (!choices.length) return false;
    state.awaitingStrongholdConquest = {
      move_type: parentAction.move_type,
      args: clone(parentAction.args || {}),
      actor: clone(parentAction.actor || { id: activePlayer().id, name: activePlayer().name })
    };
    showMessage(t("strongholdConquestBody"), "ok");
    saveState();
    render();
    return true;
  }

  function skipStrongholdConquest() {
    var conquest = state && state.awaitingStrongholdConquest;
    if (!conquest) return;
    state.awaitingStrongholdConquest = null;
    showMessage("");
    resolveTokenCapOrNoblesOrTurn(conquest.move_type, conquest.args || {}, conquest.actor || { id: activePlayer().id, name: activePlayer().name });
  }

  function beginStrongholdConquestPayment(value, trigger) {
    var conquest = state && state.awaitingStrongholdConquest;
    if (!conquest) return false;
    var ref = parseMarketActionValue(value);
    var card = marketCardAt(state, ref);
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    if (!card || !strongholdConquestSlotEligible(state, slotId, state.current)) {
      showMessage(t("strongholdNoLegalTarget"));
      render();
      return true;
    }
    var player = activePlayer();
    if (!affordability(player, card).ok || !orientAbilityBuyStatus(card, player).ok) {
      showMessage(t("msgNotEnoughForCard"));
      render();
      return true;
    }
    pendingTake = [];
    pendingPayment = {
      source: "strongholdConquest",
      value: String(value),
      card_id: card.id,
      parent: clone(conquest),
      payment: emptyPaymentPlan()
    };
    state.awaitingStrongholdConquest = null;
    showMessage(t("msgChoosePayment", { card: card.id }), "ok");
    render();
    scrollToPaymentPanel();
    return true;
  }

  function finishStrongholdAction(effect) {
    var action = state && state.awaitingStrongholdAction;
    if (!action) return;
    if (effect) {
      if (!Array.isArray(action.effects)) action.effects = [];
      action.effects.push(effect);
      action.args.stronghold_effects = clone(action.effects);
    }
    var moveType = action.move_type;
    var args = action.args || {};
    var actor = action.actor || { id: activePlayer().id, name: activePlayer().name };
    state.awaitingStrongholdAction = null;
    flushDeferredMarketRefills(args);
    showMessage("");
    resolveConquestOrTokenCapOrTurn(moveType, args, actor);
  }

  function resolveStrongholdPlace(value, trigger) {
    if (!state || !state.awaitingStrongholdAction) return;
    var ref = parseMarketActionValue(value);
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var holders = strongholdsAtSlot(state, slotId);
    var playerIndex = state.current;
    if (!marketCardAt(state, ref) || playerStrongholdSupply(state, playerIndex) <= 0) return;
    if (!canPlaceOrMoveStrongholdToSlot(state, slotId, playerIndex)) {
      showMessage(t("strongholdNoLegalTarget"));
      render();
      return;
    }
    holders.push(playerIndex);
    queueFlightFromElement(document.querySelector('.player-card[data-player-index="' + playerIndex + '"] .stronghold-stock-token') || document.querySelector('.player-card[data-player-index="' + playerIndex + '"]'), strongholdPlayerColor(playerIndex), t("strongholdPlace"), trigger && trigger.closest("[data-market-slot-id]") || cardElementForFlight(marketCardAt(state, ref)));
    finishStrongholdAction({ type: "place", slot_id: slotId, player_index: playerIndex });
  }

  function resolveStrongholdMove(value, trigger, sourceSlotOverride) {
    if (!state || !state.awaitingStrongholdAction) return;
    var ref = parseMarketActionValue(value);
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var playerIndex = state.current;
    if (!marketCardAt(state, ref)) return;
    if (!canPlaceOrMoveStrongholdToSlot(state, slotId, playerIndex)) {
      showMessage(t("strongholdNoLegalTarget"));
      render();
      return;
    }
    var sourceSlot = sourceSlotOverride || state.awaitingStrongholdAction.selected_source_slot_id || Object.keys(ensureStrongholds(state).placements).find(function (candidate) {
      return candidate !== slotId && strongholdsAtSlot(state, candidate).indexOf(playerIndex) >= 0;
    });
    if (!sourceSlot || sourceSlot === slotId) return;
    var sourceHolders = strongholdsAtSlot(state, sourceSlot);
    if (sourceHolders.indexOf(playerIndex) < 0) return;
    sourceHolders.splice(sourceHolders.indexOf(playerIndex), 1);
    if (!sourceHolders.length) delete state.strongholds.placements[sourceSlot];
    strongholdsAtSlot(state, slotId).push(playerIndex);
    var sourceSelector = '[data-market-slot-id="' + String(sourceSlot).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"] .stronghold-token[data-player-index="' + playerIndex + '"]';
    queueFlightFromElement(document.querySelector(sourceSelector), strongholdPlayerColor(playerIndex), t("strongholdMove"), trigger && trigger.closest("[data-market-slot-id]") || cardElementForFlight(marketCardAt(state, ref)));
    finishStrongholdAction({ type: "move", from_slot_id: sourceSlot, slot_id: slotId, player_index: playerIndex });
  }

  function resolveStrongholdRemove(value, trigger) {
    if (!state || !state.awaitingStrongholdAction) return;
    var ref = parseMarketActionValue(value);
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var playerIndex = state.current;
    var holders = strongholdsAtSlot(state, slotId);
    if (!canRemoveOpponentStrongholdAtSlot(state, slotId, playerIndex)) {
      showMessage(t("strongholdNoLegalTarget"));
      render();
      return;
    }
    var removeIndex = holders.findIndex(function (holder) { return holder !== playerIndex; });
    if (removeIndex < 0) return;
    var removedPlayer = holders.splice(removeIndex, 1)[0];
    if (!holders.length) delete state.strongholds.placements[slotId];
    queueFlightFromElement(trigger && trigger.querySelector && trigger.querySelector('.stronghold-token[data-player-index="' + removedPlayer + '"]') || trigger && trigger.closest("[data-market-slot-id]"), strongholdPlayerColor(removedPlayer), t("strongholdRemove"), '.player-card[data-player-index="' + removedPlayer + '"] .stronghold-stock-token');
    finishStrongholdAction({ type: "remove", slot_id: slotId, player_index: playerIndex, removed_player_index: removedPlayer });
  }

  function resolveStrongholdCardClick(value, trigger) {
    if (!state || !state.awaitingStrongholdAction) return false;
    var ref = parseMarketActionValue(value);
    var card = marketCardAt(state, ref);
    if (!card) return true;
    var slotId = marketSlotId(state, ref.marketId, ref.tier, ref.index);
    var holders = strongholdsAtSlot(state, slotId);
    var playerIndex = state.current;
    if (state.awaitingStrongholdAction.selected_source_slot_id) {
      if (state.awaitingStrongholdAction.selected_source_slot_id === slotId) {
        state.awaitingStrongholdAction.selected_source_slot_id = null;
        if (playerStrongholdSupply(state, playerIndex) > 0 && canPlaceOrMoveStrongholdToSlot(state, slotId, playerIndex)) {
          resolveStrongholdPlace(value, trigger);
          return true;
        }
        showMessage(t("strongholdSelectSource"), "ok");
        saveState();
        render();
        return true;
      }
      resolveStrongholdMove(value, trigger, state.awaitingStrongholdAction.selected_source_slot_id);
      return true;
    }
    if (playerStrongholdSupply(state, playerIndex) > 0 && canPlaceOrMoveStrongholdToSlot(state, slotId, playerIndex)) {
      resolveStrongholdPlace(value, trigger);
      return true;
    }
    if (holders.indexOf(playerIndex) >= 0) {
      state.awaitingStrongholdAction.selected_source_slot_id = slotId;
      showMessage(t("strongholdSelectTarget"), "ok");
      saveState();
      render();
      return true;
    }
    if (canRemoveOpponentStrongholdAtSlot(state, slotId, playerIndex)) {
      resolveStrongholdRemove(value, trigger);
      return true;
    }
    showMessage(t("strongholdSelectSource"));
    render();
    return true;
  }

  function runRandomStrongholdAction() {
    if (!state || !state.awaitingStrongholdAction) return;
    var playerIndex = state.current;
    var refs = marketRefsForStrongholds(state);
    if (!refs.length) return;
    if (playerStrongholdSupply(state, playerIndex) > 0) {
      var placeRefs = refs.filter(function (ref) {
        return canPlaceOrMoveStrongholdToSlot(state, ref.slotId, playerIndex);
      });
      if (placeRefs.length) {
        var place = randomChoice(placeRefs);
        resolveStrongholdPlace([place.marketId, place.tier, place.index].join(":"));
        return;
      }
    }
    var removeRefs = refs.filter(function (ref) {
      var holders = strongholdsAtSlot(state, ref.slotId);
      return holders.length === 1 && holders[0] !== playerIndex;
    });
    if (removeRefs.length) {
      var remove = randomChoice(removeRefs);
      resolveStrongholdRemove([remove.marketId, remove.tier, remove.index].join(":"));
      return;
    }
    var sourceSlot = Object.keys(ensureStrongholds(state).placements).find(function (slotId) {
      return strongholdsAtSlot(state, slotId).indexOf(playerIndex) >= 0;
    });
    var targetRefs = refs.filter(function (ref) {
      return ref.slotId !== sourceSlot && canPlaceOrMoveStrongholdToSlot(state, ref.slotId, playerIndex);
    });
    if (sourceSlot && targetRefs.length) {
      var target = randomChoice(targetRefs);
      resolveStrongholdMove([target.marketId, target.tier, target.index].join(":"), null, sourceSlot);
    }
  }

  function discardToken(color) {
    if (!state.awaitingDiscard || state.mode === "replay") return;
    if (isAiPlayer(activePlayer()) && !aiTurnInProgress) return;
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if ((player.tokens[color] || 0) <= 0) return;
    player.tokens[color] -= 1;
    state.bank[color] += 1;
    logEntry(t("logReturned", { player: player.name, token: TOKEN_LABEL[color] }));
    if (totalTokens(player) <= 10) {
      state.awaitingDiscard = false;
      showMessage("");
      resolveNoblesOrTurn("discardToken", aiTurnInProgress ? aiMoveArgs({ color: color }) : { color: color }, actor);
      return;
    }
    showMessage(t("msgStillMustDiscard", { player: player.name, count: totalTokens(player) }));
    recordMove("discardToken", aiTurnInProgress ? aiMoveArgs({ color: color }) : { color: color }, actor);
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
    logEntry(t("logReceivedNoble", { player: player.name, noble: noble.name, points: noble.points }));
    return noble;
  }

  function clearTurnAdvanceTimer() {
    if (turnAdvanceTimer) {
      window.clearTimeout(turnAdvanceTimer);
      turnAdvanceTimer = null;
    }
  }

  function clearHandDockTransitionTimers() {
    if (handDockSwitchTimer) {
      window.clearTimeout(handDockSwitchTimer);
      handDockSwitchTimer = null;
    }
    if (handDockReenterTimer) {
      window.clearTimeout(handDockReenterTimer);
      handDockReenterTimer = null;
    }
    turnSwitchInProgress = false;
    document.body.classList.remove("hand-dock-retracting", "hand-dock-entering");
  }

  function clearReplayStepTimer() {
    if (replayStepTimer) {
      window.clearTimeout(replayStepTimer);
      replayStepTimer = null;
    }
  }

  function clearReplayAutoTimer() {
    if (replayAutoTimer) {
      window.clearTimeout(replayAutoTimer);
      replayAutoTimer = null;
    }
  }

  function setReplayAutoplay(enabled, silent) {
    replayAutoplay = !!(enabled && state && state.mode === "replay" && replayData);
    clearReplayAutoTimer();
    if (replayAutoplay) {
      scheduleReplayAutoplay();
      if (!silent) showMessage(t("msgReplayAutoplayStarted"), "ok");
    } else if (!silent) {
      showMessage(t("msgReplayAutoplayStopped"), "ok");
    }
    renderReplayStatus();
  }

  function scheduleReplayAutoplay() {
    clearReplayAutoTimer();
    if (!replayAutoplay || !state || state.mode !== "replay" || !replayData) return;
    if (state.turnTransition && state.turnTransition.replay) return;
    if (replayIndex >= replayData.moves.length - 1) {
      setReplayAutoplay(false, true);
      return;
    }
    replayAutoTimer = window.setTimeout(function () {
      replayAutoTimer = null;
      if (replayAutoplay) stepReplay(1);
    }, REPLAY_AUTO_DELAY_MS);
  }

  function transitionSecondsRemaining() {
    if (!state || !state.turnTransition) return 0;
    return Math.max(0, Math.ceil(((state.turnTransition.until || Date.now()) - Date.now()) / 1000));
  }

  function turnTransitionReady() {
    return !!(state && state.turnTransition && !state.turnTransition.replay && Date.now() >= (state.turnTransition.ready_at || state.turnTransition.until || 0));
  }

  function transitionProgress() {
    if (!state || !state.turnTransition) return 1;
    var started = Date.parse(state.turnTransition.started_at || "");
    var until = Number(state.turnTransition.until) || Date.now();
    if (!Number.isFinite(started)) started = until - TURN_SWITCH_READY_MS;
    var total = Math.max(1, until - started);
    return Math.max(0, Math.min(1, 1 - ((until - Date.now()) / total)));
  }

  function replayStepSecondsRemaining() {
    if (!state || !state.turnTransition || !state.turnTransition.replay) return 0;
    return transitionSecondsRemaining();
  }

  function aiThinkingSecondsRemaining() {
    if (!state || !state.aiThinking) return 0;
    return Math.max(1, Math.ceil(((state.aiThinking.until || Date.now()) - Date.now()) / 1000));
  }

  function clearOverlayRefreshTimer() {
    if (overlayRefreshTimer) {
      window.clearTimeout(overlayRefreshTimer);
      overlayRefreshTimer = null;
    }
    if (overlayProgressFrame) {
      window.cancelAnimationFrame(overlayProgressFrame);
      overlayProgressFrame = null;
    }
  }

  function scheduleOverlayRefresh() {
    clearOverlayRefreshTimer();
    if (!state || (!state.turnTransition && !state.aiThinking)) return;
    overlayRefreshTimer = window.setTimeout(function () {
      overlayRefreshTimer = null;
      render();
    }, 240);
  }

  function scheduleHandoffProgressFrame() {
    if (overlayProgressFrame) return;
    var tick = function () {
      overlayProgressFrame = null;
      if (!state || !state.turnTransition || state.turnTransition.replay || !el.handoffContinue || el.handoffContinue.hidden) return;
      var seconds = transitionSecondsRemaining();
      var ring = el.handoffContinue.querySelector(".handoff-continue-ring");
      if (ring) {
        ring.style.setProperty("--handoff-progress", transitionProgress().toFixed(4));
        var label = ring.querySelector("span");
        if (label) label.textContent = String(seconds);
      }
      if (el.handoffBody) el.handoffBody.textContent = t("msgSwitchingPlayer", { seconds: seconds });
      if (state && state.turnTransition && Date.now() < (state.turnTransition.until || Date.now())) {
        overlayProgressFrame = window.requestAnimationFrame(tick);
      }
    };
    overlayProgressFrame = window.requestAnimationFrame(tick);
  }

  function renderHandoffOverlay() {
    if (!el.handoffOverlay) return;
    var mode = state && state.aiThinking ? "ai" : state && state.turnTransition ? (state.turnTransition.replay ? "replay" : "turn") : "";
    if (!mode) {
      el.handoffOverlay.hidden = true;
      el.handoffOverlay.classList.remove("ai-thinking");
      if (el.handoffAction) el.handoffAction.innerHTML = "";
      if (el.handoffContinue) el.handoffContinue.hidden = true;
      clearOverlayRefreshTimer();
      return;
    }
    var seconds = mode === "ai" ? aiThinkingSecondsRemaining() : transitionSecondsRemaining();
    var player = mode === "ai" && state.players[state.current] ? state.players[state.current].name : "";
    el.handoffTitle.textContent = mode === "ai" ? t("gameAiThinking") : mode === "replay" ? t("gameReplayStep") : t("gameTurnTransition");
    el.handoffBody.textContent = mode === "ai"
      ? t("msgAiThinking", { player: player })
      : mode === "replay"
        ? t("msgReplayStepAnimating", { move: state.turnTransition.move_id || "", seconds: seconds })
        : t("msgSwitchingPlayer", { seconds: seconds });
    if (el.handoffAction) {
      el.handoffAction.innerHTML = mode === "turn" || mode === "replay" ? renderTransitionAction(state.turnTransition) : "";
    }
    if (el.handoffCountdown) {
      el.handoffCountdown.textContent = String(seconds);
      el.handoffCountdown.hidden = mode === "turn";
    }
    if (el.handoffContinue) {
      if (mode === "turn") {
        el.handoffContinue.innerHTML = [
          '<span class="handoff-continue-ring" style="--handoff-progress:' + transitionProgress().toFixed(3) + '"><span>' + seconds + "</span></span>",
          '<span>' + escapeHtml(t("handoffContinue")) + "</span>"
        ].join("");
      }
      el.handoffContinue.hidden = mode !== "turn";
      el.handoffContinue.disabled = turnSwitchInProgress;
    }
    el.handoffOverlay.hidden = false;
    el.handoffOverlay.classList.toggle("ai-thinking", mode === "ai");
    if (mode === "turn") {
      if (overlayRefreshTimer) {
        window.clearTimeout(overlayRefreshTimer);
        overlayRefreshTimer = null;
      }
      scheduleHandoffProgressFrame();
    } else {
      scheduleOverlayRefresh();
    }
  }

  function scheduleTurnTransitionTimer() {
    if (!state || state.mode === "replay" || !state.turnTransition) {
      clearTurnAdvanceTimer();
      return;
    }
    if (turnAdvanceTimer) return;
    var remaining = Math.max(0, (state.turnTransition.until || Date.now()) - Date.now());
    turnAdvanceTimer = window.setTimeout(function () {
      turnAdvanceTimer = null;
      completeTurnTransition();
    }, remaining);
  }

  function scheduleTurnSwitch(type, args, actor) {
    clearTurnAdvanceTimer();
    var now = Date.now();
    state.turnTransition = {
      type: type,
      args: clone(args || {}),
      actor: clone(actor || {}),
      display_current: fallbackVisiblePlayerIndex(),
      started_at: new Date(now).toISOString(),
      ready_at: now + TURN_SWITCH_READY_MS,
      until: now + TURN_SWITCH_READY_MS
    };
    showMessage(t("msgSwitchingPlayer", { seconds: Math.ceil(TURN_SWITCH_READY_MS / 1000) }), "ok");
    saveState();
    render();
  }

  function completeTurnTransition() {
    clearTurnAdvanceTimer();
    if (!state || !state.turnTransition || state.mode === "replay" || turnSwitchInProgress) return;
    var transition = clone(state.turnTransition);
    turnSwitchInProgress = true;
    document.body.classList.remove("hand-dock-entering");
    document.body.classList.add("hand-dock-retracting");
    if (el.handoffContinue) el.handoffContinue.disabled = true;
    handDockSwitchTimer = window.setTimeout(function () {
      handDockSwitchTimer = null;
      if (!state || !state.turnTransition) {
        clearHandDockTransitionTimers();
        render();
        return;
      }
      state.turnTransition = null;
      proceedToNextTurn();
      recordMove(transition.type, transition.args, transition.actor);
      saveState();
      document.body.classList.remove("hand-dock-retracting");
      document.body.classList.add("hand-dock-entering");
      turnSwitchInProgress = false;
      render();
      handDockReenterTimer = window.setTimeout(function () {
        handDockReenterTimer = null;
        document.body.classList.remove("hand-dock-entering");
      }, HAND_DOCK_REENTER_MS);
    }, HAND_DOCK_RETRACT_MS);
  }

  function resolveNoblesOrTurn(type, args, actor) {
    var player = activePlayer();
    var eligible = eligibleNobles(player);
    if (eligible.length === 0) {
      scheduleTurnSwitch(type, args, actor);
      return;
    }
    if (eligible.length === 1) {
      var noble = awardNoble(player, eligible[0].id);
      var withNoble = Object.assign({}, args, { noble_id: noble.id });
      scheduleTurnSwitch(type, withNoble, actor);
      return;
    }
    state.awaitingNobleChoice = eligible.map(function (noble) { return noble.id; });
    showMessage(t("msgMultipleNobles", { player: player.name }));
    recordMove(type, args, actor);
    saveState();
    render();
  }

  function chooseNoble(nobleId) {
    if (!state.awaitingNobleChoice || state.mode === "replay") return;
    if (isAiPlayer(activePlayer()) && !aiTurnInProgress) return;
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if (state.awaitingNobleChoice.indexOf(nobleId) < 0) {
      showMessage(t("msgNobleNotEligible"));
      render();
      return;
    }
    var nobleSlot = state.nobles.findIndex(function (noble) { return noble.id === nobleId; });
    awardNoble(player, nobleId);
    state.awaitingNobleChoice = null;
    showMessage("");
    scheduleTurnSwitch("chooseNoble", aiTurnInProgress ? aiMoveArgs({ noble_id: nobleId, noble_slot: nobleSlot }) : { noble_id: nobleId, noble_slot: nobleSlot }, actor);
  }

  function proceedToNextTurn() {
    var player = activePlayer();
    if (!state.endTriggered && scoreFor(player) >= 15) {
      state.endTriggered = true;
      state.finalTurnsLeft = state.players.length - 1 - state.current;
      logEntry(t("logFinalRoundBegins", { player: player.name }));
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
      return t("logSharedWin", { players: winners.map(function (entry) { return entry.player.name; }).join(", ") });
    }
    return t("logWinner", { player: best.player.name });
  }

  function moveEventRefs(args, player) {
    var refs = {
      player_id: player && player.id || null,
      card_id: args && args.card_id || null,
      market_id: args && args.market_id || null,
      market_slot_id: args && args.market_slot_id || null,
      deck_slot_id: args && args.deck_slot_id || null,
      noble_id: args && args.noble_id || null
    };
    Object.keys(refs).forEach(function (key) {
      if (refs[key] === null || refs[key] === undefined) delete refs[key];
    });
    return refs;
  }

  function buildMoveEvents(moveId, type, args, player) {
    var refs = moveEventRefs(args || {}, player);
    var orientCardAction = args && (args.market_id === ORIENT_MARKET_ID || cardIsOrient(args.card)) && (type === "buyMarket" || type === "buyReserved" || type === "reserveMarket" || type === "strongholdConquest");
    var events = [{
      schema: MOVE_EVENT_SCHEMA,
      event_id: "m" + moveId + ":core",
      channel: "core",
      type: type,
      status: "resolved",
      refs: clone(refs)
    }];
    if (state && orientEnabledForRuleset(state.ruleset)) {
      events.push({
        schema: MOVE_EVENT_SCHEMA,
        event_id: "m" + moveId + ":orient-ability-window",
        channel: ORIENT_MARKET_ID,
        type: "abilityWindow",
        status: args && args.orient_effects && args.orient_effects.length ? "resolved" : "available",
        refs: clone(refs)
      });
    }
    if (orientCardAction) {
      events.push({
        schema: MOVE_EVENT_SCHEMA,
        event_id: "m" + moveId + ":orient-card-action",
        channel: ORIENT_MARKET_ID,
        type: type,
        status: "resolved",
        refs: clone(refs)
      });
    }
    return events;
  }

  function recordMove(type, args, actor) {
    if (!state || state.mode === "replay") return;
    var player = actor || state.players[state.current] || state.players[0];
    var beforeState = previousMoveSourceState();
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
      events: buildMoveEvents(state.next_move_id, type, args || {}, player),
      state_after: toGamedatas(state, { includeSourceState: true })
    };
    state.moves.push(move);
    state.next_move_id += 1;
    queueDinoBoardObserve(move, beforeState, move.state_after.source_state || move.state_after);
  }

  function toGamedatas(game, options) {
    var includeSourceState = options && options.includeSourceState;
    ensureStateRuleset(game);
    var ruleset = normalizeRuleset(game.ruleset);
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
        nobles: clone(player.nobles),
        ai: clone(player.ai || { enabled: false, mode: null, level: "balanced", available: false })
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
        mode: game.mode || "live",
        ruleset_id: ruleset.id
      },
      ruleset: clone(ruleset),
      module_state: clone(game.module_state || createModuleState(ruleset)),
      gamestate: {
        name: game.gameOver ? "gameEnd" : game.awaitingDiscard ? "discard" : game.awaitingStrongholdConquest ? "strongholdConquest" : game.awaitingNobleChoice ? "chooseNoble" : "playerTurn",
        description: gameStateTextFor(game),
        active_player: game.players[game.current] ? game.players[game.current].id : null
      },
      players: players,
      playerorder: game.players.map(function (player) { return player.id; }),
      bank: clone(game.bank),
      market: clone(game.market),
      market_slots: clone(game.market_slots || createMarketSlots()),
      orient_market: clone(game.orient_market || emptyTieredMarket()),
      deck_draw_state: clone(normalizeDeckDrawState(game.deck_draw_state)),
      strongholds: clone(game.strongholds || { placements: {} }),
      nobles: clone(game.nobles),
      decks_remaining: {
        1: game.decks[1].length,
        2: game.decks[2].length,
        3: game.decks[3].length
      },
      orient_decks_remaining: {
        1: game.orient_decks && game.orient_decks[1] ? game.orient_decks[1].length : 0,
        2: game.orient_decks && game.orient_decks[2] ? game.orient_decks[2].length : 0,
        3: game.orient_decks && game.orient_decks[3] ? game.orient_decks[3].length : 0
      },
      awaiting: {
        discard: !!game.awaitingDiscard,
        orient_action: game.awaitingOrientAction ? clone(game.awaitingOrientAction) : null,
        stronghold_action: game.awaitingStrongholdAction ? clone(game.awaitingStrongholdAction) : null,
        stronghold_conquest: game.awaitingStrongholdConquest ? clone(game.awaitingStrongholdConquest) : null,
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
    if (game.turnTransition) return "Turn handoff";
    if (game.awaitingDiscard) return "Active player must discard to token cap";
    if (game.awaitingOrientAction) return "Active player must resolve an Orient ability";
    if (game.awaitingStrongholdAction) return "Active player must resolve a Stronghold move";
    if (game.awaitingStrongholdConquest) return "Active player may resolve a Stronghold conquest";
    if (game.awaitingNobleChoice) return "Active player must choose one noble";
    if (game.endTriggered) return "Final round";
    return "Player turn";
  }

  function cloneWithoutMoveSnapshots(game) {
    return compactSourceState(game);
  }

  function compactSourceState(game) {
    if (!game || !Array.isArray(game.players)) return null;
    ensureStateRuleset(game);
    return {
      schema: SCHEMA,
      ruleset: normalizeRuleset(game.ruleset),
      module_state: clone(game.module_state || createModuleState(game.ruleset)),
      table_seed: game.table_seed,
      next_move_id: game.next_move_id,
      players: clone(game.players),
      bank: clone(game.bank),
      decks: clone(game.decks),
      market: clone(game.market),
      market_slots: clone(game.market_slots || createMarketSlots()),
      orient_decks: clone(game.orient_decks || emptyTieredMarket()),
      orient_market: clone(game.orient_market || emptyTieredMarket()),
      deck_draw_state: clone(normalizeDeckDrawState(game.deck_draw_state)),
      strongholds: clone(game.strongholds || { placements: {} }),
      seen_cards: clone(collectSeenCardsByTier(game)),
      bga_deck_unknown: !!game.bga_deck_unknown,
      bga_continued_deck_seed: game.bga_continued_deck_seed,
      nobles: clone(game.nobles),
      current: game.current,
      round: game.round,
      log: Array.isArray(game.log) ? game.log.slice() : [],
      moves: [],
      initial_gamedatas: null,
      awaitingDiscard: !!game.awaitingDiscard,
      awaitingOrientAction: game.awaitingOrientAction ? clone(game.awaitingOrientAction) : null,
      awaitingStrongholdAction: game.awaitingStrongholdAction ? clone(game.awaitingStrongholdAction) : null,
      awaitingStrongholdConquest: game.awaitingStrongholdConquest ? clone(game.awaitingStrongholdConquest) : null,
      awaitingNobleChoice: game.awaitingNobleChoice ? game.awaitingNobleChoice.slice() : null,
      endTriggered: !!game.endTriggered,
      finalTurnsLeft: game.finalTurnsLeft,
      gameOver: !!game.gameOver,
      turnTransition: game.turnTransition ? clone(game.turnTransition) : null,
      aiThinking: game.aiThinking ? clone(game.aiThinking) : null,
      mode: "live"
    };
  }

  function compactGamedatasForExport(gamedatas) {
    if (!gamedatas || gamedatas.schema !== SCHEMA) return null;
    var compact = {
      schema: SCHEMA,
      table: cloneOr(gamedatas.table, {}),
      ruleset: normalizeRuleset(gamedatas.ruleset || gamedatas.source_state && gamedatas.source_state.ruleset),
      module_state: cloneOr(gamedatas.module_state, gamedatas.source_state && gamedatas.source_state.module_state || {}),
      gamestate: cloneOr(gamedatas.gamestate, {}),
      players: cloneOr(gamedatas.players, {}),
      playerorder: Array.isArray(gamedatas.playerorder) ? gamedatas.playerorder.slice() : [],
      bank: cloneOr(gamedatas.bank, {}),
      market: cloneOr(gamedatas.market, {}),
      market_slots: cloneOr(gamedatas.market_slots, gamedatas.source_state && gamedatas.source_state.market_slots || {}),
      orient_market: cloneOr(gamedatas.orient_market, gamedatas.source_state && gamedatas.source_state.orient_market || {}),
      deck_draw_state: cloneOr(gamedatas.deck_draw_state, gamedatas.source_state && gamedatas.source_state.deck_draw_state || createDeckDrawState()),
      strongholds: cloneOr(gamedatas.strongholds, gamedatas.source_state && gamedatas.source_state.strongholds || { placements: {} }),
      nobles: cloneOr(gamedatas.nobles, []),
      decks_remaining: cloneOr(gamedatas.decks_remaining, {}),
      orient_decks_remaining: cloneOr(gamedatas.orient_decks_remaining, {}),
      awaiting: cloneOr(gamedatas.awaiting, {}),
      end: cloneOr(gamedatas.end, {}),
      log: Array.isArray(gamedatas.log) ? gamedatas.log.slice() : []
    };
    if (validateState(gamedatas.source_state)) {
      compact.source_state = compactSourceState(gamedatas.source_state);
    }
    return compact;
  }

  function compactMoveForExport(move) {
    return {
      move_id: move.move_id,
      type: move.type,
      player_id: move.player_id,
      args: clone(move.args || {}),
      notification: clone(move.notification || {}),
      events: Array.isArray(move.events) ? clone(move.events) : [],
      state_after: compactGamedatasForExport(move.state_after) || (move.state_after ? clone(move.state_after) : null)
    };
  }

  function compactMovesForExport(moves) {
    return Array.isArray(moves) ? moves.map(compactMoveForExport) : [];
  }

  function compactReplayPayload(payload) {
    if (!payload || payload.schema !== SCHEMA) return null;
    if (!rulesetSupportedByEngine(rulesetFromReplayPayload(payload))) return null;
    return {
      schema: SCHEMA,
      next_move_id: payload.next_move_id,
      ruleset: normalizeRuleset(rulesetFromReplayPayload(payload)),
      module_state: cloneOr(payload.module_state, payload.gamedatas && payload.gamedatas.module_state || {}),
      gamedatas: compactGamedatasForExport(payload.gamedatas),
      moves: compactMovesForExport(payload.moves)
    };
  }

  function compactStateForPersistence(game) {
    var compact = compactSourceState(game);
    if (!compact) return null;
    compact.moves = compactMovesForExport(game.moves);
    compact.initial_gamedatas = compactGamedatasForExport(game.initial_gamedatas);
    if (game.imported_replay) {
      compact.imported_replay = compactReplayPayload(game.imported_replay);
      compact.imported_replay_resume_index = game.imported_replay_resume_index;
    }
    return compact;
  }

  function buildStateExportPayload(game) {
    return {
      schema: SCHEMA,
      next_move_id: game.next_move_id,
      ruleset: normalizeRuleset(game.ruleset),
      module_state: clone(game.module_state || createModuleState(game.ruleset)),
      gamedatas: compactGamedatasForExport(toGamedatas(game, { includeSourceState: true })),
      moves: compactMovesForExport(game.moves)
    };
  }

  function buildReplayExportPayload(game) {
    if (game && game.mode === "replay" && replayData) {
      return compactReplayPayload(replayData);
    }
    return {
      schema: SCHEMA,
      next_move_id: game.next_move_id,
      ruleset: normalizeRuleset(game.ruleset),
      module_state: clone(game.module_state || createModuleState(game.ruleset)),
      gamedatas: compactGamedatasForExport(game.initial_gamedatas) || compactGamedatasForExport(toGamedatas(game, { includeSourceState: true })),
      moves: compactMovesForExport(game.moves)
    };
  }

  function stateFromGamedatas(gamedatas) {
    if (!gamedatas || gamedatas.schema !== SCHEMA) return null;
    if (!rulesetSupportedByEngine(gamedatas.ruleset)) return null;
    if (gamedatas.source_state && validateState(gamedatas.source_state)) {
      var restored = clone(gamedatas.source_state);
      ensureStateRuleset(restored);
      restored.seen_cards = collectSeenCardsByTier(restored);
      restored.mode = "live";
      return restored;
    }
    return null;
  }

  function rulesetFromReplayPayload(payload) {
    return payload && (
      payload.ruleset ||
      payload.gamedatas && payload.gamedatas.ruleset ||
      payload.gamedatas && payload.gamedatas.source_state && payload.gamedatas.source_state.ruleset
    );
  }

  function replayPayloadUnsupportedRulesetModules(payload) {
    if (!payload || payload.schema !== SCHEMA) return [];
    return unsupportedRulesetModules(rulesetFromReplayPayload(payload));
  }

  function exportFileName(kind) {
    var stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return "gem-table-" + kind + "-" + stamp + ".json";
  }

  function downloadJsonFile(payloadFactory, fileName, successKey) {
    showMessage(t("msgExportPreparing"), "ok");
    render();
    window.setTimeout(function () {
      try {
        var payload = typeof payloadFactory === "function" ? payloadFactory() : payloadFactory;
        var json = JSON.stringify(payload);
        var blob = new Blob([json], { type: "application/json;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 1200);
        if (el.bgaFileStatus) el.bgaFileStatus.textContent = fileName;
        showMessage(t(successKey), "ok");
        render();
      } catch (error) {
        showMessage(t("msgExportFailed", { message: error.message }));
        render();
      }
    }, 0);
  }

  function readJsonFileFromPicker(startScope, onPayload) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.style.top = "0";
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      input.remove();
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || "");
        try {
          onPayload(JSON.parse(text), text, file);
        } catch (error) {
          var message = t("msgJsonParseFailed", { message: error.message });
          if (startScope) showStartMessage(message);
          else showMessage(message);
          render();
        }
      };
      reader.onerror = function () {
        var error = reader.error || { message: "unknown error" };
        var message = t("msgFileReadFailed", { message: error.message });
        if (startScope) showStartMessage(message);
        else showMessage(message);
        render();
      };
      reader.readAsText(file);
    });
    document.body.appendChild(input);
    input.click();
  }

  function exportStateJson() {
    if (!state) {
      showMessage(t("msgNoActiveTableExport"));
      render();
      return;
    }
    downloadJsonFile(function () {
      return buildStateExportPayload(state);
    }, exportFileName("state"), "msgStateExported");
  }

  function exportReplayJson() {
    if (!state) {
      showMessage(t("msgNoActiveTableExport"));
      render();
      return;
    }
    downloadJsonFile(function () {
      return buildReplayExportPayload(state);
    }, exportFileName("replay"), "msgReplayExported");
  }

  function importStatePayload(payload) {
    var imported = null;
    if (validateState(payload)) {
      imported = compactStateForPersistence(payload) || payload;
    } else if (payload.schema === SCHEMA && payload.gamedatas) {
      var compactGamedatas = compactGamedatasForExport(payload.gamedatas);
      imported = stateFromGamedatas(compactGamedatas);
      if (imported && Array.isArray(payload.moves)) {
        imported.moves = compactMovesForExport(payload.moves);
        imported.next_move_id = payload.next_move_id || imported.next_move_id;
      }
    } else if (payload.schema === SCHEMA && payload.source_state) {
      imported = stateFromGamedatas(payload);
    }
    if (!imported) {
      showMessage(t("msgImportFailedSchema", { schema: SCHEMA }));
      render();
      return;
    }
    imported.mode = "live";
    ensureStateRuleset(imported);
    closeDinoBoardSession();
    state = imported;
    activeMarketPage = BASE_MARKET_ID;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    clearHandDockTransitionTimers();
    pendingTake = [];
    pendingPayment = null;
    pendingOrientAction = null;
    showMessage(t("msgStateImported"), "ok");
    resetDinoBoardAiForCurrentState(true);
    saveState();
    render();
  }

  function importStateJson() {
    readJsonFileFromPicker(false, function (payload, rawText, file) {
      if (el.bgaFileStatus && file) el.bgaFileStatus.textContent = file.name;
      importStatePayload(payload);
    });
  }

  function loadReplayJson() {
    readJsonFileFromPicker(false, function (payload, rawText, file) {
      if (el.bgaFileStatus && file) el.bgaFileStatus.textContent = file.name;
      loadReplayPayload(payload, "", false);
    });
  }

  function loadReplayFromStart() {
    readJsonFileFromPicker(true, function (payload, rawText, file) {
      if (el.startReplayFileStatus && file) el.startReplayFileStatus.textContent = file.name;
      loadReplayPayload(payload, "", true);
    });
  }

  function isBgaCapturePayload(payload) {
    return !!payload && (
      payload.schema === "zephyrlabs-bga-browser-capture-v1" ||
      payload.schema === "zephyrlabs-bga-replay-crawler-v1" ||
      payload.source === "boardgamearena-gamereview-browser-capture" ||
      payload.source === "boardgamearena-gamereview-local-playwright-crawler"
    );
  }

  function bgaCaptureHasExpansionHint(payload) {
    return bgaCaptureUnsupportedExpansionFlags(payload).length > 0;
  }

  function bgaCaptureUnsupportedExpansionFlags(payload) {
    var compatibility = payload && payload.compatibility || {};
    var detection = compatibility.expansion_detection || {};
    var active = Array.isArray(detection.active) ? detection.active : bgaActiveExpansionFlags(payload);
    return active.filter(function (entry) {
      return !/orient|strongholds?/i.test(String(entry && entry.label || ""));
    });
  }

  function bgaCompatibilityHasActiveExpansion(compatibility) {
    var detection = compatibility && compatibility.expansion_detection || {};
    if (Array.isArray(detection.active)) {
      return detection.active.some(function (entry) {
        return !/orient|strongholds?/i.test(String(entry && entry.label || ""));
      });
    }
    return false;
  }

  function bgaCaptureExpansionDetails(payload) {
    var compatibility = payload && payload.compatibility || {};
    var detection = compatibility.expansion_detection || {};
    var active = bgaCaptureUnsupportedExpansionFlags(payload);
    if (active.length) {
      return active.map(function (entry) {
        return (entry.label || "Expansion") + (entry.path ? " (" + entry.path + ")" : "");
      }).join(", ");
    }
    return compatibility.reason || "";
  }

  function bgaActiveExpansionFlags(payload) {
    var active = [];
    var patterns = [
      { label: "Silk Road", re: /silk[_\-\s]?road|silkroad/i },
      { label: "Cities", re: /cities|city/i },
      { label: "Orient", re: /orient/i },
      { label: "Trading", re: /trading/i },
      { label: "Strongholds", re: /stronghold/i },
      { label: "Expansion", re: /expansion|extension/i }
    ];
    function labelFor(value) {
      var text = String(value || "");
      var match = patterns.find(function (entry) { return entry.re.test(text); });
      return match ? match.label : "";
    }
    function isActiveValue(value) {
      if (value === true) return true;
      if (typeof value === "number") return value === 1;
      if (typeof value === "string") return /^(true|1|yes|on|enabled|active)$/i.test(value.trim());
      return false;
    }
    function push(entry) {
      if (!active.some(function (item) { return item.path === entry.path && item.label === entry.label; })) {
        active.push(entry);
      }
    }
    function walk(value, pathName) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.slice(0, 1000).forEach(function (item, index) {
          walk(item, pathName + "[" + index + "]");
        });
        return;
      }
      Object.keys(value).forEach(function (key) {
        var child = value[key];
        var path = pathName ? pathName + "." + key : key;
        if (path === "compatibility" || path.indexOf("compatibility.") === 0) return;
        var label = labelFor(key);
        if (label && (typeof child !== "object" || child === null) && isActiveValue(child)) {
          push({ label: label, path: path, value: child });
        }
        walk(child, path);
      });
    }
    walk(payload, "");
    return active;
  }

  function bgaInitialGamedatasOrientActive(gamedatas) {
    if (!gamedatas || !gamedatas.market) return false;
    var flag = gamedatas.expansion_orient;
    var flagActive = bgaExpansionValueActive(flag);
    return flagActive || [1, 2, 3].some(function (tier) {
      var row = gamedatas.market["orient_row_" + tier];
      return !!(row && bgaObjectValues(row.cards).length);
    });
  }

  function bgaExpansionValueActive(value) {
    if (value === true) return true;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") return /^(true|1|yes|on|enabled|active)$/i.test(value.trim());
    return false;
  }

  function bgaExpansionValueInactive(value) {
    if (value === false || value === null) return true;
    if (typeof value === "number") return value === 0 || value === 2;
    if (typeof value === "string") return /^(false|0|2|no|off|disabled|inactive|)$/i.test(value.trim());
    return false;
  }

  function bgaInitialGamedatasStrongholdsActive(gamedatas) {
    if (!gamedatas || !gamedatas.market) return false;
    var flag = gamedatas.expansion_strongholds;
    if (bgaExpansionValueActive(flag)) return true;
    if (bgaExpansionValueInactive(flag)) return false;
    return Object.keys(gamedatas.market.strongholds || {}).length > 0;
  }

  function showBgaImportMessage(key, fromStart) {
    showBgaImportText(t(key), fromStart);
  }

  function showBgaImportText(message, fromStart) {
    if (fromStart) {
      showStartMessage(message);
      if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = message;
    } else {
      showMessage(message);
      if (el.bgaCaptureStatus) el.bgaCaptureStatus.textContent = message;
    }
  }

  function failBgaCaptureImport(payload, fromStart) {
    if (bgaCaptureHasExpansionHint(payload)) {
      var details = bgaCaptureExpansionDetails(payload);
      showBgaImportText(t("msgBgaExpansionUnsupported") + (details ? " " + details : ""), fromStart);
    } else {
      showBgaImportMessage("msgBgaCaptureUnsupported", fromStart);
    }
    render();
  }

  function extractBgaReplayData(payload) {
    if (payload && payload.data && Array.isArray(payload.data.logs)) return payload.data;
    var responses = payload && Array.isArray(payload.responses) ? payload.responses : [];
    for (var index = 0; index < responses.length; index += 1) {
      var parsed = responses[index] && responses[index].parsed_json;
      if (parsed && parsed.data && Array.isArray(parsed.data.logs)) return parsed.data;
    }
    return null;
  }

  function extractBgaInitialGamedatas(payload) {
    var snapshots = payload && Array.isArray(payload.snapshots) ? payload.snapshots : [];
    for (var index = 0; index < snapshots.length; index += 1) {
      var gamedatas = snapshots[index] && snapshots[index].gameui && snapshots[index].gameui.gamedatas;
      if (gamedatas && gamedatas.market && gamedatas.carddb) return gamedatas;
    }
    return null;
  }

  function bgaGemColor(code) {
    return {
      C: "white",
      S: "blue",
      E: "green",
      R: "red",
      O: "black",
      G: "gold"
    }[String(code || "").trim().toUpperCase()] || "";
  }

  function bgaCardTypeColor(type) {
    return ["white", "blue", "green", "red", "black"][Number(type)] || "";
  }

  function bgaRawCardTypeId(card, fallback) {
    if (card && card.type !== undefined && card.type !== null && card.type !== "") return card.type;
    if (card && card.id !== undefined && card.id !== null && card.id !== "") return card.id;
    return fallback !== undefined && fallback !== null ? fallback : "";
  }

  function bgaCostToCounts(value) {
    var counts = emptyCounts(false);
    if (!value) return counts;
    if (typeof value === "string") {
      value.split("").forEach(function (code) {
        var color = bgaGemColor(code);
        if (COLORS.indexOf(color) >= 0) counts[color] += 1;
      });
      return counts;
    }
    if (typeof value === "object") {
      Object.keys(value).forEach(function (code) {
        var color = bgaGemColor(code) || (COLORS.indexOf(code) >= 0 ? code : "");
        if (COLORS.indexOf(color) >= 0) counts[color] += Math.max(0, Number(value[code]) || 0);
      });
    }
    return counts;
  }

  function bgaPoolToBank(pool) {
    var bank = emptyCounts(true);
    Object.keys(pool || {}).forEach(function (code) {
      var color = bgaGemColor(code) || (ALL_TOKENS.indexOf(code) >= 0 ? code : "");
      if (ALL_TOKENS.indexOf(color) >= 0) bank[color] = Math.max(0, Number(pool[code]) || 0);
    });
    return bank;
  }

  function bgaObjectValues(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];
    return Object.keys(value).map(function (key) { return value[key]; });
  }

  function bgaCostMatchesLocal(a, b) {
    return COLORS.every(function (color) {
      return (Number(a && a[color]) || 0) === (Number(b && b[color]) || 0);
    });
  }

  function bgaLocalCardMatch(tier, color, points, cost) {
    var cards = DEVELOPMENT_CARDS[Math.max(1, Math.min(3, Number(tier) || 1))] || [];
    return cards.find(function (card) {
      return card.color === color &&
        Number(card.points) === Number(points || 0) &&
        bgaCostMatchesLocal(card.cost, cost);
    });
  }

  function bgaWithLocalCardId(card) {
    var local = bgaLocalCardMatch(card.tier, card.color, card.points, card.cost);
    if (!local) return card;
    var mapped = clone(local);
    mapped.bga_id = card.bga_id;
    mapped.bga_card_id = card.id;
    mapped.bga_original_id = card.bga_id;
    return mapped;
  }

  function bgaTierFromCard(card, args) {
    var location = String(card && card.location || "");
    var match = location.match(/(?:market|draw)_(\d+)/);
    if (match) return Math.max(1, Math.min(3, Number(match[1]) || 1));
    var drawpile = Number(args && args.drawpile);
    if (drawpile >= 1 && drawpile <= 3) return drawpile;
    var rank = String(args && args.rank || "");
    var circles = (rank.match(/[◯○]/g) || []).length;
    return circles >= 1 && circles <= 3 ? circles : 1;
  }

  function bgaCardId(card, fallback) {
    var raw = bgaRawCardTypeId(card, fallback);
    return "bga-" + String(raw || "unknown");
  }

  function bgaCardFromDb(raw, gamedatas, fallback) {
    var id = String(raw || fallback && fallback.id || "unknown");
    var db = gamedatas && gamedatas.carddb && gamedatas.carddb[id];
    var tier = Math.max(1, Math.min(3, Number(fallback && fallback.tier) || 1));
    var color = fallback && fallback.color || "gold";
    var points = Math.max(0, Number(fallback && fallback.points) || 0);
    var cost = normalizeCost({});
    if (db) {
      if (Number(db.lvl) >= 11 && Number(db.lvl) <= 13) {
        var orientCard = localOrientCardByBgaId(id);
        if (orientCard) {
          var mappedOrient = clone(orientCard);
          mappedOrient.bga_id = id;
          mappedOrient.bga_card_id = "bga-" + id;
          mappedOrient.bga_original_id = id;
          return mappedOrient;
        }
      }
      tier = Math.max(1, Math.min(3, Number(db.lvl) || tier));
      color = bgaCardTypeColor(db.type) || color;
      points = Math.max(0, Number(db.points) || 0);
      cost = bgaCostToCounts(db.cost);
    }
    return bgaWithLocalCardId({
      id: "bga-" + id,
      bga_id: id,
      tier: tier,
      color: color,
      points: points,
      cost: cost
    });
  }

  function bgaCardFromNotification(item, groupItems, fallback, gamedatas) {
    var args = item && item.args || {};
    var card = args.card || fallback && fallback.card || {};
    var scoreItem = groupItems.find(function (entry) {
      return entry && entry.type === "updateScore" && String(entry.args && entry.args.player_id) === String(args.player_id || fallback && fallback.player_id);
    });
    var raw = bgaRawCardTypeId(card, fallback && fallback.id);
    return bgaCardFromDb(raw, gamedatas, {
      tier: bgaTierFromCard(card, args),
      color: bgaGemColor(args.gem_type) || fallback && fallback.color || "gold",
      points: Math.max(0, Number(scoreItem && scoreItem.args && scoreItem.args.amount_vp) || 0)
    });
  }

  function bgaCoinsFromGap(items, sign) {
    var counts = emptyCounts(true);
    (items || []).forEach(function (item) {
      if (!item || item.type !== "coins") return;
      var gap = item.args && item.args.gap || {};
      Object.keys(gap).forEach(function (code) {
        var color = bgaGemColor(code);
        var amount = Number(gap[code]) || 0;
        if (!color || amount * sign <= 0) return;
        counts[color] += Math.abs(amount);
      });
    });
    return counts;
  }

  function bgaTokenListFromCounts(counts) {
    var colors = [];
    ALL_TOKENS.forEach(function (color) {
      for (var index = 0; index < (Number(counts[color]) || 0); index += 1) {
        colors.push(color);
      }
    });
    return colors;
  }

  function applyBgaCoinGaps(game, player, items) {
    (items || []).forEach(function (item) {
      if (!item || item.type !== "coins") return;
      var gap = item.args && item.args.gap || {};
      Object.keys(gap).forEach(function (code) {
        var color = bgaGemColor(code);
        var delta = Number(gap[code]) || 0;
        if (!color || !delta) return;
        player.tokens[color] = Math.max(0, (player.tokens[color] || 0) + delta);
        game.bank[color] = Math.max(0, (game.bank[color] || 0) - delta);
      });
    });
  }

  function playerIndexForBgaId(game, bgaPlayerId) {
    var index = game.players.findIndex(function (player) {
      return String(player.bga_id || "") === String(bgaPlayerId || "");
    });
    return index >= 0 ? index : 0;
  }

  function marketSlotForBgaCardId(game, bgaCardId) {
    var id = String(bgaCardId || "");
    for (var marketOffset = 0; marketOffset < 2; marketOffset += 1) {
      var marketId = marketOffset === 0 ? BASE_MARKET_ID : ORIENT_MARKET_ID;
      var market = marketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
      for (var tier = 1; tier <= 3; tier += 1) {
        var cards = market && market[tier] || [];
        var index = cards.findIndex(function (card) {
          return card && String(card.bga_id || "") === id;
        });
        if (index >= 0) {
          return {
            marketId: marketId,
            tier: tier,
            index: index,
            slotId: marketSlotId(game, marketId, tier, index),
            card: cards[index]
          };
        }
      }
    }
    return null;
  }

  function strongholdPlacementCountForPlayer(game, playerIndex) {
    var strongholds = ensureStrongholds(game);
    return Object.keys(strongholds.placements).reduce(function (count, slotId) {
      var holders = strongholds.placements[slotId];
      if (!Array.isArray(holders)) return count;
      return count + holders.filter(function (entry) {
        return Number(entry) === Number(playerIndex);
      }).length;
    }, 0);
  }

  function drawStrongholdTokenForPlayer(game, playerIndex, excludeTokenId) {
    var strongholds = ensureStrongholds(game);
    var exclude = String(excludeTokenId || "");
    var tokenIds = Object.keys(strongholds.tokens).sort(function (a, b) {
      return (Number(a) || 0) - (Number(b) || 0);
    });
    for (var index = 0; index < tokenIds.length; index += 1) {
      var tokenId = tokenIds[index];
      if (tokenId === exclude) continue;
      var token = strongholds.tokens[tokenId];
      if (!token || Number(token.player_index) !== Number(playerIndex)) continue;
      if (token.slot_id) continue;
      if (token.location && token.location !== "draw") continue;
      return token;
    }
    return null;
  }

  function synthesizeStrongholdToken(game, template) {
    var strongholds = ensureStrongholds(game);
    var playerIndex = Number(template && template.player_index) || 0;
    var suffix = 1;
    var tokenId = "synthetic:" + playerIndex + ":" + suffix;
    while (strongholds.tokens[tokenId]) {
      suffix += 1;
      tokenId = "synthetic:" + playerIndex + ":" + suffix;
    }
    var token = Object.assign({}, template || {}, {
      id: tokenId,
      bga_id: tokenId,
      player_index: playerIndex,
      bga_player_id: template && template.bga_player_id || "",
      player_id: template && template.player_id || (game.players[playerIndex] ? game.players[playerIndex].id : ""),
      token_number: suffix,
      location: "draw",
      slot_id: null,
      card_bga_id: ""
    });
    strongholds.tokens[tokenId] = token;
    return token;
  }

  function tokenForRepeatedStrongholdDestination(game, token, destinationSlotId) {
    if (!token || !destinationSlotId || token.slot_id !== destinationSlotId) return token;
    var playerIndex = Number(token.player_index);
    if (!Number.isInteger(playerIndex)) return token;
    if (strongholdPlacementCountForPlayer(game, playerIndex) >= 3) return token;
    return drawStrongholdTokenForPlayer(game, playerIndex, token.id) || synthesizeStrongholdToken(game, token);
  }

  function removeStrongholdTokenFromSlot(game, tokenId) {
    var strongholds = ensureStrongholds(game);
    var token = strongholds.tokens[String(tokenId)];
    if (!token) return;
    var playerIndex = Number(token.player_index);
    var slotIds = token.slot_id ? [token.slot_id] : Object.keys(strongholds.placements);
    for (var slotIndex = 0; slotIndex < slotIds.length; slotIndex += 1) {
      var slotId = slotIds[slotIndex];
      var holders = strongholds.placements[slotId];
      if (!Array.isArray(holders)) continue;
      var index = Number.isInteger(playerIndex)
        ? holders.findIndex(function (entry) { return Number(entry) === playerIndex; })
        : holders.length - 1;
      if (index >= 0) {
        holders.splice(index, 1);
        if (!holders.length) delete strongholds.placements[slotId];
        break;
      }
    }
    token.location = "draw";
    token.slot_id = null;
    token.card_bga_id = "";
  }

  function registerBgaStrongholdToken(game, rawToken, fallbackBgaPlayerId) {
    var strongholds = ensureStrongholds(game);
    var tokenId = String(rawToken && rawToken.id || "");
    if (!tokenId) return null;
    var bgaPlayerId = String(rawToken && rawToken.type || fallbackBgaPlayerId || "");
    var playerIndex = playerIndexForBgaId(game, bgaPlayerId);
    var previous = strongholds.tokens[tokenId] || {};
    var token = Object.assign(previous, {
      id: tokenId,
      bga_id: tokenId,
      bga_player_id: bgaPlayerId,
      player_id: game.players[playerIndex] ? game.players[playerIndex].id : "",
      player_index: playerIndex,
      token_number: Number(rawToken && rawToken.type_arg) || 0,
      location: String(rawToken && rawToken.location || "draw"),
      slot_id: previous.slot_id || null,
      card_bga_id: previous.card_bga_id || ""
    });
    strongholds.tokens[tokenId] = token;
    return token;
  }

  function placeStrongholdTokenOnBgaCard(game, tokenId, destinationBgaId) {
    var strongholds = ensureStrongholds(game);
    var token = strongholds.tokens[String(tokenId)];
    if (!token) return null;
    var destination = marketSlotForBgaCardId(game, destinationBgaId);
    if (token.slot_id) removeStrongholdTokenFromSlot(game, tokenId);
    token.location = String(destinationBgaId || "");
    token.card_bga_id = String(destinationBgaId || "");
    if (!destination) {
      token.slot_id = null;
      return null;
    }
    token.slot_id = destination.slotId;
    if (!Array.isArray(strongholds.placements[destination.slotId])) strongholds.placements[destination.slotId] = [];
    strongholds.placements[destination.slotId].push(Number(token.player_index));
    return destination;
  }

  function applyBgaStrongholdEvent(game, item, playerLookup) {
    if (!item || !item.args) return null;
    var args = item.args;
    var actor = playerLookup[String(args.player_id || "")] || game.players[0];
    var actorIndex = Math.max(0, game.players.indexOf(actor));
    var tokenId = String(args.strongholdsId || "");
    var rawToken = args.stronghold || args.strongholds || { id: tokenId, type: args.player_id, location: args.strongholdsDestination };
    var token = ensureStrongholds(game).tokens[tokenId] || registerBgaStrongholdToken(game, rawToken, args.player_id);
    if (!token) return null;
    var fromSlotId = token.slot_id || null;
    var destination = String(args.strongholdsDestination || "draw");
    if (!destination || destination === "draw") {
      removeStrongholdTokenFromSlot(game, tokenId);
      return {
        type: "remove",
        token_id: tokenId,
        actor_index: actorIndex,
        player_index: Number(token.player_index),
        from_slot_id: fromSlotId,
        slot_id: fromSlotId,
        removed_player_index: Number(token.player_index),
        destination: "draw"
      };
    }
    var destinationSlot = marketSlotForBgaCardId(game, destination);
    if (destinationSlot && fromSlotId === destinationSlot.slotId) {
      token = tokenForRepeatedStrongholdDestination(game, token, destinationSlot.slotId);
      tokenId = String(token.id);
      fromSlotId = token.slot_id || null;
    }
    var target = placeStrongholdTokenOnBgaCard(game, tokenId, destination);
    token = ensureStrongholds(game).tokens[tokenId];
    return {
      type: fromSlotId ? "move" : "place",
      token_id: tokenId,
      actor_index: actorIndex,
      player_index: Number(token.player_index),
      from_slot_id: fromSlotId,
      slot_id: target ? target.slotId : null,
      card_id: target && target.card ? target.card.id : "",
      card_bga_id: destination,
      market_id: target ? target.marketId : "",
      tier: target ? target.tier : null,
      index: target ? target.index : null,
      destination: destination
    };
  }

  function applyBgaStrongholdBuyReturn(game, item, playerLookup) {
    if (!item || !item.args) return [];
    var args = item.args;
    var actor = playerLookup[String(args.player_id || "")] || game.players[0];
    var actorIndex = Math.max(0, game.players.indexOf(actor));
    var returned = [];
    bgaObjectValues(args.strongholdsIdList).forEach(function (rawToken) {
      var token = registerBgaStrongholdToken(game, rawToken, rawToken && rawToken.type || args.player_id);
      if (!token) return;
      var locationSlot = marketSlotForBgaCardId(game, rawToken && rawToken.location);
      var fromSlotId = token.slot_id || (locationSlot && locationSlot.slotId) || null;
      if (fromSlotId && !token.slot_id) token.slot_id = fromSlotId;
      removeStrongholdTokenFromSlot(game, token.id);
      returned.push({
        type: "return",
        token_id: token.id,
        actor_index: actorIndex,
        player_index: Number(token.player_index),
        from_slot_id: fromSlotId,
        slot_id: fromSlotId,
        card_bga_id: String(args.card_id || rawToken && rawToken.location || ""),
        destination: "draw"
      });
    });
    return returned;
  }

  function applyBgaStrongholdEvents(game, items, playerLookup) {
    var effects = [];
    (items || []).forEach(function (item) {
      if (item && item.type === "buyCardMoveStronghold") {
        effects = effects.concat(applyBgaStrongholdBuyReturn(game, item, playerLookup));
      } else if (item && item.type === "moveStronghold") {
        var effect = applyBgaStrongholdEvent(game, item, playerLookup);
        if (effect) effects.push(effect);
      }
    });
    return effects;
  }

  function initializeBgaStrongholds(game, gamedatas) {
    var strongholdsByPlayer = gamedatas && gamedatas.market && gamedatas.market.strongholds || {};
    Object.keys(strongholdsByPlayer).forEach(function (bgaPlayerId) {
      var tokens = strongholdsByPlayer[bgaPlayerId] || {};
      bgaObjectValues(tokens).forEach(function (rawToken) {
        var token = registerBgaStrongholdToken(game, rawToken, bgaPlayerId);
        if (token && token.location && token.location !== "draw") {
          placeStrongholdTokenOnBgaCard(game, token.id, token.location);
        }
      });
    });
  }

  function buildBgaPlayerList(data, gamedatas) {
    var players = Array.isArray(data && data.players) ? data.players.slice(0, 4) : [];
    var byId = {};
    players.forEach(function (player) {
      byId[String(player.id)] = true;
    });
    var gdPlayers = gamedatas && gamedatas.players && typeof gamedatas.players === "object" ? gamedatas.players : {};
    bgaObjectValues(gdPlayers).forEach(function (player) {
      var id = player && (player.id || player.player_id);
      if (!id || byId[String(id)]) return;
      byId[String(id)] = true;
      players.push({ id: id, name: player.name || "BGA Player " + (players.length + 1) });
    });
    (data && data.logs || []).forEach(function (packet) {
      (packet.data || []).forEach(function (entry) {
        var args = entry.args || {};
        var id = args.player_id;
        if (!id || byId[String(id)]) return;
        byId[String(id)] = true;
        players.push({ id: id, name: args.player_name || "BGA Player " + players.length });
      });
    });
    return players.slice(0, 4);
  }

  function bgaDeckPlaceholders(tier, count) {
    var cards = [];
    for (var index = 0; index < Math.max(0, Number(count) || 0); index += 1) {
      cards.push({
        id: "bga-hidden-t" + tier + "-" + index,
        bga_id: "",
        tier: tier,
        color: "gold",
        points: 0,
        cost: normalizeCost({}),
        hidden: true
      });
    }
    return cards;
  }

  function bgaNobleFromDb(raw, gamedatas, fallback) {
    var id = String(raw || fallback && fallback.id || "unknown");
    var db = gamedatas && gamedatas.nobledb && gamedatas.nobledb[id];
    return {
      id: "bga-noble-" + id,
      bga_id: id,
      name: String(db && db.name || fallback && fallback.name || "BGA noble"),
      points: Math.max(0, Number(db && db.points || fallback && fallback.points || 3) || 3),
      req: bgaCostToCounts(db && db.cost || fallback && fallback.req)
    };
  }

  function applyBgaClaimNoble(game, player, claim, gamedatas) {
    if (!game || !player || !claim) return null;
    var nobleRaw = bgaRawCardTypeId(claim.args && claim.args.card, claim.args && claim.args.card && claim.args.card.id);
    var noble = bgaNobleFromDb(nobleRaw, gamedatas, { name: claim.args && claim.args.noble_desc || "BGA noble" });
    var nobleIndex = game.nobles.findIndex(function (entry) {
      return entry && ((entry.bga_id && entry.bga_id === noble.bga_id) || entry.id === noble.id);
    });
    if (nobleIndex >= 0) noble = game.nobles.splice(nobleIndex, 1)[0];
    var alreadyClaimed = player.nobles.some(function (entry) {
      return entry && ((entry.bga_id && entry.bga_id === noble.bga_id) || entry.id === noble.id);
    });
    if (!alreadyClaimed) player.nobles.push(noble);
    return noble;
  }

  function applyBgaInitialGamedatas(game, gamedatas) {
    if (!gamedatas || !gamedatas.market || !gamedatas.carddb) return false;
    var market = gamedatas.market || {};
    if (market.pool) game.bank = bgaPoolToBank(market.pool);
    var orientActive = bgaInitialGamedatasOrientActive(gamedatas);
    var strongholdsActive = bgaInitialGamedatasStrongholdsActive(gamedatas);
    if (orientActive || strongholdsActive) {
      game.ruleset = createRuleset({ modules: { orient: orientActive, strongholds: strongholdsActive } });
      game.module_state = createModuleState(game.ruleset);
      game.orient_market = emptyTieredMarket();
      game.orient_decks = emptyTieredMarket();
      if (orientActive && activeMarketPage === BASE_MARKET_ID) activeMarketPage = ORIENT_MARKET_ID;
    }
    [1, 2, 3].forEach(function (tier) {
      var row = market["row_" + tier] || {};
      var cards = bgaObjectValues(row.cards).map(function (entry) {
        return bgaCardFromDb(bgaRawCardTypeId(entry, entry && entry.type), gamedatas, { tier: tier });
      }).filter(function (card) {
        return card && card.bga_id && card.bga_id !== "unknown";
      });
      game.market[tier] = cards;
      rememberSeenCards(game, cards);
      game.decks[tier] = bgaDeckPlaceholders(tier, Number(row.count) || 0);
      if (orientEnabledForRuleset(game.ruleset)) {
        var orientRow = market["orient_row_" + tier] || {};
        var orientCards = bgaObjectValues(orientRow.cards).map(function (entry) {
          return bgaCardFromDb(bgaRawCardTypeId(entry, entry && entry.type), gamedatas, { tier: tier });
        }).filter(function (card) {
          return card && card.bga_id && card.bga_id !== "unknown";
        });
        game.orient_market[tier] = orientCards;
        game.orient_decks[tier] = bgaDeckPlaceholders(tier, Number(orientRow.count) || 0).map(function (card) {
          card.module = ORIENT_MARKET_ID;
          return card;
        });
      }
    });
    if (orientEnabledForRuleset(game.ruleset)) setOrientDecksInitialized(game);
    game.bga_deck_unknown = true;
    game.nobles = bgaObjectValues(market.nobles).map(function (entry) {
      return bgaNobleFromDb(bgaRawCardTypeId(entry, entry && entry.type), gamedatas, {});
    }).filter(function (noble) {
      return noble && noble.bga_id && noble.bga_id !== "unknown";
    });
    if (strongholdsActive) initializeBgaStrongholds(game, gamedatas);
    var activePlayer = gamedatas.gamestate && gamedatas.gamestate.active_player;
    if (activePlayer !== undefined && activePlayer !== null) {
      var activeIndex = game.players.findIndex(function (player) {
        return String(player.bga_id || "") === String(activePlayer);
      });
      if (activeIndex >= 0) game.current = activeIndex;
    }
    game.round = Math.max(1, Number(gamedatas.roundnumber) || game.round || 1);
    return true;
  }

  function decrementBgaDeck(game, tier, marketId) {
    var decks = marketId === ORIENT_MARKET_ID ? game.orient_decks : game.decks;
    if (decks && decks[tier] && decks[tier].length) decks[tier].pop();
  }

  function removeBgaMarketCard(game, card) {
    var tier = Math.max(1, Math.min(3, Number(card && card.tier) || 1));
    var marketId = card && card.module === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID;
    var market = marketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
    var cards = market && market[tier] || [];
    var index = cards.findIndex(function (entry) {
      return entry && card && ((entry.bga_id && entry.bga_id === card.bga_id) || entry.id === card.id);
    });
    if (index >= 0) {
      cards[index] = null;
      return { tier: tier, index: index, marketId: marketId };
    }
    return null;
  }

  function bgaMarketRefFromCardLocation(card, fallbackTier) {
    var location = String(card && card.location || "");
    var match = location.match(/^(market|orient)_(\d+)$/i);
    var marketId = match && match[1].toLowerCase() === "orient" ? ORIENT_MARKET_ID : BASE_MARKET_ID;
    var tier = Math.max(1, Math.min(3, Number(match && match[2] || fallbackTier) || 1));
    var rawIndex = Number(card && card.location_arg);
    return {
      marketId: marketId,
      tier: tier,
      index: Number.isInteger(rawIndex) && rawIndex >= 0 ? rawIndex : null
    };
  }

  function findBgaRevealCardItem(items, slot, usedRevealItems) {
    var reveals = (items || []).filter(function (entry) {
      return entry && entry.type === "revealCard" && entry.args && entry.args.card && !(usedRevealItems && usedRevealItems.has(entry));
    });
    if (!slot) return reveals[0] || null;
    return reveals.find(function (entry) {
      var ref = bgaMarketRefFromCardLocation(entry.args.card, slot.tier);
      return ref.marketId === slot.marketId && ref.tier === slot.tier && ref.index === slot.index;
    }) || reveals.find(function (entry) {
      var ref = bgaMarketRefFromCardLocation(entry.args.card, slot.tier);
      return ref.marketId === slot.marketId && ref.tier === slot.tier;
    }) || reveals[0] || null;
  }

  function revealBgaMarketCard(game, items, tier, gamedatas, slot, usedRevealItems) {
    var reveal = findBgaRevealCardItem(items, slot, usedRevealItems);
    if (!reveal) return null;
    if (usedRevealItems) usedRevealItems.add(reveal);
    var revealCard = bgaCardFromNotification(reveal, items || [], { tier: tier }, gamedatas);
    if (!revealCard || !revealCard.bga_id || revealCard.bga_id === "unknown") return null;
    var targetTier = Math.max(1, Math.min(3, Number(revealCard.tier || tier) || 1));
    var targetMarketId = revealCard.module === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID;
    var targetMarket = targetMarketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
    var exists = (targetMarket[targetTier] || []).some(function (entry) {
      return entry && entry.bga_id === revealCard.bga_id;
    });
    if (!exists) {
      if (slot && slot.marketId === targetMarketId && slot.tier === targetTier && Number.isInteger(slot.index) && targetMarket[targetTier]) {
        targetMarket[targetTier][slot.index] = revealCard;
      } else {
        var emptyIndex = (targetMarket[targetTier] || []).findIndex(function (entry) { return !entry; });
        if (emptyIndex >= 0) targetMarket[targetTier][emptyIndex] = revealCard;
        else targetMarket[targetTier].push(revealCard);
      }
      rememberSeenCard(game, revealCard);
    }
    decrementBgaDeck(game, targetTier, targetMarketId);
    return revealCard;
  }

  function applyBgaRevealCards(game, items, gamedatas, usedRevealItems) {
    (items || []).forEach(function (entry) {
      if (!entry || entry.type !== "revealCard" || !entry.args || !entry.args.card) return;
      if (usedRevealItems && usedRevealItems.has(entry)) return;
      var card = bgaCardFromNotification(entry, items || [], { card: entry.args.card }, gamedatas);
      if (!card || !card.bga_id || card.bga_id === "unknown") return;
      var targetTier = Math.max(1, Math.min(3, Number(card.tier) || 1));
      var targetMarketId = card.module === ORIENT_MARKET_ID ? ORIENT_MARKET_ID : BASE_MARKET_ID;
      var targetMarket = targetMarketId === ORIENT_MARKET_ID ? game.orient_market : game.market;
      var cards = targetMarket[targetTier] || [];
      if (cards.some(function (existing) { return existing && existing.bga_id === card.bga_id; })) return;
      var emptyIndex = cards.findIndex(function (existing) { return !existing; });
      var rawIndex = Number(entry.args.card.location_arg);
      if (emptyIndex >= 0) cards[emptyIndex] = card;
      else if (Number.isInteger(rawIndex) && rawIndex >= 0 && !cards[rawIndex]) cards[rawIndex] = card;
      else cards.push(card);
      targetMarket[targetTier] = cards;
      rememberSeenCard(game, card);
      decrementBgaDeck(game, targetTier, targetMarketId);
      if (usedRevealItems) usedRevealItems.add(entry);
    });
  }

  function orientFreeSourceCard(acquiredCards, tier) {
    for (var index = acquiredCards.length - 1; index >= 0; index -= 1) {
      var card = acquiredCards[index];
      if (orientCardAbilities(card, "take_level_free").some(function (ability) {
        return Number(ability.free_tier) === Number(tier);
      })) {
        return card;
      }
    }
    return acquiredCards[0] || null;
  }

  function acquireBgaBuyCard(game, player, buyItem, items, gamedatas, usedRevealItems) {
    var buyCard = bgaCardFromNotification(buyItem, items, { player_id: buyItem && buyItem.args && buyItem.args.player_id }, gamedatas);
    rememberSeenCard(game, buyCard);
    var fromHand = /hand/i.test(String(buyItem && buyItem.args && buyItem.args.card && buyItem.args.card.location || ""));
    var buySlot = null;
    var strongholdsReturned = [];
    if (fromHand) {
      var reservedIndex = player.reserved.findIndex(function (card) {
        return card.bga_id && card.bga_id === buyCard.bga_id || card.id === buyCard.id;
      });
      if (reservedIndex >= 0) {
        buyCard.reserved_from = player.reserved[reservedIndex].reserved_from;
        player.reserved.splice(reservedIndex, 1);
      } else {
        buyCard.reserved_from = "deck";
      }
    } else {
      buySlot = removeBgaMarketCard(game, buyCard);
      if (buySlot) strongholdsReturned = clearStrongholdsAtSlot(game, marketSlotId(game, buySlot.marketId, buySlot.tier, buySlot.index));
      revealBgaMarketCard(game, items, buyCard.tier, gamedatas, buySlot, usedRevealItems);
    }
    var purchasedCard = purchaseRecordCard(buyCard);
    applyCardBonuses(player, purchasedCard);
    player.purchased.push(purchasedCard);
    return {
      card: purchasedCard,
      fromHand: fromHand,
      slot: buySlot,
      strongholdsReturned: strongholdsReturned
    };
  }

  function groupBgaPacketsByMove(logs) {
    var groups = {};
    (logs || []).forEach(function (packet) {
      var moveId = String(packet && packet.move_id || packet && packet.packet_id || "");
      if (!moveId) return;
      if (!groups[moveId]) groups[moveId] = { move_id: moveId, items: [] };
      groups[moveId].items = groups[moveId].items.concat(packet.data || []);
    });
    return Object.keys(groups).sort(function (a, b) {
      return (Number(a) || 0) - (Number(b) || 0);
    }).map(function (key) {
      return groups[key];
    });
  }

  function applyBgaMoveGroup(game, group, playerLookup, gamedatas) {
    var items = group.items || [];
    var publicReserve = items.find(function (entry) { return entry.type === "reserveCard" && (entry.log || entry.args && entry.args.player_name); });
    var privateReserve = items.find(function (entry) { return entry.type === "reserveCard" && entry.args && entry.args.card; });
    var buyItems = items.filter(function (entry) { return entry.type === "buyCard"; });
    var buy = buyItems[0];
    var claim = items.find(function (entry) { return entry.type === "claimNoble"; });
    var end = items.find(function (entry) { return entry.type === "simpleNode" && /end of game/i.test(entry.log || ""); });
    var coins = items.filter(function (entry) { return entry.type === "coins"; });
    var strongholdPrimary = items.find(function (entry) { return entry.type === "moveStronghold" || entry.type === "buyCardMoveStronghold"; });
    var primary = buy || publicReserve || privateReserve || claim || coins[0] || end || strongholdPrimary;
    if (!primary) return null;
    var primaryArgs = primary.args || {};
    var externalId = String(primaryArgs.player_id || "");
    if (!externalId && coins[0] && coins[0].args) externalId = String(coins[0].args.player_id || "");
    var player = playerLookup[externalId] || game.players[0];
    if (!player) return null;
    game.current = Math.max(0, game.players.indexOf(player));
    applyBgaCoinGaps(game, player, coins);
    var strongholdEffects = applyBgaStrongholdEvents(game, items, playerLookup);

    if (buy) {
      var usedRevealItems = new Set();
      var primaryPurchase = acquireBgaBuyCard(game, player, buy, items, gamedatas, usedRevealItems);
      var buyCard = primaryPurchase.card;
      var acquiredCards = [buyCard];
      var orientEffects = [];
      buyItems.slice(1).forEach(function (freeBuy) {
        var freePurchase = acquireBgaBuyCard(game, player, freeBuy, items, gamedatas, usedRevealItems);
        var sourceCard = orientFreeSourceCard(acquiredCards, freePurchase.card.tier);
        acquiredCards.push(freePurchase.card);
        orientEffects.push({
          type: "free_card",
          source_card_id: sourceCard && sourceCard.id || buyCard.id,
          card_id: freePurchase.card.id,
          tier: freePurchase.card.tier,
          market_id: freePurchase.slot ? freePurchase.slot.marketId : freePurchase.card.module || BASE_MARKET_ID,
          market_slot_id: freePurchase.slot ? marketSlotId(game, freePurchase.slot.marketId, freePurchase.slot.tier, freePurchase.slot.index) : null,
          strongholds_returned: freePurchase.strongholdsReturned,
          card: clone(freePurchase.card)
        });
      });
      applyBgaRevealCards(game, items, gamedatas, usedRevealItems);
      var claimedAfterBuy = applyBgaClaimNoble(game, player, claim, gamedatas);
      var args = {
        card_id: buyCard.id,
        card: buyCard,
        tier: buyCard.tier,
        reserved_from: buyCard.reserved_from || "market",
        payment: { tokens: bgaCoinsFromGap(coins, -1), gold_as: emptyCounts(false) },
        noble_id: claimedAfterBuy && claimedAfterBuy.id,
        noble: claimedAfterBuy
      };
      if (primaryPurchase.slot) {
        args.market_id = primaryPurchase.slot.marketId;
        args.market_index = primaryPurchase.slot.index;
        args.market_slot_id = marketSlotId(game, primaryPurchase.slot.marketId, primaryPurchase.slot.tier, primaryPurchase.slot.index);
      }
      if (primaryPurchase.strongholdsReturned.length) args.strongholds_returned = primaryPurchase.strongholdsReturned;
      if (strongholdEffects.length) args.stronghold_effects = strongholdEffects;
      if (orientEffects.length) args.orient_effects = orientEffects;
      return {
        type: primaryPurchase.fromHand ? "buyReserved" : "buyMarket",
        player: player,
        args: args
      };
    }

    if (publicReserve || privateReserve) {
      var reserveItem = publicReserve || privateReserve;
      var cardSource = privateReserve && privateReserve.args && privateReserve.args.card || reserveItem.args && reserveItem.args.card || {};
      var fromDeck = /^draw_/i.test(String(cardSource.location || "")) || !!(reserveItem.args && reserveItem.args.drawpile);
      var reserveCard = bgaCardFromNotification(reserveItem, items, { card: cardSource, id: bgaRawCardTypeId(cardSource, ""), player_id: externalId }, gamedatas);
      rememberSeenCard(game, reserveCard);
      reserveCard.reserved_from = fromDeck ? "deck" : "market";
      if (player.reserved.length < 3) player.reserved.push(reserveCard);
      if (fromDeck) {
        decrementBgaDeck(game, reserveCard.tier);
      } else {
        var reserveSlot = removeBgaMarketCard(game, reserveCard);
        if (reserveSlot) clearStrongholdsAtSlot(game, marketSlotId(game, reserveSlot.marketId, reserveSlot.tier, reserveSlot.index));
        var usedReserveRevealItems = new Set();
        revealBgaMarketCard(game, items, reserveCard.tier, gamedatas, reserveSlot, usedReserveRevealItems);
        applyBgaRevealCards(game, items, gamedatas, usedReserveRevealItems);
      }
      if (fromDeck) applyBgaRevealCards(game, items, gamedatas);
      return {
        type: fromDeck ? "reserveDeck" : "reserveMarket",
        player: player,
        args: {
          card_id: reserveCard.id,
          card: reserveCard,
          tier: reserveCard.tier,
          took_gold: (bgaCoinsFromGap(coins, 1).gold || 0) > 0,
          stronghold_effects: strongholdEffects
        }
      };
    }

    if (claim) {
      var noble = applyBgaClaimNoble(game, player, claim, gamedatas);
      applyBgaRevealCards(game, items, gamedatas);
      return { type: "chooseNoble", player: player, args: { noble_id: noble && noble.id, noble: noble } };
    }

    if (strongholdPrimary && strongholdEffects.length) {
      applyBgaRevealCards(game, items, gamedatas);
      return {
        type: "strongholdMove",
        player: player,
        args: {
          stronghold_effects: strongholdEffects
        }
      };
    }

    if (coins.length) {
      applyBgaRevealCards(game, items, gamedatas);
      var gained = bgaCoinsFromGap(coins, 1);
      var returned = bgaCoinsFromGap(coins, -1);
      var gainedColors = bgaTokenListFromCounts(gained);
      var returnedColors = bgaTokenListFromCounts(returned);
      if (!gainedColors.length && returnedColors.length) {
        return {
          type: "discardToken",
          player: player,
          args: { color: returnedColors[0], returned: returned }
        };
      }
      return {
        type: "takeTokens",
        player: player,
        args: { colors: gainedColors }
      };
    }

    if (end) {
      game.gameOver = true;
      return { type: "gameEnd", player: player, args: {} };
    }
    return null;
  }

  function convertBgaCaptureToReplayPayload(payload) {
    if (!isBgaCapturePayload(payload) || bgaCaptureHasExpansionHint(payload)) return null;
    var data = extractBgaReplayData(payload);
    var initialBgaGamedatas = extractBgaInitialGamedatas(payload);
    if (!data || !Array.isArray(data.logs)) return null;
    if (!initialBgaGamedatas) return null;
    var bgaPlayers = buildBgaPlayerList(data, initialBgaGamedatas);
    if (bgaPlayers.length < 2) return null;
    var orientActive = bgaInitialGamedatasOrientActive(initialBgaGamedatas);
    var strongholdsActive = bgaInitialGamedatasStrongholdsActive(initialBgaGamedatas);
    var game = createGame(bgaPlayers.length, bgaPlayers.map(function (player, index) {
      return player.name || "BGA Player " + (index + 1);
    }), bgaPlayers.map(function () {
      return { enabled: false, mode: null, level: "balanced" };
    }), { modules: { orient: orientActive, strongholds: strongholdsActive } });
    game.table_seed = 0;
    game.log = ["Imported BGA replay capture " + (payload.table_id || "") + "."];
    game.moves = [];
    game.next_move_id = 1;

    var playerLookup = {};
    bgaPlayers.forEach(function (player, index) {
      if (game.players[index]) {
        game.players[index].bga_id = String(player.id);
        playerLookup[String(player.id)] = game.players[index];
      }
    });
    applyBgaInitialGamedatas(game, initialBgaGamedatas);
    game.initial_gamedatas = toGamedatas(game, { includeSourceState: true });

    groupBgaPacketsByMove(data.logs).forEach(function (group) {
      var converted = applyBgaMoveGroup(game, group, playerLookup, initialBgaGamedatas);
      if (!converted) return;
      var actor = converted.player;
      var move = {
        move_id: game.next_move_id,
        type: converted.type,
        player_id: actor.id,
        args: converted.args || {},
        notification: {
          type: converted.type,
          log: "",
          args: Object.assign({ player_id: actor.id, player_name: actor.name, bga_move_id: group.move_id }, converted.args || {})
        },
        state_after: toGamedatas(game, { includeSourceState: true })
      };
      game.log.unshift(actor.name + " " + converted.type + " (BGA move " + group.move_id + ").");
      game.moves.push(move);
      game.next_move_id += 1;
    });

    if (!game.moves.length) return null;
    return {
      schema: SCHEMA,
      next_move_id: game.next_move_id,
      ruleset: normalizeRuleset(game.ruleset),
      gamedatas: game.initial_gamedatas,
      moves: compactMovesForExport(game.moves),
      bga_table_id: payload.table_id || "",
      compatibility: {
        base_game_only: !orientActive && !strongholdsActive,
        orient_supported: orientActive,
        strongholds_supported: strongholdsActive,
        active_expansion_flags: bgaActiveExpansionFlags(payload).filter(function (entry) {
          return !/orient|strongholds?/i.test(String(entry && entry.label || ""));
        })
      },
      source: payload.source || "boardgamearena"
    };
  }

  function setStartBgaDownload(url) {
    if (!el.startBgaDownload) return;
    if (!url) {
      el.startBgaDownload.hidden = true;
      el.startBgaDownload.removeAttribute("href");
      return;
    }
    el.startBgaDownload.hidden = false;
    el.startBgaDownload.href = url;
  }

  function setBgaImportBusy(isBusy) {
    if (el.startImportBgaTable) el.startImportBgaTable.disabled = !!isBusy;
    if (el.startBgaTableId) el.startBgaTableId.disabled = !!isBusy;
  }

  function clearActiveBgaReplayJob() {
    if (activeBgaReplayPollTimer) {
      window.clearTimeout(activeBgaReplayPollTimer);
      activeBgaReplayPollTimer = null;
    }
    activeBgaReplayJobId = "";
    setBgaImportBusy(false);
  }

  function cleanBgaTableId(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function importBgaTableFromStart() {
    if (activeBgaReplayJobId) {
      var activeMessage = t("msgBgaServerQueued", { table: cleanBgaTableId(el.startBgaTableId && el.startBgaTableId.value) });
      showStartMessage(activeMessage, "ok");
      if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = activeMessage;
      return;
    }
    var tableId = cleanBgaTableId(el.startBgaTableId && el.startBgaTableId.value);
    if (!tableId) {
      showStartMessage(t("msgBgaTableIdRequired"));
      if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = t("msgBgaTableIdRequired");
      render();
      return;
    }
    setStartBgaDownload("");
    setBgaImportBusy(true);
    var queued = t("msgBgaServerQueued", { table: tableId });
    showStartMessage(queued, "ok");
    if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = queued;
    fetch("/api/bga/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: tableId })
    }).then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    }).then(function (job) {
      activeBgaReplayJobId = job.jobId || "";
      pollBgaReplayJob(job.jobId);
    }).catch(function () {
      clearActiveBgaReplayJob();
      showStartMessage(t("msgBgaServerUnavailable"));
      if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = t("msgBgaServerUnavailable");
      render();
    });
  }

  function pollBgaReplayJob(jobId) {
    if (!jobId) {
      showStartMessage(t("msgBgaServerUnavailable"));
      return;
    }
    fetch("/api/bga/replay/" + encodeURIComponent(jobId)).then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    }).then(function (job) {
      if (job.status === "done") {
        setStartBgaDownload(job.downloadUrl || "");
        var compatibility = job.compatibility || {};
        clearActiveBgaReplayJob();
        if (job.importable || !bgaCompatibilityHasActiveExpansion(compatibility)) {
          fetch(job.downloadUrl).then(function (response) { return response.json(); }).then(function (payload) {
            loadReplayPayload(payload, "", true);
          }).catch(function () {
            showStartMessage(t("msgBgaServerDone"), "ok");
            if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = t("msgBgaServerDone");
          });
          return;
        }
        var unsupported = t("msgBgaExpansionUnsupported") + (compatibility.reason ? " " + compatibility.reason : "");
        showStartMessage(unsupported);
        if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = unsupported;
        render();
        return;
      }
      if (job.status === "failed") {
        clearActiveBgaReplayJob();
        var failed = t("msgBgaServerFailed", { message: job.error || "unknown error" });
        showStartMessage(failed);
        if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = failed;
        render();
        return;
      }
      var queued = t("msgBgaServerQueued", { table: job.tableId || "" });
      showStartMessage(queued, "ok");
      if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = queued;
      if (activeBgaReplayPollTimer) window.clearTimeout(activeBgaReplayPollTimer);
      activeBgaReplayPollTimer = window.setTimeout(function () {
        activeBgaReplayPollTimer = null;
        pollBgaReplayJob(jobId);
      }, 1500);
    }).catch(function () {
      clearActiveBgaReplayJob();
      showStartMessage(t("msgBgaServerUnavailable"));
      if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = t("msgBgaServerUnavailable");
      render();
    });
  }

  function openBgaReviewByTableId() {
    var tableId = cleanBgaTableId(el.bgaTableId && el.bgaTableId.value);
    if (!tableId) {
      showMessage(t("msgBgaTableIdRequired"));
      if (el.bgaCaptureStatus) el.bgaCaptureStatus.textContent = t("msgBgaTableIdRequired");
      render();
      return;
    }
    var url = "https://boardgamearena.com/gamereview?table=" + encodeURIComponent(tableId);
    window.open(url, "_blank", "noopener,noreferrer");
    if (el.bgaCaptureStatus) el.bgaCaptureStatus.textContent = t("msgBgaReviewOpened");
    showMessage(t("msgBgaReviewOpened"), "ok");
  }

  function loadReplayPayload(payload, rawText, fromStart) {
    if (isBgaCapturePayload(payload)) {
      var convertedPayload = convertBgaCaptureToReplayPayload(payload);
      if (convertedPayload) {
        payload = convertedPayload;
      } else {
        failBgaCaptureImport(payload, fromStart);
        return;
      }
    }
    if (payload.schema !== SCHEMA || !payload.gamedatas || !Array.isArray(payload.moves)) {
      if (fromStart) showStartMessage(t("msgLoadReplayExpected"));
      else showMessage(t("msgLoadReplayExpected"));
      render();
      return;
    }
    var unsupportedModules = replayPayloadUnsupportedRulesetModules(payload);
    if (unsupportedModules.length) {
      var unsupportedMessage = t("msgRulesetUnsupported", { modules: unsupportedModules.join(", ") });
      if (fromStart) showStartMessage(unsupportedMessage);
      else showMessage(unsupportedMessage);
      render();
      return;
    }
    var compactPayload = compactReplayPayload(payload);
    if (!compactPayload || !compactPayload.gamedatas || !Array.isArray(compactPayload.moves)) {
      if (fromStart) showStartMessage(t("msgLoadReplayExpected"));
      else showMessage(t("msgLoadReplayExpected"));
      render();
      return;
    }
    var initial = stateFromGamedatas(compactPayload.gamedatas);
    if (!initial) {
      if (fromStart) showStartMessage(t("msgLoadReplaySource"));
      else showMessage(t("msgLoadReplaySource"));
      render();
      return;
    }
    if (state && state.mode !== "replay") {
      liveStateBeforeReplay = compactStateForPersistence(state) || clone(state);
    }
    replayData = compactPayload;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    clearHandDockTransitionTimers();
    clearReplayStepTimer();
    setReplayAutoplay(false, true);
    state = initial;
    state.mode = "replay";
    activeMarketPage = BASE_MARKET_ID;
    pendingTake = [];
    pendingPayment = null;
    pendingOrientAction = null;
    showStartMessage("");
    showMessage(t("msgReplayLoaded"), "ok");
    render();
    scrollToGameTable();
  }

  function replayUrlFromQuery() {
    if (!window.URLSearchParams) return "";
    var params = new URLSearchParams(window.location.search || "");
    var value = params.get("replayUrl") || params.get("replay");
    if (!value) return "";
    try {
      var url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin) return "";
      if (!/^\/api\/bga\/replay\//.test(url.pathname)) return "";
      return url.pathname + url.search;
    } catch (error) {
      return "";
    }
  }

  function loadReplayFromQuery() {
    var replayUrl = replayUrlFromQuery();
    if (!replayUrl) return;
    setStartMode("replay");
    showStartMessage(t("msgBgaServerQueued", { table: "cache" }), "ok");
    fetch(replayUrl, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    }).then(function (payload) {
      loadReplayPayload(payload, "", true);
    }).catch(function (error) {
      showStartMessage(t("msgBgaServerFailed", { message: error && error.message || "unknown error" }));
      render();
    });
  }

  function stepReplay(delta) {
    if (!replayData || state.mode !== "replay") return;
    if (state.turnTransition && state.turnTransition.replay) return;
    var nextIndex = replayIndex + delta;
    if (nextIndex < -1 || nextIndex >= replayData.moves.length) return;
    clearReplayStepTimer();
    if (delta > 0 && nextIndex >= 0) {
      startReplayStep(nextIndex, delta);
      return;
    }
    applyReplayIndex(nextIndex);
  }

  function startReplayStep(nextIndex, delta) {
    var move = replayData.moves[nextIndex];
    if (!move) return;
    var now = Date.now();
    state.turnTransition = {
      type: move.type,
      args: clone(move.args || {}),
      actor: replayMoveActor(move),
      display_current: displayCurrentIndex(),
      replay: true,
      move_id: move.move_id,
      started_at: new Date(now).toISOString(),
      until: now + REPLAY_STEP_DELAY_MS
    };
    queueReplayMoveFlight(move, delta);
    showMessage(t("msgReplayStepAnimating", { move: move.move_id, seconds: Math.ceil(REPLAY_STEP_DELAY_MS / 1000) }), "ok");
    render();
    replayStepTimer = window.setTimeout(function () {
      replayStepTimer = null;
      applyReplayIndex(nextIndex);
    }, REPLAY_STEP_DELAY_MS);
  }

  function applyReplayIndex(nextIndex) {
    replayIndex = nextIndex;
    if (replayIndex === -1) {
      state = stateFromGamedatas(replayData.gamedatas);
    } else {
      state = stateFromGamedatas(replayData.moves[replayIndex].state_after);
    }
    state.mode = "replay";
    if (activeMarketPage === ORIENT_MARKET_ID && !orientEnabledForRuleset(state.ruleset)) activeMarketPage = BASE_MARKET_ID;
    var moveText = replayIndex === -1 ? t("msgInitialReplayPosition") : t("msgReplayAtMove", { move: replayData.moves[replayIndex].move_id, type: replayData.moves[replayIndex].type });
    showMessage(moveText, "ok");
    render();
    if (replayAutoplay) scheduleReplayAutoplay();
  }

  function replayMoveIndexFromInput(value) {
    if (!replayData || !Array.isArray(replayData.moves)) return null;
    var total = replayData.moves.length;
    var cleanValue = String(value === undefined || value === null ? "" : value).replace(/[^\d]/g, "");
    if (!cleanValue) return null;
    var moveNumber = Number(cleanValue);
    if (!Number.isFinite(moveNumber)) return null;
    moveNumber = Math.floor(moveNumber);
    if (moveNumber < 0 || moveNumber > total) return null;
    if (moveNumber === 0) return -1;
    var byMoveId = replayData.moves.findIndex(function (move) {
      return Number(move && move.move_id) === moveNumber;
    });
    return byMoveId >= 0 ? byMoveId : moveNumber - 1;
  }

  function jumpReplayToInput(valueOverride) {
    if (!replayData || state.mode !== "replay") return;
    clearReplayStepTimer();
    setReplayAutoplay(false, true);
    var total = replayData.moves.length;
    var inputValue = valueOverride !== undefined && valueOverride !== null ? valueOverride : el.replayJumpInput && el.replayJumpInput.value;
    var target = replayMoveIndexFromInput(inputValue);
    replayJumpClickValue = null;
    if (target === null) {
      showMessage(t("msgReplayJumpInvalid", { total: total }));
      render();
      return;
    }
    applyReplayIndex(target);
    var label = target < 0 ? 0 : replayData.moves[target].move_id;
    showMessage(t("msgReplayJumped", { move: label }), "ok");
    render();
  }

  function exitReplay() {
    if (!state || state.mode !== "replay") return;
    setReplayAutoplay(false, true);
    closeDinoBoardSession();
    state = liveStateBeforeReplay ? clone(liveStateBeforeReplay) : null;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearReplayStepTimer();
    pendingTake = [];
    pendingPayment = null;
    pendingOrientAction = null;
    showMessage(state ? t("msgReturnedLiveTable") : "");
    resetDinoBoardAiForCurrentState(false);
    render();
  }

  function continueReplayFromHere() {
    if (!state || state.mode !== "replay" || !replayData) return;
    setReplayAutoplay(false, true);
    var preservedReplay = clone(replayData);
    var continuedMoves = compactMovesForExport(replayMovesThroughCurrentStep());
    var continued = clone(state);
    continued.mode = "live";
    continued.moves = continuedMoves;
    continued.initial_gamedatas = compactGamedatasForExport(preservedReplay.gamedatas) || clone(preservedReplay.gamedatas);
    continued.next_move_id = nextMoveIdAfterMoves(continued, continuedMoves);
    rebuildUnknownBgaDecksForLive(continued);
    continued.imported_replay = preservedReplay;
    continued.imported_replay_resume_index = replayIndex;
    closeDinoBoardSession();
    state = continued;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearReplayStepTimer();
    pendingTake = [];
    pendingPayment = null;
    pendingOrientAction = null;
    if (el.bgaFileStatus) el.bgaFileStatus.textContent = t("fileIoHint");
    showMessage(t("msgContinueFromReplay"), "ok");
    resetDinoBoardAiForCurrentState(true);
    saveState();
    render();
  }

  function parseJsonTextarea(source, startScope) {
    try {
      return JSON.parse((source || el.bgaJson).value);
    } catch (error) {
      var message = t("msgJsonParseFailed", { message: error.message });
      if (startScope) showStartMessage(message);
      else showMessage(message);
      render();
      return null;
    }
  }

  function startGameWithCurrentForm(countOverride) {
    var count = countOverride || Number(el.playerCount.value);
    if (![2, 3, 4].includes(count)) {
      showStartMessage(t("msgChoosePlayerCount"));
      render();
      return;
    }
    el.playerCount.value = String(count);
    if (el.playerNameFields.querySelectorAll('input[name="playerName"]').length !== count) {
      renderNameFields();
    }
    var names = Array.from(el.playerNameFields.querySelectorAll('input[name="playerName"]')).map(function (input, index) {
      return cleanName(input.value, index);
    });
    var aiLevels = Array.from(el.playerNameFields.querySelectorAll('select[name="playerAiLevel"]'));
    var aiSettings = Array.from(el.playerNameFields.querySelectorAll('input[name="playerAi"]')).map(function (input, index) {
      var level = normalizeAiLevel(aiLevels[index] && aiLevels[index].value);
      return { enabled: input.checked, mode: level, level: level, selected_order: Number(input.dataset.aiSelectedOrder) || null };
    });
    var rulesetOptions = {
      modules: {
        orient: !!(el.rulesetOrient && el.rulesetOrient.checked),
        strongholds: !!(el.rulesetStrongholds && el.rulesetStrongholds.checked)
      }
    };
    closeDinoBoardSession();
    state = createGame(count, names, aiSettings, rulesetOptions);
    activeMarketPage = BASE_MARKET_ID;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    clearHandDockTransitionTimers();
    pendingTake = [];
    pendingPayment = null;
    pendingOrientAction = null;
    pendingOrientAction = null;
    showStartMessage("");
    showMessage(t("msgGameStarted"), "ok");
    if (el.bankPanel) el.bankPanel.open = true;
    resetDinoBoardAiForCurrentState(true);
    saveState();
    render();
    scrollToGameTable();
  }

  function resetToStart() {
    if (aiTurnTimer) {
      window.clearTimeout(aiTurnTimer);
      aiTurnTimer = null;
    }
    clearTurnAdvanceTimer();
    clearHandDockTransitionTimers();
    closeDinoBoardSession();
    state = null;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    clearHandDockTransitionTimers();
    pendingTake = [];
    pendingPayment = null;
    activeMarketPage = BASE_MARKET_ID;
    if (el.rulesetOrient) el.rulesetOrient.checked = false;
    if (el.rulesetStrongholds) el.rulesetStrongholds.checked = false;
    messageText = "";
    messageKind = "";
    clearSavedState();
    render();
  }

  function randomChoice(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function legalRandomAiBuyActions(player) {
    var actions = [];
    [1, 2, 3].forEach(function (tier) {
      state.market[tier].forEach(function (card, index) {
        var slotId = marketSlotId(state, BASE_MARKET_ID, tier, index);
        if (!strongholdAccessStatus(slotId, state.current).ok) return;
        var payment = autoPaymentPlan(player, card);
        if (orientAbilityBuyStatus(card).ok && paymentIsLegal(player, card, payment)) {
          actions.push({
            type: "buy",
            context: { type: "buyMarket", player: player, card: card, tier: tier, index: index },
            payment: payment
          });
        }
      });
      if (orientEnabledForRuleset(state.ruleset)) {
        (state.orient_market[tier] || []).forEach(function (card, index) {
          if (!card || orientCardNeedsManualChoice(card)) return;
          var slotId = marketSlotId(state, ORIENT_MARKET_ID, tier, index);
          if (!strongholdAccessStatus(slotId, state.current).ok) return;
          var payment = autoPaymentPlan(player, card);
          if (orientAbilityBuyStatus(card, player).ok && paymentIsLegal(player, card, payment)) {
            actions.push({
              type: "buy",
              context: { type: "buyMarket", player: player, card: card, tier: tier, index: index, market_id: ORIENT_MARKET_ID },
              payment: payment
            });
          }
        });
      }
    });
    player.reserved.forEach(function (card, index) {
      if (orientCardNeedsManualChoice(card)) return;
      var payment = autoPaymentPlan(player, card);
      if (orientAbilityBuyStatus(card, player).ok && paymentIsLegal(player, card, payment)) {
        actions.push({
          type: "buy",
          context: { type: "buyReserved", player: player, card: card, index: index },
          payment: payment
        });
      }
    });
    return actions;
  }

  function legalRandomAiTakeActions() {
    var actions = [];
    var available = availableTakeColors();
    if (available.length > 0 && available.length < 3) {
      actions.push({ type: "take", colors: available.slice() });
    } else {
      for (var a = 0; a < available.length; a += 1) {
        for (var b = a + 1; b < available.length; b += 1) {
          for (var c = b + 1; c < available.length; c += 1) {
            actions.push({ type: "take", colors: [available[a], available[b], available[c]] });
          }
        }
      }
    }
    COLORS.forEach(function (color) {
      if (state.bank[color] >= 4) {
        actions.push({ type: "take", colors: [color, color] });
      }
    });
    return actions;
  }

  function decodeDinoBoardAction(actionId) {
    var id = Number(actionId);
    if (id >= 0 && id <= 11) return { type: "buyMarket", tier: Math.floor(id / 4) + 1, index: id % 4 };
    if (id >= 12 && id <= 23) {
      var reserveOffset = id - 12;
      return { type: "reserveMarket", tier: Math.floor(reserveOffset / 4) + 1, index: reserveOffset % 4 };
    }
    if (id >= 24 && id <= 26) return { type: "reserveDeck", tier: id - 23 };
    if (id >= 27 && id <= 29) return { type: "buyReserved", index: id - 27 };
    if (id >= 30 && id <= 39) return { type: "takeTokens", colors: DINO_TAKE_THREE[id - 30].slice() };
    if (id >= 40 && id <= 49) return { type: "takeTokens", colors: DINO_TAKE_TWO[id - 40].slice() };
    if (id >= 50 && id <= 54) return { type: "takeTokens", colors: [COLORS[id - 50]] };
    if (id >= 55 && id <= 59) return { type: "takeTokens", colors: [COLORS[id - 55], COLORS[id - 55]] };
    if (id >= 60 && id <= 62) return { type: "chooseNoble", index: id - 60 };
    if (id >= 63 && id <= 68) return { type: "discardToken", color: ALL_TOKENS[id - 63] };
    if (id === 69) return { type: "pass" };
    throw new Error("Unsupported DinoBoard action " + actionId);
  }

  function executeDinoBoardAction(actionId) {
    var action = decodeDinoBoardAction(actionId);
    var player = activePlayer();
    if (!player) throw new Error("No active player for AI action.");
    if (action.type === "discardToken") {
      discardToken(action.color);
      return;
    }
    if (action.type === "chooseNoble") {
      var nobleId = state.awaitingNobleChoice && state.awaitingNobleChoice[action.index] || state.awaitingNobleChoice && state.awaitingNobleChoice[0];
      if (!nobleId && state.nobles[action.index]) nobleId = state.nobles[action.index].id;
      if (!nobleId) throw new Error("AI chose a noble slot that is not available.");
      chooseNoble(nobleId);
      return;
    }
    if (!canAct({ allowAi: true })) throw new Error("AI attempted to act while the table is locked.");
    if (action.type === "buyMarket") {
      var marketCard = state.market[action.tier] && state.market[action.tier][action.index];
      if (!marketCard) throw new Error("AI selected an empty market slot.");
      var marketContext = { type: "buyMarket", player: player, card: marketCard, tier: action.tier, index: action.index };
      var marketPayment = autoPaymentPlan(player, marketCard);
      if (!orientAbilityBuyStatus(marketCard).ok) throw new Error("AI selected an Orient card with a pending ability choice.");
      if (!paymentIsLegal(player, marketCard, marketPayment)) throw new Error("AI selected an unaffordable market card.");
      completePurchase(marketContext, marketPayment, null, { ai: true });
      return;
    }
    if (action.type === "buyReserved") {
      var reservedCard = player.reserved[action.index];
      if (!reservedCard) throw new Error("AI selected an empty reserved slot.");
      var reservedContext = { type: "buyReserved", player: player, card: reservedCard, index: action.index };
      var reservedPayment = autoPaymentPlan(player, reservedCard);
      if (!orientAbilityBuyStatus(reservedCard).ok) throw new Error("AI selected an Orient card with a pending ability choice.");
      if (!paymentIsLegal(player, reservedCard, reservedPayment)) throw new Error("AI selected an unaffordable reserved card.");
      completePurchase(reservedContext, reservedPayment, null, { ai: true });
      return;
    }
    if (action.type === "reserveMarket") {
      reserveMarket(action.tier + ":" + action.index);
      return;
    }
    if (action.type === "reserveDeck") {
      reserveDeck(action.tier);
      return;
    }
    if (action.type === "takeTokens") {
      pendingTake = action.colors.slice();
      confirmTake();
      return;
    }
    if (action.type === "pass") {
      logEntry(player.name + " passed.");
      afterAction("pass", { ai: true });
      return;
    }
  }

  function runDinoBoardAiTurn() {
    aiTurnTimer = null;
    if (!state || state.mode === "replay" || state.gameOver) return;
    var player = activePlayer();
    if (!player || !player.ai || !player.ai.enabled) return;
    if (activeAiProviderName() !== "dinoboard") {
      scheduleRandomAiTurn();
      return;
    }
    aiDisplayCurrentOverride = state.aiThinking && typeof state.aiThinking.display_current === "number"
      ? state.aiThinking.display_current
      : fallbackVisiblePlayerIndex();
    activeAiProvider = "dinoboard";
    aiTurnInProgress = true;
    ensureDinoBoardSession().then(function () {
      return dinoboardAi.pending;
    }).then(function () {
      return dinoFetchJson("/ai/sessions/" + encodeURIComponent(dinoboardAi.sessionId) + "/decide", { method: "POST" });
    }).then(function (decision) {
      executeDinoBoardAction(decision.action_id);
    }).catch(function (error) {
      setDinoBoardUnavailable(error.message);
    }).then(function () {
      if (state) state.aiThinking = null;
      aiTurnInProgress = false;
      activeAiProvider = null;
      aiDisplayCurrentOverride = null;
      saveState();
      render();
    });
  }

  function scheduleDinoBoardAiTurn() {
    if (aiTurnTimer || aiTurnInProgress) return;
    if (!state || state.mode === "replay" || state.gameOver || state.turnTransition || pendingPayment || state.awaitingOrientAction) return;
    var player = activePlayer();
    if (!player || !player.ai || !player.ai.enabled) return;
    if (dinoboardAi && dinoboardAi.disabled) return;
    if (state.awaitingStrongholdAction || state.awaitingStrongholdConquest) {
      scheduleRandomAiTurn();
      return;
    }
    if (activeAiProviderName() !== "dinoboard") {
      scheduleRandomAiTurn();
      return;
    }
    if (!state.aiThinking) {
      var now = Date.now();
      state.aiThinking = {
        player_id: player.id,
        display_current: fallbackVisiblePlayerIndex(),
        started_at: new Date(now).toISOString(),
        until: now + AI_MIN_THINK_MS
      };
      saveState();
      render();
      return;
    }
    aiTurnTimer = window.setTimeout(runDinoBoardAiTurn, Math.max(0, (state.aiThinking.until || Date.now()) - Date.now()));
  }

  function runRandomAiTurn() {
    aiTurnTimer = null;
    if (!state || state.mode === "replay" || state.gameOver) return;
    var player = activePlayer();
    if (!player || !player.ai || !player.ai.enabled) return;
    aiDisplayCurrentOverride = state.aiThinking && typeof state.aiThinking.display_current === "number"
      ? state.aiThinking.display_current
      : fallbackVisiblePlayerIndex();
    state.aiThinking = null;
    activeAiProvider = "random";
    aiTurnInProgress = true;
    try {
      if (state.awaitingDiscard) {
        var discardColors = ALL_TOKENS.filter(function (color) {
          return (player.tokens[color] || 0) > 0;
        });
        if (discardColors.length) discardToken(randomChoice(discardColors));
        return;
      }
      if (state.awaitingNobleChoice) {
        var choices = state.awaitingNobleChoice.slice();
        if (choices.length) chooseNoble(randomChoice(choices));
        return;
      }
      if (state.awaitingStrongholdAction) {
        runRandomStrongholdAction();
        return;
      }
      if (state.awaitingStrongholdConquest) {
        skipStrongholdConquest();
        return;
      }
      if (!canAct()) return;
      var buyActions = legalRandomAiBuyActions(player);
      var takeActions = legalRandomAiTakeActions();
      if (!buyActions.length && !takeActions.length) {
        saveState();
        render();
        return;
      }
      var action = buyActions.length ? randomChoice(buyActions) : randomChoice(takeActions);
      if (action.type === "buy") {
        completePurchase(action.context, action.payment, null, { ai: true });
      } else if (action.type === "take") {
        pendingTake = action.colors.slice();
        confirmTake();
      }
    } finally {
      aiTurnInProgress = false;
      activeAiProvider = null;
      aiDisplayCurrentOverride = null;
    }
  }

  function scheduleRandomAiTurn() {
    if (aiTurnTimer) return;
    if (!state || state.mode === "replay" || state.gameOver || state.turnTransition || pendingPayment || state.awaitingOrientAction) return;
    var player = activePlayer();
    if (!player || !player.ai || !player.ai.enabled) return;
    if (!state.aiThinking) {
      var now = Date.now();
      state.aiThinking = {
        player_id: player.id,
        display_current: fallbackVisiblePlayerIndex(),
        started_at: new Date(now).toISOString(),
        until: now + AI_MIN_THINK_MS
      };
      saveState();
      render();
      return;
    }
    aiTurnTimer = window.setTimeout(runRandomAiTurn, Math.max(0, (state.aiThinking.until || Date.now()) - Date.now()));
  }

  function scheduleAiTurn() {
    if (!state || !isAiPlayer(activePlayer())) return;
    if (activeAiProviderName() === "dinoboard") scheduleDinoBoardAiTurn();
    else scheduleRandomAiTurn();
  }

  function updatePlayerAi(playerIndex, enabled, level) {
    if (!state || !state.players[playerIndex]) return;
    var player = state.players[playerIndex];
    if (!enabled && aiToggleLockedForPlayer(playerIndex)) {
      showMessage(t("msgCannotDisableActiveAi"));
      render();
      return;
    }
    var selectedLevel = normalizeAiLevel(level || player.ai && (player.ai.level || player.ai.mode));
    var selectedOrder = enabled
      ? player.ai && player.ai.selected_order || nextAiSelectionOrder()
      : null;
    player.ai = {
      enabled: !!enabled,
      mode: enabled ? selectedLevel : null,
      level: selectedLevel,
      selected_order: selectedOrder,
      provider: "random",
      available: false
    };
    if (enabled) showMessage(t("msgRandomAiEnabled"), "ok");
    resetDinoBoardAiForCurrentState(true);
    saveState();
    render();
  }

  function wireEvents() {
    var boardProgress = byId("board-progress");
    if (boardProgress) {
      boardProgress.addEventListener("click", function (event) {
        var link = event.target.closest("[data-progress-target]");
        if (!link) return;
        var section = byId(link.dataset.progressTarget);
        if (!section || !section.scrollIntoView) return;
        event.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("scroll", function () {
      if (reservePreviewTapMode()) closeTapPreviews();
      closeBonusPreviews();
    }, { passive: true });
    window.addEventListener("resize", function () {
      syncDockWidth();
      syncTopDockOffset();
      syncMobileTopStick();
      updateBoardProgress();
      scheduleMarketOrientWrapSync();
      closeTapPreviews();
      closeBonusPreviews();
    });
    if (el.bankPanel) {
      el.bankPanel.addEventListener("toggle", function () {
        syncTopDockOffset();
        syncMobileTopStick();
        updateBoardProgress();
      });
    }
    if (el.marketTabs) {
      el.marketTabs.addEventListener("click", function (event) {
        var button = event.target.closest("[data-market-page]");
        if (!button || button.disabled) return;
        switchMarketPage(button.dataset.marketPage);
      });
    }
    if (el.handoffContinue) {
      el.handoffContinue.addEventListener("click", completeTurnTransition);
    }
    if (el.market) {
      el.market.addEventListener("touchstart", handleMarketSwipeStart, { passive: true });
      el.market.addEventListener("touchmove", handleMarketSwipeMove, { passive: true });
      el.market.addEventListener("touchend", handleMarketSwipeEnd, { passive: true });
      el.market.addEventListener("touchcancel", handleMarketSwipeCancel, { passive: true });
      el.market.addEventListener("pointerdown", handleMarketSwipeStart);
      el.market.addEventListener("pointermove", handleMarketSwipeMove);
      el.market.addEventListener("pointerup", handleMarketSwipeEnd);
      el.market.addEventListener("pointercancel", handleMarketSwipeCancel);
      el.market.addEventListener("pointerleave", handleMarketSwipeCancel);
    }
    el.languageSelect.addEventListener("change", function () {
      currentLocale = I18N[el.languageSelect.value] ? el.languageSelect.value : "en";
      saveLanguagePreference();
      applyTranslations();
      render();
    });
    document.querySelectorAll("[data-start-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        setStartMode(button.dataset.startMode);
      });
    });
    if (el.startLoadReplay) {
      el.startLoadReplay.addEventListener("click", loadReplayFromStart);
    }
    if (el.startImportBgaTable) {
      el.startImportBgaTable.addEventListener("click", importBgaTableFromStart);
    }
    if (el.startBgaTableId) {
      el.startBgaTableId.addEventListener("keydown", function (event) {
        if (event.key === "Enter") importBgaTableFromStart();
      });
    }
    if (el.startClearReplay) {
      el.startClearReplay.addEventListener("click", function () {
        clearActiveBgaReplayJob();
        el.startReplayJson.value = "";
        if (el.startReplayFileStatus) el.startReplayFileStatus.textContent = t("startReplayBody");
        if (el.startBgaImportStatus) el.startBgaImportStatus.textContent = t("bgaTableImportStatus");
        showStartMessage("");
      });
    }
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
        showStartMessage(t("msgNoValidSavedTable"));
        render();
        return;
      }
      closeDinoBoardSession();
      ensureStateRuleset(saved);
      state = saved;
      activeMarketPage = BASE_MARKET_ID;
      pendingTake = [];
      pendingPayment = null;
      pendingOrientAction = saved.awaitingOrientAction || null;
      showMessage(t("msgSavedResumed"), "ok");
      resetDinoBoardAiForCurrentState(true);
      render();
    });
    el.clearSave.addEventListener("click", function () {
      clearSavedState();
      showStartMessage(t("msgSavedCleared"), "ok");
      render();
    });
    el.saveGame.addEventListener("click", function () {
      if (!state || state.mode === "replay") {
        showMessage(t("msgNoLiveTableSave"));
      } else {
        saveState();
        showMessage(t("msgGameSaved"), "ok");
      }
      render();
    });
    el.resetGame.addEventListener("click", resetToStart);
    el.confirmTake.addEventListener("click", confirmTake);
    el.clearTake.addEventListener("click", function () {
      pendingTake = [];
      pendingPayment = null;
      showMessage("");
      render();
    });
    el.confirmPayment.addEventListener("click", confirmPayment);
    el.clearPayment.addEventListener("click", clearPaymentSelection);
    el.cancelPayment.addEventListener("click", cancelPayment);
    el.paymentOptions.addEventListener("click", function (event) {
      var tokenChoice = event.target.closest("[data-payment-token-color]");
      var virtualCard = event.target.closest("[data-payment-toggle-virtual-card]");
      var addColor = event.target.closest("[data-payment-add-color]");
      var removeColor = event.target.closest("[data-payment-remove-color]");
      var addGold = event.target.closest("[data-payment-add-gold]");
      var removeGold = event.target.closest("[data-payment-remove-gold]");
      var addVirtual = event.target.closest("[data-payment-add-virtual]");
      var removeVirtual = event.target.closest("[data-payment-remove-virtual]");
      var discardCard = event.target.closest("[data-payment-toggle-discard-card]");
      if (tokenChoice) cyclePaymentToken(tokenChoice.dataset.paymentTokenColor);
      else if (virtualCard) togglePaymentVirtualCard(virtualCard.dataset.paymentToggleVirtualCard);
      else if (addColor) adjustPayment("colored", addColor.dataset.paymentAddColor, 1);
      else if (removeColor) adjustPayment("colored", removeColor.dataset.paymentRemoveColor, -1);
      else if (addGold) adjustPayment("gold", addGold.dataset.paymentAddGold, 1);
      else if (removeGold) adjustPayment("gold", removeGold.dataset.paymentRemoveGold, -1);
      else if (addVirtual) adjustPayment("virtual", addVirtual.dataset.paymentAddVirtual, 1);
      else if (removeVirtual) adjustPayment("virtual", removeVirtual.dataset.paymentRemoveVirtual, -1);
      else if (discardCard) togglePaymentDiscardCard(discardCard.dataset.paymentToggleDiscardCard);
    });
    if (el.orientActionOptions) {
      el.orientActionOptions.addEventListener("click", function (event) {
        var copyCard = event.target.closest("[data-orient-copy-card]");
        var freeCard = event.target.closest("[data-orient-free-card]");
        if (copyCard) resolveOrientCopy(copyCard.dataset.orientCopyCard);
        else if (freeCard) resolveOrientFreeCard(freeCard.dataset.orientFreeCard, freeCard);
      });
    }
    if (el.strongholdActionOptions) {
      el.strongholdActionOptions.addEventListener("click", function (event) {
        var place = event.target.closest("[data-stronghold-place]");
        var move = event.target.closest("[data-stronghold-move]");
        var source = event.target.closest("[data-stronghold-source]");
        var remove = event.target.closest("[data-stronghold-remove]");
        var skip = event.target.closest("[data-stronghold-skip]");
        var conquestSkip = event.target.closest("[data-stronghold-conquest-skip]");
        if (place) resolveStrongholdPlace(place.dataset.strongholdPlace, place);
        else if (move) resolveStrongholdMove(move.dataset.strongholdMove, move);
        else if (source) resolveStrongholdCardClick(source.dataset.strongholdSource, source);
        else if (remove) resolveStrongholdRemove(remove.dataset.strongholdRemove, remove);
        else if (conquestSkip) skipStrongholdConquest();
      });
    }
    el.bankTokens.addEventListener("click", function (event) {
      var button = event.target.closest("[data-bank-color]");
      if (button) selectTake(button.dataset.bankColor);
    });
    el.market.addEventListener("click", function (event) {
      if (state && state.awaitingStrongholdConquest) {
        var conquestTarget = event.target.closest("[data-stronghold-target]");
        if (conquestTarget) {
          event.preventDefault();
          beginStrongholdConquestPayment(conquestTarget.dataset.strongholdTarget, conquestTarget);
          return;
        }
      }
      if (state && state.awaitingStrongholdAction) {
        var strongholdTarget = event.target.closest("[data-stronghold-target]");
        if (strongholdTarget) {
          event.preventDefault();
          resolveStrongholdCardClick(strongholdTarget.dataset.strongholdTarget, strongholdTarget);
          return;
        }
      }
      if (state && state.awaitingOrientAction) {
        var orientFreeTarget = event.target.closest("[data-orient-free-card]");
        if (orientFreeTarget) {
          event.preventDefault();
          resolveOrientFreeCard(orientFreeTarget.dataset.orientFreeCard, orientFreeTarget);
          return;
        }
        var orientBlockedTarget = event.target.closest(".orient-choice-disabled");
        if (orientBlockedTarget) {
          event.preventDefault();
          showMessage(orientBlockedTarget.dataset.orientChoiceReason || t("strongholdBlocked"));
          render();
          return;
        }
        if (event.target.closest(".dev-card")) {
          var task = orientCurrentTask();
          if (task && task.type === "free_card") showMessage(t("msgOrientChooseFree", { tier: task.tier }), "ok");
          event.preventDefault();
          return;
        }
      }
      var reserveMarketButton = event.target.closest("[data-reserve-market]");
      var reserveDeckButton = event.target.closest("[data-reserve-deck]");
      var buyMarketButton = event.target.closest("[data-buy-market]");
      if (reserveMarketButton) {
        reserveMarket(reserveMarketButton.dataset.reserveMarket, reserveMarketButton);
      } else if (reserveDeckButton) {
        reserveDeck(reserveDeckButton.dataset.reserveDeck, reserveDeckButton);
      } else if (buyMarketButton) {
        buyMarket(buyMarketButton.dataset.buyMarket, buyMarketButton);
      }
    });
    el.players.addEventListener("click", function (event) {
      var orientCopyTarget = event.target.closest("[data-orient-copy-card]");
      if (orientCopyTarget && state && state.awaitingOrientAction) {
        event.preventDefault();
        resolveOrientCopy(orientCopyTarget.dataset.orientCopyCard);
        return;
      }
      var bonusPreview = event.target.closest("[data-bonus-preview-toggle]");
      if (bonusPreview) {
        var bonusOpen = bonusPreview.classList.contains("preview-open");
        closeBonusPreviews(bonusPreview);
        closeTapPreviews();
        bonusPreview.classList.toggle("preview-open", !bonusOpen);
        event.stopPropagation();
        return;
      }
      var reservePreview = event.target.closest("[data-reserve-preview-toggle]");
      if (reservePreview && reservePreviewTapMode()) {
        var alreadyOpen = reservePreview.classList.contains("preview-open");
        closeTapPreviews(reservePreview);
        reservePreview.classList.toggle("preview-open", !alreadyOpen);
        if (!alreadyOpen) holdTapPreviewOpen();
        event.stopPropagation();
        return;
      }
      var button = event.target.closest("[data-buy-reserved]");
      if (button) buyReserved(button.dataset.buyReserved, button);
    });
    document.addEventListener("click", function () {
      if (reservePreviewTapMode()) closeTapPreviews();
      closeBonusPreviews();
    });
    [el.logSafeMode, el.logFullMode].forEach(function (button) {
      if (!button) return;
      button.addEventListener("click", function () {
        logMode = button.dataset.logMode === "full" ? "full" : "safe";
        renderLog();
      });
    });
    el.actionLog.addEventListener("click", function (event) {
      var preview = event.target.closest("[data-log-card-preview-toggle]");
      if (preview && reservePreviewTapMode()) {
        var alreadyOpen = preview.classList.contains("preview-open");
        closeTapPreviews(preview);
        preview.classList.toggle("preview-open", !alreadyOpen);
        if (!alreadyOpen) holdTapPreviewOpen();
        event.stopPropagation();
      }
    });
    el.players.addEventListener("change", function (event) {
      var toggle = event.target.closest("[data-player-ai-toggle]");
      var levelSelect = event.target.closest("[data-player-ai-level]");
      if (toggle) {
        var toggleIndex = Number(toggle.dataset.playerAiToggle);
        var pairedLevel = el.players.querySelector('[data-player-ai-level="' + toggleIndex + '"]');
        updatePlayerAi(toggleIndex, toggle.checked, pairedLevel && pairedLevel.value);
      } else if (levelSelect) {
        var levelIndex = Number(levelSelect.dataset.playerAiLevel);
        var pairedToggle = el.players.querySelector('[data-player-ai-toggle="' + levelIndex + '"]');
        updatePlayerAi(levelIndex, pairedToggle && pairedToggle.checked, levelSelect.value);
      }
    });
    el.activeReserved.addEventListener("click", function (event) {
      var button = event.target.closest("[data-buy-reserved]");
      if (button) buyReserved(button.dataset.buyReserved, button);
    });
    el.activeBonusRow.addEventListener("click", function (event) {
      var orientCopyTarget = event.target.closest("[data-orient-copy-card]");
      if (orientCopyTarget && state && state.awaitingOrientAction) {
        event.preventDefault();
        resolveOrientCopy(orientCopyTarget.dataset.orientCopyCard);
        return;
      }
      var bonusPreview = event.target.closest("[data-bonus-preview-toggle]");
      if (!bonusPreview) return;
      var bonusOpen = bonusPreview.classList.contains("preview-open");
      closeBonusPreviews(bonusPreview);
      closeTapPreviews();
      bonusPreview.classList.toggle("preview-open", !bonusOpen);
      event.stopPropagation();
    });
    el.discardTokens.addEventListener("click", function (event) {
      var button = event.target.closest("[data-discard-color]");
      if (button) discardToken(button.dataset.discardColor);
    });
    el.bankDiscardTokens.addEventListener("click", function (event) {
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
    if (el.openBgaReview) {
      el.openBgaReview.addEventListener("click", openBgaReviewByTableId);
    }
    if (el.bgaTableId) {
      el.bgaTableId.addEventListener("keydown", function (event) {
        if (event.key === "Enter") openBgaReviewByTableId();
      });
    }
    el.prevMove.addEventListener("click", function () {
      setReplayAutoplay(false, true);
      stepReplay(-1);
    });
    el.nextMove.addEventListener("click", function () {
      setReplayAutoplay(false, true);
      stepReplay(1);
    });
    if (el.replayAutoplay) {
      el.replayAutoplay.addEventListener("click", function () {
        setReplayAutoplay(!replayAutoplay, false);
        render();
      });
    }
    if (el.replayJump) {
      el.replayJump.addEventListener("pointerdown", function () {
        replayJumpClickValue = el.replayJumpInput ? el.replayJumpInput.value : null;
      });
    }
    if (el.topReplayControls) {
      el.topReplayControls.addEventListener("click", function (event) {
        var jumpButton = event.target.closest("#replay-jump");
        if (!jumpButton) return;
        event.preventDefault();
        jumpReplayToInput(replayJumpClickValue);
      });
    }
    if (el.replayJumpInput) {
      el.replayJumpInput.addEventListener("input", function () {
        el.replayJumpInput.value = el.replayJumpInput.value.replace(/[^\d]/g, "");
      });
      el.replayJumpInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          jumpReplayToInput();
        }
      });
    }
    if (el.continueReplay) {
      el.continueReplay.addEventListener("click", continueReplayFromHere);
    }
    el.exitReplay.addEventListener("click", exitReplay);
  }

  function collectElements() {
    [
      "start-panel",
      "start-mode-new",
      "start-mode-replay",
      "start-replay-panel",
      "start-replay-json",
      "start-replay-file-status",
      "start-bga-table-id",
      "start-import-bga-table",
      "start-bga-import-status",
      "start-bga-download",
      "start-load-replay",
      "start-clear-replay",
      "language-select",
      "start-form",
      "start-game",
      "start-message",
      "player-count",
      "player-name-fields",
      "ruleset-orient",
      "ruleset-strongholds",
      "resume-game",
      "clear-save",
      "game-panel",
      "top-replay-controls",
      "table-top-sentinel",
      "current-player",
      "round-label",
      "game-state-label",
      "move-label",
      "handoff-overlay",
      "handoff-title",
      "handoff-body",
      "handoff-action",
      "handoff-countdown",
      "handoff-continue",
      "message",
      "discard-panel",
      "discard-tokens",
      "bank-discard",
      "bank-discard-summary",
      "bank-discard-tokens",
      "bank-take-actions",
      "noble-choice-panel",
      "noble-choice-list",
      "payment-panel",
      "payment-card",
      "payment-summary",
      "payment-options",
      "confirm-payment",
      "clear-payment",
      "cancel-payment",
      "orient-action-panel",
      "orient-action-title",
      "orient-action-summary",
      "orient-action-options",
      "stronghold-action-panel",
      "stronghold-action-title",
      "stronghold-action-summary",
      "stronghold-action-options",
      "take-summary",
      "bank-tokens",
      "bank-panel",
      "confirm-take",
      "clear-take",
      "nobles",
      "market-tabs",
      "market-tab-base",
      "market-tab-orient",
      "market",
      "players",
      "active-hand-panel",
      "active-hand-meta",
      "active-token-row",
      "active-bonus-row",
      "active-virtual-gold",
      "active-reserved",
      "log-safe-mode",
      "log-full-mode",
      "action-log",
      "save-game",
      "reset-game",
      "bga-json",
      "bga-file-status",
      "bga-table-id",
      "open-bga-review",
      "bga-capture-status",
      "export-state",
      "import-state",
      "export-replay",
      "load-replay",
      "prev-move",
      "next-move",
      "replay-autoplay",
      "replay-jump-input",
      "replay-jump",
      "continue-replay",
      "exit-replay",
      "replay-status"
    ].forEach(function (id) {
      var key = id.replace(/-([a-z])/g, function (_, letter) {
        return letter.toUpperCase();
      });
      el[key] = byId(id);
    });
  }

  function installDebugHooks() {
    window.__gemTableDebug = {
      createGame: createGame,
      getState: function () { return state; },
      startGame: function (count, names, aiSettings, options) {
        state = createGame(count, names || [], aiSettings || [], options || {});
        activeMarketPage = BASE_MARKET_ID;
        pendingTake = [];
        pendingPayment = null;
        render();
        return state;
      },
      setState: function (nextState) {
        if (validateState(nextState)) {
          ensureStateRuleset(nextState);
          state = nextState;
          activeMarketPage = BASE_MARKET_ID;
          pendingPayment = null;
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
        return state ? buildReplayExportPayload(state) : null;
      },
      convertBgaCaptureToReplayPayload: convertBgaCaptureToReplayPayload,
      clearSave: clearSavedState,
      schema: SCHEMA
    };
  }

  function init() {
    collectElements();
    installDebugHooks();
    loadLanguagePreference();
    applyTranslations();
    renderNameFields();
    wireEvents();
    render();
    loadReplayFromQuery();

    installDebugHooks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
