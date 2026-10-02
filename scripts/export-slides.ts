import { chromium, type Browser, type Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, 'images');

interface ExportOptions {
  configUrl?: string;
  baseUrl?: string;
  format?: 'portrait_4by5' | 'stories';
  imageFormat?: 'png' | 'jpeg';
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
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __APP_READY__?: boolean };
      if (w.__APP_READY__) return true;
      const el = document.querySelector('[data-app-ready="true"]');
      return !!el;
    },
    { timeout: 120_000 },
  );
}

interface ExportJob {
  slideId: string;
  fileName: string;
  weekendIndex: number;
  kind: string;
}

async function getExportJobs(page: Page, opts: ExportOptions) {
  const jobs = await page.evaluate(
    async (args: { onlyWeekends: number[] | undefined; format: string }) => {
      const fn = (
        window as unknown as {
          __getExportJobs?: (o: {
            onlyWeekends?: number[];
            format?: string;
          }) => Promise<ExportJob[]>;
        }
      ).__getExportJobs;
      if (typeof fn === 'function') {
        return await fn({ onlyWeekends: args.onlyWeekends, format: args.format });
      }
      return [] as ExportJob[];
    },
    { onlyWeekends: opts.onlyWeekends, format: opts.format ?? 'portrait_4by5' },
  );
  return jobs as ExportJob[];
}

async function selectFormat(page: Page, format: 'portrait_4by5' | 'stories', slideId: string) {
  const dimensions =
    format === 'stories' ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 };
  const label = format === 'stories' ? 'Stories' : 'Portrait 4:5';
  await page
    .getByRole('group', { name: 'Bildformat' })
    .getByRole('button', { name: label })
    .click();
  await page.waitForFunction(
    (args) => {
      const slide = document.getElementById(args.slideId);
      const selected = document.querySelector(
        '[aria-label="Bildformat"] button[aria-pressed="true"]',
      );
      return (
        slide?.style.width === `${args.width}px` &&
        slide.style.height === `${args.height}px` &&
        selected?.textContent?.trim() === args.label
      );
    },
    { slideId, ...dimensions, label },
    { timeout: 10_000 },
  );
}

async function waitForRenderAssets(page: Page, slideIds: string[]) {
  await page.evaluate(async (ids) => {
    await Promise.all(
      ['400', '600', '700', '900'].map((weight) =>
        document.fonts.load(`${weight} 16px Montserrat`),
      ),
    );
    await document.fonts.ready;

    const urls = new Set<string>();
    const imageElements: HTMLImageElement[] = [];
    for (const id of ids) {
      const slide = document.getElementById(id);
      if (!slide) throw new Error(`Missing slide ${id}`);
      const elements = [slide, ...slide.querySelectorAll<HTMLElement>('*')];
      for (const element of elements) {
        if (element instanceof HTMLImageElement) imageElements.push(element);
        const backgroundImage = getComputedStyle(element).backgroundImage;
        for (const match of backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)) {
          if (match[1]) urls.add(new URL(match[1], document.baseURI).href);
        }
      }
    }

    await Promise.all([
      ...imageElements.map((image) => image.decode().catch(() => undefined)),
      ...[...urls].map(
        (src) =>
          new Promise<void>((resolve) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = src;
            if (image.complete) resolve();
          }),
      ),
    ]);

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }, slideIds);
}

/**
 * Rasterizes one slide and returns encoded image bytes.
 *
 * `page.evaluate` cannot return a `Blob` (it is not part of the value
 * serialization protocol), so the page encodes the bytes as base64 and Node
 * decodes them again. Chunks keep `String.fromCharCode` below its argument
 * limit for full-size 1080x1350 slides.
 */
async function renderSlide(
  page: Page,
  slideId: string,
  pixelRatio: number,
  imageFormat: 'png' | 'jpeg',
): Promise<Buffer> {
  const base64 = await page.evaluate(
    async (args: { slideId: string; pixelRatio: number; imageFormat: 'png' | 'jpeg' }) => {
      const node = document.getElementById(args.slideId);
      if (!node) throw new Error(`Missing node ${args.slideId}`);
      const w = window as unknown as {
        __renderSlideToPng?: (n: HTMLElement, p: number) => Promise<Blob>;
        htmlToImage?: { toBlob: (n: HTMLElement, o: unknown) => Promise<Blob> };
      };
      let blob: Blob;
      if (w.__renderSlideToPng) {
        blob = await w.__renderSlideToPng(node, args.pixelRatio);
      } else if (w.htmlToImage?.toBlob) {
        blob = await w.htmlToImage.toBlob(node, {
          pixelRatio: args.pixelRatio,
          cacheBust: true,
        });
      } else {
        throw new Error('No renderer available on page');
      }
      if (args.imageFormat === 'jpeg') {
        const image = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create canvas context');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        image.close();
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error('JPEG encoding failed'))),
            'image/jpeg',
            0.88,
          );
        });
      }
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    },
    { slideId, pixelRatio, imageFormat },
  );
  return Buffer.from(base64, 'base64');
}

export async function exportSlides(opts: ExportOptions = {}) {
  const baseUrl =
    opts.baseUrl ??
    getArg('base-url') ??
    getArg('baseUrl') ??
    'http://localhost:4173/wvv-insta-posts/';
  const configUrl = opts.configUrl ?? getArg('config-url') ?? getArg('configUrl');
  const format = (opts.format ?? getArg('format') ?? 'portrait_4by5') as
    'portrait_4by5' | 'stories';
  const imageFormat = (opts.imageFormat ?? getArg('image-format') ?? 'png') as 'png' | 'jpeg';
  const pixelRatio = Number(opts.pixelRatio ?? getArg('pixel-ratio') ?? 1);
  const onlyWeekends = getArg('only-weekends')
    ? getArg('only-weekends')!
        .split(',')
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n))
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
    if (jobs.length > 0) {
      await selectFormat(page, format, jobs[0].slideId);
      await waitForRenderAssets(
        page,
        jobs.map((job) => job.slideId),
      );
    }
    for (const j of jobs) {
      const buf = await renderSlide(page, j.slideId, pixelRatio, imageFormat);
      const extension = imageFormat === 'jpeg' ? '.jpg' : '.png';
      const baseName = j.fileName.replace(/\.png$/, '');
      const fileName = `${baseName}${format === 'stories' ? '_stories' : ''}${extension}`;
      await fs.writeFile(path.join(OUT_DIR, fileName), buf);
      console.log(`Wrote ${fileName} at ${pixelRatio}x`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  exportSlides().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
