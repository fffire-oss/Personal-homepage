# ZephyrLabs Personal Homepage

Static personal homepage for ZephyrLabs projects.

## What It Contains

- `index.html`: minimal ZephyrLabs landing page with Gem Table, BoardReplayLab, Video Hub links, and a short todo list.
- `videohub.html`: video index for match analysis and project notes.
- `splendor-table.html`: Gem Table, an unofficial Splendor-style local table.
- `splendor-table.js`: local game logic, replay import/export, BGA-style action logs, hot-seat play, and random AI fallback.
- `splendor-table.css`: Gem Table layout and interaction styling.

## Current Project Focus

- Gem Table local multiplayer, replay workflows, and expansion compatibility.
- BoardReplayLab replay capture/conversion tooling for Gem Table and training data.
- Stronger AlphaZero-style training with real-player replay data.
- Tampermonkey scripts for BGA play/replay ergonomics.
- Quantitative stock-model experiments and structured explanation videos.

## Related Work

- [BoardReplayLab](https://github.com/Haro-stack/BoardReplayLab): replay capture/conversion lab. The current Splendor module exports supported BGA replay data for Gem Table and AI workflows.
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

- Homepage static files can be served from any chosen site root and synced from this repository's `main` branch.
- DinoBoard is deployed separately as a private local service.
- The AI service should bind only to loopback and be exposed through the same-origin `/api/dinoboard/*` route.
- Do not commit raw production network addresses, cookies, SSH paths, account names, or other private deployment values.
- AI abuse protection is implemented in DinoBoard FastAPI rate limits plus a `fail2ban` jail that watches `RATE_LIMIT` journal lines.

See [DinoBoard AI deployment](docs/dinoboard-ai-deployment.md) for sanitized systemd/Caddy templates, runtime dependency install, rate limits, fail2ban rules, and AI strength tiers.
