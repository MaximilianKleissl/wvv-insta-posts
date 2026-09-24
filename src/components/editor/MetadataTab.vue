<script setup lang="ts">
import { useConfigEditor } from '@/composables/useConfigEditor';
import SectionInfo from '@/components/editor/SectionInfo.vue';

const { metadata } = useConfigEditor();
</script>

<template>
  <div class="space-y-4">
    <SectionInfo title="Was ist hier konfiguriert?">
      Die Saison-Metadaten steuern die Überschrift der Folien. Der Verein wird als Eigentümer der
      Folien verwendet, der Saison-Name erscheint in der Kopfzeile.
    </SectionInfo>

    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Saison</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="text-xs text-gray-500">Saison</span>
          <input v-model="metadata.season" class="editor-input" placeholder="2025/26" />
        </label>
        <label class="block">
          <span class="text-xs text-gray-500">Verein</span>
          <input v-model="metadata.club" class="editor-input" placeholder="Werderaner VV" />
        </label>
      </div>
    </div>
  </div>
</template>
