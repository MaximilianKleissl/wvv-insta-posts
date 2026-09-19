import { normalizeTeamName } from '@/lib/logo-matcher';
import { CONFIG_BASE_URL } from '@/lib/config';

const LOGO_BASE_URL = `${CONFIG_BASE_URL}/Logos`;

export function useLogo() {
  const getLogoUrl = (teamName: string): string => {
    const normalizedName = normalizeTeamName(teamName);
    return `${LOGO_BASE_URL}/${normalizedName}.png`;
  };

  return {
    getLogoUrl,
  };
}
