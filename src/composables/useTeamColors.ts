import { computed } from 'vue';
import { getTeamColorScheme } from '@/lib/team-colors';

export function useTeamColors(teamName: string) {
  const colorScheme = computed(() => getTeamColorScheme(teamName));

  const getTeamTextColor = (teamNameToHighlight: string): string =>
    teamNameToHighlight === teamName ? colorScheme.value.primary : 'text-black';

  const getHomeBorderColor = (opacity?: '20' | '60' | '95') => {
    if (opacity === '20') return colorScheme.value.borderOpacity20;
    if (opacity === '60') return colorScheme.value.borderOpacity60;
    if (opacity === '95') return colorScheme.value.borderOpacity95;
    return colorScheme.value.primaryBorder;
  };

  const getHomeBgColor = () => colorScheme.value.primaryBgLight;
  const getHomeIconColor = () => colorScheme.value.primary;
  const getLeftPanelBgColor = () => colorScheme.value.leftPanelBg;
  const getBadgeBgColor = () => colorScheme.value.badgeBg;
  const getAccentColor = () => colorScheme.value.accent;
  const getHighlightColor = () => colorScheme.value.highlightBg;
  const getPrimaryTextColorWithOpacity = (opacity: string) =>
    opacity === '80' ? colorScheme.value.primaryOpacity80 : colorScheme.value.primary;
  const getDateTextColor = () => colorScheme.value.dateText;
  const getResultBgColor = () => colorScheme.value.resultBg;
  const getResultBgColorWithOpacity = (opacity: string) =>
    opacity === '90' ? colorScheme.value.resultBgOpacity : colorScheme.value.resultBg;

  return {
    colorScheme,
    getTeamTextColor,
    getHomeBorderColor,
    getHomeBgColor,
    getHomeIconColor,
    getLeftPanelBgColor,
    getBadgeBgColor,
    getAccentColor,
    getHighlightColor,
    getPrimaryTextColorWithOpacity,
    getDateTextColor,
    getResultBgColor,
    getResultBgColorWithOpacity,
  };
}
