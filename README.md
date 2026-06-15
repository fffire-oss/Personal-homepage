# ZephyrLabs Personal Homepage

Static personal homepage for ZephyrLabs projects.

## What It Contains

- `index.html`: landing page for Geminus, Algo Trade, Journal, and related local tools.
- `video.html`: configurable video hub. Public defaults are generic; production links are supplied by local config.
- `gemtable/`: Gem Table, an unofficial Splendor-style local table with its own HTML, CSS, app script, and rules module.
- `styles.css`: homepage styles, including the former targeted fixes.
- `shared/effects.js`: reusable liquid background, sticky-card behavior, card focus dimming, footer reveal, and canvas helpers.
- `homepage-effects.js`: homepage-only visuals for the logo, AI chip, market globe, and Journal graph.

## Local Preview

Open `index.html` directly in a browser. No build step, package install, or Node runtime is required for the static page.

For an HTTP preview, run:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Local-Only Site Config

The public repository ships only generic defaults in `site-config.json`. Production-only public display data, such as optional external links, video links, and registration footer text, should live in `site-config.local.json` in the deployed site root.

`site-config.local.json` is ignored by git, but it is still fetched by the browser when present. Only put information in it that is acceptable for website visitors to read directly.

If the server auto-syncs this repository into the site root and may remove untracked files, keep the real local config outside the repo, then map `/site-config.local.json` to that server-owned file in the web server. The frontend always reads `/site-config.local.json` first and falls back to `site-config.json`.

Use `site-config.local.example.json` as the shape:

```json
{
  "homepage": {
    "links": {
      "geminusReplay": {
        "title": "Replay tooling",
        "description": "External project",
        "url": "https://example.com/replay-tooling"
      },
      "geminusHud": {
        "title": "Decision overlay",
        "description": "External project",
        "url": "https://example.com/decision-overlay"
      },
      "marketTrainer": {
        "title": "Market trainer",
        "description": "Historical replay trainer",
        "url": "https://example.com/market-trainer"
      }
    },
    "footer": {
      "registrationText": "Registration number",
      "registrationUrl": "https://beian.miit.gov.cn/"
    }
  }
}
```

Backend services, if used, should be deployed separately behind same-origin APIs. Do not commit production network addresses, cookies, SSH paths, account names, service templates, or other private deployment details.
