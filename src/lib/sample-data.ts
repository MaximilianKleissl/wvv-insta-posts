import type { MatchDay, SeasonData } from './types';
import { buildWeekendsFromMatchDays } from './grouping';

// Dynamically load all JSON files from sample-data directory
const sampleDataModules = import.meta.glob<{ default: unknown }>('./sample-data/*.json', {
  eager: true,
});

const SAMPLE_METADATA = (() => {
  const metadataModule = sampleDataModules['./sample-data/metadata.json'];
  return metadataModule?.default as { season: string; club: string };
})();

const SAMPLE_MATCH_DAYS = (() => {
  const matchDays: MatchDay[] = [];
  for (const [path, module] of Object.entries(sampleDataModules)) {
    if (path.includes('metadata.json')) continue;
    const data = module.default as MatchDay[];
    if (Array.isArray(data)) {
      matchDays.push(...data);
    }
  }
  return matchDays;
})();

export const SAMPLE_SEASON_DATA: SeasonData = {
  season: SAMPLE_METADATA.season,
  club: SAMPLE_METADATA.club,
  weekends: buildWeekendsFromMatchDays(SAMPLE_MATCH_DAYS),
};

export const SAMPLE_SEASON_METADATA_JSON = JSON.stringify(
  { season: SAMPLE_SEASON_DATA.season, club: SAMPLE_SEASON_DATA.club },
  null,
  2,
);
export const SAMPLE_SEASON_MATCHDAYS_JSON = JSON.stringify(SAMPLE_MATCH_DAYS, null, 2);

export const SAMPLE_SEASON_FILES = [
  { name: 'metadata.json', content: SAMPLE_SEASON_METADATA_JSON },
  { name: 'matchdays.json', content: SAMPLE_SEASON_MATCHDAYS_JSON },
];

export const SAMPLE_SEASON_JSON = JSON.stringify(SAMPLE_SEASON_DATA, null, 2);
