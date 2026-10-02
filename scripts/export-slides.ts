import { chromium, type Browser, type Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, 'images');

interface ExportOptions {
  configUrl?: string;
  baseUrl?: string;
  format?: 'portrait_4by5' | 'stories';
  pixelRatio?: number;
  onlyWeekends?: number[];
  timeoutMs?: number;
}

function getArg(name: string): string | undefined {
  const key = `--${name}=`;
  for (const a of process.argv) {
    if (a.startsWith(key)) return a.slice(key.length);
  }
  const envKey = name.toUpperCase().replace(/-/g, '_');
  return process.env[envKey];
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function waitForAppReady(page: Page) {
  await page.waitForFunction(() => {
    const w = window as unknown as { __APP_READY__?: boolean };
    if (w.__APP_READY__) return true;
    const el = document.querySelector('[data-app-ready="true"]');
    return !!el;
  }, { timeout: 120_000 });
}

interface ExportJob {
  slideId: string;
  fileName: string;
  weekendIndex: number;
  kind: string;
}

async function getExportJobs(page: Page, opts: ExportOptions) {
  const jobs = await page.evaluate(async (onlyWeekends: number[] | undefined, format: string) => {
    const fn = (window as unknown as { __getExportJobs?: (o: { onlyWeekends?: number[]; format?: string }) => Promise<ExportJob[]> }).__getExportJobs;
    if (typeof fn === 'function') {
      return await fn({ onlyWeekends, format });
    }
    return [] as ExportJob[];
  }, opts.onlyWeekends, opts.format ?? 'portrait_4by5');
  return jobs as ExportJob[];
}

async function renderSlide(page: Page, slideId: string, pixelRatio: number) {
  return await page.evaluate(async (slideId: string, pixelRatio: number) => {
    const node = document.getElementById(slideId);
    if (!node) throw new Error(`Missing node ${slideId}`);
    const w = window as unknown as {
      __renderSlideToPng?: (n: HTMLElement, p: number) => Promise<Blob>;
      htmlToImage?: { toBlob: (n: HTMLElement, o: unknown) => Promise<Blob> };
    };
    if (w.__renderSlideToPng) return await w.__renderSlideToPng(node, pixelRatio);
    if (w.htmlToImage?.toBlob) return await w.htmlToImage.toBlob(node, { pixelRatio, cacheBust: true });
    throw new Error('No renderer available on page');
  }, slideId, pixelRatio);
}

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const array = await blob.arrayBuffer();
  return Buffer.from(array);
}

export async function exportSlides(opts: ExportOptions = {}) {
  const baseUrl = opts.baseUrl ?? getArg('base-url') ?? getArg('baseUrl') ?? 'http://localhost:4173/wvv-insta-posts/';
  const configUrl = opts.configUrl ?? getArg('config-url') ?? getArg('configUrl');
  const format = (opts.format ?? getArg('format') ?? 'portrait_4by5') as 'portrait_4by5' | 'stories';
  const pixelRatio = Number(opts.pixelRatio ?? getArg('pixel-ratio') ?? 2);
  const onlyWeekends = getArg('only-weekends')
    ? getArg('only-weekends')!.split(',').map((n) => Number(n)).filter((n) => !Number.isNaN(n))
    : opts.onlyWeekends;

  const browser: Browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  await ensureDir(OUT_DIR);

  try {
    const url = new URL(baseUrl);
    if (configUrl) url.searchParams.set('config', configUrl);
    await page.goto(url.toString(), { waitUntil: 'networkidle', timeout: 180_000 });
    await waitForAppReady(page);
    const jobs = await getExportJobs(page, { ...opts, onlyWeekends, format });
    for (const j of jobs) {
      const blob = await renderSlide(page, j.slideId, pixelRatio);
      const buf = await blobToBuffer(blob);
      await fs.writeFile(path.join(OUT_DIR, j.fileName), buf);
      console.log(`Wrote ${j.fileName}`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  exportSlides().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
