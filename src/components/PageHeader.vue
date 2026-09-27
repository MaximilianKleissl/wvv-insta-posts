<script setup lang="ts">
import { ref, toRef } from 'vue';
import { useHeader } from '@/composables/useHeader';
import DocumentationModal from '@/components/DocumentationModal.vue';
import HeaderMenu from '@/components/HeaderMenu.vue';
import type { StatEntry } from '@/components/HeaderMenu.vue';

const props = withDefaults(
  defineProps<{
    /** Club name from the loaded config; falls back to a generic label while loading. */
    club?: string;
    season?: string;
    stats?: StatEntry[];
  }>(),
  { club: '', season: '', stats: () => [] },
);

const { clubName, subtitle } = useHeader(toRef(props, 'club'), toRef(props, 'season'));

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
        <slot name="extra-actions" />
        <HeaderMenu :stats="props.stats" @open-documentation="openDocumentation" />
      </div>
    </div>
  </header>
  <DocumentationModal ref="documentationModal" />
</template>
