<script setup lang="ts">
import { computed } from 'vue';
import { SLIDE_FORMATS, SLIDE_FORMAT_MODES, type SlideFormatMode } from '@/lib/slide-format';

const props = defineProps<{ modelValue: SlideFormatMode }>();
const emit = defineEmits<{ 'update:modelValue': [value: SlideFormatMode] }>();

// Must be reactive: the hint describes the currently selected format, not the
// one that happened to be selected when the component was created.
const selected = computed(() => SLIDE_FORMATS[props.modelValue]);
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <span class="text-sm font-medium text-gray-700">Format:</span>
    <div class="flex items-center gap-2" role="group" aria-label="Bildformat">
      <button
        v-for="mode in SLIDE_FORMAT_MODES"
        :key="mode"
        type="button"
        :aria-pressed="props.modelValue === mode"
        :title="`${SLIDE_FORMATS[mode].label} – ${SLIDE_FORMATS[mode].width} × ${SLIDE_FORMATS[mode].height} px`"
        :class="[
          'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          props.modelValue === mode
            ? 'border-green-800 bg-green-800 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:border-green-700 hover:text-green-700',
        ]"
        @click="emit('update:modelValue', mode)"
      >
        {{ SLIDE_FORMATS[mode].label }}
      </button>
    </div>
    <span class="text-xs text-gray-500">
      {{ selected.hint }} · {{ selected.width }} × {{ selected.height }} px
    </span>
  </div>
</template>
