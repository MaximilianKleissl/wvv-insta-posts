import { computed } from 'vue';
import { getTeamColorScheme, hexToRgba } from '@/lib/team-colors';

export function useTeamColors(teamName: string) {
  const colorScheme = computed(() => getTeamColorScheme(teamName));

  /** rgba() background for hairline/divider lines (kept as an inline style so Tailwind JIT is irrelevant). */
  const getHairlineColor = () => hexToRgba(colorScheme.value.imageTint, 0.2);

  const getHomeBorderColor = () => colorScheme.value.borderOpacity60;

  const getHomeBgColor = () => colorScheme.value.primaryBgLight;
  const getHomeIconColor = () => colorScheme.value.primary;
  const getBadgeBgColor = () => colorScheme.value.badgeBg;
  const getPrimaryTextColorWithOpacity = (opacity: '80') =>
    opacity === '80' ? colorScheme.value.primaryOpacity80 : colorScheme.value.primary;

  return {
    colorScheme,
    getHairlineColor,
    getHomeBorderColor,
    getHomeBgColor,
    getHomeIconColor,
    getBadgeBgColor,
    getPrimaryTextColorWithOpacity,
  };
}
