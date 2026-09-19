import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG_BASE_URL = 'https://maximiliankleissl.github.io/wvv-posts-config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname));
  const configBaseUrl = env.VITE_CONFIG_BASE_URL || DEFAULT_CONFIG_BASE_URL;

  return {
    base: '/wvv-insta-posts/',
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      dedupe: ['vue'],
    },
    root: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
      proxy: {
        // Proxy config-server requests in dev to avoid CORS issues with local servers.
        '/config': {
          target: configBaseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/config/, ''),
        },
      },
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});