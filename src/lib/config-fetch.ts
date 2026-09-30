/**
 * The config host answers with `cache-control: max-age=300`, so a browser keeps
 * serving a file for up to five minutes even after a new version was published.
 *
 * `cache: 'no-cache'` keeps the entry cacheable but forces the browser to
 * revalidate before reusing it. The host honours `If-None-Match` and answers
 * unchanged files with `304 Not Modified` and no body, so this costs nothing
 * while guaranteeing that a reload shows what is actually published.
 */
export function fetchFresh(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: 'no-cache' });
}

/**
 * Fetches one JSON file from the config host and turns any failure into a
 * message the UI can show as-is (German, with a hint at what went wrong).
 * `label` names the file in user language, e.g. `Spielplan-Übersicht`.
 */
export async function fetchConfigJson<T>(url: string, label: string): Promise<T> {
  let response: Response;
  try {
    response = await fetchFresh(url);
  } catch {
    throw new Error(
      `Keine Verbindung zum Konfigurationsserver. Bitte Internetverbindung prüfen und erneut laden. (${label})`,
    );
  }
  if (!response.ok) {
    throw new Error(`${label} konnte nicht geladen werden (HTTP ${response.status}).`);
  }
  return (await response.json()) as T;
}
