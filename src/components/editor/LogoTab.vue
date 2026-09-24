<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useConfigEditor } from '@/composables/useConfigEditor';
import { useAssetStatus } from '@/composables/useAssetStatus';
import { normalizeTeamName } from '@/lib/logo-matcher';
import { CONFIG_BASE_URL } from '@/lib/config';
import SectionInfo from '@/components/editor/SectionInfo.vue';
import AssetUploadField from '@/components/editor/AssetUploadField.vue';

const { metadata, matchdayFiles, actionImages, binaryFiles, setBinaryFile } = useConfigEditor();
const { assetExists, refreshAssetStatus } = useAssetStatus();

const extraLogoTeams = ref<string[]>([]);
const newLogoTeam = ref('');
const search = ref('');
const onlyMissing = ref(false);

/** Logo files are keyed by the normalized team name. */
const logoPath = (team: string) => `Logos/${team}.png`;

/** Club's own teams (have action images) plus the club name itself – no opponent logo needed. */
const clubTeams = computed(() => new Set(Object.keys(actionImages.value.teams)));

const isClubTeam = (team: string) =>
  clubTeams.value.has(team) || (metadata.value.club && team === metadata.value.club);

/** All teams appearing in a `teams` or `matches` array – only they need a logo. */
const participantTeams = computed(() => {
  const set = new Set<string>();
  for (const matchDays of Object.values(matchdayFiles.value)) {
    for (const md of matchDays) {
      for (const team of md.teams ?? []) if (team) set.add(team);
      for (const match of md.matches ?? []) {
        if (match.home) set.add(match.home);
        if (match.away) set.add(match.away);
      }
    }
  }
  return set;
});

const knownTeams = computed(() =>
  [...participantTeams.value].filter((team) => team && !isClubTeam(team)),
);

/** Participant teams that are not the club's own (club teams need no logo). */
const opponentTeams = computed(() => {
  const set = new Set<string>();
  for (const team of participantTeams.value) {
    if (team && !isClubTeam(team)) set.add(team);
  }
  return set;
});

/** Normalized opponent names – these are the names the viewer uses for logo lookups. */
const opponentNorm = computed(() => {
  const set = new Set<string>();
  for (const team of opponentTeams.value) {
    const name = normalizeTeamName(team);
    if (name) set.add(name);
  }
  return set;
});

/** Every unique normalized team name that needs/accepts a logo. */
const normalizedTeams = computed(() => {
  const set = new Set<string>();
  for (const team of knownTeams.value) {
    const name = normalizeTeamName(team);
    if (name) set.add(name);
  }
  for (const team of extraLogoTeams.value) {
    const name = normalizeTeamName(team);
    if (name) set.add(name);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'de'));
});

const logoStatus = (team: string): 'has' | 'missing' =>
  assetExists.value[logoPath(team)] === true ? 'has' : 'missing';

const missingOpponents = computed(() =>
  [...opponentNorm.value]
    .filter((team) => logoStatus(team) === 'missing')
    .sort((a, b) => a.localeCompare(b, 'de')),
);

const filteredLogoTeams = computed(() => {
  const query = search.value.trim().toLowerCase();
  const priority = (team: string) => {
    if (logoStatus(team) === 'missing' && opponentNorm.value.has(team)) return 0;
    if (logoStatus(team) === 'missing') return 1;
    if (opponentNorm.value.has(team)) return 2;
    return 3;
  };
  return normalizedTeams.value
    .filter((team) => (onlyMissing.value ? logoStatus(team) === 'missing' : true))
    .filter((team) => (query ? team.toLowerCase().includes(query) : true))
    .sort((a, b) => priority(a) - priority(b) || a.localeCompare(b, 'de'));
});

const missingCount = computed(
  () => normalizedTeams.value.filter((t) => logoStatus(t) === 'missing').length,
);

function addLogoTeam() {
  const name = normalizeTeamName(newLogoTeam.value.trim());
  if (!name || isClubTeam(newLogoTeam.value.trim())) return;
  if (normalizedTeams.value.includes(name)) return;
  extraLogoTeams.value = [...extraLogoTeams.value, name];
  newLogoTeam.value = '';
}

function resetFilters() {
  search.value = '';
  onlyMissing.value = false;
}

onMounted(() => {
  void refreshAssetStatus(normalizedTeams.value.map((team) => logoPath(team)));
});
</script>

<template>
  <div class="space-y-4">
    <SectionInfo title="Was ist hier konfiguriert?">
      GitHub-Ordner: <span class="font-mono">Logos/</span>. Für jedes gegnerische Team erwartet der
      Viewer ein Logo unter <span class="font-mono">Logos/&lt;vereinfachter-name&gt;.png</span> – es
      erscheint auf den Folien neben dem Teamnamen. Eigenmannschaften (mit Aktionsbildern) werden
      ausgeblendet; Gegner ohne Logo stehen oben und werden hervorgehoben.
    </SectionInfo>

    <div v-if="missingOpponents.length > 0" class="rounded-lg border border-red-200 bg-red-50 p-3">
      <p class="text-sm font-semibold text-red-700">
        ⚠ {{ missingOpponents.length }} Gegner ohne Logo:
      </p>
      <p class="mt-1 text-xs leading-relaxed text-red-700">
        {{ missingOpponents.join(', ') }}
      </p>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        v-model="newLogoTeam"
        class="editor-input max-w-xs"
        list="known-teams"
        placeholder="Team auswählen oder eintippen"
      />
      <button
        class="rounded bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-800"
        @click="addLogoTeam"
      >
        + Team hinzufügen
      </button>
      <datalist id="known-teams">
        <option v-for="team in normalizedTeams" :key="team" :value="team" />
      </datalist>
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <input v-model="search" class="editor-input max-w-xs" placeholder="Suchen…" />
      <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
        <input v-model="onlyMissing" type="checkbox" class="h-4 w-4 accent-green-700" />
        nur ohne Logo
      </label>
      <button class="editor-add" @click="resetFilters">Filter zurücksetzen</button>
      <span class="ml-auto text-xs text-gray-500">
        {{ normalizedTeams.length }} Teams · {{ missingCount }} ohne Logo
      </span>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <AssetUploadField
        v-for="team in filteredLogoTeams"
        :key="logoPath(team)"
        :label="team"
        :target-path="logoPath(team)"
        :model-value="binaryFiles[logoPath(team)] ?? null"
        :existing="assetExists[logoPath(team)] ?? null"
        :existing-preview-url="`${CONFIG_BASE_URL}/${logoPath(team)}`"
        :required="opponentNorm.has(team)"
        @update:model-value="setBinaryFile(logoPath(team), $event)"
      />
    </div>
  </div>
</template>
