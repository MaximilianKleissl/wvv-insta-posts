<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useConfigEditor } from '@/composables/useConfigEditor';
import { useAssetStatus } from '@/composables/useAssetStatus';
import { useToast } from '@/composables/useToast';
import { collectOpponentTeams, collectClubTeams, logoPathForTeam } from '@/lib/teamChecks';
import { normalizeTeamName } from '@/lib/logo-matcher';
import SectionInfo from '@/components/editor/SectionInfo.vue';

const {
  changes,
  changeCount,
  password,
  saving,
  baseSha,
  lastPublishedSha,
  publish,
  metadata,
  matchdayFiles,
  actionImages,
  sponsors,
  binaryFiles,
} = useConfigEditor();
const { assetExists, refreshAssetStatus } = useAssetStatus();
const { toast } = useToast();

const clubActionTeams = computed(() => new Set(Object.keys(actionImages.value.teams)));

const opponentTeams = computed(() =>
  collectOpponentTeams(matchdayFiles.value, clubActionTeams.value, metadata.value.club),
);

/** True when a file exists on GitHub or is queued for upload. */
const assetPresent = (path: string) =>
  assetExists.value[path] === true || binaryFiles.value[path] !== undefined;

const warnings = computed(() => {
  const list: string[] = [];

  const missingLogos = [...opponentTeams.value]
    .filter((team) => !assetPresent(logoPathForTeam(team)))
    .map((team) => normalizeTeamName(team))
    .filter((name, i, all) => all.indexOf(name) === i)
    .sort((a, b) => a.localeCompare(b, 'de'));
  if (missingLogos.length > 0) {
    list.push(`${missingLogos.length} Gegner ohne Logo: ${missingLogos.join(', ')}`);
  }

  const withoutActionImages = [...collectClubTeams(matchdayFiles.value)]
    .filter((team) => !clubActionTeams.value.has(team))
    .sort((a, b) => a.localeCompare(b, 'de'));
  if (withoutActionImages.length > 0) {
    list.push(
      `${withoutActionImages.length} Mannschaften ohne eigene Aktionsbilder (Standard wird verwendet): ${withoutActionImages.join(', ')}`,
    );
  }

  const sponsorsWithoutTeams = sponsors.value.filter((s) => !s.teams.some(Boolean));
  if (sponsorsWithoutTeams.length > 0) {
    list.push(
      `${sponsorsWithoutTeams.length} Sponsoren ohne Mannschaft (erscheinen auf keiner Folie): ${sponsorsWithoutTeams.map((s) => s.name || s.filename).join(', ')}`,
    );
  }

  const missingSponsorLogos = sponsors.value.filter(
    (s) => s.filename && !assetPresent(`Sponsoren/${s.filename}`),
  );
  if (missingSponsorLogos.length > 0) {
    list.push(
      `${missingSponsorLogos.length} Sponsor-Logos fehlen unter Sponsoren/: ${missingSponsorLogos.map((s) => s.name || s.filename).join(', ')}`,
    );
  }

  return list;
});

onMounted(() => {
  const paths = [
    ...[...opponentTeams.value].map(logoPathForTeam),
    ...sponsors.value.filter((s) => s.filename).map((s) => `Sponsoren/${s.filename}`),
  ];
  void refreshAssetStatus(paths);
});

async function onPublish() {
  const result = await publish();
  if (result.ok) {
    toast('Konfiguration wurde veröffentlicht.');
  } else if (result.noChanges) {
    toast('Keine Änderungen vorhanden.');
  } else if (result.error) {
    toast(result.error, 'error');
  }
}
</script>

<template>
  <div class="space-y-4">
    <SectionInfo title="Was passiert beim Veröffentlichen?">
      Alle Änderungen werden als einzelner Commit in das Konfigurations-Repository (<span
        class="font-mono"
        >wvv-posts-config</span
      >) geschrieben und benötigen das Editor-Passwort. Nach dem Speichern dauert es ca. 1 Minute,
      bis GitHub Pages die neue Konfiguration ausliefert. Der baseSha stellt sicher, dass keine
      zwischenzeitlichen Änderungen überschrieben werden.
    </SectionInfo>

    <div v-if="warnings.length > 0" class="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h2 class="text-sm font-semibold text-amber-800">⚠ Hinweise vor der Veröffentlichung</h2>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-800">
        <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
      </ul>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Änderungen ({{ changeCount }})
      </h2>
      <div v-if="changeCount === 0" class="text-sm text-gray-500">Keine Änderungen vorhanden.</div>
      <div
        v-for="(_, path) in changes"
        :key="path"
        class="flex items-center justify-between rounded border border-gray-200 px-3 py-2"
      >
        <span class="font-mono text-sm text-gray-800">{{ path }}</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="
            path.endsWith('.json') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-700'
          "
        >
          {{ path.endsWith('.json') ? 'geändert' : 'Bild' }}
        </span>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <label class="block max-w-sm">
        <span class="text-xs text-gray-500">Passwort</span>
        <input v-model="password" type="password" class="editor-input" placeholder="••••••••" />
      </label>

      <button
        class="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        :disabled="saving || changeCount === 0"
        @click="onPublish"
      >
        {{ saving ? 'Veröffentliche…' : 'Veröffentlichen' }}
      </button>

      <div class="mt-3 space-y-1 text-xs text-gray-500">
        <p>Aktueller Stand (baseSha): {{ baseSha ?? 'unbekannt' }}</p>
        <p>Zuletzt veröffentlicht: {{ lastPublishedSha ?? '—' }}</p>
      </div>
    </div>
  </div>
</template>
