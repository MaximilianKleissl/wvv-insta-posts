import type { LogoLibrary } from './types';

const LOGO_STORAGE_KEY = 'wvv-logo-library-v1';

/** Normalizes a team name into a stable lookup key (lowercase, no diacritics, no punctuation). */
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace('/', '')
    .replace(/ [0-9]+/, '')
    .trim()
    .replace(/[i,v]+$/, '') //replace end with latin numbers with ""
    .trim()
    .replace(' ', '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]*/g, '')
    .replace('volleyballverein', '')
    .replace('sv ', '')
    .replace('vc ', '')
    .replace('sv', '')
    .replace('vc', '')
    .replace('vv', '')
    .replace(/\d*/, '');
}

export function loadLogoLibrary(): LogoLibrary {
  try {
    const raw = localStorage.getItem(LOGO_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LogoLibrary;
  } catch {
    return {};
  }
}

export function saveLogoLibrary(library: LogoLibrary): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(library));
  } catch {
    // localStorage quota exceeded or unavailable; fail silently, in-memory state still works
  }
}

export function addLogoToLibrary(
  library: LogoLibrary,
  teamName: string,
  dataUrl: string,
): LogoLibrary {
  const key = normalizeTeamName(teamName);
  const next = { ...library, [key]: dataUrl };
  saveLogoLibrary(next);
  return next;
}

export function removeLogoFromLibrary(library: LogoLibrary, teamName: string): LogoLibrary {
  const key = normalizeTeamName(teamName);
  const next = { ...library };
  delete next[key];
  saveLogoLibrary(next);
  return next;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Guesses a team name from an uploaded file name, e.g. "VC BW Brandenburg.png" -> "VC BW Brandenburg". */
export function guessTeamNameFromFileName(fileName: string): string {
  return fileName.replace(/\.[a-zA-Z0-9]+$/, '').trim();
}
