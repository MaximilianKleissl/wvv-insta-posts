/**
 * Composable for team highlighting logic
 * Provides consistent highlighting of the home club across slide components
 */

import { computed } from 'vue';
import type { SeasonData } from '@/lib/types';

export function useTeamHighlight(season: SeasonData) {
  /**
   * Check if a team name matches the home club
   */
  const isHomeClub = (teamName: string): boolean => {
    return teamName.startsWith(season.club);
  };

  /**
   * Get text color class based on whether team is home club
   */
  const getTeamTextColor = (teamName: string): string => {
    return isHomeClub(teamName) ? 'text-green-800' : 'text-black';
  };

  /**
   * Computed version of text color for reactive usage
   */
  const teamTextColor = (teamName: string) => computed(() => getTeamTextColor(teamName));

  return {
    isHomeClub,
    getTeamTextColor,
    teamTextColor,
  };
}
