import type { MatchDay, Weekend } from "./types";

const GERMAN_WEEKDAYS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

/** Parses "DD.MM.YYYY" into a Date. Returns null if the format is unexpected. */
export function parseGermanDate(date: string): Date | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(date.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function germanWeekdayName(date: string): string {
  const parsed = parseGermanDate(date);
  if (!parsed) return "";
  return GERMAN_WEEKDAYS[parsed.getDay()];
}

/** True when a match day only lists participating teams, without known pairings/times (e.g. tournaments). */
export function isTournamentMatchDay(matchDay: MatchDay): boolean {
  return (!matchDay.matches || matchDay.matches.length === 0) && !!matchDay.teams && matchDay.teams.length > 0;
}

/** Sorts match days: home matches first, then away matches, each group chronological by date then earliest match time. */
export function sortMatchDays(matchDays: MatchDay[]): MatchDay[] {
  const earliestTime = (md: MatchDay): string => {
    if (!md.matches || md.matches.length === 0) return "99:99";
    return md.matches.reduce((min, m) => (m.time < min ? m.time : min), md.matches[0].time);
  };

  const withMeta = matchDays.map((md) => ({
    md,
    date: parseGermanDate(md.date)?.getTime() ?? Number.MAX_SAFE_INTEGER,
    time: earliestTime(md),
  }));

  withMeta.sort((a, b) => {
    if (a.md.home !== b.md.home) return a.md.home ? -1 : 1;
    if (a.date !== b.date) return a.date - b.date;
    return a.time.localeCompare(b.time);
  });

  return withMeta.map((w) => w.md);
}

export function sortedMatchDaysForWeekend(weekend: Weekend): MatchDay[] {
  return sortMatchDays(weekend.matchDays);
}

/** Sorts an individual match day's matches chronologically by time. */
export function sortMatches(matchDay: MatchDay): NonNullable<MatchDay["matches"]> {
  return [...(matchDay.matches ?? [])].sort((a, b) => a.time.localeCompare(b.time));
}

export function slugify(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

function formatGermanDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function formatGermanDateShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function weekStartKey(date: string): string {
  const parsed = parseGermanDate(date);
  if (!parsed) return date;

  const weekStart = new Date(parsed);
  const day = weekStart.getDay();
  const diff = (day + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
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

      const dateRange = parsedDates.length === 0
        ? ""
        : parsedDates[0].getTime() === parsedDates[parsedDates.length - 1].getTime()
          ? formatGermanDate(parsedDates[0])
          : `${formatGermanDate(parsedDates[0])}–${formatGermanDate(parsedDates[parsedDates.length - 1])}`;
      const dateRangeShort = parsedDates.length === 0
        ? ""
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
  const num = String(index + 1).padStart(2, "0");
  return `Wochenende_${num}_${weekend.dateRange.replace(/\./g, "-").replace(/ /g, "_")}`;
}
