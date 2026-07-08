import { z } from 'zod';
import type { SeasonData, MatchDay } from './types';
import { buildWeekendsFromMatchDays } from './grouping';

const matchSchema = z.object({
  time: z.string().min(1, 'Uhrzeit fehlt'),
  home: z.string().min(1, 'Heimteam fehlt'),
  away: z.string().min(1, 'Gastteam fehlt'),
});

const matchDaySchema = z
  .object({
    team: z.string().min(1, 'Teamname fehlt'),
    home: z.boolean({ message: "'home' muss true oder false sein" }),
    date: z.string().min(1, 'Datum fehlt'),
    location: z.string().min(1, 'Spielort fehlt'),
    matches: z.array(matchSchema).optional(),
    teams: z.array(z.string().min(1, 'Teamname darf nicht leer sein')).optional(),
  })
  .refine((md) => (md.matches && md.matches.length > 0) || (md.teams && md.teams.length >= 2), {
    message:
      "Entweder 'matches' (mit mindestens einem Spiel) oder 'teams' (mit mindestens zwei teilnehmenden Mannschaften, falls Gegner/Uhrzeit noch unbekannt sind) muss angegeben werden",
  });

const weekendSchema = z.object({
  dateRange: z.string().min(1, 'Datumsbereich fehlt'),
  matchDays: z.array(matchDaySchema).min(1, 'Mindestens ein Spieltag wird benötigt'),
});

const legacyWeekendSchema = z.object({
  dateRange: z.string().min(1, 'Datumsbereich fehlt'),
  weekendTitle: z.string().min(1).optional(),
  matchDays: z.array(matchDaySchema).min(1, 'Mindestens ein Spieltag wird benötigt'),
});

export const seasonSchema = z.object({
  season: z.string().min(1, 'Saison fehlt'),
  club: z.string().min(1, 'Vereinsname fehlt'),
  weekends: z.array(weekendSchema).min(1, 'Mindestens ein Wochenende wird benötigt'),
});

const legacySeasonSchema = z.object({
  season: z.string().min(1, 'Saison fehlt'),
  club: z.string().min(1, 'Vereinsname fehlt'),
  weekends: z.array(legacyWeekendSchema).min(1, 'Mindestens ein Wochenende wird benötigt'),
});

const metadataSchema = z.object({
  season: z.string().min(1, 'Saison fehlt'),
  club: z.string().min(1, 'Vereinsname fehlt'),
});

const matchDaysArraySchema = z
  .array(matchDaySchema)
  .min(1, 'Mindestens ein Spieltag wird benötigt');

export type ValidationIssue = {
  path: string;
  message: string;
};

export interface ValidationResult {
  success: boolean;
  data?: SeasonData;
  issues?: ValidationIssue[];
  parseError?: string;
}

export interface ImportFileSource {
  name: string;
  content: string;
}

function isLegacySeasonShape(
  value: unknown,
): value is {
  season: string;
  club: string;
  weekends: Array<{ dateRange: string; matchDays: MatchDay[] }>;
} {
  return legacySeasonSchema.safeParse(value).success;
}

function isMetadataShape(value: unknown): value is { season: string; club: string } {
  return metadataSchema.safeParse(value).success;
}

function isMatchDaysArrayShape(value: unknown): value is MatchDay[] {
  return matchDaysArraySchema.safeParse(value).success;
}

function buildValidationIssues(issues: z.ZodIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

function buildSeasonDataFromParsedValue(parsed: unknown): ValidationResult {
  if (isLegacySeasonShape(parsed)) {
    return {
      success: true,
      data: {
        season: parsed.season,
        club: parsed.club,
        weekends: parsed.weekends.map((weekend) => ({
          dateRange: weekend.dateRange,
          matchDays: weekend.matchDays,
        })),
      },
    };
  }

  if (isMetadataShape(parsed) || isMatchDaysArrayShape(parsed)) {
    return {
      success: false,
      issues: [
        {
          path: '(root)',
          message:
            'Bitte lade eine Metadaten-Datei mit season/club und mindestens eine MatchDay-Datei mit einem Array von Spieltagen.',
        },
      ],
    };
  }

  const result = seasonSchema.safeParse(parsed);
  if (!result.success) {
    return { success: false, issues: buildValidationIssues(result.error.issues) };
  }

  return { success: true, data: result.data };
}

export function validateSeasonJson(raw: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      success: false,
      parseError: err instanceof Error ? err.message : 'Ungültiges JSON',
    };
  }

  return buildSeasonDataFromParsedValue(parsed);
}

export async function parseSeasonImportFiles(
  files: Array<File | ImportFileSource>,
): Promise<ValidationResult> {
  const sources = await Promise.all(
    files.map(async (file) => {
      if (file instanceof File) {
        return { name: file.name, content: await file.text() } satisfies ImportFileSource;
      }
      return file;
    }),
  );

  let metadata: { season: string; club: string } | null = null;
  const matchDays: MatchDay[] = [];
  const issues: ValidationIssue[] = [];

  for (const source of sources) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(source.content);
    } catch (err) {
      issues.push({
        path: source.name,
        message: err instanceof Error ? err.message : 'Ungültiges JSON',
      });
      continue;
    }

    if (isLegacySeasonShape(parsed)) {
      metadata = { season: parsed.season, club: parsed.club };
      matchDays.push(...parsed.weekends.flatMap((weekend) => weekend.matchDays));
      continue;
    }

    if (isMetadataShape(parsed)) {
      metadata = { season: parsed.season, club: parsed.club };
      continue;
    }

    if (isMatchDaysArrayShape(parsed)) {
      matchDays.push(...parsed);
      continue;
    }

    issues.push({
      path: source.name,
      message:
        'Datei muss entweder ein Metadaten-Objekt mit season/club oder ein Array von Spieltagen sein.',
    });
  }

  if (!metadata) {
    return {
      success: false,
      issues:
        issues.length > 0
          ? issues
          : [
              {
                path: '(files)',
                message: 'Bitte lade mindestens eine Metadaten-Datei mit season/club hoch.',
              },
            ],
    };
  }

  if (matchDays.length === 0) {
    return {
      success: false,
      issues:
        issues.length > 0
          ? issues
          : [
              {
                path: '(files)',
                message: 'Bitte lade mindestens eine Datei mit einem Array von Spieltagen hoch.',
              },
            ],
    };
  }

  return {
    success: true,
    data: {
      season: metadata.season,
      club: metadata.club,
      weekends: buildWeekendsFromMatchDays(matchDays),
    },
  };
}
