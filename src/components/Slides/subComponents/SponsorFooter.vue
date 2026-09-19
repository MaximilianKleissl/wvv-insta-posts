<template>
  <footer :class="['flex flex-col items-center pb-10', format === 'stories' ? 'gap-3' : 'gap-3']">
    <p class="text-xs font-semibold tracking-[0.14em] text-gray-600 uppercase">
      {{
        format === 'stories'
          ? 'Partner, Unterstützer und Förderer'
          : 'Der WVV bedankt sich bei seinen Sponsoren'
      }}
    </p>
    <div :class="['flex items-center justify-center', format === 'stories' ? 'gap-12' : 'gap-8']">
      <img
        v-for="logo in sponsorLogos"
        :key="logo.src"
        :src="logo.src"
        :alt="logo.alt"
        :class="[format === 'stories' ? 'h-16' : 'h-12', 'w-auto object-contain brightness-95']"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { SlideFormatMode } from '@/lib/slide-format';

defineProps<{
  format: SlideFormatMode;
  sponsorLogos: ReadonlyArray<{ src: string; alt: string }>;
}>();
</script>
