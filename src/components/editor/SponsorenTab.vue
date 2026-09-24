<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useConfigEditor } from '@/composables/useConfigEditor';
import { useAssetStatus } from '@/composables/useAssetStatus';
import { CONFIG_BASE_URL } from '@/lib/config';
import SectionInfo from '@/components/editor/SectionInfo.vue';
import AssetUploadField from '@/components/editor/AssetUploadField.vue';
import TagInput from '@/components/editor/TagInput.vue';

const {
  sponsors,
  actionImages,
  binaryFiles,
  addSponsor,
  removeSponsor,
  updateSponsor,
  setBinaryFile,
} = useConfigEditor();
const { assetExists, refreshAssetStatus } = useAssetStatus();

/** Only teams with their own action images can be assigned to a sponsor. */
const selectableTeams = computed(() => Object.keys(actionImages.value.teams).sort());

const targetPath = (index: number) => `Sponsoren/${sponsors.value[index].filename}`;

function setSponsorTeams(index: number, teams: string[]) {
  updateSponsor(index, { ...sponsors.value[index], teams });
}

onMounted(() => {
  void refreshAssetStatus(
    sponsors.value.filter((s) => s.filename).map((s) => `Sponsoren/${s.filename}`),
  );
});
</script>

<template>
  <div class="space-y-3">
    <SectionInfo title="Was ist hier konfiguriert?">
      GitHub-Ordner: <span class="font-mono">Sponsoren/</span>. Die Datei
      <span class="font-mono">sponsoren_overview.json</span> legt fest, welche Sponsoren auf den
      Folien erscheinen. Über die Tags bei „Teams“ wird bestimmt, welche Mannschaften den Sponsor
      angezeigt bekommen – wählbar sind nur eigene Mannschaften (mit Aktionsbildern). Das Logo wird
      unter dem angegebenen Dateinamen in den Ordner <span class="font-mono">Sponsoren/</span>
      gelegt. Erklärung: Ein Sponsor, dem keine Mannschaft zugewiesen ist, erscheint auf keiner
      Folie; jede zugewiesene Mannschaft zeigt das Logo auf ihren Folien.
    </SectionInfo>

    <div
      v-for="(sponsor, i) in sponsors"
      :key="i"
      class="rounded-lg border border-gray-200 bg-white p-4"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-800">Sponsor {{ i + 1 }}</h3>
        <button
          class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200"
          @click="removeSponsor(i)"
        >
          entfernen
        </button>
      </div>

      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="text-xs text-gray-500">Name</span>
          <input
            :value="sponsor.name"
            class="editor-input"
            @input="
              updateSponsor(i, { ...sponsor, name: ($event.target as HTMLInputElement).value })
            "
          />
        </label>
        <label class="block">
          <span class="text-xs text-gray-500">Dateiname (im Ordner Sponsoren/)</span>
          <input
            :value="sponsor.filename"
            class="editor-input"
            @input="
              updateSponsor(i, { ...sponsor, filename: ($event.target as HTMLInputElement).value })
            "
          />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs text-gray-500"
            >Teams (nur eigene Mannschaften, per Klick oder Enter)</span
          >
          <TagInput
            :model-value="sponsor.teams"
            :suggestions="selectableTeams"
            @update:model-value="setSponsorTeams(i, $event)"
          />
        </label>
      </div>

      <div
        class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs leading-relaxed text-green-800"
      >
        <p v-if="sponsor.teams.filter((t) => t).length > 0" class="font-semibold">
          Einfluss der Teams ({{ sponsor.teams.filter((t) => t).length }} von
          {{ selectableTeams.length }} ausgewählt)
        </p>
        <p v-else class="font-semibold">Einfluss der Teams (keine ausgewählt)</p>
        <p class="mt-1">
          Das Sponsorenlogo erscheint nur auf den Folien der oben ausgewählten Mannschaften –
          z.&nbsp;B. „Herren 1“ → das Logo wird auf jeder Herren-1-Folie angezeigt.
          <template v-if="sponsor.teams.filter((t) => t).length === 0">
            <span class="font-semibold">Aktuell wird der Sponsor auf keiner Folie angezeigt.</span>
          </template>
        </p>
      </div>

      <div class="mt-3">
        <AssetUploadField
          v-if="sponsor.filename"
          :label="`Logo: ${sponsor.name || sponsor.filename}`"
          :target-path="targetPath(i)"
          :model-value="binaryFiles[targetPath(i)] ?? null"
          :existing="assetExists[targetPath(i)] ?? null"
          :existing-preview-url="`${CONFIG_BASE_URL}/${targetPath(i)}`"
          @update:model-value="setBinaryFile(targetPath(i), $event)"
        />
        <p v-else class="text-xs text-gray-500">Dateiname eintragen, um ein Logo hochzuladen.</p>
      </div>
    </div>

    <button class="editor-add" @click="addSponsor">+ Sponsor hinzufügen</button>
  </div>
</template>
