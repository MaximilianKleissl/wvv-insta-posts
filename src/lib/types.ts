export interface MatchResult {
  home: number;
  away: number;
}

export interface Match {
  time: string;
  home: string;
  away: string;
  result?: MatchResult;
}

export interface MatchDay {
  team: string;
  home: boolean;
  match_day_result?: string;
  date: string;
  location: string;
  match_day_name?: string;
  homeTeam?: string;
  /**
   * Full schedule of matches (time + home/away). Use this when pairings and kickoff
   * times are already known.
   */
  matches?: Match[];
  /**
   * Use instead of `matches` for tournament-style match days where only the
   * participating teams are known, but not yet who plays whom or when.
   */
  teams?: string[];
}

export interface Weekend {
  dateRange: string;
  dateRangeShort: string;
  matchDays: MatchDay[];
}

export interface SeasonData {
  season: string;
  club: string;
  weekends: Weekend[];
}

export interface LogoEntry {
  /** normalized team name used as the lookup key */
  key: string;
  /** original team name as uploaded */
  name: string;
  /** data URL of the logo image */
  dataUrl: string;
}

export type LogoLibrary = Record<string, string>;

export type TemplateId = 'classic';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
}

export interface GeneratedSlide {
  id: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
  matchDayIndex?: number;
  title: string;
  caption: string;
  /** file name (without extension) used for export */
  fileName: string;
}
