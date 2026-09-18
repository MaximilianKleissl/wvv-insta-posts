<template>
  <div
    class="flex min-w-0 items-center border border-[#6A2C68]/15 bg-white/70 shadow-[0_10px_24px_rgba(55,26,54,0.08)] backdrop-blur-[2px]"
    :class="[
      styles.cardPadding,
      styles.cardRadius,
      compact ? 'gap-2' : 'gap-6',
    ]">
    <div :class="[
      'flex shrink-0 flex-col items-center justify-center border-r',
      compact ? 'min-w-[96px] px-2' : 'min-w-[130px] px-4',
      borderColor ?? 'border-border/40',
    ]">
      <slot name="left_part" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { SlideStyles } from '@/composables/Slides/useDensity.ts';

defineProps<{ styles: SlideStyles; borderColor?: string; compact?: boolean }>();
</script>
