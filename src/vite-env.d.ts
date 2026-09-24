/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the config server (Spiele, Logos, Sponsoren, Action_Images). */
  readonly VITE_CONFIG_BASE_URL?: string;
  /** Base URL of the write-gateway (Cloudflare Worker) that commits config edits. */
  readonly VITE_WRITER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
