/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the config server (Spiele, Logos, Sponsoren, Action_Images). */
  readonly VITE_CONFIG_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
