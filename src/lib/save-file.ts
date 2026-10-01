/**
 * Saving generated files in a way that also works on iOS/iPadOS Safari.
 *
 * Two things break the classic `<a download>` + `URL.createObjectURL` trick on Apple mobile:
 *
 * 1. Safari resolves the blob asynchronously. Revoking the object URL in the same tick as the
 *    click (or even shortly after) makes the download silently vanish. The URL has to outlive the
 *    navigation by a wide margin.
 * 2. `<a download>` is not a path iOS actually guarantees. The Web Share API is – it is the only
 *    documented way to put a file into Files/Photos from Safari. The catch: `navigator.share`
 *    demands a *live* user gesture, and a ZIP export has long consumed its gesture by the time
 *    the archive exists.
 *
 * `saveFile` therefore prefers the share sheet on Apple mobile and keeps the anchor download
 * everywhere else. Callers that render for a while before saving should ask `needsShareFlow`
 * up front, so they can render first and then let the user confirm with a fresh tap.
 */

export type SaveOutcome = 'shared' | 'downloaded' | 'cancelled';

/** Safari only grabs the blob while handling the click's navigation. */
const OBJECT_URL_TTL_MS = 60_000;

function shareNavigator(): Navigator | null {
  return typeof navigator === 'undefined' ? null : navigator;
}

export function isAppleMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports itself as "Macintosh"; the touch points give it away.
  return (
    /Macintosh/.test(ua) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  );
}

function mimeTypeFor(fileName: string): string {
  if (fileName.endsWith('.zip')) return 'application/zip';
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
}

export function toFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type || mimeTypeFor(fileName) });
}

function canShareFile(file: File): boolean {
  const nav = shareNavigator();
  if (!nav || typeof nav.share !== 'function' || typeof nav.canShare !== 'function') return false;
  try {
    return nav.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * True when the file can only be saved from inside a fresh user gesture, i.e. the caller has to
 * render first and then ask the user to tap a save button instead of saving right after an
 * `await`. Always false on desktop/Android, where the anchor download is fine.
 */
export function needsShareFlow(fileName: string): boolean {
  if (!isAppleMobile()) return false;
  return canShareFile(new File([new Uint8Array([0])], fileName, { type: mimeTypeFor(fileName) }));
}

function triggerAnchorDownload(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoking later is the whole point: on Safari the blob is read after this tick returns.
  window.setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL_MS);
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

/**
 * Saves `blob` as `fileName`. On Apple mobile this opens the share sheet (which is what actually
 * persists the file); everywhere else it triggers a normal download. Call this from a user gesture
 * where possible – without one, iOS falls back to the anchor download.
 */
export async function saveFile(blob: Blob, fileName: string): Promise<SaveOutcome> {
  const file = toFile(blob, fileName);
  const nav = shareNavigator();

  if (nav && typeof nav.share === 'function' && isAppleMobile() && canShareFile(file)) {
    try {
      await nav.share({ files: [file] });
      return 'shared';
    } catch (err) {
      // The user dismissing the sheet is a normal outcome, not a failure.
      if (isAbortError(err)) return 'cancelled';
      // Otherwise (typically: the gesture expired while we were rendering) fall through to the
      // anchor download rather than losing the file.
    }
  }

  triggerAnchorDownload(file);
  return 'downloaded';
}

/** User-facing confirmation that differs per platform and file type. */
export function describeSaveOutcome(outcome: SaveOutcome, fileName: string): string | null {
  switch (outcome) {
    case 'shared':
      return fileName.endsWith('.png')
        ? 'Über „Sichern" in Fotos oder Dateien abgelegt.'
        : 'Über „Sichern" in „Dateien" abgelegt – dort lässt sich das ZIP entpacken.';
    case 'downloaded':
      return 'Download hat begonnen.';
    case 'cancelled':
      return 'Abgebrochen – es wurde nichts gespeichert.';
  }
}
