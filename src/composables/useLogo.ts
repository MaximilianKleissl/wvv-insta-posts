import { computed } from 'vue';
import { getBundledLogoUrl } from '@/lib/logo-assets';
import type { LogoLibrary } from '@/lib/types';

export function useLogo(basePath: string = import.meta.env.BASE_URL, customLibrary?: LogoLibrary) {
  const getLogoUrl = (teamName: string): string | undefined => {
    if (customLibrary && customLibrary[teamName]) {
      return customLibrary[teamName];
    }
    return getBundledLogoUrl(teamName, basePath);
  };

  const hasLogo = (teamName: string): boolean => {
    return getLogoUrl(teamName) !== undefined;
  };

  const logoUrl = (teamName: string) => computed(() => getLogoUrl(teamName));

  return {
    getLogoUrl,
    hasLogo,
    logoUrl,
  };
}
