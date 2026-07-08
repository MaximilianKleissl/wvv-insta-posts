<template>
  <div
    class="flex items-center gap-6 border border-border/40 shadow-sm"
    :class="[styles.cardPadding, styles.cardRadius]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { SlideStyles } from '@/composables/Slides/useDensity.ts';

defineProps<{ styles: SlideStyles }>();
</script>
