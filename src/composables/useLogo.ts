import { computed } from 'vue';
import { normalizeTeamName } from '@/lib/logo-matcher';

const LOGO_BASE_URL = 'https://maximiliankleissl.github.io/wvv-posts-config/Logos';

// Cache for logo availability checks
const logoCache = new Map<string, boolean>();

export function useLogo() {
  const getLogoUrl = (teamName: string): string => {
    const normalizedName = normalizeTeamName(teamName);
    return `${LOGO_BASE_URL}/${normalizedName}.png`;
  };

  const hasLogo = async (teamName: string): Promise<boolean> => {
    const normalizedName = normalizeTeamName(teamName);
    const cacheKey = normalizedName;

    // Return cached result if available
    if (logoCache.has(cacheKey)) {
      return logoCache.get(cacheKey)!;
    }

    try {
      const url = getLogoUrl(teamName);
      const response = await fetch(url, { method: 'HEAD' });
      const exists = response.ok;
      logoCache.set(cacheKey, exists);
      return exists;
    } catch (error) {
      console.warn(`Failed to check logo availability for ${teamName}:`, error);
      logoCache.set(cacheKey, false);
      return false;
    }
  };

  const logoUrl = (teamName: string) => computed(() => getLogoUrl(teamName));

  return {
    getLogoUrl,
    hasLogo,
    logoUrl,
  };
}
