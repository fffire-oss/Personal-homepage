// ==UserScript==
// @name         ZephyrLabs BGA Replay Capture
// @namespace    https://zephyrlabs.cloud/
// @version      0.1.0
// @description  Capture browser-visible Board Game Arena gamereview data and download it as JSON.
// @match        https://boardgamearena.com/gamereview*
// @match        https://*.boardgamearena.com/gamereview*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  var SCHEMA = "zephyrlabs-bga-browser-capture-v1";
  var MAX_CAPTURE_COUNT = 1800;
  var captures = [];
  var responseSeq = 1;
  var panel = null;
  var countNode = null;

  function tableIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("table") || params.get("tableid") || "";
  }

  function safeJsonClone(value, maxDepth) {
    var seen = new WeakSet();
    function walk(input, depth) {
      if (depth > maxDepth) return "[MaxDepth]";
      if (input === null || typeof input !== "object") return input;
      if (seen.has(input)) return "[Circular]";
      seen.add(input);
      if (Array.isArray(input)) return input.slice(0, 200).map(function (item) { return walk(item, depth + 1); });
      var out = {};
      Object.keys(input).slice(0, 300).forEach(function (key) {
        var value;
        try {
          value = input[key];
        } catch (error) {
          value = "[Unreadable]";
        }
        if (typeof value !== "function") out[key] = walk(value, depth + 1);
      });
      return out;
    }
    return walk(value, 0);
  }

  function headersToObject(headers) {
    var out = {};
    if (!headers || !headers.forEach) return out;
    headers.forEach(function (value, key) {
      out[key] = value;
    });
    return out;
  }

  function looksUseful(url, contentType, text) {
    if (!url) return false;
    if (url.indexOf("boardgamearena") === -1 && url.charAt(0) !== "/") return false;
    if ((contentType || "").indexOf("json") !== -1) return true;
    if (!text) return false;
    var trimmed = text.trim();
    if (trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[") return true;
    return /gamedatas|move_id|notification|replay|gamereview|table_id|tableId/.test(trimmed);
  }

  function parseMaybeJson(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  function pushCapture(item) {
    captures.push(item);
    if (captures.length > MAX_CAPTURE_COUNT) captures.shift();
    updatePanel();
  }

  function captureResponse(kind, url, status, headers, text) {
    var contentType = headers && (headers["content-type"] || headers["Content-Type"] || "");
    if (!looksUseful(url, contentType, text)) return;
    pushCapture({
      seq: responseSeq += 1,
      kind: kind,
      url: url,
      status: status,
      captured_at: new Date().toISOString(),
      content_type: contentType,
      parsed_json: parseMaybeJson(text),
      text: text
    });
  }

  function patchFetch() {
    if (!window.fetch) return;
    var originalFetch = window.fetch;
    window.fetch = function () {
      var requestUrl = "";
      try {
        requestUrl = typeof arguments[0] === "string" ? arguments[0] : arguments[0] && arguments[0].url;
      } catch (error) {
        requestUrl = "";
      }
      return originalFetch.apply(this, arguments).then(function (response) {
        try {
          var clone = response.clone();
          clone.text().then(function (text) {
            captureResponse("fetch", requestUrl || response.url, response.status, headersToObject(response.headers), text);
          }).catch(function () {});
        } catch (error) {
          // Some opaque responses cannot be cloned. Ignore them.
        }
        return response;
      });
    };
  }

  function patchXhr() {
    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__zl_url = url;
      return originalOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
      this.addEventListener("load", function () {
        try {
          var headers = {};
          String(this.getAllResponseHeaders() || "").trim().split(/[\r\n]+/).forEach(function (line) {
            var parts = line.split(": ");
            var key = parts.shift();
            if (key) headers[key.toLowerCase()] = parts.join(": ");
          });
          var text = typeof this.responseText === "string" ? this.responseText : "";
          captureResponse("xhr", this.__zl_url || "", this.status, headers, text);
        } catch (error) {
          // Ignore inaccessible XHR bodies.
        }
      });
      return originalSend.apply(this, arguments);
    };
  }

  function collectLogText() {
    var selectors = [
      "#logs .log",
      "#logs li",
      ".gamelogreview .log",
      ".gamelogreview li",
      ".log_history_status",
      ".chatwindowlogs_zone .log"
    ];
    var rows = [];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        var text = String(node.textContent || "").replace(/\s+/g, " ").trim();
        if (text && rows.indexOf(text) === -1) rows.push(text);
      });
    });
    return rows;
  }

  function collectSnapshot() {
    var gameui = window.gameui || window.gameui_playback || null;
    return {
      title: document.title,
      url: window.location.href,
      table_id: tableIdFromUrl(),
      captured_at: new Date().toISOString(),
      gameui: gameui ? safeJsonClone({
        game_name: gameui.game_name,
        game_id: gameui.game_id,
        table_id: gameui.table_id,
        gamedatas: gameui.gamedatas,
        gamestate: gameui.gamedatas && gameui.gamedatas.gamestate,
        player_id: gameui.player_id,
        player_name: gameui.player_name
      }, 8) : null,
      logs: collectLogText()
    };
  }

  function downloadCapture() {
    var tableId = tableIdFromUrl() || "unknown";
    var payload = {
      schema: SCHEMA,
      source: "boardgamearena-gamereview-browser-capture",
      table_id: tableId,
      page_url: window.location.href,
      exported_at: new Date().toISOString(),
      note: "Captured from a BGA gamereview page in the user's own browser session. It contains only data visible to this browser.",
      snapshot: collectSnapshot(),
      responses: captures
    };
    var stamp = new Date().toISOString().replace(/[:.]/g, "-");
    var blob = new Blob([JSON.stringify(payload)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "bga-table-" + tableId + "-capture-" + stamp + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1200);
  }

  function updatePanel() {
    if (countNode) countNode.textContent = String(captures.length);
  }

  function installPanel() {
    if (panel || !document.body) return;
    panel = document.createElement("div");
    panel.style.cssText = [
      "position:fixed",
      "right:14px",
      "bottom:14px",
      "z-index:2147483647",
      "display:grid",
      "gap:8px",
      "max-width:320px",
      "padding:12px",
      "border:1px solid rgba(49,215,255,.45)",
      "border-radius:10px",
      "background:rgba(8,12,18,.94)",
      "color:#eef8f8",
      "font:13px/1.35 system-ui,-apple-system,Segoe UI,sans-serif",
      "box-shadow:0 18px 48px rgba(0,0,0,.35)"
    ].join(";");
    panel.innerHTML = [
      "<strong>ZephyrLabs BGA capture</strong>",
      "<span style=\"color:#9fb0c4\">Open or play the replay until the data you need is loaded, then export.</span>",
      "<span>Captured responses: <b data-zl-count>0</b></span>",
      "<button data-zl-export style=\"min-height:32px;border:1px solid rgba(49,215,255,.5);border-radius:7px;background:#31d7ff;color:#061015;font-weight:800;cursor:pointer\">Download JSON</button>",
      "<button data-zl-clear style=\"min-height:30px;border:1px solid rgba(255,255,255,.2);border-radius:7px;background:rgba(255,255,255,.08);color:#eef8f8;cursor:pointer\">Clear capture</button>"
    ].join("");
    countNode = panel.querySelector("[data-zl-count]");
    panel.querySelector("[data-zl-export]").addEventListener("click", downloadCapture);
    panel.querySelector("[data-zl-clear]").addEventListener("click", function () {
      captures = [];
      updatePanel();
    });
    document.body.appendChild(panel);
    updatePanel();
  }

  patchFetch();
  patchXhr();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installPanel);
  } else {
    installPanel();
  }
})();
