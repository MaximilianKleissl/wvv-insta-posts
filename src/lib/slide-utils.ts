import type { Match, MatchDay } from '@/lib/types';
import type { SlideTitle } from '@/lib/slide-types';
import { homeAwayLabel, isTournamentMatchDay } from '@/lib/grouping';

export function getMatchDaySlideTitle(matchDay: MatchDay): SlideTitle {
  const hasResults = matchDay.matches?.some((m) => m.result) ?? false;
  return {
    subtitle: matchDay.team,
    title: `${hasResults ? 'Ergebnisse vom ' : ''}${homeAwayLabel(matchDay.home)}spieltag`,
    label: [matchDay.location, matchDay.match_day_name, matchDay.date].filter(
      (label): label is string => Boolean(label),
    ),
  };
}

export function getMatchDayKey(matchDay: MatchDay): string {
  return `${matchDay.date}-${matchDay.team}-${matchDay.location}`;
}

export function getMatchKey(match: Match): string {
  return `${match.time}-${match.home}-${match.away}`;
}

/** Number of cells a match day renders: participating teams for tournaments, pairings otherwise. */
export function getMatchDayItemCount(matchDay: MatchDay): number {
  if (isTournamentMatchDay(matchDay)) {
    return matchDay.teams?.length ?? 0;
  }
  return matchDay.matches?.length ?? 0;
}

/** FNV-1a-ish hash so selections are stable across renders. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Deterministic Fisher-Yates shuffle seeded by a string or number. */
export function seededShuffle<T>(items: readonly T[], seed: string | number): T[] {
  let state = typeof seed === 'string' ? hashString(seed) : seed >>> 0;

  const random = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
