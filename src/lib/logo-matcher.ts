/** Normalizes a team name into a stable lookup key (lowercase, no diacritics, no punctuation). */
export function normalizeTeamName(name: string): string {
  return name
    .replace('/', '')
    .replace(/\s+(?!VV$)[IVX]+$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
}
