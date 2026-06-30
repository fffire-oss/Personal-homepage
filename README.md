# ZephyrLabs Personal Homepage

Static personal homepage for ZephyrLabs projects.

## What It Contains

- `index.html`: landing page for Geminus, Algo Trade, Journal, and related local tools.
- `journal.html`: public Obsidian-style Journal graph built from sanitized vault summaries.
- `journal-data.json`: public-safe knowledge graph data distilled from the vault.
- `journal-backend/`: no-dependency same-origin API for adding public graph nodes without exposing credentials in browser code. Its admin UI template is not part of the public static site.
- `gemtable/`: Gem Table, an unofficial Splendor-style local table with its own HTML, CSS, app script, and rules module.
- `scripts/build-site.js`: production build pipeline for publishing a hardened `dist/` site instead of the editable source tree.
- `styles.css`: homepage styles, including the former targeted fixes.
- `shared/effects.js`: reusable liquid background, sticky-card behavior, card focus dimming, footer reveal, and canvas helpers.
- `homepage-effects.js`: homepage-only visuals for the logo, AI chip, market globe, and Journal graph.
- `docs/vault-audit.md`: summary of the Obsidian vault privacy and content curation pass.

## Local Preview

For source-level preview, open `index.html` directly in a browser. No package install is required for the static source page.

For an HTTP preview, run:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Production Build

Do not serve the repository root in production if the goal is to make direct copying harder. Build and publish only `dist/`:

```sh
npm run build
```

The build is dependency-free and writes a production-only static site to `dist/`:

- homepage scripts are bundled into `dist/assets/home-<hash>.js`
- Journal scripts are bundled into `dist/assets/journal-<hash>.js`
- Gem Table rules, config loader, and app code are bundled into `dist/gemtable/assets/gemtable-<hash>.js`
- CSS files are minified and hash-named
- only art assets referenced by the public entry HTML/CSS/JS are copied; unused files in `assets/` are excluded
- source maps are not emitted
- Gem Table's `window.__gemTableDebug` test hook is stripped from the production bundle
- `docs/`, `test/`, `journal-backend/`, `scripts/`, README, package files, debug logs, and local connection notes are not copied

Point Caddy, nginx, or any static host at `dist/`, not this repository root. If the server uses an auto-sync script, run `npm run build` after pulling and keep the web root set to the generated `dist/` directory.

This raises the effort required to copy the frontend implementation, but it is not DRM. Browser-delivered JavaScript, WebGL shaders, images, and canvas logic can still be downloaded by a determined visitor. Keep private algorithms, credentials, model weights, trading logic, and note sources on a backend.

## Local-Only Site Config

The public repository ships only generic defaults in `site-config.json`. Production-only public display data, such as optional external links and registration footer text, should live in `site-config.local.json` in the deployed site root.

`site-config.local.json` is ignored by git, but it is still fetched by the browser when present. Only put information in it that is acceptable for website visitors to read directly. Optional homepage links render only when both `title` and a non-placeholder HTTP(S) `url` are set.

If the server auto-syncs this repository into the site root and may remove untracked files, keep the real local config outside the repo, then map `/site-config.local.json` to that server-owned file in the web server. The frontend always reads `/site-config.local.json` first and falls back to `site-config.json`.

Use `site-config.local.example.json` as the shape:

```json
{
  "homepage": {
    "links": {
      "geminusReplay": {
        "title": "",
        "description": "",
        "url": ""
      },
      "geminusHud": {
        "title": "",
        "description": "",
        "url": ""
      },
      "marketTrainer": {
        "title": "",
        "description": "",
        "url": ""
      }
    },
    "footer": {
      "registrationText": "Registration number",
      "registrationUrl": "https://beian.miit.gov.cn/"
    }
  }
}
```

Backend services, if used, should be deployed separately behind same-origin APIs. Do not commit production network addresses, cookies, SSH paths, account names, service templates, API tokens, private note stores, or other private deployment details.

## Journal Backend Preview

The Journal graph works as a static page from `journal-data.json`. To test node editing locally:

```sh
set JOURNAL_ADMIN_TOKEN=replace-with-a-long-random-value
set JOURNAL_ENABLE_ADMIN_UI=1
node journal-backend/server.js
```

Then visit `http://localhost:8787/journal.html` or `http://localhost:8787/admin/journal-admin.html`.

The public static site does not publish `journal-admin.html`. The admin UI is available only when the backend is explicitly started with `JOURNAL_ENABLE_ADMIN_UI=1`, and production deployments should put that route behind edge authentication such as OIDC, VPN, or an equivalent access-control layer.

The admin page can load an existing node with `/admin/journal-admin.html?node=geminus`. Without a backend token it stores browser-local override drafts; with `JOURNAL_ADMIN_TOKEN` it upserts the node through `/api/journal/nodes`.

The backend also exposes read-only `/api/journal/graph` for the Journal page, `/api/journal/graph/stream` for the homepage's node-by-node vault reveal, and writable `/api/journal/nodes` for adding or updating one public node at a time. Public Journal responses are field-whitelisted and do not return source paths, private vault paths, raw Markdown, admin notes, or sync metadata. The homepage waits for page art assets to finish decoding before it streams the full public vault into the orbit graph.

## Private Vault Writer and Sync

The protected admin UI also includes a private Vault Writer when served through `journal-backend/server.js`. It can write Markdown notes, upload vetted vault resources, and trigger Git sync from the backend. The browser never receives GitHub credentials; configure the backend host with Git/Git Credential Manager, SSH keys, or a server-only token.

Optional environment variables:

```sh
set JOURNAL_VAULT_PATH=<outside-repo>\zephyrlabs-vault
set JOURNAL_VAULT_GIT_REMOTE=git@github.com:<owner>/<private-vault-repo>.git
set JOURNAL_VAULT_GIT_BRANCH=main
set JOURNAL_VAULT_GIT_AUTO_SYNC=1
set JOURNAL_ADMIN_ORIGIN=https://admin.zephyrlabs.cloud
```

`JOURNAL_VAULT_GIT_AUTO_SYNC=0` keeps the writer local until the admin uses Sync Now. Keep the vault path and GitHub credentials outside this public repository.
