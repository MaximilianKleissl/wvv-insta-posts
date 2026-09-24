/**
 * Shared type definitions for slide components
 * Centralized types to avoid duplication across components
 */

import type { MatchDay, SeasonData } from '@/lib/types';
import type { SlideFormatMode } from '@/lib/slide-format';

export interface SlideTitle {
  subtitle: string;
  title: string;
  label: string[];
}

/** Common props for slides rendering a single match day (matchday + tournament). */
export interface SlideMatchdayProps {
  id: string;
  season: SeasonData;
  matchDay: MatchDay;
  format?: SlideFormatMode;
}

/** A match day paired with its pre-computed, de-duplicated opponent names. */
export interface MatchDayFixture {
  matchDay: MatchDay;
  opponents: string[];
}
