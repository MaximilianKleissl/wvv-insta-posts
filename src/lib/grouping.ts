import type { MatchDay, Weekend, SeasonData } from './types';

const GERMAN_WEEKDAYS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];

/** Parses "DD.MM.YYYY" into a Date. Returns null if the format is unexpected. */
export function parseGermanDate(date: string): Date | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(date.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * Rewrites free-form input into "DD.MM.YYYY" by keeping the digits and placing
 * the separators, so partial input grows into the format instead of drifting
 * away from it. Anything that is not a digit is dropped.
 */
export function maskGermanDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

/**
 * Strict check for "DD.MM.YYYY". Unlike `parseGermanDate` it also rejects dates
 * that do not exist, which the Date constructor would silently roll over
 * (31.02.2025 would become 03.03.2025).
 */
export function isValidGermanDate(value: string): boolean {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (!match) return false;
  const [, day, month, year] = match;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (m < 1 || m > 12) return false;
  return d >= 1 && d <= new Date(y, m, 0).getDate();
}

export function germanWeekdayName(date: string): string {
  const parsed = parseGermanDate(date);
  if (!parsed) return '';
  return GERMAN_WEEKDAYS[parsed.getDay()];
}

/** German home/away wording: "Heim"/"Auswärts" (short), "Heimspiel"/"Auswärtsspiel" (long), or their plurals. */
export function homeAwayLabel(
  isHome: boolean,
  variant: 'short' | 'long' | 'plural' = 'short',
): string {
  if (variant === 'long') return isHome ? 'Heimspiel' : 'Auswärtsspiel';
  if (variant === 'plural') return isHome ? 'Heimspiele' : 'Auswärtsspiele';
  return isHome ? 'Heim' : 'Auswärts';
}

/** True when a match day only lists participating teams, without known pairings/times (e.g. tournaments). */
export function isTournamentMatchDay(matchDay: MatchDay): boolean {
  return (
    (!matchDay.matches || matchDay.matches.length === 0) &&
    !!matchDay.teams &&
    matchDay.teams.length > 0
  );
}

/** Earliest kick-off of a match day as "HH:MM"; match days without pairings (e.g. tournaments) sort last. */
function earliestMatchTime(matchDay: MatchDay): string {
  if (!matchDay.matches || matchDay.matches.length === 0) return '99:99';
  return matchDay.matches.reduce(
    (min, m) => (m.time < min ? m.time : min),
    matchDay.matches[0].time,
  );
}

/** Match day date as a comparable timestamp; unparsable dates sort last. */
function matchDayTimestamp(matchDay: MatchDay): number {
  return parseGermanDate(matchDay.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

/** Decorates each match day with the keys the sort orders use, computed once per comparison-free pass. */
function withSortKeys(matchDays: MatchDay[]) {
  return matchDays.map((md) => ({ md, date: matchDayTimestamp(md), time: earliestMatchTime(md) }));
}

/** Sorts match days: home matches first, then away matches, each group chronological by date then earliest match time. */
export function sortMatchDays(matchDays: MatchDay[]): MatchDay[] {
  return withSortKeys(matchDays)
    .sort((a, b) => {
      if (a.md.home !== b.md.home) return a.md.home ? -1 : 1;
      if (a.date !== b.date) return a.date - b.date;
      return a.time.localeCompare(b.time);
    })
    .map((w) => w.md);
}

/**
 * Sorts match days purely chronologically: by date, then by earliest match
 * time, and only then home before away as a tie-break within one slot. The
 * weekend overview uses this, because grouping by home/away would otherwise
 * push a Saturday match below a Sunday one.
 */
export function sortMatchDaysByDate(matchDays: MatchDay[]): MatchDay[] {
  return withSortKeys(matchDays)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date - b.date;
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      if (a.md.home !== b.md.home) return a.md.home ? -1 : 1;
      return 0;
    })
    .map((w) => w.md);
}

export function sortedMatchDaysForWeekend(weekend: Weekend): MatchDay[] {
  return sortMatchDays(weekend.matchDays);
}

/** Sorts an individual match day's matches chronologically by time. */
export function sortMatches(matchDay: MatchDay): NonNullable<MatchDay['matches']> {
  return [...(matchDay.matches ?? [])].sort((a, b) => a.time.localeCompare(b.time));
}

export function slugify(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
}

function formatGermanDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatGermanDateShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function weekStartKey(date: string): string {
  const parsed = parseGermanDate(date);
  if (!parsed) return date;

  const weekStart = new Date(parsed);
  const day = weekStart.getDay();
  const diff = (day + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
}

export function buildWeekendsFromMatchDays(matchDays: MatchDay[]): Weekend[] {
  const sortedMatchDays = [...matchDays].sort((a, b) => {
    const aDate = parseGermanDate(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDate = parseGermanDate(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });

  const grouped = new Map<string, MatchDay[]>();

  sortedMatchDays.forEach((md) => {
    const key = weekStartKey(md.date);
    const current = grouped.get(key) ?? [];
    current.push(md);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, days]) => {
      const sortedDays = sortMatchDays(days);
      const parsedDates = sortedDays
        .map((day) => parseGermanDate(day.date))
        .filter((date): date is Date => !!date)
        .sort((a, b) => a.getTime() - b.getTime());

      const dateRange =
        parsedDates.length === 0
          ? ''
          : parsedDates[0].getTime() === parsedDates[parsedDates.length - 1].getTime()
            ? formatGermanDate(parsedDates[0])
            : `${formatGermanDate(parsedDates[0])}–${formatGermanDate(parsedDates[parsedDates.length - 1])}`;
      const dateRangeShort =
        parsedDates.length === 0
          ? ''
          : parsedDates[0].getTime() === parsedDates[parsedDates.length - 1].getTime()
            ? formatGermanDateShort(parsedDates[0])
            : `${formatGermanDateShort(parsedDates[0])}–${formatGermanDateShort(parsedDates[parsedDates.length - 1])}`;

      return {
        dateRange,
        dateRangeShort,
        matchDays: sortedDays,
      } satisfies Weekend;
    });
}

export function weekendFolderName(weekend: Weekend, index: number): string {
  const num = String(index + 1).padStart(2, '0');
  return `Wochenende_${num}_${weekend.dateRange.replace(/\./g, '-').replace(/ /g, '_')}`;
}

export interface TeamMatchDays {
  teamName: string;
  matchDays: MatchDay[];
}

export function groupMatchDaysByTeam(seasonData: SeasonData): TeamMatchDays[] {
  const teamMap = new Map<string, MatchDay[]>();

  seasonData.weekends.forEach((weekend) => {
    weekend.matchDays.forEach((matchDay) => {
      const teamName = matchDay.team.trim();
      if (!teamMap.has(teamName)) {
        teamMap.set(teamName, []);
      }
      teamMap.get(teamName)!.push(matchDay);
    });
  });

  return Array.from(teamMap.entries())
    .map(([teamName, matchDays]) => ({
      teamName,
      matchDays: sortMatchDays(matchDays),
    }))
    .sort((a, b) => a.teamName.localeCompare(b.teamName));
}
