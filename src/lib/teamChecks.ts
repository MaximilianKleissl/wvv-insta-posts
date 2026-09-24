import type { MatchDay } from './types';
import { normalizeTeamName } from './logo-matcher';

/** Repo path of a team's logo file from its (raw or already normalized) name. */
export function logoPathForTeam(team: string): string {
  return `Logos/${normalizeTeamName(team)}.png`;
}

/** All teams in the matchday data, used for filters and validation. */
export function collectTeamNames(matchdayFiles: Record<string, MatchDay[]>): Set<string> {
  const teams = new Set<string>();
  for (const matchDays of Object.values(matchdayFiles)) {
    for (const md of matchDays) {
      if (md.team) teams.add(md.team);
      for (const match of md.matches ?? []) {
        if (match.home) teams.add(match.home);
        if (match.away) teams.add(match.away);
      }
    }
  }
  return teams;
}

/** The club's own teams that appear in the data (distinct `team` field). */
export function collectClubTeams(matchdayFiles: Record<string, MatchDay[]>): Set<string> {
  const teams = new Set<string>();
  for (const matchDays of Object.values(matchdayFiles)) {
    for (const md of matchDays) if (md.team) teams.add(md.team);
  }
  return teams;
}

/** Participant teams that need a logo (all teams from `teams`/`matches` arrays). */
export function collectParticipantTeams(matchdayFiles: Record<string, MatchDay[]>): Set<string> {
  const teams = new Set<string>();
  for (const matchDays of Object.values(matchdayFiles)) {
    for (const md of matchDays) {
      for (const team of md.teams ?? []) if (team) teams.add(team);
      for (const match of md.matches ?? []) {
        if (match.home) teams.add(match.home);
        if (match.away) teams.add(match.away);
      }
    }
  }
  return teams;
}

/** Opponent teams (participants that are not club teams and not the club name). */
export function collectOpponentTeams(
  matchdayFiles: Record<string, MatchDay[]>,
  clubTeams: ReadonlySet<string>,
  clubName: string,
): Set<string> {
  const opponents = new Set<string>();
  for (const team of collectParticipantTeams(matchdayFiles)) {
    if (team && !clubTeams.has(team) && team !== clubName) opponents.add(team);
  }
  return opponents;
}
