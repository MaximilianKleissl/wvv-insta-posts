/**
 * Saving generated files in a way that also works on iOS/iPadOS Safari, and reporting honestly
 * when it does not.
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
 * Nothing in here is allowed to fail quietly: every attempt ends in a `SaveResult` that the UI can
 * turn into a message, and `describeEnvironment` makes the next bug report actionable.
 */

import type { ToastType } from '@/composables/useToast';

export type SaveFailureReason =
  /** The share sheet refused to open because the tap that triggered it was too old. */
  | 'no-user-gesture'
  /** Anything else the platform reported. */
  | 'rejected';

export type SaveResult =
  | { status: 'shared' }
  /** `reliable: false` means we had to fall back to the anchor download, which iOS may ignore. */
  | { status: 'downloaded'; reliable: boolean }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: SaveFailureReason; detail: string; recoverable: boolean };

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

function probeFile(fileName: string): File {
  return new File([new Uint8Array([0])], fileName, { type: mimeTypeFor(fileName) });
}

/**
 * True when the file can only be saved from inside a fresh user gesture, i.e. the caller has to
 * render first and then ask the user to tap a save button instead of saving right after an
 * `await`. Always false on desktop/Android, where the anchor download is fine.
 */
export function needsShareFlow(fileName: string): boolean {
  if (!isAppleMobile()) return false;
  return canShareFile(probeFile(fileName));
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

function describeThrown(err: unknown): string {
  if (err instanceof DOMException) return `${err.name}: ${err.message}`;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

/**
 * Saves `blob` as `fileName`. On Apple mobile this opens the share sheet (which is what actually
 * persists the file); everywhere else it triggers a normal download. Call this from a user gesture
 * where possible – without one, iOS rejects the share sheet and the result says so.
 */
export async function saveFile(blob: Blob, fileName: string): Promise<SaveResult> {
  const file = toFile(blob, fileName);
  const nav = shareNavigator();
  const shareable = nav !== null && typeof nav.share === 'function' && canShareFile(file);

  if (nav && isAppleMobile() && shareable) {
    try {
      await nav.share({ files: [file] });
      return { status: 'shared' };
    } catch (err) {
      if (isAbortError(err)) return { status: 'cancelled' };

      const detail = describeThrown(err);
      // The gesture expired – typically because rendering outlived the tap. The file itself is
      // fine, so the caller can offer a retry instead of forcing a full re-export.
      const recoverable = err instanceof DOMException && err.name === 'NotAllowedError';
      return {
        status: 'failed',
        reason: recoverable ? 'no-user-gesture' : 'rejected',
        detail,
        recoverable,
      };
    }
  }

  // Apple devices without share support: the anchor click is all that is left, and iOS may
  // silently ignore it. Say so instead of claiming success.
  triggerAnchorDownload(file);
  return { status: 'downloaded', reliable: !isAppleMobile() || !shareable };
}

export interface SaveFeedback {
  message: string;
  type: ToastType;
  detail?: string;
}

/** Turns a `SaveResult` into something the user can act on. */
export function describeSaveResult(result: SaveResult, fileName: string): SaveFeedback {
  switch (result.status) {
    case 'shared':
      return fileName.endsWith('.png')
        ? {
            message: 'Über „Sichern“ in Fotos oder Dateien abgelegt.',
            type: 'success',
          }
        : {
            message: 'Über „Sichern“ in „Dateien“ abgelegt – dort lässt sich das ZIP entpacken.',
            type: 'success',
          };

    case 'downloaded':
      return result.reliable
        ? { message: 'Download hat begonnen.', type: 'success' }
        : {
            message:
              'Download angestoßen – iOS ignoriert das aber gelegentlich. Falls nichts passiert, ' +
              'über das Teilen-Menü des Browsers sichern.',
            type: 'warning',
            detail: describeEnvironment(),
          };

    case 'cancelled':
      return { message: 'Abgebrochen – es wurde nichts gespeichert.', type: 'warning' };

    case 'failed':
      return result.reason === 'no-user-gesture'
        ? {
            message:
              'Der Browser hat das Speichern blockiert, weil die Bestätigung zu lange her ist.',
            type: 'error',
            detail: `Noch einmal auf „Jetzt speichern“ tippen. ${result.detail}`,
          }
        : {
            message: 'Speichern fehlgeschlagen.',
            type: 'error',
            detail: `${result.detail} · ${describeEnvironment()}`,
          };
  }
}

/**
 * One-line capability report, attached to error and warning messages so a bug report carries the
 * information needed to tell an unsupported platform apart from a real bug.
 */
export function describeEnvironment(): string {
  if (typeof navigator === 'undefined') return 'Umgebung unbekannt';
  const nav = navigator;
  const yes = (v: boolean) => (v ? 'ja' : 'nein');
  const mem = (nav as Navigator & { deviceMemory?: number }).deviceMemory;

  return [
    `Plattform: ${isAppleMobile() ? 'iOS/iPadOS' : 'Desktop/Android'}`,
    `Browser: ${nav.userAgent}`,
    `Teilen-API: ${yes(typeof nav.share === 'function')}`,
    `Teilt ZIP: ${yes(canShareFile(probeFile('probe.zip')))}`,
    `Teilt PNG: ${yes(canShareFile(probeFile('probe.png')))}`,
    `Sicherer Kontext: ${yes(window.isSecureContext)}`,
    `DPR: ${window.devicePixelRatio}`,
    `Kerne: ${nav.hardwareConcurrency ?? 'unbekannt'}`,
    mem !== undefined ? `RAM: ${mem} GB` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
