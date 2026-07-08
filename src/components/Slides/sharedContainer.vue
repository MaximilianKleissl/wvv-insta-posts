<template>
  <div
    :id="id"
    class="relative flex flex-col bg-slate-50 text-slate-900 antialiased select-none"
    style="width: 1080px; height: 1080px"
  >
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        src="/Splashlogo_Weiss.png"
        alt=""
        class="absolute inset-0 m-auto invert h-[820px] w-[820px] object-contain opacity-[0.035] mix-blend-multiply"
      />
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-green-800 rounded-full blur-3xl" />
    </div>

    <div class="relative z-10 flex h-full w-full flex-col">
      <Header :slideTitle="slideTitle" :matchDay="matchDay" />
      <main class="flex-1 flex flex-col min-w-0 justify-center p-10 gap-5">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './subComponents/Header.vue';
import { SlideStyles } from '@/composables/Slides/useDensity.ts';
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';

defineProps<{
  id: string;
  slideTitle: SlideTitle;
  matchDay?: MatchDayMetaData;
  styles: SlideStyles;
}>();
</script>
