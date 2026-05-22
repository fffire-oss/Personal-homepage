# BGA replay server

This optional server turns the static Gem Table page into a table-id crawler UI.

It does not ask the frontend for a BGA password. The server runs the crawler in
a local browser context. Log in to BGA in that browser profile before relying on
it for private or Premium-only reviews.

```bash
cd server
npm install
npm run install-browser
npm start
```

The crawler script is kept in `tools/bga-replay-crawler.mjs` so the website can
link to it on GitHub. When launched through this server it resolves Playwright
from `server/node_modules`.

Open:

```text
http://127.0.0.1:4175/splendor-table.html
```

API:

- `POST /api/bga/replay` with `{ "tableId": "123456789" }`
- `GET /api/bga/replay/:jobId`
- `GET /api/bga/replay/:jobId/download`

The generated JSON is raw BGA browser-visible replay data. The current Gem Table
viewer only imports ZephyrLabs base-game replay JSON directly. Expansion tables,
unsupported variants, and raw BGA captures intentionally report import failure
instead of loading incorrect state.
