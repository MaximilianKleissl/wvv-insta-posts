import { slugify, sortedMatchDaysForWeekend } from './grouping';
import type { SeasonData } from './types';

export interface ExportJob {
  slideId: string;
  fileName: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
}

export function buildExportJobs(season: SeasonData): ExportJob[] {
  const jobs: ExportJob[] = [];
  season.weekends.forEach((weekend, weekendIndex) => {
    if (weekend.matchDays.length > 1) {
      jobs.push({
        slideId: `overview-${weekendIndex}`,
        fileName: `wochenende_${weekendIndex + 1}_overview.png`,
        weekendIndex,
        kind: 'overview',
      });
    }
    sortedMatchDaysForWeekend(weekend).forEach((md) => {
      const originalIndex = weekend.matchDays.indexOf(md);
      jobs.push({
        slideId: `matchday-${weekendIndex}-${originalIndex}`,
        fileName: `wochenende_${weekendIndex + 1}_${slugify(md.team)}.png`,
        weekendIndex,
        kind: 'matchday',
      });
    });
  });
  return jobs;
}
