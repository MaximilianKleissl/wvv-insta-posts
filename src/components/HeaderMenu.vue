<script lang="ts">
/** One labelled number in the header statistics popover. */
export interface StatEntry {
  label: string;
  value: number | string;
}
</script>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ stats: StatEntry[] }>();

const emit = defineEmits<{
  openDocumentation: [];
}>();

const router = useRouter();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

// Close the popover on Escape or on a click outside, so it never floats over
// the page after the user has moved on.
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu();
};

const onClickOutside = (event: MouseEvent) => {
  if (!containerRef.value?.contains(event.target as Node)) closeMenu();
};

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('click', onClickOutside);
});
</script>

<template>
  <div ref="containerRef" class="relative">
    <div class="flex items-center gap-2">
      <button
        :aria-expanded="isOpen"
        aria-haspopup="true"
        :class="[
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
          isOpen ? 'bg-white text-green-900' : 'bg-white/20 text-white hover:bg-white/30',
        ]"
        title="Statistiken"
        aria-label="Statistiken"
        @click.stop="toggleMenu"
      >
        #
      </button>
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white hover:bg-white/30 transition"
        title="Config-Editor öffnen"
        aria-label="Config-Editor öffnen"
        @click="router.push('/editor')"
      >
        ✎
      </button>
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white hover:bg-white/30 transition"
        title="Dokumentation anzeigen"
        aria-label="Dokumentation anzeigen"
        @click="emit('openDocumentation')"
      >
        ?
      </button>
    </div>

    <div v-if="isOpen" class="absolute right-0 top-12 z-50 w-72 rounded-lg bg-white shadow-xl">
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Statistiken</h3>
        <div v-if="props.stats.length === 0" class="text-sm text-gray-500">
          Noch keine Daten geladen.
        </div>
        <div v-else class="space-y-2">
          <div v-for="stat in props.stats" :key="stat.label" class="flex justify-between text-sm">
            <span class="text-gray-600">{{ stat.label }}:</span>
            <span class="font-semibold text-gray-900">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
