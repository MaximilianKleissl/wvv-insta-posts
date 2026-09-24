<template>
  <div class="flex flex-col items-start gap-2" :class="flexDirection">
    <div
      v-for="label in labels"
      :key="label"
      class="w-fit bg-white/95 font-black tracking-tight shadow-xl"
      :class="chipClasses"
      :style="resolvedChipStyle"
    >
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    labels: string[];
    color: string;
    flexDirection?: string;
    chipClasses?: string;
    chipStyle?: Record<string, string>;
  }>(),
  {
    flexDirection: 'flex-col',
    chipClasses: 'px-9 py-2 text-3xl',
    chipStyle: undefined,
  },
);

const resolvedChipStyle = computed(
  () =>
    props.chipStyle ?? {
      color: props.color,
      clipPath: 'polygon(3% 8%, 96% 0, 100% 78%, 91% 100%, 5% 91%, 0 28%)',
    },
);
</script>
