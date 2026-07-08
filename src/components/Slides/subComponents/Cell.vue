<template>
  <div
    class="flex items-center gap-6 border border-border/40 shadow-sm"
    :class="[styles.cardPadding, styles.cardRadius]"
  >
    <div
      class="flex flex-col items-center justify-center px-4 border-r border-green-800/60 min-w-[130px]"
    >
      <slot name="left_part" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { SlideStyles } from '@/composables/Slides/useDensity.ts';

defineProps<{ styles: SlideStyles }>();
</script>
