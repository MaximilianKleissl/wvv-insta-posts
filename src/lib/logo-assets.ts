/**
 * Bundled demo logo assets shipped with the app (served from /logos via Vite's public dir).
 * The app discovers available files from the public logos folder at runtime, so adding a new
 * image there is enough. The resolver treats these as bundled defaults and uses them when
 * no custom logo has been uploaded.
 */
import { normalizeTeamName } from "./logo-matcher";

const BUNDLED_LOGO_FILES = import.meta.glob("/public/logos/*", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

function getBundledLogoFileEntries() {
  return Object.entries(BUNDLED_LOGO_FILES)
    .map(([path, url]) => {
      const fileName = path.replace(/^\/public\/logos\//, "");
      const displayName = fileName.replace(/\.[^.]+$/, "");
      return { name: displayName, fileName, url };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getBundledLogoEntries(basePath: string) {
  return getBundledLogoFileEntries().map(({ name, fileName }) => ({
    name,
    url: `${basePath}logos/${encodeURIComponent(fileName)}`,
  }));
}

export function getBundledLogoUrl(teamName: string, basePath: string): string | undefined {
  const key = normalizeTeamName(teamName);
  const match = getBundledLogoFileEntries().find(({ name }) => normalizeTeamName(name) === key);
  if (!match) alert(`No bundled logo found for team: ${teamName} (${key}). Available teams: ${getBundledLogoFileEntries().map(({ name }) => normalizeTeamName(name)).join(", ")}`);
  return `${basePath}logos/${encodeURIComponent(match.fileName)}`;
}
