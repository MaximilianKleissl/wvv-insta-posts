import { buildExportJobs, type ExportJob } from '@/lib/export-jobs';
import { renderSlideToPng } from '@/lib/render-slide';
import type { SeasonData } from '@/lib/types';

declare global {
  interface Window {
    __APP_READY__?: boolean;
    __getExportJobs?: (opts: { onlyWeekends?: number[]; format?: string }) => Promise<ExportJob[]>;
    __renderSlideToPng?: (node: HTMLElement, pixelRatio: number) => Promise<Blob>;
  }
}

export function exposeHeadlessExportApis(season: SeasonData | null) {
  if (typeof window === 'undefined') return;
  window.__APP_READY__ = !!season;
  window.__getExportJobs = async (opts: { onlyWeekends?: number[]; format?: string } = {}) => {
    if (!season) return [];
    let jobs = buildExportJobs(season);
    if (opts.onlyWeekends && opts.onlyWeekends.length > 0) {
      jobs = jobs.filter((j) => opts.onlyWeekends!.includes(j.weekendIndex));
    }
    return jobs;
  };
  window.__renderSlideToPng = async (node: HTMLElement, pixelRatio: number) => {
    return await renderSlideToPng(node, pixelRatio);
  };
}
