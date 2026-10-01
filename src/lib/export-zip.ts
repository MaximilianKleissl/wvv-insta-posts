import JSZip from 'jszip';
import type { SeasonData } from './types';
import { renderSlideToPng, RETINA_PIXEL_RATIO } from './render-slide';
import {
  weekendFolderName,
  slugify,
  sortedMatchDaysForWeekend,
  isTournamentMatchDay,
  homeAwayLabel,
  type TeamMatchDays,
} from './grouping';
import { buildWeekendCaption } from './caption';

export interface ExportProgress {
  current: number;
  total: number;
  label: string;
}

export interface ZipExportResult {
  blob: Blob;
  /** Archive paths that could not be rasterised. One bad slide must not sink the whole export. */
  failedSlides: string[];
}

export interface ExportOptions {
  /** Retina renders are sharp but need a lot of canvas memory; 1 is the iOS-safe retry. */
  pixelRatio?: number;
}

/**
 * Rasterising a slide is heavy, synchronous main-thread work. Handing control back to the browser
 * between slides keeps the progress UI repainting and stops mobile Safari from treating the export
 * as a hung page.
 */
function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
}

interface RenderJob {
  /** Extension-less archive path, e.g. `Wochenende_01/mannschaft`. */
  basePath: string;
  /** Absent for caption-only jobs. */
  slideId?: string;
  caption?: string;
}

async function buildZip(
  jobs: RenderJob[],
  getSlideElement: ((slideId: string) => HTMLElement | null) | undefined,
  onProgress: ((progress: ExportProgress) => void) | undefined,
  options: ExportOptions,
): Promise<ZipExportResult> {
  const zip = new JSZip();
  const pixelRatio = options.pixelRatio ?? RETINA_PIXEL_RATIO;
  const failedSlides: string[] = [];

  let done = 0;
  for (const job of jobs) {
    if (job.slideId && getSlideElement) {
      const node = getSlideElement(job.slideId);
      if (node) {
        try {
          zip.file(`${job.basePath}.png`, await renderSlideToPng(node, pixelRatio));
        } catch (err) {
          failedSlides.push(`${job.basePath}.png`);
          console.error(`Failed to render ${job.basePath}.png`, err);
        }
      }
    }

    if (job.caption) {
      zip.file(`${job.basePath}.txt`, job.caption);
    }

    done += 1;
    onProgress?.({ current: done, total: jobs.length, label: job.basePath });
    await yieldToMainThread();
  }

  // `streamFiles` keeps peak memory down while deflating, which matters on phones.
  return { blob: await zip.generateAsync({ type: 'blob', streamFiles: true }), failedSlides };
}

/**
 * Renders each provided slide element to PNG and packages everything (PNGs + caption .txt files)
 * into a ZIP, preserving the `Wochenende_XX/file.png` + `file.txt` folder structure.
 *
 * `getSlideElement` must return the currently-mounted DOM node for a given slide id so we can
 * rasterize it — the caller is responsible for making sure the node is rendered (even off-screen)
 * before calling export.
 */
export async function exportSeasonZip(
  season: SeasonData,
  selectedWeekendIndexes?: number[],
  getSlideElement?: (slideId: string) => HTMLElement | null,
  onProgress?: (progress: ExportProgress) => void,
  options: ExportOptions = {},
): Promise<ZipExportResult> {
  const jobs: RenderJob[] = [];
  const weekendsToExport = selectedWeekendIndexes
    ? selectedWeekendIndexes.map((i) => season.weekends[i]).filter(Boolean)
    : season.weekends;

  weekendsToExport.forEach((weekend, index) => {
    const weekendIndex = selectedWeekendIndexes ? selectedWeekendIndexes[index] : index;
    const folder = weekendFolderName(season.weekends[weekendIndex], weekendIndex);

    // Caption-only job: no slideId, so nothing is rasterised for it.
    jobs.push({
      basePath: `${folder}/caption`,
      caption: buildWeekendCaption(season, weekendIndex),
    });

    if (weekend.matchDays.length > 1) {
      jobs.push({
        basePath: `${folder}/overview`,
        slideId: `overview-${weekendIndex}`,
      });
    }

    const sortedDays = sortedMatchDaysForWeekend(weekend);
    sortedDays.forEach((md) => {
      const originalIndex = weekend.matchDays.indexOf(md);
      jobs.push({
        basePath: `${folder}/${slugify(md.team)}`,
        slideId: `matchday-${weekendIndex}-${originalIndex}`,
      });
    });
  });

  return buildZip(jobs, getSlideElement, onProgress, options);
}

export async function exportTeamZip(
  season: SeasonData,
  teamData: TeamMatchDays,
  getSlideElement?: (slideId: string) => HTMLElement | null,
  onProgress?: (progress: ExportProgress) => void,
  options: ExportOptions = {},
): Promise<ZipExportResult> {
  const folderName = slugify(teamData.teamName);
  const jobs: RenderJob[] = [];
  const gameTypes = [
    { key: 'home', label: 'heim', isHome: true },
    { key: 'away', label: 'auswaerts', isHome: false },
  ] as const;
  let captionAttached = false;

  gameTypes.forEach(({ key, label, isHome }) => {
    if (teamData.matchDays.some((matchDay) => matchDay.home === isHome)) {
      jobs.push({
        basePath: `${folderName}/saison_uebersicht_${label}`,
        slideId: `team-${key}-${slugify(teamData.teamName)}`,
        ...(!captionAttached ? { caption: buildTeamCaption(season, teamData) } : {}),
      });
      captionAttached = true;
    }
  });

  return buildZip(jobs, getSlideElement, onProgress, options);
}

function buildTeamCaption(season: SeasonData, teamData: TeamMatchDays): string {
  const lines = [
    `Saison ${season.season}`,
    `Team: ${teamData.teamName}`,
    '',
    `Spieltage: ${teamData.matchDays.length}`,
    '',
    'Spieltagübersicht:',
  ];

  teamData.matchDays.forEach((md) => {
    lines.push(`- ${md.date}: ${homeAwayLabel(md.home)} in ${md.location}`);

    // Get opponents for this matchday
    const opponents: string[] = [];
    if (isTournamentMatchDay(md)) {
      opponents.push(...(md.teams?.filter((t) => t !== teamData.teamName) ?? []));
    } else if (md.matches) {
      opponents.push(...md.matches.map((m) => (m.home === teamData.teamName ? m.away : m.home)));
    }

    // Remove duplicates
    const uniqueOpponents = Array.from(new Set(opponents));

    if (uniqueOpponents.length > 0) {
      lines.push(`  Gegner: ${uniqueOpponents.join(', ')}`);
    }
  });

  return lines.join('\n');
}
