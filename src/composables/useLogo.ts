import { normalizeTeamName } from '@/lib/logo-matcher';

const LOGO_BASE_URL = 'https://maximiliankleissl.github.io/wvv-posts-config/Logos';

export function useLogo() {
  const getLogoUrl = (teamName: string): string => {
    const normalizedName = normalizeTeamName(teamName);
    return `${LOGO_BASE_URL}/${normalizedName}.png`;
  };

  return {
    getLogoUrl,
  };
}
