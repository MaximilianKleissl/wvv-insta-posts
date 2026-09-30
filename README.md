# Werderaner VV – Social Media Generator

[![Live demo](https://img.shields.io/badge/live-demo-green)](https://maximiliankleissl.github.io/wvv-insta-posts)
[![Checks](https://github.com/MaximilianKleissl/wvv-insta-posts/actions/workflows/checks.yml/badge.svg)](https://github.com/MaximilianKleissl/wvv-insta-posts/actions/workflows/checks.yml)

Vue 3 app that turns a volleyball match schedule into Instagram-ready slides. It generates
Portrait 4:5 and Story slides for match weekends (overview, matchdays, tournaments) and
per-team season summaries, packs them with ready-to-paste captions into a ZIP, and downloads
it via the browser.

Everything renders client-side: the schedule JSON is fetched from a static config server,
and the PNGs are rasterized directly in the browser with `html-to-image`.

## Live demo

https://maximiliankleissl.github.io/wvv-insta-posts

## Features

- **Weekend mode** – overview slide plus one slide per matchday (or one tournament slide when
  only participating teams are known), a caption for Instagram, and a per-weekend ZIP export
- **Team mode** – per-team season summaries, split into home and away games
- **Two formats** – Portrait 4:5 (1080×1350) and Instagram Stories (1080×1920)
- **Captions** – auto-generated German captions, exported as `.txt` files next to each PNG
- **Sponsors & action images** – logo and action-photo placement with deterministic
  (team-seeded) selection
- **Config editor** – a UI for editing matchdays, logos, sponsors and action images, which
  commits to the config repository through a write gateway
- **In-app help** – a German documentation modal (`?` in the header) and per-tab info
  banners in the editor

## Data source

The app reads the config straight from the `wvv-posts-config` repository via
`raw.githubusercontent.com`, pinned to a branch ref:

```
https://raw.githubusercontent.com/<owner>/wvv-posts-config/main
```

That host serves `Access-Control-Allow-Origin: *`, so the browser can read both the JSON
and the logo images directly. Compared to reaching the repo through GitHub Pages it
removes the build and CDN propagation delay after a publish: a commit becomes readable
within seconds. The trade-off is that raw is not a CDN, so the many small config files
are fetched concurrently rather than in sequence.

The host sends `cache-control: max-age=300`, which on its own would keep a browser
serving the previous version for up to five minutes. Every request for config data
therefore goes through `src/lib/config-fetch.ts`, which sets `cache: 'no-cache'`. The
host honours `If-None-Match`, so unchanged files come back as `304 Not Modified` with an
empty body: a reload always reflects what is actually published, and unchanged files
still cost almost nothing.

Override the host with:

```bash
VITE_CONFIG_BASE_URL=https://example.com/path-to-config
```

The editor additionally needs the write gateway, which commits edits back to the config
repository:

```bash
VITE_WRITER_URL=https://example.com/write-gateway
```

See `.env.example` for both. Without them, default URLs are used. The config repository
is expected to expose:

| Path                                | Contents                                                   |
| ----------------------------------- | ---------------------------------------------------------- |
| `Spiele/File_Overview.json`         | list of the matchday file names for the season             |
| `Spiele/metadata.json`              | `{ season, club }` – shown in the header and on the slides |
| `Spiele/matchdays-*.json`           | arrays of matchday objects (see below)                     |
| `Logos/<normalized team name>.png`  | club and opponent logos                                    |
| `Sponsoren/sponsoren_overview.json` | `[{ filename, name, teams }]`                              |
| `Action_Images/action_images.json`  | `{ default, teams }` filename lists                        |

A matchday object has `team`, `home` (boolean), `date` (`DD.MM.YYYY`) and `location`,
plus either `matches` (`time`, `home`, `away`, optional `result`) for known pairings or
`teams` for a tournament where only the participants are known. `match_day_name`,
`match_day_result` and `homeTeam` are optional display overrides.

The data is edited through `/editor` in the app; the JSON is the source of truth, so it
can also be maintained directly in the config repository.

## Getting started

```bash
npm install
npm run dev       # Vite dev server on :3000 (proxies /config and /writer)
npm run build     # production build into dist/
npm run serve     # preview the built app
```

In development, requests go through the Vite proxy at `/config` and `/writer` (see
`vite.config.ts`) to avoid CORS against a local config server. `VITE_CONFIG_BASE_URL` and
`VITE_WRITER_URL` are only read at build time.

Quality checks:

```bash
npm run typecheck        # vue-tsc
npm run lint             # eslint
npm run format:check     # prettier --check
```

## Deployment

The app is deployed to GitHub Pages from the `main` branch via
`.github/workflows/deploy.yml`. The Vite `base` and the router history are both set to
`/wvv-insta-posts/` to match the repository name – adjust both in `vite.config.ts` and
`src/router/index.ts` if you deploy elsewhere.

## License

All rights reserved. No license is granted: the code may not be used, copied, modified,
distributed, or published without prior written permission from the author.

## Project structure

```
src/
  components/         shared UI: header, format toggle, status panel, preview gallery
  components/Slides/  slide layouts, cards and primitives (logo, badge, rows)
  components/Slides/slides/  the slide types: overview, matchday, tournament, team-summary
  components/editor/  config editor tabs and form widgets
  lib/                types, grouping, caption, PNG/ZIP export, slide formatting
  composables/        season loading, sponsors, action images, theming, toasts
  pages/              weekend mode (home), team mode, config editor
```
