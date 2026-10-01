import { toBlob } from 'html-to-image';

export const RETINA_PIXEL_RATIO = 2;
export const SAFE_PIXEL_RATIO = 1;

/**
 * `toBlob` signals trouble two different ways: it can throw, or it can resolve to `null` when the
 * canvas could not be encoded. Both happen far more readily on mobile Safari than on desktop, so
 * both have to be treated as "this render did not work".
 */
async function tryRender(node: HTMLElement, pixelRatio: number): Promise<Blob | null> {
  try {
    return await toBlob(node, { pixelRatio, cacheBust: true });
  } catch (err) {
    console.warn(`Render at ${pixelRatio}x failed.`, err);
    return null;
  }
}

/**
 * Rasterises a slide node to a PNG blob.
 *
 * Produces a Blob rather than the data-URL string that `toPng` returns: the data-URL variant forces
 * a full base64 copy of a multi-megapixel PNG through the JS heap, which is slow everywhere and
 * unreliable to hand to iOS as a download. Retries once at 1x before giving up, because a 2x
 * render of a full-bleed slide is exactly what runs a phone out of canvas memory.
 */
export async function renderSlideToPng(
  node: HTMLElement,
  pixelRatio: number = RETINA_PIXEL_RATIO,
): Promise<Blob> {
  const preferred = await tryRender(node, pixelRatio);
  if (preferred) return preferred;

  if (pixelRatio <= SAFE_PIXEL_RATIO) {
    throw new Error('Slide konnte nicht als PNG gerendert werden');
  }

  const fallback = await tryRender(node, SAFE_PIXEL_RATIO);
  if (!fallback) throw new Error('Slide konnte nicht als PNG gerendert werden');

  console.warn('Slide nur mit reduzierter Auflösung (1x) gerendert.');
  return fallback;
}
