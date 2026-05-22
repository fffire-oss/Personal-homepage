# ZephyrLabs Personal Homepage

Static personal homepage for projects, skiing notes, and small web experiments.

## Planning Docs

- `docs/content-workbook.md`: editable workbook for filling in homepage copy, skiing notes, places, time/space visuals, project descriptions, AI chat personality, and comment fields.
- `docs/site-roadmap.md`: phased roadmap for growing the static page into a content-driven site with AI chat, comments, and an admin system.

## Local Preview

Open `index.html` directly in a browser. No build step, package install, or Node runtime is required.

For an HTTP preview, run:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages.
3. Select the `main` branch and the repository root as the Pages source.

The page is implemented with plain HTML, CSS, and JavaScript for simple deployment.

## Optional BGA Replay Server

The static page can import local replay JSON files directly. BGA table-id import
requires a small Node service because the browser cannot safely use BGA login
cookies from this domain.

See `server/README.md` for the optional API server. The frontend posts a table
ID to `/api/bga/replay`, shows progress, and exposes a generated JSON download
when the server-side crawler finishes.
