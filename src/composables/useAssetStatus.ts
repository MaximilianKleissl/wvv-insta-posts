import { ref } from 'vue';
import { CONFIG_BASE_URL } from '@/lib/config';
import { fetchFresh } from '@/lib/config-fetch';

const assetExists = ref<Record<string, boolean | null>>({});

/** Checks which config assets already exist in the published repo (module singleton). */
export function useAssetStatus() {
  async function refreshAssetStatus(paths: string[]) {
    for (const path of paths) {
      if (path in assetExists.value) continue;
      assetExists.value[path] = null;
      try {
        // Revalidated: a cached "missing" result would keep showing a false
        // "fehlt" badge for up to five minutes after an upload.
        const response = await fetchFresh(`${CONFIG_BASE_URL}/${path}`, { method: 'GET' });
        assetExists.value[path] = response.ok;
      } catch {
        assetExists.value[path] = false;
      }
    }
  }

  return { assetExists, refreshAssetStatus };
}
