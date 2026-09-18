<template>
  <div
:id="id" class="relative flex flex-col bg-slate-50 text-slate-900 antialiased select-none"
    :style="slideBoxStyle">
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img
:src="backgroundSrc" alt="" class="absolute inset-0 m-auto object-contain grayscale opacity-70"
        :style="backgroundImageStyle" />
      <div
class="absolute inset-0 m-auto mix-blend-color opacity-70" :style="{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        background: `radial-gradient(circle at center, transparent 0%, transparent 34%, ${teamColors.colorScheme.value.imageTint} 100%)`,
      }" />
      <div
:class="[
        'absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl',
        teamColors.getBadgeBgColor(),
      ]" />
      <div
v-if="format === 'stories'" class="absolute -bottom-24 -left-24 h-72 w-[720px] rotate-[-9deg] bg-[#6A2C68]/15"
        :style="{ clipPath: 'polygon(0 20%, 12% 0, 34% 17%, 56% 4%, 82% 20%, 100% 8%, 94% 86%, 63% 70%, 38% 100%, 10% 78%)' }" />
      <div
v-if="format === 'stories'" class="absolute bottom-0 right-[-10%] h-36 w-[55%] rotate-[7deg] bg-white/30"
        :style="{ clipPath: 'polygon(0 30%, 22% 6%, 52% 24%, 79% 0, 100% 20%, 94% 100%, 20% 86%)' }" />
      <div
v-if="format === 'stories'" class="absolute -bottom-44 -right-36 h-[520px] w-[520px] rounded-full border-[18px] border-[#6A2C68]/10 opacity-80"
        :style="{
          background: 'radial-gradient(circle at 34% 28%, transparent 0 34%, rgba(106,44,104,0.06) 35% 36%, transparent 37%), linear-gradient(28deg, transparent 46%, rgba(106,44,104,0.12) 47% 49%, transparent 50%), linear-gradient(-32deg, transparent 49%, rgba(106,44,104,0.1) 50% 52%, transparent 53%)',
        }" />
    </div>

    <div class="relative z-10 flex h-full w-full flex-col">
      <Header :slide-title="slideTitle" :match-day="matchDay" :format="format" />
      <main
:class="[
        'flex-1 flex flex-col min-w-0 min-h-0 justify-center p-10 overflow-hidden',
        format === 'stories' ? 'gap-8' : 'gap-5',
      ]">
        <slot />
      </main>
      <footer :class="['flex flex-col items-center pb-6', format === 'stories' ? 'gap-4' : 'gap-3']">
        <p class="text-sm font-semibold tracking-[0.16em] text-gray-600 uppercase">
          {{ format === 'stories' ? 'Partner, Unterstützer und Förderer' : 'Der WVV bedankt sich bei seinen Sponsoren' }}
        </p>
        <div :class="['flex items-center justify-center', format === 'stories' ? 'gap-12' : 'gap-8']">
          <img
v-for="(logo, index) in sponsorLogos" :key="index" :src="logo.src" :alt="logo.alt"
            :class="[format === 'stories' ? 'h-16' : 'h-12', 'w-auto object-contain brightness-95']" />
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
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';
import { getSlideBoxStyle, getSlideDimensions, type SlideFormatMode } from '@/lib/slide-format';

const props = withDefaults(
  defineProps<{
    id: string;
    slideTitle: SlideTitle;
    matchDay?: MatchDayMetaData;
    styles: SlideStyles;
    format?: SlideFormatMode;
  }>(),
  {
    matchDay: undefined,
    format: 'square',
  },
);

const { getRandomSponsors } = useSponsors();
const teamColors = useTeamColors(props.slideTitle.subtitle);

const dimensions = computed(() => getSlideDimensions(props.format));
const slideBoxStyle = computed(() => getSlideBoxStyle(props.format));
const backgroundSrc = computed(() => (props.format === 'stories' ? 'image_story.png' : 'image.png'));
const backgroundImageStyle = computed(() => ({
  width: `${dimensions.value.width}px`,
  height: `${dimensions.value.height}px`,
}));

const sponsorLogos = computed(() => {
  const sponsors = getRandomSponsors.value(3, props.slideTitle.subtitle);
  return sponsors.map((sponsor) => ({
    src: `https://maximiliankleissl.github.io/wvv-posts-config/Sponsoren/${sponsor.filename}`,
    alt: sponsor.name,
  }));
});
</script>
