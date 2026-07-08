/**
 * Design tokens and constants for slide components
 * Centralized configuration for consistent styling across all slides
 */

// Action image configuration per team
export const ACTION_IMAGES = {
  DAMEN_1: ['damen1.png'],
  HERREN_1: ['janne.png', 'herren1.png', 'herren1_2.png'],
  DEFAULT: ['baumbluetenumzug.jpg'],
} as const;

// Team name mappings for action images
export const TEAM_ACTION_IMAGE_MAP: Record<string, readonly string[]> = {
  'Damen 1': ACTION_IMAGES.DAMEN_1,
  'Herren 1': ACTION_IMAGES.HERREN_1,
} as const;

// Badge labels
export const BADGE_LABELS = {
  HOME: 'Heimspiel',
  AWAY: 'Auswärtsspiel',
  HOME_SHORT: 'Heim',
  AWAY_SHORT: 'Auswärts',
} as const;
