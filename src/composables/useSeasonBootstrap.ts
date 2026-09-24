import { onMounted } from 'vue';
import { useSeasonData } from './useSeasonData';
import { useSponsors } from './useSponsors';
import { fetchSeasonData } from '@/lib/sample-data';

/** Loads sponsors + season data once on mount; exposes state for the UI. */
export function useSeasonBootstrap() {
  const { setSeasonData, seasonData, loading, error } = useSeasonData();
  const { loadSponsors } = useSponsors();

  onMounted(async () => {
    loading.value = true;
    try {
      await loadSponsors();
      const data = await fetchSeasonData();
      setSeasonData(data);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Daten';
    } finally {
      loading.value = false;
    }
  });

  return { seasonData, loading, error };
}
