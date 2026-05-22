(function () {
  "use strict";

  var STORAGE_KEY = "zephyrlabs-gem-table-save-v3";
  var LEGACY_STORAGE_KEYS = ["zephyrlabs-gem-table-save-v2", "zephyrlabs-gem-table-save-v1"];
  var SCHEMA = "zephyrlabs-gemtable-bga-v1";
  var COLORS = ["white", "blue", "green", "red", "black"];
  var ALL_TOKENS = COLORS.concat(["gold"]);
  var AI_LEVELS = ["easy", "balanced", "expert"];
  var TURN_SWITCH_DELAY_MS = 3000;
  var AI_MIN_THINK_MS = 2000;
  var REPLAY_STEP_DELAY_MS = 1800;
  var GEM_HEX = {
    white: "#f1eadb",
    blue: "#55a7ff",
    green: "#37e89b",
    red: "#ff6b5d",
    black: "#778494",
    gold: "#ffbf45"
  };
  var TOKEN_LABEL = {
    white: "W",
    blue: "U",
    green: "G",
    red: "R",
    black: "B",
    gold: "Au"
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
      aiBadgeFormat: "Random AI: {level}",
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
      aiUnavailableTitle: "Smart AI is temporarily unavailable",
      aiUnavailableBody: "Smart decisions are still being deployed. AI takeover currently uses a random legal move and will not reserve cards.",
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
      logBlindCard: "Blind tier {tier}",
      logUnknownCard: "Unknown card",
      logGoldTaken: "Gold taken",
      logPayment: "Payment",
      logRandomAi: "Random AI",
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
      continueFromReplay: "Continue from here",
      exitReplay: "Exit replay",
      jsonPlaceholder: "Exported JSON appears here. Paste state or replay JSON here before importing/loading.",
      fileIoHint: "Exports download as .json files. Import buttons read a selected .json file directly.",
      bgaCaptureTitle: "BGA replay capture",
      bgaCaptureBody: "Open the official BGA review page, or use BoardReplayLab to crawl and convert browser-visible replay data as JSON.",
      bgaTableImportTitle: "Import by BGA table ID",
      bgaTableImportBody: "Enter a table ID to try direct import. If the server cannot access BGA, use the BoardReplayLab crawler project and import its JSON file.",
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
      reserveShort: "Res",
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
      aiSmartUnavailable: "Smart AI temporarily unavailable",
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
      msgBgaDirectImportFailed: "Direct BGA table import failed. Use the BoardReplayLab crawler project, then import the generated JSON file.",
      msgBgaServerUnavailable: "Replay server is not available. Use the BoardReplayLab crawler project and import the generated JSON file.",
      msgBgaServerQueued: "Server is crawling BGA table {table}. Keep this page open.",
      msgBgaServerDone: "Server captured the replay JSON. Download is ready.",
      msgBgaServerFailed: "Server crawl failed: {message}",
      msgBgaCaptureUnsupported: "Replay JSON is ready to download, but this BGA capture could not be adapted into the current Gem Table replay schema.",
      msgBgaExpansionUnsupported: "Replay JSON is ready to download, but an active expansion flag was detected, so it cannot be imported into the base-game table.",
      msgInitialReplayPosition: "Initial replay position.",
      msgReplayAtMove: "Replay at move {move}: {type}.",
      msgReturnedLiveTable: "Returned to live table.",
      msgJsonParseFailed: "JSON parse failed: {message}",
      msgChoosePlayerCount: "Choose 2, 3, or 4 players.",
      msgGameStarted: "Game started.",
      msgSwitchingPlayer: "Turn ends. Next player in {seconds}s.",
      msgAiThinking: "{player} is thinking.",
      msgReplayStepAnimating: "Replaying move {move} ({seconds}s).",
      msgRandomAiEnabled: "Smart AI is temporarily unavailable. Random AI will play legal non-reserve moves for this player.",
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
    aiUnavailableTitle: "智能 AI 暂不可用",
    aiUnavailableBody: "可以在设置里标记 AI 对手，但自动决策仍在部署中。目前所有回合仍为手动热座操作。",
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
    aiSmartUnavailable: "智能 AI 暂不可用",
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
    aiUnavailableTitle: "智慧 AI 暫不可用",
    aiUnavailableBody: "\u667a\u6167\u6c7a\u7b56\u4ecd\u5728\u90e8\u7f72\u4e2d\u3002\u76ee\u524d AI \u63a5\u7ba1\u4f7f\u7528\u96a8\u6a5f\u5408\u6cd5\u64cd\u4f5c\uff0c\u4e0d\u6703\u57f7\u884c\u9810\u7d04\u3002",
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
    aiSmartUnavailable: "智慧 AI 暫不可用",
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
    aiUnavailableTitle: "スマートAIは未対応",
    aiUnavailableBody: "設定でAI対戦相手をマークできますが、自動判断はまだデプロイ中です。現在はすべて手動ホットシートです。",
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
    aiSmartUnavailable: "スマートAI未対応",
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
    aiUnavailableTitle: "L'IA intelligente est indisponible",
    aiUnavailableBody: "Les adversaires IA peuvent être marqués, mais les décisions automatiques sont encore en déploiement. Pour l'instant, tout reste manuel.",
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
    aiSmartUnavailable: "IA intelligente indisponible",
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
    aiUnavailableTitle: "Smarte KI ist nicht verfügbar",
    aiUnavailableBody: "KI-Gegner können markiert werden, automatische Entscheidungen werden aber noch bereitgestellt. Aktuell bleibt jeder Zug manuell.",
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
    aiSmartUnavailable: "Smarte KI nicht verfügbar",
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
    aiUnavailableTitle: "La IA inteligente no está disponible",
    aiUnavailableBody: "Puedes marcar oponentes IA, pero las decisiones automáticas siguen en despliegue. Por ahora todos los turnos son manuales.",
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
    aiSmartUnavailable: "IA inteligente no disponible",
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
    aiUnavailableTitle: "\u667a\u80fd AI \u6682\u4e0d\u53ef\u7528",
    aiUnavailableBody: "\u53ef\u4ee5\u5728\u8bbe\u7f6e\u91cc\u6807\u8bb0 AI \u5bf9\u624b\uff0c\u4f46\u81ea\u52a8\u51b3\u7b56\u4ecd\u5728\u90e8\u7f72\u4e2d\u3002\u76ee\u524d\u6240\u6709\u56de\u5408\u4ecd\u4e3a\u624b\u52a8\u70ed\u5ea7\u64cd\u4f5c\u3002",
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
    aiUnavailableTitle: "\u667a\u6167 AI \u66ab\u4e0d\u53ef\u7528",
    aiUnavailableBody: "\u667a\u6167\u6c7a\u7b56\u4ecd\u5728\u90e8\u7f72\u4e2d\u3002\u76ee\u524d AI \u63a5\u7ba1\u4f7f\u7528\u96a8\u6a5f\u5408\u6cd5\u64cd\u4f5c\uff0c\u4e0d\u6703\u57f7\u884c\u9810\u7d04\u3002",
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
    aiUnavailableTitle: "\u30b9\u30de\u30fc\u30c8AI\u306f\u672a\u5bfe\u5fdc",
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
    aiUnavailableTitle: "IA intelligente indisponible",
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
    aiUnavailableTitle: "Smarte KI ist nicht verfuegbar",
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
    aiUnavailableTitle: "IA inteligente no disponible",
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
    aiBadgeFormat: "\u968f\u673a AI\uff1a{level}",
    aiUnavailableTitle: "智能 AI 暂时不可用",
    aiUnavailableBody: "\u667a\u80fd\u51b3\u7b56\u4ecd\u5728\u90e8\u7f72\u4e2d\u3002\u76ee\u524d AI \u63a5\u7ba1\u4f7f\u7528\u968f\u673a\u5408\u6cd5\u64cd\u4f5c\uff0c\u4e0d\u4f1a\u6267\u884c\u9884\u7ea6\u3002",
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
    aiSmartUnavailable: "智能 AI 暂时不可用",
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
    msgRandomAiEnabled: "\u667a\u80fd AI \u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u5df2\u4f7f\u7528\u968f\u673a AI \u4ee3\u66ff\uff1a\u5b83\u4f1a\u6267\u884c\u5408\u6cd5\u7684\u975e\u9884\u7ea6\u64cd\u4f5c\u3002",
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
    aiBadgeFormat: "\u96a8\u6a5f AI\uff1a{level}",
    round: "回合",
    state: "狀態",
    move: "步數",
    aiPlayers: "AI 玩家",
    aiUnavailableTitle: "智慧 AI 暫時不可用",
    aiUnavailableBody: "可以在設定裡標記 AI 對手，但自動決策仍在部署中。目前所有回合仍為手動熱座操作。",
    gameAiThinking: "AI \u601d\u8003\u4e2d",
    gameTurnTransition: "\u56de\u5408\u4ea4\u63a5",
    msgSwitchingPlayer: "\u672c\u56de\u5408\u7d50\u675f\uff0c{seconds} \u79d2\u5f8c\u5207\u63db\u5230\u4e0b\u4e00\u4f4d\u73a9\u5bb6\u3002",
    msgAiThinking: "{player} \u6b63\u5728\u601d\u8003\u3002",
    msgSelectLegalTake: "\u8acb\u9078\u64c7 3 \u7a2e\u4e0d\u540c\u7684\u975e\u91d1\u5e63\u5bf6\u77f3\uff1b\u5982\u679c\u9280\u884c\u53ea\u5269\u5c11\u65bc 3 \u7a2e\u984f\u8272\uff0c\u5247\u9078\u5b8c\u6240\u6709\u53ef\u7528\u984f\u8272\uff1b\u6216\u5f9e\u6578\u91cf\u81f3\u5c11 4 \u7684\u540c\u8272\u5806\u88e1\u9078 2 \u679a\u3002",
    msgRandomAiEnabled: "\u667a\u6167 AI \u66ab\u6642\u4e0d\u53ef\u7528\uff0c\u5df2\u4f7f\u7528\u96a8\u6a5f AI \u4ee3\u66ff\uff1a\u5b83\u6703\u57f7\u884c\u5408\u6cd5\u7684\u975e\u9810\u7d04\u64cd\u4f5c\u3002",
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
    aiSmartUnavailable: "智慧 AI 暫時不可用",
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
    aiBadgeFormat: "Random AI: {level}",
    aiPlayers: "AIプレイヤー",
    aiUnavailableTitle: "スマートAIは一時的に利用できません",
    aiUnavailableBody: "Smart AI is temporarily unavailable. Random AI now plays legal non-reserve moves.",
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
    aiBadgeFormat: "IA aleatoire : {level}",
    aiPlayers: "Joueurs IA",
    aiUnavailableTitle: "IA temporairement indisponible",
    aiUnavailableBody: "L'IA intelligente est encore en deploiement. Le relais utilise une IA aleatoire qui ne reserve pas.",
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
    aiSmartUnavailable: "IA temporairement indisponible",
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
    aiBadgeFormat: "Zufalls-KI: {level}",
    aiPlayers: "KI-Spieler",
    aiUnavailableTitle: "Smarte KI voruebergehend nicht verfuegbar",
    aiUnavailableBody: "Smarte KI ist noch nicht bereit. KI uebernahme nutzt eine Zufalls-KI ohne Reservieren.",
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
    aiSmartUnavailable: "Smarte KI voruebergehend nicht verfuegbar",
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
    aiBadgeFormat: "IA aleatoria: {level}",
    aiPlayers: "Jugadores IA",
    aiUnavailableTitle: "IA temporalmente no disponible",
    aiUnavailableBody: "La IA inteligente sigue en despliegue. El control IA usa movimientos legales aleatorios sin reservar.",
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
    logBlindCard: "{tier} \u7ea7\u6697\u724c",
    logUnknownCard: "\u672a\u77e5\u5361\u724c",
    logGoldTaken: "\u83b7\u5f97\u9ec4\u91d1",
    logPayment: "\u652f\u4ed8",
    logRandomAi: "\u968f\u673a AI",
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
    logBlindCard: "{tier} \u7d1a\u6697\u724c",
    logUnknownCard: "\u672a\u77e5\u5361\u724c",
    logGoldTaken: "\u7372\u5f97\u9ec3\u91d1",
    logPayment: "\u652f\u4ed8",
    logRandomAi: "\u96a8\u6a5f AI",
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
    bgaTableImportBody: "\u8f93\u5165 table ID \u540e\u5c1d\u8bd5\u76f4\u63a5\u5bfc\u5165\u3002\u5982\u679c\u670d\u52a1\u5668\u65e0\u6cd5\u8bbf\u95ee BGA\uff0c\u8bf7\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u9879\u76ee\u540e\u518d\u5bfc\u5165 JSON \u6587\u4ef6\u3002",
    importBgaTable: "\u5bfc\u5165 table ID",
    openBgaCrawlerGithub: "\u811a\u672c\u4e0b\u8f7d",
    downloadCapturedJson: "\u4e0b\u8f7d\u91c7\u96c6 JSON",
    bgaTableImportStatus: "\u6269\u5c55\u724c\u5c40\u548c\u4e0d\u652f\u6301\u7684 BGA \u6570\u636e\u4f1a\u663e\u793a\u5bfc\u5165\u5931\u8d25\uff0c\u4e0d\u4f1a\u8f7d\u5165\u9519\u8bef\u6570\u636e\u3002",
    bgaCaptureTitle: "BGA \u56de\u653e\u91c7\u96c6",
    bgaCaptureBody: "\u6253\u5f00 BGA \u5b98\u65b9\u56de\u653e\u9875\uff0c\u6216\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u5e76\u8f6c\u6362\u56de\u653e JSON\u3002",
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
    msgBgaDirectImportFailed: "\u76f4\u63a5\u5bfc\u5165 BGA table \u5931\u8d25\u3002\u8bf7\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u9879\u76ee\uff0c\u518d\u5bfc\u5165\u751f\u6210\u7684 JSON \u6587\u4ef6\u3002",
    msgBgaServerUnavailable: "\u56de\u653e\u670d\u52a1\u5668\u4e0d\u53ef\u7528\u3002\u8bf7\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u9879\u76ee\u540e\u5bfc\u5165 JSON \u6587\u4ef6\u3002",
    msgBgaServerQueued: "\u670d\u52a1\u5668\u6b63\u5728\u722c\u53d6 BGA \u724c\u684c {table}\uff0c\u8bf7\u4fdd\u6301\u9875\u9762\u6253\u5f00\u3002",
    msgBgaServerDone: "\u670d\u52a1\u5668\u5df2\u751f\u6210\u56de\u653e JSON\uff0c\u53ef\u4ee5\u4e0b\u8f7d\u3002",
    msgBgaServerFailed: "\u670d\u52a1\u5668\u722c\u53d6\u5931\u8d25\uff1a{message}",
    msgBgaCaptureUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f7d\uff1b\u4f46\u8fd9\u4efd BGA \u91c7\u96c6\u6570\u636e\u65e0\u6cd5\u9002\u914d\u6210\u5f53\u524d Gem Table \u56de\u653e\u683c\u5f0f\u3002",
    msgBgaExpansionUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f7d\uff1b\u4f46\u68c0\u6d4b\u5230\u6269\u5c55\u5df2\u542f\u7528\uff0c\u4e0d\u80fd\u5bfc\u5165\u5f53\u524d\u57fa\u7840\u7248\u724c\u684c\u3002",
    msgContinueFromReplay: "\u5df2\u5c06\u5f53\u524d\u56de\u653e\u8282\u70b9\u8f6c\u4e3a\u53ef\u7ee7\u7eed\u7684\u724c\u5c40\u3002\u5982\u9700\u56de\u653e\uff0c\u8bf7\u91cd\u65b0\u4ece\u5934\u8f7d\u5165\u4fdd\u7559\u7684 JSON\u3002"
  });

  Object.assign(I18N["zh-Hans"], {
    handoffAction: "\u52a8\u4f5c",
    bonusCardsTitle: "{color} \u5361\u724c",
    bonusCardsEmpty: "\u8fd8\u6ca1\u6709\u8fd9\u4e2a\u989c\u8272\u7684\u5df2\u8d2d\u5361\u3002"
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
    bgaTableImportBody: "\u8f38\u5165 table ID \u5f8c\u5617\u8a66\u76f4\u63a5\u532f\u5165\u3002\u5982\u679c\u4f3a\u670d\u5668\u7121\u6cd5\u8a2a\u554f BGA\uff0c\u8acb\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u9805\u76ee\u5f8c\u518d\u532f\u5165 JSON \u6a94\u6848\u3002",
    importBgaTable: "\u532f\u5165 table ID",
    openBgaCrawlerGithub: "\u8173\u672c\u4e0b\u8f09",
    downloadCapturedJson: "\u4e0b\u8f09\u63a1\u96c6 JSON",
    bgaTableImportStatus: "\u64f4\u5145\u724c\u5c40\u548c\u4e0d\u652f\u63f4\u7684 BGA \u8cc7\u6599\u6703\u986f\u793a\u532f\u5165\u5931\u6557\uff0c\u4e0d\u6703\u8f09\u5165\u932f\u8aa4\u8cc7\u6599\u3002",
    bgaCaptureTitle: "BGA \u56de\u653e\u63a1\u96c6",
    bgaCaptureBody: "\u6253\u958b BGA \u5b98\u65b9\u56de\u653e\u9801\uff0c\u6216\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u4e26\u8f49\u63db\u56de\u653e JSON\u3002",
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
    msgBgaDirectImportFailed: "\u76f4\u63a5\u532f\u5165 BGA table \u5931\u6557\u3002\u8acb\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u9805\u76ee\uff0c\u518d\u532f\u5165\u7522\u751f\u7684 JSON \u6a94\u6848\u3002",
    msgBgaServerUnavailable: "\u56de\u653e\u4f3a\u670d\u5668\u4e0d\u53ef\u7528\u3002\u8acb\u4f7f\u7528 BoardReplayLab \u722c\u53d6\u9805\u76ee\u5f8c\u532f\u5165 JSON \u6a94\u6848\u3002",
    msgBgaServerQueued: "\u4f3a\u670d\u5668\u6b63\u5728\u722c\u53d6 BGA \u724c\u684c {table}\uff0c\u8acb\u4fdd\u6301\u9801\u9762\u958b\u555f\u3002",
    msgBgaServerDone: "\u4f3a\u670d\u5668\u5df2\u7522\u751f\u56de\u653e JSON\uff0c\u53ef\u4ee5\u4e0b\u8f09\u3002",
    msgBgaServerFailed: "\u4f3a\u670d\u5668\u722c\u53d6\u5931\u6557\uff1a{message}",
    msgBgaCaptureUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f09\uff1b\u4f46\u9019\u4efd BGA \u63a1\u96c6\u8cc7\u6599\u7121\u6cd5\u9069\u914d\u6210\u76ee\u524d Gem Table \u56de\u653e\u683c\u5f0f\u3002",
    msgBgaExpansionUnsupported: "\u56de\u653e JSON \u5df2\u6293\u53d6\u5b8c\u6210\uff0c\u53ef\u4ee5\u4e0b\u8f09\uff1b\u4f46\u6aa2\u6e2c\u5230\u64f4\u5145\u5df2\u555f\u7528\uff0c\u4e0d\u80fd\u532f\u5165\u76ee\u524d\u57fa\u790e\u7248\u724c\u684c\u3002",
    msgContinueFromReplay: "\u5df2\u5c07\u7576\u524d\u56de\u653e\u7bc0\u9ede\u8f49\u70ba\u53ef\u7e7c\u7e8c\u7684\u724c\u5c40\u3002\u5982\u9700\u56de\u653e\uff0c\u8acb\u91cd\u65b0\u5f9e\u982d\u8f09\u5165\u4fdd\u7559\u7684 JSON\u3002"
  });

  Object.assign(I18N["zh-Hant"], {
    handoffAction: "\u52d5\u4f5c",
    bonusCardsTitle: "{color} \u5361\u724c",
    bonusCardsEmpty: "\u9084\u6c92\u6709\u9019\u500b\u984f\u8272\u7684\u5df2\u8cfc\u5361\u3002"
  });

  Object.assign(I18N.ja, {
    buyShort: "\u8cb7",
    reserveShort: "\u4e88",
    bgaCaptureTitle: "BGA \u30ea\u30d7\u30ec\u30a4\u53d6\u5f97",
    bgaCaptureBody: "BGA \u516c\u5f0f\u30ec\u30d3\u30e5\u30fc\u30da\u30fc\u30b8\u3092\u958b\u304f\u304b\u3001BoardReplayLab \u3067\u56de\u653e JSON \u3092\u53d6\u5f97\u3057\u307e\u3059\u3002",
    bgaTableIdLabel: "BGA table ID",
    openBgaReview: "BGA \u56de\u653e\u3092\u958b\u304f",
    downloadBgaCaptureScript: "\u53d6\u5f97\u30b9\u30af\u30ea\u30d7\u30c8",
    bgaCaptureStatus: "\u30d1\u30b9\u30ef\u30fc\u30c9\u306f BGA \u516c\u5f0f\u30da\u30fc\u30b8\u3067\u306e\u307f\u5165\u529b\u3057\u307e\u3059\u3002\u672c\u30b5\u30a4\u30c8\u306f\u4fdd\u5b58\u3057\u307e\u305b\u3093\u3002"
  });

  Object.assign(I18N.fr, {
    buyShort: "Ach.",
    reserveShort: "Res.",
    downloadBgaCaptureScript: "Script capture",
    openBgaReview: "Ouvrir BGA"
  });

  Object.assign(I18N.de, {
    buyShort: "Kauf",
    reserveShort: "Res.",
    downloadBgaCaptureScript: "Capture-Skript",
    openBgaReview: "BGA offnen"
  });

  Object.assign(I18N.es, {
    buyShort: "Com.",
    reserveShort: "Res.",
    downloadBgaCaptureScript: "Script captura",
    openBgaReview: "Abrir BGA"
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
  var logMode = "safe";
  var startMode = "new";
  var messageText = "";
  var startMessageText = "";
  var messageKind = "";
  var pendingFlight = null;
  var aiTurnTimer = null;
  var aiTurnInProgress = false;
  var aiDisplayCurrentOverride = null;
  var lastHumanPlayerIndex = 0;
  var turnAdvanceTimer = null;
  var replayStepTimer = null;
  var overlayRefreshTimer = null;
  var activeBgaReplayJobId = "";
  var activeBgaReplayPollTimer = null;
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

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function cloneOr(value, fallback) {
    return typeof value === "undefined" ? fallback : clone(value);
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

  function randomSeed() {
    return (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0;
  }

  function generateDeck(tier, size, seed) {
    var deck = (DEVELOPMENT_CARDS[tier] || []).map(clone);
    if (deck.length !== size && window.console && window.console.warn) {
      window.console.warn("Unexpected development deck size", tier, deck.length, size);
    }
    return shuffle(deck, (seed || 7000) + tier * 101);
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
    var seed = randomSeed();
    game.table_seed = seed;
    [1, 2, 3].forEach(function (tier) {
      var hiddenMarketSlots = [];
      (game.market[tier] || []).forEach(function (card, index) {
        if (isBgaHiddenCard(card)) hiddenMarketSlots.push(index);
      });
      var candidates = shuffle((DEVELOPMENT_CARDS[tier] || []).filter(function (card) {
        return seen[tier].indexOf(card.id) < 0;
      }).map(clone), seed + tier * 5099 + (Number(game.next_move_id) || 0) * 37);
      hiddenMarketSlots.forEach(function (index) {
        var replacement = candidates.pop();
        if (replacement) {
          game.market[tier][index] = replacement;
          rememberSeenCard(game, replacement);
        } else {
          game.market[tier].splice(index, 1);
        }
      });
      game.decks[tier] = candidates;
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

  function createGame(playerCount, names, aiSettings) {
    var tokenCount = tokenCountForPlayers(playerCount);
    var aiConfig = aiSettings || [];
    var tableSeed = randomSeed();
    var decks = {
      1: generateDeck(1, TIER_SIZES[1], tableSeed),
      2: generateDeck(2, TIER_SIZES[2], tableSeed + 1009),
      3: generateDeck(3, TIER_SIZES[3], tableSeed + 2003)
    };
    var game = {
      schema: SCHEMA,
      created_at: new Date().toISOString(),
      mode: "live",
      playerCount: playerCount,
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
            available: false
          }
        };
      }),
      bank: emptyCounts(true),
      decks: decks,
      market: { 1: [], 2: [], 3: [] },
      seen_cards: emptySeenCards(),
      nobles: shuffle(NOBLE_POOL, tableSeed + 9111).slice(0, playerCount + 1),
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
      rememberSeenCards(game, game.market[tier]);
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

  function fillMarketSlot(game, tier, index) {
    if (!game || !game.market[tier]) return null;
    var replacement = game.decks[tier] && game.decks[tier].length ? game.decks[tier].pop() : null;
    if (replacement) {
      game.market[tier][index] = replacement;
      rememberSeenCard(game, replacement);
      return replacement;
    }
    game.market[tier].splice(index, 1);
    return null;
  }

  function activePlayer() {
    return state && state.players[state.current];
  }

  function isAiPlayer(player) {
    return !!(player && player.ai && player.ai.enabled);
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

  function totalTokens(player) {
    return ALL_TOKENS.reduce(function (sum, color) {
      return sum + (Number(player.tokens[color]) || 0);
    }, 0);
  }

  function canAct() {
    return !!state && state.mode !== "replay" && !state.gameOver && !state.turnTransition && !state.aiThinking && !state.awaitingDiscard && !state.awaitingNobleChoice && !pendingPayment;
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
    return "--gem:" + GEM_HEX[color];
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
      var target = document.querySelector(flight.targetSelector) || el.activeHandPanel || el.players;
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
      return card.color === color;
    });
    var title = t("bonusCardsTitle", { color: TOKEN_LABEL[color] });
    var body = cards.length ? cards.map(function (card) {
      return [
        '<span class="bonus-card-row">',
        '<span class="bonus-card-main"><strong>' + escapeHtml(card.id) + '</strong><span>' + t("tier") + " " + card.tier + " / " + card.points + " " + t("prestige") + "</span></span>",
        '<span class="bonus-card-cost">' + costHtml(card.cost) + "</span>",
        "</span>"
      ].join("");
    }).join("") : '<span class="muted compact">' + t("bonusCardsEmpty") + "</span>";
    return '<span class="bonus-preview" role="tooltip"><span class="bonus-preview-title">' + escapeHtml(title) + "</span>" + body + "</span>";
  }

  function bonusesHtml(counts, player) {
    return COLORS.map(function (color) {
      var previewAttrs = player ? ' data-bonus-preview-toggle="true" tabindex="0" role="button"' : "";
      return '<span class="bonus-pill" data-color="' + color + '" style="' + gemStyle(color) + '" aria-label="' + color + " bonus " + (counts[color] || 0) + '"' + previewAttrs + '><span class="bonus-label">' + TOKEN_LABEL[color] + '</span><span>' + (counts[color] || 0) + "</span>" + bonusCardsPreviewHtml(player, color) + "</span>";
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
      colored: emptyCounts(false),
      gold: emptyCounts(false)
    };
  }

  function paymentGoldTotal(payment) {
    return COLORS.reduce(function (sum, color) {
      return sum + (Number(payment && payment.gold && payment.gold[color]) || 0);
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
    COLORS.forEach(function (color) {
      var colored = Number(payment && payment.colored && payment.colored[color]) || 0;
      var gold = Number(payment && payment.gold && payment.gold[color]) || 0;
      if (colored > 0) parts.push(TOKEN_LABEL[color] + " " + colored);
      if (gold > 0) parts.push(TOKEN_LABEL.gold + " " + gold + " -> " + TOKEN_LABEL[color]);
    });
    return parts.length ? parts.join(", ") : "-";
  }

  function normalizePaymentPlan(player, card, payment) {
    var needs = paymentNeeds(player, card);
    var normalized = emptyPaymentPlan();
    COLORS.forEach(function (color) {
      var colored = Math.max(0, Number(payment && payment.colored && payment.colored[color]) || 0);
      colored = Math.min(colored, player.tokens[color] || 0, needs[color]);
      normalized.colored[color] = colored;
      var gold = Math.max(0, Number(payment && payment.gold && payment.gold[color]) || 0);
      normalized.gold[color] = Math.min(gold, Math.max(needs[color] - colored, 0));
    });
    var excessGold = paymentGoldTotal(normalized) - (player.tokens.gold || 0);
    if (excessGold > 0) {
      COLORS.slice().reverse().forEach(function (color) {
        var remove = Math.min(normalized.gold[color], excessGold);
        normalized.gold[color] -= remove;
        excessGold -= remove;
      });
    }
    return normalized;
  }

  function paymentIsLegal(player, card, payment) {
    if (!player || !card || !payment) return false;
    var needs = paymentNeeds(player, card);
    if (paymentGoldTotal(payment) > (player.tokens.gold || 0)) return false;
    return COLORS.every(function (color) {
      var colored = Number(payment.colored && payment.colored[color]) || 0;
      var gold = Number(payment.gold && payment.gold[color]) || 0;
      return colored <= (player.tokens[color] || 0) && colored + gold === needs[color];
    });
  }

  function paymentMoveArgs(payment) {
    return {
      tokens: paymentSpend(payment),
      gold_as: clone(payment.gold || emptyCounts(false))
    };
  }

  function autoPaymentPlan(player, card) {
    var needs = paymentNeeds(player, card);
    var payment = emptyPaymentPlan();
    COLORS.forEach(function (color) {
      var colored = Math.min(player.tokens[color] || 0, needs[color]);
      payment.colored[color] = colored;
      payment.gold[color] = Math.max(needs[color] - colored, 0);
    });
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
    var affordText = afford && afford.ok ? t("affordable") : t("needTokens");
    var actions = [];
    if (controls.buy) {
      actions.push('<button type="button" data-short-label="' + escapeHtml(t("buyShort")) + '" ' + buyAttr + " " + (controls.buyDisabled ? "disabled" : "") + ">" + t("buy") + "</button>");
    }
    if (controls.reserve) {
      actions.push('<button type="button" data-short-label="' + escapeHtml(t("reserveShort")) + '" ' + reserveAttr + " " + (controls.reserveDisabled ? "disabled" : "") + ">" + t("reserve") + "</button>");
    }
    return [
      '<article class="dev-card" data-card-id="' + escapeHtml(card.id) + '" data-card-color="' + card.color + '" style="' + gemStyle(card.color) + '">',
      "<h3><span>" + t("tier") + " " + card.tier + " " + TOKEN_LABEL[card.color] + '<br><span class="card-id">' + card.id + '</span></span><span class="points">' + card.points + "</span></h3>",
      '<div class="cost-row">' + costHtml(card.cost) + "</div>",
      '<p class="card-affordability compact">' + affordText + "</p>",
      actions.length ? '<div class="card-actions">' + actions.join("") + "</div>" : "",
      "</article>"
    ].join("");
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

  function renderMarket() {
    var active = displayPlayer();
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
        '<span class="label">' + t("tier") + " " + tier + "</span>",
        "<strong>" + state.decks[tier].length + "</strong>",
        '<span class="muted compact">' + t("deckCards") + "</span>",
        '<button type="button" data-reserve-deck="' + tier + '" data-short-label="' + escapeHtml(t("reserveShort")) + '" ' + (!canAct() || active.reserved.length >= 3 || state.decks[tier].length === 0 ? "disabled" : "") + ">" + t("reserveDeck") + "</button>",
        "</div>",
        '<div class="card-grid">' + (cards || '<span class="muted">' + t("noFaceUpCards") + "</span>") + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function reservedSourceText(card) {
    return card && card.reserved_from === "deck" ? t("blindReserve") : t("faceUpReserve");
  }

  function cardPreviewHtml(card) {
    if (!card) return "";
    return [
      '<span class="reserve-preview" role="tooltip" style="' + gemStyle(card.color) + '">',
      '<span class="reserve-preview-title">',
      "<strong>" + t("tier") + " " + card.tier + " " + TOKEN_LABEL[card.color] + "</strong>",
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
    var visibleIndex = displayCurrentIndex();
    el.players.innerHTML = state.players.map(function (player, playerIndex) {
      var reservedCards = renderReservedSummary(player);
      var nobleText = player.nobles.length ? player.nobles.map(function (noble) { return noble.name; }).join(", ") : t("none");
      var aiBadge = player.ai && player.ai.enabled ? '<span class="ai-badge">' + escapeHtml(t("aiBadgeFormat", { level: aiLevelLabel(player.ai.level || player.ai.mode) })) + "</span>" : "";
      return [
        '<article class="player-card ' + (playerIndex === visibleIndex ? "active" : "") + '" data-player-index="' + playerIndex + '">',
        '<div class="player-top"><div><h3>' + escapeHtml(player.name) + "</h3>" + aiBadge + '</div><strong class="score-line">' + scoreFor(player) + " " + t("prestige") + "</strong></div>",
        playerAiControlsHtml(player, playerIndex),
        '<div class="player-resource-panel">',
        '<span class="label">' + t("tokens") + " (" + totalTokens(player) + '/10)</span><div class="token-row">' + tokensHtml(player.tokens, false, null, true) + "</div>",
        '<span class="label">' + t("bonuses") + '</span><div class="bonus-row">' + bonusesHtml(player.bonuses, player) + "</div>",
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
      var tier = Number(parts[0]);
      var marketIndex = Number(parts[1]);
      card = state.market[tier] && state.market[tier][marketIndex];
      context = { type: "buyMarket", player: player, card: card, tier: tier, index: marketIndex };
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

  function paymentRowsHtml(context) {
    var player = context.player;
    var needs = paymentNeeds(player, context.card);
    var payment = pendingPayment.payment;
    var rows = COLORS.filter(function (color) {
      return needs[color] > 0;
    }).map(function (color) {
      var colored = payment.colored[color] || 0;
      var gold = payment.gold[color] || 0;
      var remaining = Math.max(needs[color] - colored - gold, 0);
      var canAddColor = remaining > 0 && colored < (player.tokens[color] || 0);
      var canAddGold = remaining > 0 && paymentGoldTotal(payment) < (player.tokens.gold || 0);
      return [
        '<div class="payment-row" style="' + gemStyle(color) + '">',
        '<div class="payment-need">',
        '<span class="requirement-tile" data-color="' + color + '" style="' + gemStyle(color) + '"><span>' + needs[color] + "</span></span>",
        '<div><strong>' + TOKEN_LABEL[color] + '</strong><span>' + t("paymentRemaining", { count: remaining }) + "</span></div>",
        "</div>",
        '<div class="payment-used"><span>' + TOKEN_LABEL[color] + " " + colored + '</span><span>' + TOKEN_LABEL.gold + " " + gold + "</span></div>",
        '<div class="payment-controls">',
        '<button type="button" data-payment-add-color="' + color + '" style="' + gemStyle(color) + '" ' + (canAddColor ? "" : "disabled") + ">+ " + TOKEN_LABEL[color] + "</button>",
        '<button type="button" data-payment-remove-color="' + color + '" ' + (colored > 0 ? "" : "disabled") + ">- " + TOKEN_LABEL[color] + "</button>",
        '<button type="button" data-payment-add-gold="' + color + '" style="' + gemStyle("gold") + '" ' + (canAddGold ? "" : "disabled") + ">+ " + TOKEN_LABEL.gold + "</button>",
        '<button type="button" data-payment-remove-gold="' + color + '" ' + (gold > 0 ? "" : "disabled") + ">- " + TOKEN_LABEL.gold + "</button>",
        "</div>",
        "</div>"
      ].join("");
    });
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

  function findDevelopmentCardById(cardId) {
    var id = String(cardId || "");
    for (var tier = 1; tier <= 3; tier += 1) {
      var found = (DEVELOPMENT_CARDS[tier] || []).find(function (card) {
        return card.id === id;
      });
      if (found) return found;
    }
    return null;
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
    var byType = {
      takeTokens: "logTakeTokensTitle",
      reserveMarket: "logReserveTitle",
      reserveDeck: "logReserveTitle",
      buyMarket: "logBuyTitle",
      buyReserved: "logBuyTitle",
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
      '<span class="reserve-slot" data-color="' + card.color + '" style="' + gemStyle(card.color) + '">' + TOKEN_LABEL[card.color] + "</span>",
      escapeHtml(card.id),
      cardPreviewHtml(card),
      "</span>"
    ].join("");
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
      return logTokenChip(args.color, 1, false);
    }
    if (move.type === "reserveMarket" || move.type === "reserveDeck") {
      var hiddenReserve = mode === "safe" && move.type === "reserveDeck";
      return [
        '<span class="log-source-chip">' + escapeHtml(t(move.type === "reserveDeck" ? "logBlindReserve" : "logFaceUpReserve")) + "</span>",
        logCardBadge(args.card_id, { hidden: hiddenReserve, tier: args.tier, card: args.card }),
        args.took_gold ? '<span class="log-source-chip gold">' + escapeHtml(t("logGoldTaken")) + " " + logTokenChip("gold", 1, true) + "</span>" : ""
      ].filter(Boolean).join("");
    }
    if (move.type === "buyMarket" || move.type === "buyReserved") {
      var hiddenBuy = mode === "safe" && move.type === "buyReserved" && args.reserved_from === "deck";
      return [
        logCardBadge(args.card_id, { hidden: hiddenBuy, tier: args.tier, card: args.card }),
        args.payment ? '<span class="log-source-chip">' + escapeHtml(t("logPayment")) + "</span>" : "",
        args.payment ? logTokenSet(args.payment.tokens, args.payment.gold_as) : ""
      ].filter(Boolean).join("");
    }
    if (move.type === "chooseNoble") {
      return '<span class="log-source-chip">' + escapeHtml(args.noble_id || t("logNobleTitle")) + "</span>";
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
    return [
      '<li><article class="log-entry">',
      '<div class="log-entry-head">',
      '<span class="log-entry-title">' + escapeHtml(moveTitle(move)) + "</span>",
      '<span class="log-entry-meta">' + escapeHtml(t("logMove", { move: move.move_id })) + "</span>",
      "</div>",
      '<div class="log-entry-actor">' + escapeHtml(playerNameForMove(move)) + (move.notification && move.notification.args && move.notification.args.ai ? ' · ' + escapeHtml(t("logRandomAi")) : "") + "</div>",
      '<div class="log-entry-body">' + renderLogMoveBody(move) + "</div>",
      "</article></li>"
    ].join("");
  }

  function replayMovesThroughCurrentStep() {
    if (!replayData || !Array.isArray(replayData.moves) || replayIndex < 0) return [];
    return replayData.moves.slice(0, replayIndex + 1).filter(Boolean);
  }

  function replayDeckElement(tier) {
    var button = document.querySelector('[data-reserve-deck="' + tier + '"]');
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
    if (move.type === "discardToken") return TOKEN_LABEL[args.color] || t("tokens");
    if (move.type === "reserveDeck") return t("blind");
    if (move.type === "reserveMarket") return t("reserve");
    if (move.type === "buyMarket" || move.type === "buyReserved") return t("buy");
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
      color = args.color || "gold";
      source = replayPlayerSourceElement(move.player_id, '.token[data-color="' + color + '"]') || replayPlayerSourceElement(move.player_id, ".player-resource-panel");
      targetSelector = ".bank-tokens";
    } else if (move.type === "reserveDeck") {
      color = "gold";
      source = replayDeckElement(args.tier) || el.market;
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".reserved-list");
    } else if (move.type === "reserveMarket") {
      color = args.card && args.card.color || "gold";
      source = cardElementForFlight(args.card || { id: args.card_id }) || el.market;
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".reserved-list");
    } else if (move.type === "buyMarket" || move.type === "buyReserved") {
      color = args.card && args.card.color || "gold";
      source = cardElementForFlight(args.card || { id: args.card_id }) || (move.type === "buyReserved" ? el.activeHandPanel : el.market);
      targetSelector = playerPanelTargetForPlayerId(move.player_id, ".purchased-summary");
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
      el.replayStatus.textContent = t("liveTable");
      el.prevMove.disabled = true;
      el.nextMove.disabled = true;
      if (el.continueReplay) el.continueReplay.disabled = true;
      el.exitReplay.disabled = true;
      return;
    }
    var total = replayData && replayData.moves ? replayData.moves.length : 0;
    var animating = !!(state.turnTransition && state.turnTransition.replay);
    el.replayStatus.textContent = t("replayMove", { current: Math.max(0, replayIndex + 1), total: total });
    el.prevMove.disabled = animating || replayIndex < 0;
    el.nextMove.disabled = animating || !replayData || replayIndex >= total - 1;
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

    if (!state) {
      el.startPanel.hidden = false;
      el.gamePanel.hidden = true;
      setStartMode(startMode);
      renderHandoffOverlay();
      renderReplayStatus();
      syncTopDockOffset();
      return;
    }

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
    renderLog();
    renderReplayStatus();
    renderHandoffOverlay();
    syncDockWidth();
    syncTopDockOffset();
    syncMobileTopStick();
    flushPendingFlight();
    updateBoardProgress();
    scheduleTurnTransitionTimer();
    scheduleRandomAiTurn();
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
    if (state.awaitingNobleChoice) return t("gameNoble");
    if (state.endTriggered) return t("gameFinal", { turns: state.finalTurnsLeft });
    return t("gameProgress");
  }

  function reservePreviewTapMode() {
    return !!(window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse), (max-width: 760px)").matches);
  }

  function closeTapPreviews(except) {
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
    return [
      '<div class="player-ai-control ' + (ai.enabled ? "active" : "") + '">',
      '<label class="ai-toggle compact-toggle">',
      '<input type="checkbox" data-player-ai-toggle="' + playerIndex + '" ' + (ai.enabled ? "checked" : "") + ">",
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
    var parts = value.split(":");
    var tier = Number(parts[0]);
    var index = Number(parts[1]);
    var player = activePlayer();
    if (player.reserved.length >= 3) {
      showMessage(t("msgReserveLimit"));
      render();
      return;
    }
    var card = state.market[tier][index];
    if (!card) {
      showMessage(t("msgMarketGone"));
      render();
      return;
    }
    queueFlightFromElement(trigger && trigger.closest(".dev-card"), card.color, t("reserve"), playerPanelTarget(".reserved-list"));
    fillMarketSlot(state, tier, index);
    reserveCard(player, card, "reserveMarket", { card_id: card.id, tier: tier });
  }

  function reserveDeck(tier, trigger) {
    if (!canAct()) return;
    var player = activePlayer();
    if (player.reserved.length >= 3) {
      showMessage(t("msgReserveLimit"));
      render();
      return;
    }
    var card = state.decks[tier].pop();
    if (!card) {
      showMessage(t("msgDeckEmpty"));
      render();
      return;
    }
    queueFlightFromElement(trigger && trigger.closest(".deck-box"), "gold", t("blind"), playerPanelTarget(".reserved-list"));
    reserveCard(player, card, "reserveDeck", { card_id: card.id, tier: tier });
  }

  function reserveCard(player, card, type, args) {
    var reservedCard = clone(card);
    reservedCard.reserved_from = type === "reserveDeck" ? "deck" : "market";
    reservedCard.reserved_public = type !== "reserveDeck";
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

  function scrollToPaymentPanel() {
    if (!el.paymentPanel || el.paymentPanel.hidden) return;
    if (el.activeHandPanel) el.activeHandPanel.open = true;
  }

  function beginPaymentChoice(source, value, card) {
    var player = activePlayer();
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
    var selected = (payment.colored[color] || 0) + (payment.gold[color] || 0);
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
    }
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
    pendingPayment = null;
    showMessage(t("msgPaymentCancelled"), "ok");
    render();
  }

  function completePurchase(context, payment, sourceElement, options) {
    var card = context.card;
    var flightSource = sourceElement || cardElementForFlight(card) || el.market;
    var args = {
      card_id: card.id,
      payment: paymentMoveArgs(payment)
    };
    if (options && options.ai) args.ai = true;
    spendForCard(context.player, paymentSpend(payment));
    context.player.purchased.push(card);
    context.player.bonuses[card.color] += 1;
    logEntry(t("logBought", { player: context.player.name, card: card.id, points: card.points }));
    if (context.type === "buyMarket") {
      args.tier = context.tier;
      fillMarketSlot(state, context.tier, context.index);
    } else {
      args.tier = card.tier;
      args.reserved_from = card.reserved_from || "market";
      context.player.reserved.splice(context.index, 1);
    }
    queueFlightFromElement(flightSource, card.color, t("buy"), playerPanelTarget(".purchased-summary"));
    pendingPayment = null;
    showMessage("");
    afterAction(context.type, args);
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
    var parts = value.split(":");
    var tier = Number(parts[0]);
    var index = Number(parts[1]);
    var card = state.market[tier][index];
    if (!card) {
      showMessage(t("msgMarketGone"));
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
    beginPaymentChoice("reserved", value, card);
  }

  function afterAction(type, args) {
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if (aiTurnInProgress && args && !args.ai) {
      args = Object.assign({}, args, { ai: true });
    }
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

  function discardToken(color) {
    if (!state.awaitingDiscard || state.mode === "replay") return;
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if ((player.tokens[color] || 0) <= 0) return;
    player.tokens[color] -= 1;
    state.bank[color] += 1;
    logEntry(t("logReturned", { player: player.name, token: TOKEN_LABEL[color] }));
    if (totalTokens(player) <= 10) {
      state.awaitingDiscard = false;
      showMessage("");
      resolveNoblesOrTurn("discardToken", aiTurnInProgress ? { color: color, ai: true } : { color: color }, actor);
      return;
    }
    showMessage(t("msgStillMustDiscard", { player: player.name, count: totalTokens(player) }));
    recordMove("discardToken", aiTurnInProgress ? { color: color, ai: true } : { color: color }, actor);
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

  function clearReplayStepTimer() {
    if (replayStepTimer) {
      window.clearTimeout(replayStepTimer);
      replayStepTimer = null;
    }
  }

  function transitionSecondsRemaining() {
    if (!state || !state.turnTransition) return 0;
    return Math.max(1, Math.ceil(((state.turnTransition.until || Date.now()) - Date.now()) / 1000));
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
  }

  function scheduleOverlayRefresh() {
    clearOverlayRefreshTimer();
    if (!state || (!state.turnTransition && !state.aiThinking)) return;
    overlayRefreshTimer = window.setTimeout(function () {
      overlayRefreshTimer = null;
      render();
    }, 240);
  }

  function renderHandoffOverlay() {
    if (!el.handoffOverlay) return;
    var mode = state && state.aiThinking ? "ai" : state && state.turnTransition ? (state.turnTransition.replay ? "replay" : "turn") : "";
    if (!mode) {
      el.handoffOverlay.hidden = true;
      el.handoffOverlay.classList.remove("ai-thinking");
      if (el.handoffAction) el.handoffAction.innerHTML = "";
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
    el.handoffCountdown.textContent = String(seconds);
    el.handoffOverlay.hidden = false;
    el.handoffOverlay.classList.toggle("ai-thinking", mode === "ai");
    scheduleOverlayRefresh();
  }

  function scheduleTurnTransitionTimer() {
    if (!state || state.mode === "replay" || !state.turnTransition) {
      clearTurnAdvanceTimer();
      return;
    }
    if (turnAdvanceTimer) return;
    var remaining = Math.max(0, (state.turnTransition.until || Date.now()) - Date.now());
    turnAdvanceTimer = window.setTimeout(completeTurnTransition, remaining);
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
      until: now + TURN_SWITCH_DELAY_MS
    };
    showMessage(t("msgSwitchingPlayer", { seconds: Math.ceil(TURN_SWITCH_DELAY_MS / 1000) }), "ok");
    saveState();
    render();
  }

  function completeTurnTransition() {
    clearTurnAdvanceTimer();
    if (!state || !state.turnTransition || state.mode === "replay") return;
    var transition = clone(state.turnTransition);
    state.turnTransition = null;
    proceedToNextTurn();
    recordMove(transition.type, transition.args, transition.actor);
    saveState();
    render();
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
    var player = activePlayer();
    var actor = { id: player.id, name: player.name };
    if (state.awaitingNobleChoice.indexOf(nobleId) < 0) {
      showMessage(t("msgNobleNotEligible"));
      render();
      return;
    }
    awardNoble(player, nobleId);
    state.awaitingNobleChoice = null;
    showMessage("");
    scheduleTurnSwitch("chooseNoble", aiTurnInProgress ? { noble_id: nobleId, ai: true } : { noble_id: nobleId }, actor);
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
    if (game.turnTransition) return "Turn handoff";
    if (game.awaitingDiscard) return "Active player must discard to token cap";
    if (game.awaitingNobleChoice) return "Active player must choose one noble";
    if (game.endTriggered) return "Final round";
    return "Player turn";
  }

  function cloneWithoutMoveSnapshots(game) {
    return compactSourceState(game);
  }

  function compactSourceState(game) {
    if (!game || !Array.isArray(game.players)) return null;
    return {
      schema: SCHEMA,
      table_seed: game.table_seed,
      next_move_id: game.next_move_id,
      players: clone(game.players),
      bank: clone(game.bank),
      decks: clone(game.decks),
      market: clone(game.market),
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
      gamestate: cloneOr(gamedatas.gamestate, {}),
      players: cloneOr(gamedatas.players, {}),
      playerorder: Array.isArray(gamedatas.playerorder) ? gamedatas.playerorder.slice() : [],
      bank: cloneOr(gamedatas.bank, {}),
      market: cloneOr(gamedatas.market, {}),
      nobles: cloneOr(gamedatas.nobles, []),
      decks_remaining: cloneOr(gamedatas.decks_remaining, {}),
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
      state_after: compactGamedatasForExport(move.state_after) || (move.state_after ? clone(move.state_after) : null)
    };
  }

  function compactMovesForExport(moves) {
    return Array.isArray(moves) ? moves.map(compactMoveForExport) : [];
  }

  function compactReplayPayload(payload) {
    if (!payload || payload.schema !== SCHEMA) return null;
    return {
      schema: SCHEMA,
      next_move_id: payload.next_move_id,
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
      gamedatas: compactGamedatasForExport(game.initial_gamedatas) || compactGamedatasForExport(toGamedatas(game, { includeSourceState: true })),
      moves: compactMovesForExport(game.moves)
    };
  }

  function stateFromGamedatas(gamedatas) {
    if (!gamedatas || gamedatas.schema !== SCHEMA) return null;
    if (gamedatas.source_state && validateState(gamedatas.source_state)) {
      var restored = clone(gamedatas.source_state);
      restored.seen_cards = collectSeenCardsByTier(restored);
      restored.mode = "live";
      return restored;
    }
    return null;
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
    state = imported;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    pendingTake = [];
    pendingPayment = null;
    showMessage(t("msgStateImported"), "ok");
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
    var compatibility = payload && payload.compatibility || {};
    var detection = compatibility.expansion_detection || {};
    if (Array.isArray(detection.active)) return detection.active.length > 0;
    return bgaActiveExpansionFlags(payload).length > 0;
  }

  function bgaCompatibilityHasActiveExpansion(compatibility) {
    var detection = compatibility && compatibility.expansion_detection || {};
    if (Array.isArray(detection.active)) return detection.active.length > 0;
    return false;
  }

  function bgaCaptureExpansionDetails(payload) {
    var compatibility = payload && payload.compatibility || {};
    var detection = compatibility.expansion_detection || {};
    var active = Array.isArray(detection.active) ? detection.active : bgaActiveExpansionFlags(payload);
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

  function applyBgaInitialGamedatas(game, gamedatas) {
    if (!gamedatas || !gamedatas.market || !gamedatas.carddb) return false;
    var market = gamedatas.market || {};
    if (market.pool) game.bank = bgaPoolToBank(market.pool);
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
    });
    game.bga_deck_unknown = true;
    game.nobles = bgaObjectValues(market.nobles).map(function (entry) {
      return bgaNobleFromDb(bgaRawCardTypeId(entry, entry && entry.type), gamedatas, {});
    }).filter(function (noble) {
      return noble && noble.bga_id && noble.bga_id !== "unknown";
    });
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

  function decrementBgaDeck(game, tier) {
    if (game.decks[tier] && game.decks[tier].length) game.decks[tier].pop();
  }

  function removeBgaMarketCard(game, card) {
    var tier = Math.max(1, Math.min(3, Number(card && card.tier) || 1));
    var cards = game.market[tier] || [];
    var index = cards.findIndex(function (entry) {
      return entry && card && ((entry.bga_id && entry.bga_id === card.bga_id) || entry.id === card.id);
    });
    if (index >= 0) {
      cards[index] = null;
      return { tier: tier, index: index };
    }
    return null;
  }

  function revealBgaMarketCard(game, items, tier, gamedatas, slot) {
    var reveal = (items || []).find(function (entry) {
      return entry && entry.type === "revealCard" && entry.args && entry.args.card;
    });
    if (!reveal) {
      if (slot && game.market[slot.tier] && !game.market[slot.tier][slot.index]) game.market[slot.tier].splice(slot.index, 1);
      return null;
    }
    var revealCard = bgaCardFromNotification(reveal, items || [], { tier: tier }, gamedatas);
    if (!revealCard || !revealCard.bga_id || revealCard.bga_id === "unknown") {
      if (slot && game.market[slot.tier] && !game.market[slot.tier][slot.index]) game.market[slot.tier].splice(slot.index, 1);
      return null;
    }
    var targetTier = Math.max(1, Math.min(3, Number(revealCard.tier || tier) || 1));
    var exists = (game.market[targetTier] || []).some(function (entry) {
      return entry && entry.bga_id === revealCard.bga_id;
    });
    if (!exists) {
      if (slot && slot.tier === targetTier && Number.isInteger(slot.index) && game.market[targetTier]) {
        game.market[targetTier][slot.index] = revealCard;
      } else {
        var emptyIndex = (game.market[targetTier] || []).findIndex(function (entry) { return !entry; });
        if (emptyIndex >= 0) game.market[targetTier][emptyIndex] = revealCard;
        else game.market[targetTier].push(revealCard);
      }
      rememberSeenCard(game, revealCard);
    }
    decrementBgaDeck(game, targetTier);
    return revealCard;
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
    var buy = items.find(function (entry) { return entry.type === "buyCard"; });
    var claim = items.find(function (entry) { return entry.type === "claimNoble"; });
    var end = items.find(function (entry) { return entry.type === "simpleNode" && /end of game/i.test(entry.log || ""); });
    var coins = items.filter(function (entry) { return entry.type === "coins"; });
    var primary = buy || publicReserve || privateReserve || claim || coins[0] || end;
    if (!primary) return null;
    var primaryArgs = primary.args || {};
    var externalId = String(primaryArgs.player_id || "");
    if (!externalId && coins[0] && coins[0].args) externalId = String(coins[0].args.player_id || "");
    var player = playerLookup[externalId] || game.players[0];
    if (!player) return null;
    game.current = Math.max(0, game.players.indexOf(player));
    applyBgaCoinGaps(game, player, coins);

    if (buy) {
      var buyCard = bgaCardFromNotification(buy, items, { player_id: externalId }, gamedatas);
      rememberSeenCard(game, buyCard);
      var fromHand = /hand/i.test(String(buy.args && buy.args.card && buy.args.card.location || ""));
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
        var buySlot = removeBgaMarketCard(game, buyCard);
        revealBgaMarketCard(game, items, buyCard.tier, gamedatas, buySlot);
      }
      if (COLORS.indexOf(buyCard.color) >= 0) player.bonuses[buyCard.color] += 1;
      player.purchased.push(buyCard);
      return {
        type: fromHand ? "buyReserved" : "buyMarket",
        player: player,
        args: {
          card_id: buyCard.id,
          card: buyCard,
          tier: buyCard.tier,
          reserved_from: buyCard.reserved_from || "market",
          payment: { tokens: bgaCoinsFromGap(coins, -1), gold_as: emptyCounts(false) }
        }
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
        revealBgaMarketCard(game, items, reserveCard.tier, gamedatas, reserveSlot);
      }
      return {
        type: fromDeck ? "reserveDeck" : "reserveMarket",
        player: player,
        args: {
          card_id: reserveCard.id,
          card: reserveCard,
          tier: reserveCard.tier,
          took_gold: (bgaCoinsFromGap(coins, 1).gold || 0) > 0
        }
      };
    }

    if (claim) {
      var nobleRaw = bgaRawCardTypeId(claim.args && claim.args.card, group.move_id);
      var noble = bgaNobleFromDb(nobleRaw, gamedatas, { name: claim.args && claim.args.noble_desc || "BGA noble" });
      var nobleIndex = game.nobles.findIndex(function (entry) {
        return entry && ((entry.bga_id && entry.bga_id === noble.bga_id) || entry.id === noble.id);
      });
      if (nobleIndex >= 0) noble = game.nobles.splice(nobleIndex, 1)[0];
      player.nobles.push(noble);
      return { type: "chooseNoble", player: player, args: { noble_id: noble.name } };
    }

    if (coins.length) {
      var gained = bgaCoinsFromGap(coins, 1);
      return {
        type: "takeTokens",
        player: player,
        args: { colors: bgaTokenListFromCounts(gained) }
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
    var game = createGame(bgaPlayers.length, bgaPlayers.map(function (player, index) {
      return player.name || "BGA Player " + (index + 1);
    }), bgaPlayers.map(function () {
      return { enabled: false, mode: null, level: "balanced" };
    }));
    game.table_seed = 0;
    game.log = ["Imported base-game BGA replay capture " + (payload.table_id || "") + "."];
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
      gamedatas: game.initial_gamedatas,
      moves: compactMovesForExport(game.moves),
      bga_table_id: payload.table_id || "",
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
    clearReplayStepTimer();
    state = initial;
    state.mode = "replay";
    pendingTake = [];
    pendingPayment = null;
    showStartMessage("");
    showMessage(t("msgReplayLoaded"), "ok");
    render();
    scrollToGameTable();
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
    var moveText = replayIndex === -1 ? t("msgInitialReplayPosition") : t("msgReplayAtMove", { move: replayData.moves[replayIndex].move_id, type: replayData.moves[replayIndex].type });
    showMessage(moveText, "ok");
    render();
  }

  function exitReplay() {
    if (!state || state.mode !== "replay") return;
    state = liveStateBeforeReplay ? clone(liveStateBeforeReplay) : null;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearReplayStepTimer();
    pendingTake = [];
    pendingPayment = null;
    showMessage(state ? t("msgReturnedLiveTable") : "");
    render();
  }

  function continueReplayFromHere() {
    if (!state || state.mode !== "replay" || !replayData) return;
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
    state = continued;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearReplayStepTimer();
    pendingTake = [];
    pendingPayment = null;
    if (el.bgaFileStatus) el.bgaFileStatus.textContent = t("fileIoHint");
    showMessage(t("msgContinueFromReplay"), "ok");
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
      return { enabled: input.checked, mode: level, level: level };
    });
    state = createGame(count, names, aiSettings);
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    pendingTake = [];
    pendingPayment = null;
    showStartMessage("");
    showMessage(t("msgGameStarted"), "ok");
    if (el.bankPanel) el.bankPanel.open = true;
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
    state = null;
    liveStateBeforeReplay = null;
    replayData = null;
    replayIndex = -1;
    clearTurnAdvanceTimer();
    pendingTake = [];
    pendingPayment = null;
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
        var payment = autoPaymentPlan(player, card);
        if (paymentIsLegal(player, card, payment)) {
          actions.push({
            type: "buy",
            context: { type: "buyMarket", player: player, card: card, tier: tier, index: index },
            payment: payment
          });
        }
      });
    });
    player.reserved.forEach(function (card, index) {
      var payment = autoPaymentPlan(player, card);
      if (paymentIsLegal(player, card, payment)) {
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

  function runRandomAiTurn() {
    aiTurnTimer = null;
    if (!state || state.mode === "replay" || state.gameOver) return;
    var player = activePlayer();
    if (!player || !player.ai || !player.ai.enabled) return;
    aiDisplayCurrentOverride = state.aiThinking && typeof state.aiThinking.display_current === "number"
      ? state.aiThinking.display_current
      : fallbackVisiblePlayerIndex();
    state.aiThinking = null;
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
      aiDisplayCurrentOverride = null;
    }
  }

  function scheduleRandomAiTurn() {
    if (aiTurnTimer) return;
    if (!state || state.mode === "replay" || state.gameOver || state.turnTransition || pendingPayment) return;
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

  function updatePlayerAi(playerIndex, enabled, level) {
    if (!state || !state.players[playerIndex]) return;
    var player = state.players[playerIndex];
    var selectedLevel = normalizeAiLevel(level || player.ai && (player.ai.level || player.ai.mode));
    player.ai = {
      enabled: !!enabled,
      mode: enabled ? selectedLevel : null,
      level: selectedLevel,
      available: false
    };
    if (enabled) showMessage(t("msgRandomAiEnabled"), "ok");
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
      state = saved;
      pendingTake = [];
      pendingPayment = null;
      showMessage(t("msgSavedResumed"), "ok");
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
    if (el.restartGame) {
      el.restartGame.addEventListener("click", resetToStart);
    }
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
      var addColor = event.target.closest("[data-payment-add-color]");
      var removeColor = event.target.closest("[data-payment-remove-color]");
      var addGold = event.target.closest("[data-payment-add-gold]");
      var removeGold = event.target.closest("[data-payment-remove-gold]");
      if (addColor) adjustPayment("colored", addColor.dataset.paymentAddColor, 1);
      else if (removeColor) adjustPayment("colored", removeColor.dataset.paymentRemoveColor, -1);
      else if (addGold) adjustPayment("gold", addGold.dataset.paymentAddGold, 1);
      else if (removeGold) adjustPayment("gold", removeGold.dataset.paymentRemoveGold, -1);
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
        reserveMarket(reserveMarketButton.dataset.reserveMarket, reserveMarketButton);
      } else if (reserveDeckButton) {
        reserveDeck(Number(reserveDeckButton.dataset.reserveDeck), reserveDeckButton);
      } else if (buyMarketButton) {
        buyMarket(buyMarketButton.dataset.buyMarket, buyMarketButton);
      }
    });
    el.players.addEventListener("click", function (event) {
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
    el.prevMove.addEventListener("click", function () { stepReplay(-1); });
    el.nextMove.addEventListener("click", function () { stepReplay(1); });
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
      "resume-game",
      "clear-save",
      "game-panel",
      "table-top-sentinel",
      "current-player",
      "round-label",
      "game-state-label",
      "move-label",
      "restart-game",
      "handoff-overlay",
      "handoff-title",
      "handoff-body",
      "handoff-action",
      "handoff-countdown",
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
      "take-summary",
      "bank-tokens",
      "bank-panel",
      "confirm-take",
      "clear-take",
      "nobles",
      "market",
      "players",
      "active-hand-panel",
      "active-hand-meta",
      "active-token-row",
      "active-bonus-row",
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
      startGame: function (count, names, aiSettings) {
        state = createGame(count, names || [], aiSettings || []);
        pendingTake = [];
        pendingPayment = null;
        render();
        return state;
      },
      setState: function (nextState) {
        if (validateState(nextState)) {
          state = nextState;
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

    installDebugHooks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
