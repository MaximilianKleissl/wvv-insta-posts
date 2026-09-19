<template>
  <div
    class="flex min-w-0 items-center bg-white/70 backdrop-blur-[2px]"
    :class="[styles.cardPadding, styles.cardRadius, compact ? 'gap-2' : 'gap-6']"
    :style="cardStyle"
  >
    <div
      class="flex shrink-0 flex-col items-center justify-center border-r"
      :class="[
        compact ? 'min-w-[96px] px-2' : 'min-w-[130px] px-4',
        borderColor ?? 'border-border/40',
      ]"
    >
      <slot name="left_part" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SlideStyles } from '@/composables/Slides/useDensity.ts';
import { hexToRgba } from '@/lib/team-colors';

const props = withDefaults(
  defineProps<{
    styles: SlideStyles;
    borderColor?: string;
    compact?: boolean;
    emphasis?: boolean;
    tintHex?: string;
  }>(),
  {
    borderColor: undefined,
    compact: false,
    emphasis: false,
    tintHex: undefined,
  },
);

const cardStyle = computed(() => {
  if (!props.tintHex) return undefined;
  if (props.emphasis) {
    return {
      border: `2px solid ${hexToRgba(props.tintHex, 0.95)}`,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    };
  }
  return {
    border: `1px solid ${hexToRgba(props.tintHex, 0.15)}`,
    boxShadow: `0 10px 24px ${hexToRgba(props.tintHex, 0.08)}`,
  };
});
</script>
