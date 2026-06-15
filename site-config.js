(function () {
  "use strict";

  const DEFAULT_CONFIG = {
    homepage: {
      links: {},
      footer: {
        registrationText: "",
        registrationUrl: "https://beian.miit.gov.cn/"
      }
    }
  };

  const CONFIG_PATHS = ["/site-config.local.json", "/site-config.json"];

  function mergeConfig(config) {
    const homepage = config && typeof config.homepage === "object" ? config.homepage : {};
    const links = homepage.links && typeof homepage.links === "object" ? homepage.links : {};
    const footer = homepage.footer && typeof homepage.footer === "object" ? homepage.footer : {};
    return {
      homepage: {
        links: {
          ...DEFAULT_CONFIG.homepage.links,
          ...links
        },
        footer: {
          ...DEFAULT_CONFIG.homepage.footer,
          ...footer
        }
      }
    };
  }

  function safeHttpUrl(value) {
    if (typeof value !== "string" || value.trim() === "") return "";
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function setLinkText(link, title, description) {
    const strong = link.querySelector("strong");
    const span = link.querySelector("span");
    if (strong && typeof title === "string" && title.trim()) strong.textContent = title.trim();
    if (span && typeof description === "string" && description.trim()) span.textContent = description.trim();
    if (!strong && typeof title === "string" && title.trim()) link.textContent = title.trim();
  }

  function configureHomepageLink(key, value) {
    const link = document.querySelector('[data-site-link="' + key + '"]');
    if (!link || !value || typeof value !== "object") return;

    const url = safeHttpUrl(value.url);
    if (!url) return;

    setLinkText(link, value.title, value.description);
    link.href = url;
    link.hidden = false;
  }

  function configureFooter(footer) {
    const container = document.querySelector("[data-site-footer]");
    const link = document.querySelector("[data-site-registration]");
    if (!container || !link || !footer || typeof footer !== "object") return;

    const text = typeof footer.registrationText === "string" ? footer.registrationText.trim() : "";
    const url = safeHttpUrl(footer.registrationUrl);
    if (!text || !url) return;

    link.textContent = text;
    link.href = url;
    container.hidden = false;
  }

  async function readJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load " + path);
    return response.json();
  }

  async function loadConfig() {
    for (const path of CONFIG_PATHS) {
      try {
        return mergeConfig(await readJson(path));
      } catch (_error) {
        // Missing local config is expected in the public repository.
      }
    }
    return DEFAULT_CONFIG;
  }

  function applyConfig(config) {
    const homepage = config.homepage;
    Object.keys(homepage.links).forEach((key) => configureHomepageLink(key, homepage.links[key]));
    configureFooter(homepage.footer);
  }

  loadConfig().then(applyConfig);
})();
