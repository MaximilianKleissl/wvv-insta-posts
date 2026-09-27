import type { MatchDay, SeasonData } from './types';
import { buildWeekendsFromMatchDays } from './grouping';
import { CONFIG_BASE_URL } from './config';

const BASE_URL = `${CONFIG_BASE_URL}/Spiele`;

/**
 * Fetches one JSON file from the config server and turns any failure into a
 * message the UI can show as-is (German, with a hint at what went wrong).
 */
async function fetchJsonFile<T>(url: string, label: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      `Keine Verbindung zum Konfigurationsserver. Bitte Internetverbindung prüfen und erneut laden. (${label})`,
    );
  }
  if (!response.ok) {
    throw new Error(`${label} konnte nicht geladen werden (HTTP ${response.status}).`);
  }
  return (await response.json()) as T;
}

export async function fetchSeasonData(): Promise<SeasonData> {
  // The file overview lists which matchday files exist for this season. Both
  // requests are independent, and the config host is not a CDN, so they run
  // concurrently along with the matchday files below.
  const [files, metadata] = await Promise.all([
    fetchJsonFile<string[]>(`${BASE_URL}/File_Overview.json`, 'Spielplan-Übersicht'),
    fetchJsonFile<{ season: string; club: string }>(
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
      fetchJsonFile<MatchDay[]>(`${BASE_URL}/${file}`, `Spieltag-Datei ${file}`).catch((err) => {
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
