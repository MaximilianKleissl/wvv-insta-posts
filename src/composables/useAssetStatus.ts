import { ref } from 'vue';
import { CONFIG_BASE_URL } from '@/lib/config';

const assetExists = ref<Record<string, boolean | null>>({});

/** Checks which config assets already exist in the published repo (module singleton). */
export function useAssetStatus() {
  async function refreshAssetStatus(paths: string[]) {
    for (const path of paths) {
      if (path in assetExists.value) continue;
      assetExists.value[path] = null;
      try {
        const response = await fetch(`${CONFIG_BASE_URL}/${path}`, { method: 'GET' });
        assetExists.value[path] = response.ok;
      } catch {
        assetExists.value[path] = false;
      }
    }
  }

  return { assetExists, refreshAssetStatus };
}
