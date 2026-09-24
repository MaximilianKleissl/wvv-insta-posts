<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useConfigEditor } from '@/composables/useConfigEditor';
import { useAssetStatus } from '@/composables/useAssetStatus';
import { CONFIG_BASE_URL } from '@/lib/config';
import SectionInfo from '@/components/editor/SectionInfo.vue';
import AssetUploadField from '@/components/editor/AssetUploadField.vue';

const {
  actionImages,
  binaryFiles,
  addDefaultActionImage,
  removeDefaultActionImage,
  updateDefaultActionImage,
  addTeamActionImages,
  removeTeamActionImages,
  addTeamActionImage,
  updateTeamActionImage,
  removeTeamActionImage,
  setBinaryFile,
} = useConfigEditor();
const { assetExists, refreshAssetStatus } = useAssetStatus();

const newActionTeam = ref('');

const actionImagePaths = computed(() => {
  const paths: string[] = [];
  for (const image of actionImages.value.default) if (image) paths.push(`Action_Images/${image}`);
  for (const images of Object.values(actionImages.value.teams)) {
    for (const image of images) if (image) paths.push(`Action_Images/${image}`);
  }
  return paths;
});

function addActionTeam() {
  const name = newActionTeam.value.trim();
  if (!name) return;
  addTeamActionImages(name);
  newActionTeam.value = '';
}

onMounted(() => {
  void refreshAssetStatus(actionImagePaths.value);
});
</script>

<template>
  <div class="space-y-4">
    <SectionInfo title="Was ist hier konfiguriert?">
      GitHub-Ordner: <span class="font-mono">Action_Images/</span>. Diese Bilder werden dynamisch in
      die Folien eingeblendet (z.&nbsp;B. Spielaktionen). Der Eintrag unter „Standard“ gilt für alle
      Teams; unter „Pro Team“ können Bilder für einzelne Teams überschrieben werden. Der Dateiname
      muss dem Namen in <span class="font-mono">action_images.json</span> entsprechen und als Datei
      im Ordner liegen.
    </SectionInfo>

    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Standard</h3>
        <button class="editor-add" @click="addDefaultActionImage">+ Bild</button>
      </div>
      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div v-for="(image, i) in actionImages.default" :key="`def-${i}`" class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              :value="image"
              class="editor-input font-mono"
              placeholder="bild.jpg"
              @input="updateDefaultActionImage(i, ($event.target as HTMLInputElement).value)"
            />
            <button
              class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
              @click="removeDefaultActionImage(i)"
            >
              ✕
            </button>
          </div>
          <AssetUploadField
            v-if="image"
            :label="`Standard: ${image}`"
            :target-path="`Action_Images/${image}`"
            :model-value="binaryFiles[`Action_Images/${image}`] ?? null"
            :existing="assetExists[`Action_Images/${image}`] ?? null"
            :existing-preview-url="`${CONFIG_BASE_URL}/Action_Images/${image}`"
            @update:model-value="setBinaryFile(`Action_Images/${image}`, $event)"
          />
        </div>
        <p v-if="actionImages.default.length === 0" class="text-sm text-gray-500">
          Noch keine Standard-Bilder. Mit „+ Bild“ hinzufügen.
        </p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Pro Team</h3>
      <div class="mb-4 flex items-center gap-2">
        <input v-model="newActionTeam" class="editor-input max-w-xs" placeholder="Teamname" />
        <button
          class="rounded bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-800"
          @click="addActionTeam"
        >
          + Team
        </button>
      </div>

      <div
        v-for="(images, team) in actionImages.teams"
        :key="team"
        class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-800">{{ team }}</h4>
          <button
            class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
            @click="removeTeamActionImages(team)"
          >
            entfernen
          </button>
        </div>
        <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div v-for="(image, i) in images" :key="`${team}-${i}`" class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                :value="image"
                class="editor-input font-mono"
                placeholder="bild.jpg"
                @input="updateTeamActionImage(team, i, ($event.target as HTMLInputElement).value)"
              />
              <button
                class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                @click="removeTeamActionImage(team, i)"
              >
                ✕
              </button>
            </div>
            <AssetUploadField
              v-if="image"
              :label="`${team}: ${image}`"
              :target-path="`Action_Images/${image}`"
              :model-value="binaryFiles[`Action_Images/${image}`] ?? null"
              :existing="assetExists[`Action_Images/${image}`] ?? null"
              :existing-preview-url="`${CONFIG_BASE_URL}/Action_Images/${image}`"
              @update:model-value="setBinaryFile(`Action_Images/${image}`, $event)"
            />
          </div>
        </div>
        <button class="editor-add mt-3" @click="addTeamActionImage(team)">+ Bild</button>
      </div>
    </div>
  </div>
</template>
