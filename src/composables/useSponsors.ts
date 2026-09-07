import { ref, computed } from 'vue';
import type { Sponsor } from '@/lib/types';

const SPONSORS_URL =
  'https://maximiliankleissl.github.io/wvv-posts-config/Sponsoren/sponsoren_overview.json';

// Shared state across all composable instances
const sponsors = ref<Sponsor[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function useSponsors() {
  const loadSponsors = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(SPONSORS_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
      }
      const data = await response.json();
      sponsors.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load sponsors';
      console.error('Failed to load sponsors:', err);
    } finally {
      loading.value = false;
    }
  };

  const getAllSponsors = computed(() => sponsors.value);

  const getSponsorsForTeam = computed(() => {
    return (teamName: string) => {
      return sponsors.value.filter(
        (sponsor) => sponsor.teams.includes(teamName) || sponsor.teams.includes(''),
      );
    };
  });

  const getRandomSponsors = computed(() => {
    return (count: number, teamName?: string) => {
      const availableSponsors =
        teamName && sponsors.value.some((sponsor) => sponsor.teams.includes(teamName))
          ? sponsors.value.filter(
              (sponsor) => sponsor.teams.includes(teamName) || sponsor.teams.includes(''),
            )
          : sponsors.value;

      if (availableSponsors.length === 0) return [];

      const shuffled = [...availableSponsors].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    };
  });

  return {
    sponsors,
    loading,
    error,
    loadSponsors,
    getAllSponsors,
    getSponsorsForTeam,
    getRandomSponsors,
  };
}
