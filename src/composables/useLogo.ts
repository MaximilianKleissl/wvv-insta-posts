/**
 * Composable for logo rendering with fallback
 * Provides consistent logo handling across slide components
 */

import { computed } from 'vue';
import { getBundledLogoUrl } from '@/lib/logo-assets';
import type { LogoLibrary } from '@/lib/types';

export function useLogo(basePath: string = import.meta.env.BASE_URL, customLibrary?: LogoLibrary) {
  /**
   * Get logo URL for a team name
   * First checks custom library, then falls back to bundled logos
   */
  const getLogoUrl = (teamName: string): string | undefined => {
    // Check custom library first if provided
    if (customLibrary && customLibrary[teamName]) {
      return customLibrary[teamName];
    }
    // Fall back to bundled logos
    return getBundledLogoUrl(teamName, basePath);
  };

  /**
   * Check if a logo is available for a team
   */
  const hasLogo = (teamName: string): boolean => {
    return getLogoUrl(teamName) !== undefined;
  };

  /**
   * Get logo URL with null safety
   * Returns undefined if no logo is found
   */
  const logoUrl = (teamName: string) => computed(() => getLogoUrl(teamName));

  return {
    getLogoUrl,
    hasLogo,
    logoUrl,
  };
}
