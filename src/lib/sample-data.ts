import type { MatchDay, SeasonData } from './types';
import { buildWeekendsFromMatchDays } from './grouping';

const BASE_URL = 'https://maximiliankleissl.github.io/wvv-posts-config/Spiele';

export async function fetchSeasonData(): Promise<SeasonData> {
  // Fetch the file overview to get available files
  const overviewResponse = await fetch(`${BASE_URL}/File_Overview.json`);
  if (!overviewResponse.ok) {
    throw new Error('Failed to fetch file overview');
  }
  const files: string[] = await overviewResponse.json();

  // Fetch metadata
  const metadataResponse = await fetch(`${BASE_URL}/metadata.json`);
  if (!metadataResponse.ok) {
    throw new Error('Failed to fetch metadata');
  }
  const metadata = await metadataResponse.json();

  // Fetch all matchday files
  const matchDays: MatchDay[] = [];
  for (const file of files) {
    if (file === 'metadata.json' || file === 'File_Overview.json') continue;

    const response = await fetch(`${BASE_URL}/${file}`);
    if (!response.ok) {
      console.warn(`Failed to fetch ${file}`);
      continue;
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      matchDays.push(...data);
    }
  }

  return {
    season: metadata.season,
    club: metadata.club,
    weekends: buildWeekendsFromMatchDays(matchDays),
  };
}
