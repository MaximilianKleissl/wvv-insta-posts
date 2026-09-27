import { DEFAULT_CONFIG_BASE_URL, DEFAULT_WRITER_URL } from './config-defaults';

/**
 * Base URL of the config repo (Spiele, Logos, Sponsoren, Action_Images).
 *
 * Reads go straight to raw.githubusercontent.com rather than to GitHub Pages, so
 * freshly published config is available in seconds instead of after a Pages
 * build. The trade-off is that raw is not a CDN, so the many small files are
 * fetched concurrently (see `lib/sample-data.ts`).
 *
 * The value can be overridden with VITE_CONFIG_BASE_URL, e.g. to point at the
 * Pages URL again. In dev, requests go through the Vite proxy at `/config` to
 * avoid CORS when the config repo is mirrored locally; in build, the env var (or
 * the default) is baked in as an absolute URL.
 */
export const CONFIG_BASE_URL = import.meta.env.DEV
  ? '/config'
  : import.meta.env.VITE_CONFIG_BASE_URL || DEFAULT_CONFIG_BASE_URL;

/**
 * Base URL of the write-gateway (Cloudflare Worker) that commits edited config
 * files to the config repository. In dev, requests go through the Vite dev-server
 * proxy at `/writer` to avoid CORS.
 */
export const WRITER_BASE_URL = import.meta.env.DEV
  ? '/writer'
  : import.meta.env.VITE_WRITER_URL || DEFAULT_WRITER_URL;
