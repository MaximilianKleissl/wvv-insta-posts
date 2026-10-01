/**
 * Composable for team highlighting logic
 * Provides consistent highlighting of the home club across slide components
 */

import type { SeasonData } from '@/lib/types';
import { useTeamColors } from './useTeamColors';

export function useTeamHighlight(season: SeasonData, themeTeamName = season.club) {
  const teamColors = useTeamColors(themeTeamName);

  /**
   * Check if a team name matches the home club
   */
  const isHomeClub = (teamName: string): boolean => {
    return teamName.startsWith(season.club);
  };

  /**
   * Text color for a team: the club's own teams wear the team color,
   * everyone else stays black.
   */
  const getTeamTextColor = (teamName: string): string => {
    return isHomeClub(teamName) ? teamColors.getInkColor() : '#000000';
  };

  return {
    isHomeClub,
    getTeamTextColor,
  };
}
