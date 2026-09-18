<template>
  <div
    class="flex items-center gap-6 border border-[#6A2C68]/15 bg-white/70 shadow-[0_10px_24px_rgba(55,26,54,0.08)] backdrop-blur-[2px]"
    :class="[styles.cardPadding, styles.cardRadius]"
  >
    <div
      class="flex flex-col items-center justify-center px-4 border-r min-w-[130px]"
      :class="borderColor ?? 'border-border/40'"
    >
      <slot name="left_part" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { SlideStyles } from '@/composables/Slides/useDensity.ts';

defineProps<{ styles: SlideStyles; borderColor?: string }>();
</script>
