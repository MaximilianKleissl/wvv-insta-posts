<script setup lang="ts">
import { reactive, computed, watch, onMounted } from 'vue';
import type { MatchDay, Match } from '@/lib/types';
import { getTeamColorScheme, hexToRgba } from '@/lib/team-colors';
import { logoPathForTeam } from '@/lib/teamChecks';
import { useConfigEditor } from '@/composables/useConfigEditor';
import { useAssetStatus } from '@/composables/useAssetStatus';

const props = defineProps<{
  modelValue: MatchDay;
  index: number;
  file: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: MatchDay];
  remove: [];
}>();

const { actionImages, metadata } = useConfigEditor();
const { assetExists, refreshAssetStatus } = useAssetStatus();

/** Only the club's own teams (those with action images) are selectable. */
const teamOptions = computed(() =>
  Object.keys(actionImages.value.teams).sort((a, b) => a.localeCompare(b, 'de')),
);

/** Background/border tint of the card in the team's theme color. */
const cardStyle = computed(() => {
  const tint = getTeamColorScheme(local.team).imageTint;
  return {
    background: hexToRgba(tint, 0.06),
    borderColor: hexToRgba(tint, 0.35),
  };
});

const local = reactive(clone(props.modelValue));

function clone(value: MatchDay): MatchDay {
  return JSON.parse(JSON.stringify(value)) as MatchDay;
}

watch(
  () => props.modelValue,
  (value) => Object.assign(local, clone(value)),
);

watch(local, () => emit('update:modelValue', clone(local)), { deep: true });

/** Teams of this matchday that need a logo – those in the `teams` or `matches` array. */
const teamParticipants = computed(() => {
  const set = new Set<string>();
  for (const team of local.teams ?? []) if (team) set.add(team);
  for (const match of local.matches ?? []) {
    if (match.home) set.add(match.home);
    if (match.away) set.add(match.away);
  }
  return [...set];
});

/** Participants without a logo file in the repo yet (club's own teams need none). */
const logoMissingTeams = computed(() =>
  teamParticipants.value.filter(
    (team) =>
      !actionImages.value.teams[team] &&
      team !== metadata.value.club &&
      assetExists.value[logoPathForTeam(team)] !== true,
  ),
);

function refreshParticipantLogos() {
  const paths = teamParticipants.value.map(logoPathForTeam);
  if (paths.length > 0) void refreshAssetStatus(paths);
}

onMounted(refreshParticipantLogos);
watch(teamParticipants, refreshParticipantLogos);

const mode = computed<'matches' | 'teams'>(() =>
  local.teams && local.teams.length > 0 ? 'teams' : 'matches',
);

const switchMode = (next: 'matches' | 'teams') => {
  if (next === 'matches') {
    local.teams = undefined;
    if (!local.matches || local.matches.length === 0) {
      local.matches = [emptyMatch()];
    }
  } else {
    local.matches = undefined;
    if (!local.teams || local.teams.length === 0) {
      local.teams = [local.team || '', ''];
    }
  }
};

function emptyMatch(): Match {
  return { time: '', home: '', away: '', result: undefined };
}

const addMatch = () => {
  local.matches = [...(local.matches ?? []), emptyMatch()];
};

const removeMatch = (index: number) => {
  local.matches = (local.matches ?? []).filter((_, i) => i !== index);
};

const moveMatch = (index: number, direction: -1 | 1) => {
  const matches = local.matches ?? [];
  const target = index + direction;
  if (target < 0 || target >= matches.length) return;
  const copy = [...matches];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  local.matches = copy;
};

const addTeam = () => {
  local.teams = [...(local.teams ?? []), ''];
};

const removeTeam = (index: number) => {
  local.teams = (local.teams ?? []).filter((_, i) => i !== index);
};

const setResult = (index: number, key: 'home' | 'away', value: string) => {
  const matches = local.matches ?? [];
  const result = matches[index].result ?? { home: 0, away: 0 };
  result[key] = value === '' ? 0 : Number(value);
  matches[index].result = result;
};

const valid = () =>
  (local.matches && local.matches.length > 0) || (local.teams && local.teams.length >= 2);
</script>

