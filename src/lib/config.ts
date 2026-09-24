const DEFAULT_CONFIG_BASE_URL = 'https://maximiliankleissl.github.io/wvv-posts-config';
const DEFAULT_WRITER_URL = 'https://gateway.wvv-insta-config-editor-api.workers.dev';

/**
 * Base URL of the config server (Spiele, Logos, Sponsoren, Action_Images).
 *
 * In dev, requests go through the Vite dev-server proxy at `/config` to avoid
 * CORS when the config server is a local one. In build, the env var (or the
 * default) is baked in as an absolute URL.
 */
export const CONFIG_BASE_URL = import.meta.env.DEV
  ? '/config'
  : import.meta.env.VITE_CONFIG_BASE_URL || DEFAULT_CONFIG_BASE_URL;

/**
 * Base URL of the write-gateway (Cloudflare Worker) that commits edited config
 * files to the wvv-posts-config repository. In dev, requests go through the
 * Vite dev-server proxy at `/writer` to avoid CORS.
 */
export const WRITER_BASE_URL = import.meta.env.DEV
  ? '/writer'
  : import.meta.env.VITE_WRITER_URL || DEFAULT_WRITER_URL;
