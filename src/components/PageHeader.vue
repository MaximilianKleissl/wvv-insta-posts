<script setup lang="ts">
import { ref } from 'vue';
import { useHeader } from '@/composables/useHeader';
import DocumentationModal from '@/components/DocumentationModal.vue';
import HeaderMenu from '@/components/HeaderMenu.vue';
import type { ExportProgress } from '@/lib/export-zip';

const { clubName, subtitle } = useHeader();

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
}>();

const documentationModal = ref<InstanceType<typeof DocumentationModal> | null>(null);

const openDocumentation = () => {
  documentationModal.value?.open();
};

defineExpose({
  openDocumentation,
});
</script>

<template>
  <header
    class="mb-8 rounded-lg bg-linear-to-r from-green-900 to-green-800 p-6 text-white shadow-lg"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p class="mb-1 text-xs uppercase tracking-widest opacity-80">{{ subtitle }}</p>
        <h1 class="text-3xl font-black">{{ clubName }}</h1>
      </div>
      <div class="flex items-center gap-3">
        <HeaderMenu
          :exporting="props.exporting"
          :export-progress="props.exportProgress"
          :weekend-count="props.weekendCount"
          :match-day-count="props.matchDayCount"
          :match-count="props.matchCount"
          @file-upload="emit('fileUpload', $event)"
          @load-sample="emit('loadSample')"
          @export-all="emit('exportAll')"
          @open-documentation="openDocumentation"
        />
      </div>
    </div>
  </header>
  <DocumentationModal ref="documentationModal" />
</template>