<template>
  <div class="rounded-lg border p-3 sm:p-4" :style="cardStyle">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-sm font-semibold text-gray-700">{{ local.team }}</span>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="valid() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'"
        >
          {{ valid() ? 'gültig' : 'Matches oder Teams erforderlich' }}
        </span>
        <button
          class="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200"
          title="Spieltag löschen"
          @click="emit('remove')"
        >
          ✕
        </button>
      </div>
    </div>

    <div
      v-if="logoMissingTeams.length > 0"
      class="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800"
    >
      ⚠ Kein Logo gefunden für
      <span class="font-semibold">{{ logoMissingTeams.join(' · ') }}</span>
      (Spielteilnehmer). Bitte im Tab <span class="font-semibold">„Logos“</span> hochladen – sonst
      fehlt es auf den Folien.
    </div>

    <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <label class="block">
        <span class="text-xs text-gray-500">Datei (Spieltag liegt in dieser Datei)</span>
        <input
          :value="file"
          class="editor-input bg-white/60 opacity-80"
          disabled
          title="Die Datei bestimmt, in welchem Wochenend-Set dieser Spieltag erscheint."
        />
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">Mannschaft</span>
        <select v-model="local.team" class="editor-input">
          <option value="">Auswählen…</option>
          <option v-for="team in teamOptions" :key="team" :value="team">{{ team }}</option>
        </select>
      </label>
      <label class="flex items-end gap-2 pb-2">
        <input v-model="local.home" type="checkbox" class="h-4 w-4" />
        <span class="text-sm text-gray-700">Heimspiel</span>
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">Datum</span>
        <input v-model="local.date" class="editor-input" placeholder="26.10.2025" />
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">Spielort</span>
        <input v-model="local.location" class="editor-input" placeholder="Halle Süd" />
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">Spieltagname (optional)</span>
        <input v-model="local.match_day_name" class="editor-input" placeholder="12. Spieltag" />
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">Ergebnis-Notiz (optional)</span>
        <input v-model="local.match_day_result" class="editor-input" placeholder="z. B. 3:1" />
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">Heimteam (optional)</span>
        <input v-model="local.homeTeam" class="editor-input" placeholder="z. B. WVV Herren I" />
      </label>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <span class="text-xs text-gray-500">Modus:</span>
      <button
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="
          mode === 'matches'
            ? 'bg-green-800 text-white'
            : 'bg-white text-gray-600 border border-gray-300'
        "
        @click="switchMode('matches')"
      >
        Paarungen (matches)
      </button>
      <button
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="
          mode === 'teams'
            ? 'bg-green-800 text-white'
            : 'bg-white text-gray-600 border border-gray-300'
        "
        @click="switchMode('teams')"
      >
        Teilnehmer (teams)
      </button>
    </div>

    <div v-if="mode === 'matches'" class="mt-3 space-y-2">
      <div
        v-for="(match, i) in local.matches ?? []"
        :key="i"
        class="grid grid-cols-1 gap-2 rounded border border-gray-200 bg-white p-2 sm:grid-cols-12"
      >
        <div class="flex items-center gap-1 sm:col-span-3">
          <button
            class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            title="Spiel nach oben"
            :disabled="i === 0"
            @click="moveMatch(i, -1)"
          >
            ↑
          </button>
          <button
            class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            title="Spiel nach unten"
            :disabled="i === (local.matches ?? []).length - 1"
            @click="moveMatch(i, 1)"
          >
            ↓
          </button>
          <input v-model="match.time" class="editor-input flex-1" placeholder="Uhrzeit" />
        </div>
        <input v-model="match.home" class="editor-input sm:col-span-3" placeholder="Heim" />
        <input v-model="match.away" class="editor-input sm:col-span-3" placeholder="Gast" />
        <div class="flex items-center gap-1 sm:col-span-3">
          <input
            :value="match.result?.home ?? ''"
            class="editor-input w-14"
            type="number"
            placeholder="Hz"
            @input="setResult(i, 'home', ($event.target as HTMLInputElement).value)"
          />
          <input
            :value="match.result?.away ?? ''"
            class="editor-input w-14"
            type="number"
            placeholder="Az"
            @input="setResult(i, 'away', ($event.target as HTMLInputElement).value)"
          />
          <button
            class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 hover:bg-red-200"
            title="Spiel löschen"
            @click="removeMatch(i)"
          >
            ✕
          </button>
        </div>
      </div>
      <button class="editor-add" @click="addMatch">+ Spiel hinzufügen</button>
    </div>

    <div v-else class="mt-3 space-y-2">
      <div
        v-for="(team, i) in local.teams ?? []"
        :key="i"
        class="flex items-center gap-2 rounded border border-gray-200 bg-white p-2"
      >
        <span class="w-24 shrink-0 text-xs text-gray-500 sm:w-40">Teilnehmer {{ i + 1 }}</span>
        <input v-model="(local.teams ?? [])[i]" class="editor-input" placeholder="Teamname" />
        <button
          class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 hover:bg-red-200"
          title="Team löschen"
          @click="removeTeam(i)"
        >
          ✕
        </button>
      </div>
      <button class="editor-add" @click="addTeam">+ Teilnehmer hinzufügen</button>
    </div>
  </div>
</template>
