<template>
  <div :id="id" class="relative flex flex-col bg-slate-50 text-slate-900 antialiased select-none"
    style="width: 1080px; height: 1080px">
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img src="/image.png" alt="" class="absolute inset-0 m-auto h-[1080px] w-[1080px] object-contain" />
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-green-800 rounded-full blur-3xl" />
    </div>

    <div class="relative z-10 flex h-full w-full flex-col">
      <Header :slide-title="slideTitle" :match-day="matchDay" />
      <main class="flex-1 flex flex-col min-w-0 min-h-0 justify-center p-10 gap-5 overflow-hidden">
        <slot />
      </main>
      <footer class="flex flex-col items-center gap-3 pb-6">
        <p class="text-sm font-medium text-gray-600 tracking-wide">
          Der WVV bedankt sich bei seinen Sponsoren
        </p>
        <div class="flex items-center justify-center gap-8">
          <img v-for="(logo, index) in sponsorLogos" :key="index" :src="logo.src" :alt="logo.alt"
            class="h-12 w-auto object-contain brightness-95" />
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Header from './subComponents/Header.vue';
import { SlideStyles } from '@/composables/Slides/useDensity.ts';
import { useSponsors } from '@/composables/useSponsors';
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';

const props = defineProps<{
  id: string;
  slideTitle: SlideTitle;
  matchDay?: MatchDayMetaData;
  styles: SlideStyles;
}>();

const { getRandomSponsors } = useSponsors();

const sponsorLogos = computed(() => {
  const sponsors = getRandomSponsors.value(3, props.slideTitle.subtitle);
  return sponsors.map((sponsor) => ({
    src: `https://maximiliankleissl.github.io/wvv-posts-config/Sponsoren/${sponsor.filename}`,
    alt: sponsor.name,
  }));
});
</script>
