import type { SeasonData } from "./types";
import { germanWeekdayName } from "./grouping";

export function buildWeekendCaption(
  season: SeasonData,
  weekendIndex: number,
): string {
  const weekend = season.weekends[weekendIndex];
  const intro = `🏐 Endlich ist wieder Spielwochenende! Unsere Teams sind bereit, alles auf dem Feld zu geben. Kommt vorbei oder drückt auswärts die Daumen!`;

  const entries = weekend.matchDays.map((md) => {
    const icon = md.home ? "🏠" : "🚗";
    return `${icon} ${md.team} · ${germanWeekdayName(md.date)} · ${md.location}`;
  });

  return [
    `🏐 Spielwochenende ${weekend.dateRange}`,
    "",
    intro,
    "",
    ...entries,
    "",
    "Seid dabei, feuert unsere Mannschaften an!",
    "",
    `#${slugifyHashtag(season.club)}`,
    "#Volleyball",
    "#Spielwochenende",
  ].join("\n");
}

function slugifyHashtag(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "");
}
