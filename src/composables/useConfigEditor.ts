import { ref, computed } from 'vue';
import { CONFIG_BASE_URL, WRITER_BASE_URL } from '@/lib/config';
import type { MatchDay, Sponsor } from '@/lib/types';

export interface ActionImageConfig {
  default: string[];
  teams: Record<string, string[]>;
}

export interface PublishResult {
  ok: boolean;
  noChanges?: boolean;
  error?: string;
  sha?: string;
}

const EMPTY_MATCHDAY = (): MatchDay => ({
  team: '',
  home: true,
  date: '',
  location: '',
});

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Konnte ${url} nicht laden (${response.status})`);
  return (await response.json()) as T;
}

/** Reads a File object as a base64 string (chunked to avoid stack overflow on large images). */
export async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Module-level singleton state: dedicated tabs (Spieltage, Logos, etc.) and the page
// share one store, so data loaded in one component is visible in the others.

/** Removes empty/whitespace-only entries (UI edit placeholders like "") from string arrays. */
function cleanStringArray(items: string[]): string[] {
  return items.filter((s) => typeof s === 'string' && s.trim() !== '');
}

function cleanActionImages(ai: ActionImageConfig): ActionImageConfig {
  const teams: Record<string, string[]> = {};
  for (const [team, images] of Object.entries(ai.teams ?? {})) {
    teams[team] = cleanStringArray(images);
  }
  return { default: cleanStringArray(ai.default ?? []), teams };
}

function cleanSponsors(items: Sponsor[]): Sponsor[] {
  return items.map((sponsor) => ({ ...sponsor, teams: cleanStringArray(sponsor.teams ?? []) }));
}
const metadata = ref<{ season: string; club: string }>({ season: '', club: '' });
const matchdayFiles = ref<Record<string, MatchDay[]>>({});
const sponsors = ref<Sponsor[]>([]);
const actionImages = ref<ActionImageConfig>({ default: [], teams: {} });
const binaryFiles = ref<Record<string, string>>({});
const password = ref('');

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const loaded = ref(false);
const baseSha = ref<string | null>(null);
const lastPublishedSha = ref<string | null>(null);

/** Baseline JSON of every config file as loaded, used to detect changes. */
const loadedJson = ref<Record<string, string>>({});

export function useConfigEditor() {
  async function fetchSha(): Promise<string | null> {
    const response = await fetch(`${WRITER_BASE_URL}/sha`);
    if (!response.ok) return null;
    const data = (await response.json()) as { sha?: string | null };
    return data.sha ?? null;
  }

  async function loadAll() {
    loading.value = true;
    error.value = null;
    try {
      const overview = await fetchJson<string[]>(`${CONFIG_BASE_URL}/Spiele/File_Overview.json`);
      const meta = await fetchJson<{ season: string; club: string }>(
        `${CONFIG_BASE_URL}/Spiele/metadata.json`,
      );
      const files = overview.filter((f) => f !== 'metadata.json' && f !== 'File_Overview.json');

      const loadedFiles: Record<string, MatchDay[]> = {};
      const baseline: Record<string, string> = {
        'File_Overview.json': JSON.stringify(['metadata.json', ...files], null, 2),
        'metadata.json': JSON.stringify(meta, null, 2),
      };
      for (const file of files) {
        try {
          const data = await fetchJson<MatchDay[]>(`${CONFIG_BASE_URL}/Spiele/${file}`);
          loadedFiles[file] = data;
          baseline[file] = JSON.stringify(data, null, 2);
        } catch (err) {
          console.warn(`Failed to load ${file}`, err);
          loadedFiles[file] = [];
          baseline[file] = '[]';
        }
      }

      const defaultBaseline = (path: string, value: unknown) => {
        baseline[path] = JSON.stringify(value, null, 2);
      };

      let sp: Sponsor[] = [];
      let ai: ActionImageConfig = { default: [], teams: {} };
      try {
        sp = cleanSponsors(
          await fetchJson<Sponsor[]>(`${CONFIG_BASE_URL}/Sponsoren/sponsoren_overview.json`),
        );
      } catch (err) {
        console.warn('Failed to load sponsors', err);
      }
      try {
        ai = cleanActionImages(
          await fetchJson<ActionImageConfig>(`${CONFIG_BASE_URL}/Action_Images/action_images.json`),
        );
      } catch (err) {
        console.warn('Failed to load action images', err);
      }
      defaultBaseline('Sponsoren/sponsoren_overview.json', sp);
      defaultBaseline('Action_Images/action_images.json', ai);

      metadata.value = meta;
      matchdayFiles.value = loadedFiles;
      sponsors.value = sp;
      actionImages.value = ai;
      loadedJson.value = baseline;
      binaryFiles.value = {};
      baseSha.value = await fetchSha();
      lastPublishedSha.value = baseSha.value;
      loaded.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Konfiguration';
    } finally {
      loading.value = false;
    }
  }

  /** Every config JSON as it would be published right now. */
  function buildCurrentFiles(): Record<string, string> {
    const files: Record<string, string> = {};
    files['File_Overview.json'] = JSON.stringify(
      ['metadata.json', ...Object.keys(matchdayFiles.value)],
      null,
      2,
    );
    files['metadata.json'] = JSON.stringify(metadata.value, null, 2);
    for (const [name, matchDays] of Object.entries(matchdayFiles.value)) {
      files[name] = JSON.stringify(matchDays, null, 2);
    }
    files['Sponsoren/sponsoren_overview.json'] = JSON.stringify(
      cleanSponsors(sponsors.value),
      null,
      2,
    );
    files['Action_Images/action_images.json'] = JSON.stringify(
      cleanActionImages(actionImages.value),
      null,
      2,
    );
    return files;
  }

  /** Files that differ from the loaded baseline (JSON) plus all queued uploads (binary). */
  const changes = computed<Record<string, string>>(() => {
    const current = buildCurrentFiles();
    const changed: Record<string, string> = {};
    for (const [path, content] of Object.entries(current)) {
      if (loadedJson.value[path] !== content) changed[path] = content;
    }
    for (const [path, content] of Object.entries(binaryFiles.value)) {
      changed[path] = content;
    }
    return changed;
  });

  const changeCount = computed(() => Object.keys(changes.value).length);

  async function publish(): Promise<PublishResult> {
    const changed = changes.value;
    if (Object.keys(changed).length === 0) return { ok: false, noChanges: true };
    if (!baseSha.value)
      return { ok: false, error: 'Kein aktueller Stand (baseSha) verfügbar – neu laden' };

    saving.value = true;
    try {
      const response = await fetch(`${WRITER_BASE_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.value,
          baseSha: baseSha.value,
          files: changed,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; sha?: string };
      if (!response.ok || !data.ok) {
        return { ok: false, error: data.error ?? 'Speichern fehlgeschlagen' };
      }
      for (const [path, content] of Object.entries(changed)) {
        if (path.endsWith('.json')) loadedJson.value[path] = content;
      }
      binaryFiles.value = {};
      lastPublishedSha.value = data.sha ?? baseSha.value;
      baseSha.value = data.sha ?? baseSha.value;
      return { ok: true, sha: data.sha };
    } finally {
      saving.value = false;
    }
  }

  // ---- Spieltage (matchday files) ----

  const nextFileNumber = (): number => {
    let n = 1;
    while (matchdayFiles.value[`Spieltag_${n}.json`]) n += 1;
    return n;
  };

  const addMatchDayFile = (): void => {
    const name = `Spieltag_${nextFileNumber()}.json`;
    matchdayFiles.value = { ...matchdayFiles.value, [name]: [] };
  };

  const removeMatchDayFile = (name: string): void => {
    const copy = { ...matchdayFiles.value };
    delete copy[name];
    matchdayFiles.value = copy;
  };

  const addMatchDay = (file: string): void => {
    matchdayFiles.value[file] = [...matchdayFiles.value[file], EMPTY_MATCHDAY()];
  };

  const removeMatchDay = (file: string, index: number): void => {
    const next = [...matchdayFiles.value[file]];
    next.splice(index, 1);
    matchdayFiles.value[file] = next;
  };

  const updateMatchDay = (file: string, index: number, matchDay: MatchDay): void => {
    const next = [...matchdayFiles.value[file]];
    next[index] = matchDay;
    matchdayFiles.value[file] = next;
  };

  // ---- Sponsoren ----

  const addSponsor = (): void => {
    sponsors.value = [...sponsors.value, { filename: '', name: '', teams: [] as string[] }];
  };

  const removeSponsor = (index: number): void => {
    const next = [...sponsors.value];
    next.splice(index, 1);
    sponsors.value = next;
  };

  const updateSponsor = (index: number, sponsor: Sponsor): void => {
    const next = [...sponsors.value];
    next[index] = sponsor;
    sponsors.value = next;
  };

  // ---- Aktionsbilder ----

  const addDefaultActionImage = (): void => {
    actionImages.value = {
      ...actionImages.value,
      default: [...actionImages.value.default, ''],
    };
  };

  const removeDefaultActionImage = (index: number): void => {
    const next = [...actionImages.value.default];
    next.splice(index, 1);
    actionImages.value = { ...actionImages.value, default: next };
  };

  const updateDefaultActionImage = (index: number, name: string): void => {
    const next = [...actionImages.value.default];
    next[index] = name;
    actionImages.value = { ...actionImages.value, default: next };
  };

  const addTeamActionImages = (team: string): void => {
    if (!team || actionImages.value.teams[team]) return;
    actionImages.value = {
      ...actionImages.value,
      teams: { ...actionImages.value.teams, [team]: [] },
    };
  };

  const removeTeamActionImages = (team: string): void => {
    const copy = { ...actionImages.value.teams };
    delete copy[team];
    actionImages.value = { ...actionImages.value, teams: copy };
  };

  const addTeamActionImage = (team: string): void => {
    actionImages.value = {
      ...actionImages.value,
      teams: {
        ...actionImages.value.teams,
        [team]: [...actionImages.value.teams[team], ''],
      },
    };
  };

  const updateTeamActionImage = (team: string, index: number, name: string): void => {
    const next = [...actionImages.value.teams[team]];
    next[index] = name;
    actionImages.value = {
      ...actionImages.value,
      teams: { ...actionImages.value.teams, [team]: next },
    };
  };

  const removeTeamActionImage = (team: string, index: number): void => {
    const next = [...actionImages.value.teams[team]];
    next.splice(index, 1);
    actionImages.value = {
      ...actionImages.value,
      teams: { ...actionImages.value.teams, [team]: next },
    };
  };

  // ---- Binäre Assets ----

  const setBinaryFile = (path: string, base64: string | null): void => {
    if (base64 === null) {
      const copy = { ...binaryFiles.value };
      delete copy[path];
      binaryFiles.value = copy;
    } else {
      binaryFiles.value = { ...binaryFiles.value, [path]: base64 };
    }
  };

  const hasBinary = (path: string): boolean => path in binaryFiles.value;

  return {
    metadata,
    matchdayFiles,
    sponsors,
    actionImages,
    binaryFiles,
    password,
    loading,
    saving,
    error,
    loaded,
    baseSha,
    lastPublishedSha,
    changes,
    changeCount,
    loadAll,
    publish,
    addMatchDayFile,
    removeMatchDayFile,
    addMatchDay,
    removeMatchDay,
    updateMatchDay,
    addSponsor,
    removeSponsor,
    updateSponsor,
    addDefaultActionImage,
    removeDefaultActionImage,
    updateDefaultActionImage,
    addTeamActionImages,
    removeTeamActionImages,
    addTeamActionImage,
    updateTeamActionImage,
    removeTeamActionImage,
    setBinaryFile,
    hasBinary,
  };
}
