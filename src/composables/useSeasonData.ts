import { ref } from 'vue';
import type { SeasonData } from '@/lib/types';

export function useSeasonData() {
  const seasonData = ref<SeasonData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setSeasonData = (value: SeasonData) => {
    seasonData.value = value;
    error.value = null;
  };

  return {
    setSeasonData,
    seasonData,
    loading,
    error,
  };
}
