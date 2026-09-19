import type { Match, MatchDay } from '@/lib/types';
import type { SlideTitle } from '@/lib/slide-types';

export function getMatchDaySlideTitle(matchDay: MatchDay): SlideTitle {
  return {
    subtitle: matchDay.team,
    title: `${matchDay.home ? 'Heim' : 'Auswärts'}-Spieltag`,
    label: matchDay.match_day_name ?? matchDay.date,
  };
}

export function isClubTeam(teamName: string, clubName: string): boolean {
  return teamName.startsWith(clubName);
}

export function getMatchDayKey(matchDay: MatchDay): string {
  return `${matchDay.date}-${matchDay.team}-${matchDay.location}`;
}

export function getMatchKey(match: Match): string {
  return `${match.time}-${match.home}-${match.away}`;
}
