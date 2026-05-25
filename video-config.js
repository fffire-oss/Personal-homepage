(function () {
  "use strict";

  const DEFAULT_CONFIG = {
    videoHub: {
      eyebrow: "Video index",
      title: "Video Hub",
      summary: "Match commentary, replay notes, and project updates for Gem Table and AI training.",
      profileLabel: "Creator profile",
      profileUrl: "",
      featuredTitle: "Featured video",
      featuredDescription: "The production link is supplied by local server configuration.",
      featuredLinkLabel: "Open video",
      featuredUrl: "",
      embedUrl: "",
      embedTitle: "Featured video",
    },
  };

  const CONFIG_PATHS = ["site-config.local.json", "site-config.json"];

  function mergeConfig(config) {
    const hub = config && typeof config.videoHub === "object" ? config.videoHub : {};
    return {
      videoHub: {
        ...DEFAULT_CONFIG.videoHub,
        ...hub,
      },
    };
  }

  function getSafeUrl(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }

    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && typeof value === "string") {
      element.textContent = value;
    }
  }

  function configureLink(id, url, label) {
    const link = document.getElementById(id);
    const safeUrl = getSafeUrl(url);

    if (!link || !safeUrl) {
      return;
    }

    link.href = safeUrl;
    link.textContent = label;
    link.hidden = false;
  }

  function configureVisualLink(id, url, label) {
    const link = document.getElementById(id);

    if (!link) {
      return;
    }

    const safeUrl = getSafeUrl(url);
    link.setAttribute("aria-label", label || DEFAULT_CONFIG.videoHub.profileLabel);
    link.hidden = false;

    if (safeUrl) {
      link.href = safeUrl;
      return;
    }

    link.removeAttribute("href");
  }

  function configureEmbed(url, title) {
    const frame = document.getElementById("featured-video-frame");
    const safeUrl = getSafeUrl(url);

    if (!frame || !safeUrl) {
      return;
    }

    frame.src = safeUrl;
    frame.title = title;
    frame.hidden = false;
    frame.parentElement.classList.add("has-embed");
  }

  async function readJson(path) {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load ${path}`);
    }

    return response.json();
  }

  async function loadConfig() {
    for (const path of CONFIG_PATHS) {
      try {
        return mergeConfig(await readJson(path));
      } catch (_error) {
        // Keep falling back so production can provide only the local override file.
      }
    }

    return DEFAULT_CONFIG;
  }

  function applyConfig(config) {
    const hub = config.videoHub;

    setText("video-eyebrow", hub.eyebrow);
    setText("video-hub-title", hub.title);
    setText("video-summary", hub.summary);
    setText("featured-video-title", hub.featuredTitle);
    setText("featured-video-description", hub.featuredDescription);

    configureVisualLink("video-profile-link", hub.profileUrl, hub.profileLabel);
    configureLink("featured-video-link", hub.featuredUrl, hub.featuredLinkLabel);
    configureEmbed(hub.embedUrl, hub.embedTitle);
  }

  loadConfig().then(applyConfig);
})();
