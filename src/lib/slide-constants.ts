/**
 * Design tokens and constants for slide components
 * Centralized configuration for consistent styling across all slides
 */

// Action image configuration per team
export const ACTION_IMAGES = {
  DAMEN_1: ['damen1.png', 'damen1II.png'],
  HERREN_1: ['janne.png', 'herren1.png', 'herren1_2.jpeg'],
  HERREN_2: ['jugend_gesamt.png'],
  U_20W: ['jugend_gesamt.png'],
  U_18W: ['u18w.png', 'u18wII.png', 'u18wIII.png', 'u18wIV.png'],
  U_16W: ['jugend_gesamt.png'],
  U_14W: ['jugend_gesamt.png', 'u14w.png', 'u14.png'],
  U_20M: ['jugend_gesamt.png', 'u20m.png'],
  U_18M: ['jugend_gesamt.png'],
  U_16M: ['jugend_gesamt.png', 'u16m.png'],
  U_14M: ['jugend_gesamt.png', 'u14.png'],
  DEFAULT: ['baumbluetenumzug.jpg'],
} as const;

// Team name mappings for action images
export const TEAM_ACTION_IMAGE_MAP: Record<string, readonly string[]> = {
  'Damen 1': ACTION_IMAGES.DAMEN_1,
  'Herren 1': ACTION_IMAGES.HERREN_1,
  'Herren 2': ACTION_IMAGES.HERREN_2,
  'U20 - Weiblich': ACTION_IMAGES.U_20W,
  'U18 - Weiblich': ACTION_IMAGES.U_18W,
  'U16 - Weiblich': ACTION_IMAGES.U_16W,
  'U14 - Weiblich': ACTION_IMAGES.U_14W,
  'U20 - Männlich': ACTION_IMAGES.U_20M,
  'U18 - Männlich': ACTION_IMAGES.U_18M,
  'U16 - Männlich': ACTION_IMAGES.U_16M,
  'U14 - Männlich': ACTION_IMAGES.U_14M,
} as const;

// Badge labels
export const BADGE_LABELS = {
  HOME: 'Heimspiel',
  AWAY: 'Auswärtsspiel',
  HOME_SHORT: 'Heim',
  AWAY_SHORT: 'Auswärts',
} as const;
