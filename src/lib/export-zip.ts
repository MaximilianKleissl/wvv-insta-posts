import JSZip from 'jszip';
import { toPng } from 'html-to-image';
import type { SeasonData } from './types';
import { weekendFolderName, slugify, sortedMatchDaysForWeekend } from './grouping';
import { buildWeekendCaption } from './caption';

export interface ExportProgress {
  current: number;
  total: number;
  label: string;
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
): Promise<Blob> {
  const zip = new JSZip();

  const jobs: { weekendIndex: number; slideId: string; fileBase: string; caption?: string }[] = [];

  const weekendsToExport = selectedWeekendIndexes
    ? selectedWeekendIndexes.map((i) => season.weekends[i]).filter(Boolean)
    : season.weekends;

  weekendsToExport.forEach((weekend, index) => {
    const weekendIndex = selectedWeekendIndexes ? selectedWeekendIndexes[index] : index;

    // Add weekend caption file
    jobs.push({
      weekendIndex,
      slideId: `caption-${weekendIndex}`,
      fileBase: 'caption',
      caption: buildWeekendCaption(season, weekendIndex),
    });

    if (weekend.matchDays.length > 1) {
      jobs.push({
        weekendIndex,
        slideId: `overview-${weekendIndex}`,
        fileBase: 'overview',
      });
    }

    const sortedDays = sortedMatchDaysForWeekend(weekend);
    sortedDays.forEach((md) => {
      const originalIndex = weekend.matchDays.indexOf(md);
      jobs.push({
        weekendIndex,
        slideId: `matchday-${weekendIndex}-${originalIndex}`,
        fileBase: slugify(md.team),
      });
    });
  });

  let done = 0;
  for (const job of jobs) {
    const folder = weekendFolderName(season.weekends[job.weekendIndex], job.weekendIndex);

    // Only render PNG for slide jobs (not caption-only jobs) and if getSlideElement is provided
    if (!job.slideId.startsWith('caption-') && getSlideElement) {
      const node = getSlideElement(job.slideId);
      if (node) {
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
        });
        const base64 = dataUrl.split(',')[1] ?? '';
        zip.file(`${folder}/${job.fileBase}.png`, base64, { base64: true });
      }
    }

    if (job.caption) {
      zip.file(`${folder}/${job.fileBase}.txt`, job.caption);
    }
    done += 1;
    onProgress?.({ current: done, total: jobs.length, label: `${folder}/${job.fileBase}` });
  }

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function seasonZipFileName(season: SeasonData): string {
  const seasonSlug = season.season.replace(/[^0-9a-zA-Z]/g, '-');
  return `${slugify(season.club)}_${seasonSlug}.zip`;
}
