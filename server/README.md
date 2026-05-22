# BGA replay server

This optional server turns the static Gem Table page into a table-id crawler UI.

It does not ask the frontend for a BGA password. The server runs the crawler in
a local browser context. Log in to BGA in that browser profile before relying on
it for private or Premium-only reviews.

For unattended imports, prefer a BGA Cookie request header captured from a
logged-in browser session:

```bash
BGA_COOKIE='cookie_name=value; other_cookie=value' npm start
```

or store it in a local, ignored file and point the server at it:

```bash
BGA_COOKIE_FILE=../.bga-cookie-header npm start
```

The crawler can also write that local cookie file after a successful server-side
login:

```bash
BGA_USERNAME=your_bga_username BGA_PASSWORD=your_bga_password BGA_WRITE_COOKIE_FILE=.bga-cookie-header node tools/bga-replay-crawler.mjs --table 854928957 --headless
```

As a fallback, set credentials only as server environment variables:

```bash
BGA_USERNAME=your_bga_username BGA_PASSWORD=your_bga_password npm start
```

These values are inherited by the crawler process but are not sent to the
frontend and should not be committed to the repository.

To prepare that profile safely, run this once from the repository root and log
in inside the opened BGA browser window:

```bash
node tools/bga-replay-crawler.mjs --table 854928957 --manual --wait-ms 300000
```

```bash
cd server
npm install
npm run install-browser
npm start
```

If the production host uses a system Chrome or Chromium instead of the
Playwright-managed browser download, set:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm start
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
