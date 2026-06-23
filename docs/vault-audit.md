# Obsidian Vault Public-Curation Audit

Date: 2026-06-14

Source reviewed: `ZephyrLabs_Knowledge_Map_Website_Ready.zip`

## Result

The vault did not contain publishable matches for common private-data patterns in the reviewed Markdown content: emails, API keys, secret markers, IP addresses, local Windows paths, deployment paths, Bilibili profile links, or personal profile URLs.

## Curation Decisions

- Published only `visibility: public` pages and distilled summaries from topic hubs.
- Excluded `.obsidian` workspace state, templates, dashboard workflow notes, and the private website integration spec.
- Rewrote short or broad notes as concrete public summaries before adding them to `journal-data.json`.
- Kept raw daily notes and operational notes out of the public graph.
- Removed the Video Hub surface from the homepage and public config.

## Published Surface

- `journal.html` renders the public knowledge graph.
- `journal-data.json` contains the sanitized graph data.
- `journal-backend/admin/journal-admin.html` is a backend-only admin UI template and is not published as a public static page.
- `journal-backend/server.js` provides a no-dependency same-origin API for appending public graph nodes.
