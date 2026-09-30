import type { MatchDay, SeasonData } from './types';
import { buildWeekendsFromMatchDays } from './grouping';
import { CONFIG_BASE_URL } from './config';
import { fetchConfigJson } from './config-fetch';

const BASE_URL = `${CONFIG_BASE_URL}/Spiele`;

export async function fetchSeasonData(): Promise<SeasonData> {
  // The file overview lists which matchday files exist for this season. Both
  // requests are independent, and the config host is not a CDN, so they run
  // concurrently along with the matchday files below.
  const [files, metadata] = await Promise.all([
    fetchConfigJson<string[]>(`${BASE_URL}/File_Overview.json`, 'Spielplan-Übersicht'),
    fetchConfigJson<{ season: string; club: string }>(
      `${BASE_URL}/metadata.json`,
      'Saison-Metadaten',
    ),
  ]);

  const matchDayFiles = files.filter(
    (file) => file !== 'metadata.json' && file !== 'File_Overview.json',
  );

  // A single unreadable matchday file must not hide the rest of the season.
  const perFile = await Promise.all(
    matchDayFiles.map((file) =>
      fetchConfigJson<MatchDay[]>(`${BASE_URL}/${file}`, `Spieltag-Datei ${file}`).catch((err) => {
        console.warn(`Failed to fetch ${file}`, err);
        return null;
      }),
    ),
  );
  const matchDays = perFile.flatMap((data) => (Array.isArray(data) ? data : []));

  return {
    season: metadata.season,
    club: metadata.club,
    weekends: buildWeekendsFromMatchDays(matchDays),
  };
}
