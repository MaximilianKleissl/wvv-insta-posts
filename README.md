# Werderaner VV – Social Media Generator

Vue 3 app that turns a volleyball match schedule into Instagram-ready slides. It generates
Portrait 4:5 and Story slides for match weekends (overview, matchdays, tournaments) and
per-team season summaries, packs them with ready-to-paste captions into a ZIP, and downloads
it via the browser.

Everything renders client-side: your schedule JSON is fetched from a static config server,
and the PNGs are rasterized directly in the browser with `html-to-image`.

## Features

- **Weekend mode** – overview slide plus one slide per matchday (or one tournament slide when
  only participating teams are known)
- **Team mode** – per-team season summaries, split into home and away games
- **Theming** – colors, badges, and backgrounds are derived from the club name
- **Formats** – Portrait 4:5 and Instagram Stories
- **Captions** – auto-generated German captions, exported as `.txt` files next to each PNG
- **Sponsors & action images** – logo and action-photo placement with deterministic
  (team-seeded) selection

## Data source

The app loads a static JSON config from a base URL (teams, schedules, logos, sponsors,
action images). Set it with:

```bash
VITE_CONFIG_BASE_URL=https://example.com/path-to-config
```

See `.env.example`. Without it, a default URL is used. The validation rules for the JSON
live in `src/lib/schema.ts`.

## Getting started

```bash
npm install
npm run dev       # Vite dev server (proxies /config to the config server)
npm run build     # production build into dist/
npm run serve     # preview the built app
```

Quality checks:

```bash
npm run typecheck   # vue-tsc
npm run lint        # eslint
npm run format      # prettier --write
```

## Deployment

The app is deployed to GitHub Pages from the `main` branch via
`.github/workflows/deploy.yml`. The Vite `base` and the router history are set to
`/wvw-insta-posts/` to match the repository name – adjust both if you deploy elsewhere.

## License

All rights reserved. No license is granted: the code may not be used, copied, modified,
distributed, or published without prior written permission from the author.

## Project structure

```
src/
  components/Slides/   cards, slide layouts, and slide primitives (logo, badge, rows)
  components/Slides/slides/  the slide types: overview, matchday, tournament, team-summary
  lib/                 types, schemas, formatting, grouping, export (ZIP/PNG)
  composables/         theming, sponsors, action images, season loading
  pages/               weekend mode (home) and team mode
```
