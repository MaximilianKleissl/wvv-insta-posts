<script setup lang="ts">
import { ref } from 'vue';
import type { ExportProgress } from '@/lib/export-zip';

const props = defineProps<{
  exporting?: boolean;
  exportProgress?: ExportProgress | null;
  weekendCount?: number;
  matchDayCount?: number;
  matchCount?: number;
}>();

const emit = defineEmits<{
  fileUpload: [event: Event];
  loadSample: [];
  exportAll: [];
  openDocumentation: [];
}>();

const isOpen = ref(false);
const activeMenu = ref<string | null>(null);

const toggleMenu = (menu: string) => {
  if (activeMenu.value === menu) {
    activeMenu.value = null;
    isOpen.value = false;
  } else {
    activeMenu.value = menu;
    isOpen.value = true;
  }
};

const closeMenu = () => {
  activeMenu.value = null;
  isOpen.value = false;
};

defineExpose({
  closeMenu,
});
</script>

<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <button
        :class="[
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
          activeMenu === 'upload'
            ? 'bg-white text-green-900'
            : 'bg-white/20 text-white hover:bg-white/30',
        ]"
        title="Upload"
        @click="toggleMenu('upload')"
      >
        ↑
      </button>
      <button
        :class="[
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
          activeMenu === 'export'
            ? 'bg-white text-green-900'
            : 'bg-white/20 text-white hover:bg-white/30',
        ]"
        title="Export"
        @click="toggleMenu('export')"
      >
        ↓
      </button>
      <button
        :class="[
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
          activeMenu === 'stats'
            ? 'bg-white text-green-900'
            : 'bg-white/20 text-white hover:bg-white/30',
        ]"
        title="Statistiken"
        @click="toggleMenu('stats')"
      >
        #
      </button>
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white hover:bg-white/30 transition"
        title="Dokumentation anzeigen"
        @click="emit('openDocumentation')"
      >
        ?
      </button>
    </div>

    <div v-if="isOpen" class="absolute right-0 top-12 z-50 w-72 rounded-lg bg-white shadow-xl">
      <div v-if="activeMenu === 'upload'" class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Upload</h3>
        <label
          class="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm text-gray-600 hover:bg-gray-100"
        >
          <span class="font-semibold text-gray-800">JSON-Dateien auswählen</span>
          <span class="mt-1 text-xs">Metadaten + MatchDay-Dateien</span>
          <input
            type="file"
            class="sr-only"
            multiple
            accept=".json,application/json"
            @change="emit('fileUpload', $event)"
          />
        </label>
        <button
          class="mt-3 w-full flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm text-gray-600 hover:bg-gray-100"
          @click="emit('loadSample')"
        >
          <span class="font-semibold text-gray-800">Beispieldaten laden</span>
          <span class="mt-1 text-xs">Demo-Daten importieren</span>
        </button>
      </div>

      <div v-if="activeMenu === 'export'" class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Export</h3>
        <p class="text-sm text-gray-600 mb-3">
          Erzeugt eine ZIP-Datei mit allen Grafiken und Bildtexten für alle Spieltage.
        </p>
        <button
          :disabled="props.exporting"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          @click="emit('exportAll')"
        >
          {{ props.exporting ? 'Erstelle ZIP...' : 'ZIP herunterladen' }}
        </button>
        <div v-if="props.exportProgress" class="mt-3">
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>{{ props.exportProgress.label }}</span>
            <span>{{ props.exportProgress.current }}/{{ props.exportProgress.total }}</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-600 transition-all"
              :style="{
                width: `${(props.exportProgress.current / props.exportProgress.total) * 100}%`,
              }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="activeMenu === 'stats'" class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Statistiken</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Wochenende:</span>
            <span class="font-semibold text-gray-900">{{ props.weekendCount ?? 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Spieltage:</span>
            <span class="font-semibold text-gray-900">{{ props.matchDayCount ?? 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Spiele:</span>
            <span class="font-semibold text-gray-900">{{ props.matchCount ?? 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
