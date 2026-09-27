/**
 * Default hosts for the config repo and the write gateway.
 *
 * Imported by both `vite.config.ts` (which proxies config requests during dev)
 * and `lib/config.ts` (which resolves them at runtime), so the two can never
 * drift apart. Keep this module free of `import.meta.env` and Vite APIs: it is
 * loaded outside the app bundle as well.
 */

/** Raw config repo, pinned to a branch ref — see README "Data source". */
export const DEFAULT_CONFIG_BASE_URL =
  'https://raw.githubusercontent.com/maximiliankleissl/wvv-posts-config/main';

export const DEFAULT_WRITER_URL = 'https://gateway.wvv-insta-config-editor-api.workers.dev';
