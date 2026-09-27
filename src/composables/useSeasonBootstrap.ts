import { onMounted } from 'vue';
import { useSeasonData } from './useSeasonData';
import { useSponsors } from './useSponsors';
import { fetchSeasonData } from '@/lib/sample-data';

/** Loads sponsors + season data on mount; exposes state and a retry action. */
export function useSeasonBootstrap() {
  const { setSeasonData, seasonData, loading, error } = useSeasonData();
  const { loadSponsors } = useSponsors();

  const reload = async () => {
    loading.value = true;
    error.value = null;
    try {
      await loadSponsors();
      setSeasonData(await fetchSeasonData());
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Daten.';
    } finally {
      loading.value = false;
    }
  };

  onMounted(reload);

  return { seasonData, loading, error, reload };
}
