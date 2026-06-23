# Journal Backend

Small same-origin API for the public Journal graph. It serves the static site and lets an authenticated admin upsert public nodes without exposing credentials in browser code.

The admin UI is disabled by default and is not published as `journal-admin.html` in the public static site. Enable it only for local work or behind a separately authenticated admin surface.

## Run

```sh
set JOURNAL_ADMIN_TOKEN=replace-with-a-long-random-value
set JOURNAL_ENABLE_ADMIN_UI=1
node journal-backend/server.js
```

Open `http://localhost:8787/journal.html` or, for local admin work, `http://localhost:8787/admin/journal-admin.html`.

Optional environment variables:

```sh
set PORT=8787
set JOURNAL_STORE_PATH=<outside-repo>\journal-store.json
set JOURNAL_VAULT_PATH=<outside-repo>\zephyrlabs-vault
set JOURNAL_VAULT_GIT_REMOTE=git@github.com:<owner>/<private-vault-repo>.git
set JOURNAL_VAULT_GIT_BRANCH=main
set JOURNAL_VAULT_GIT_AUTO_SYNC=1
set JOURNAL_ADMIN_ORIGIN=https://admin.zephyrlabs.cloud
```

Keep `JOURNAL_ADMIN_TOKEN` and the production store outside git. The API rejects obvious private content such as emails, IP addresses, local paths, deployment paths, secrets, tokens, and Bilibili profile links.

`JOURNAL_VAULT_PATH` is the private writer storage path. It can contain raw Markdown and resources because it is protected by `JOURNAL_ADMIN_TOKEN` and should point outside this public repository in production. GitHub credentials should live in the backend host's Git Credential Manager, SSH agent, or server-only environment; do not put them in browser code.

## Endpoints

- `GET /api/health`
- `GET /api/journal/graph`
- `GET /api/journal/graph/stream`
- `GET /api/journal/nodes`
- `POST /api/journal/nodes` with `Authorization: Bearer <JOURNAL_ADMIN_TOKEN>`
- `GET /api/journal/vault/status` with `Authorization: Bearer <JOURNAL_ADMIN_TOKEN>`
- `GET /api/journal/vault/files` with `Authorization: Bearer <JOURNAL_ADMIN_TOKEN>`
- `GET /api/journal/vault/file?path=<relative-path>` with `Authorization: Bearer <JOURNAL_ADMIN_TOKEN>`
- `POST /api/journal/vault/file` with `Authorization: Bearer <JOURNAL_ADMIN_TOKEN>`
- `POST /api/journal/vault/sync` with `Authorization: Bearer <JOURNAL_ADMIN_TOKEN>`

The frontend still works as a static site from `journal-data.json` when the backend is not deployed.
Posting an existing `id` replaces the stored override for that node, so the admin console can edit base graph nodes without committing secrets or tokens into frontend files.
The graph endpoint is read-only, and the stream endpoint emits public display fields node by node for the homepage reveal. Use the node endpoint to add or update one public node at a time instead of uploading a whole vault export.
Admin write routes apply a same-origin write guard, basic per-IP rate limiting, constant-time bearer token comparison, strict JSON content-type checks, and field-whitelisted public responses. Put production deployments behind edge authentication before enabling the admin UI.

Saving a vault file writes it under `JOURNAL_VAULT_PATH`; when `JOURNAL_VAULT_GIT_AUTO_SYNC` is not `0`, the backend commits all vault changes and pushes them to `JOURNAL_VAULT_GIT_REMOTE`. If the remote is not configured, the backend still keeps a local Git history in the vault path.
