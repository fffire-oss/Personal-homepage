# ZephyrLabs Personal Homepage

Static personal homepage for ZephyrLabs projects.

## What It Contains

- `index.html`: minimal ZephyrLabs landing page with project links and a short todo list.
- `splendor-table.html`: Gem Table, an unofficial base-game Splendor-style local table.
- `splendor-table.js`: local game logic, replay import/export, BGA-style action logs, hot-seat play, and random AI fallback.
- `splendor-table.css`: Gem Table layout and interaction styling.

## Current Project Focus

- Gem Table local multiplayer and replay workflows.
- Base-game BGA replay capture adaptation.
- Future AI-assisted Gem Table play.
- Future expansion support once rule data and BGA capture data are mapped cleanly.
- Automation tooling experiments, including trading workflow research.

## Related Work

- [BoardReplayLab](https://github.com/Haro-stack/BoardReplayLab): public crawler/converter project for downloading BGA replay JSON data and converting supported captures for Gem Table.
- [DinoBoard](https://github.com/Zhiqi-Wang/DinoBoard): upstream board-game AI framework reference used by the Gem Table Smart AI deployment.

## Local Preview

Open `index.html` directly in a browser. No build step, package install, or Node runtime is required for the static page.

For an HTTP preview, run:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment Notes

The homepage is designed as static HTML/CSS/JS. The production domain may also run a separate private BGA replay API behind `/api/bga/replay`; that runtime is intentionally not part of this public homepage repository and should be deployed separately.

Gem Table Smart AI uses [DinoBoard](https://github.com/Zhiqi-Wang/DinoBoard) behind the same-origin `/api/dinoboard` reverse proxy. The server-side AI runtime is separate from this static homepage:

- Homepage static files are served from `<site-root>`; production should continue syncing this repository's `main` branch after the PR is merged.
- DinoBoard is deployed separately at `<dinoboard-root>`.
- The DinoBoard FastAPI process runs privately on `127.0.0.1:8001` through `dinoboard-ai.service`.
- Caddy exposes only the same-origin route `/api/dinoboard/*` and proxies it to `127.0.0.1:8001`.
- Before ICP approval, test through `https://<your-domain>`; after the domain is available, keep the same reverse-proxy handler under the domain site.
- AI abuse protection is implemented in DinoBoard FastAPI rate limits plus a `fail2ban` jail that watches `RATE_LIMIT` journal lines.

See [DinoBoard AI deployment](docs/dinoboard-ai-deployment.md) for the exact systemd unit, Caddy block, runtime dependency install, rate limits, fail2ban rules, and AI strength tiers.
