<template>
  <div v-if="format === 'stories'"
    class="relative h-[500px] w-full shrink-0 overflow-hidden bg-[#6A2C68] font-sans select-none">
    <div class="absolute inset-y-0 right-0 w-[72%] opacity-95" :style="{
      backgroundImage: `url(${actionImage})`,
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
      maskImage: 'linear-gradient(90deg, transparent 0%, black 35%, black 88%, transparent 100%)',
    }" />
    <div class="absolute -left-[10%] top-[57%] h-44 w-[82%] rotate-[-8deg] bg-white/95"
      :style="{ clipPath: 'polygon(0 25%, 8% 8%, 30% 17%, 55% 0, 83% 14%, 100% 5%, 96% 82%, 62% 70%, 35% 91%, 7% 74%)' }" />
    <div class="absolute -left-[8%] top-[66%] h-20 w-[75%] rotate-[-6deg] bg-white/45"
      :style="{ clipPath: 'polygon(0 35%, 18% 0, 48% 22%, 74% 5%, 100% 25%, 94% 80%, 50% 62%, 15% 100%)' }" />
    <div class="absolute inset-0 bg-gradient-to-r from-[#6A2C68] via-[#6A2C68]/85 to-transparent" />
    <div class="relative z-10 flex h-full flex-col justify-between p-14 text-white">
      <div class="max-w-[640px] pt-2">
        <div class="mb-5 flex items-center gap-4">
          <span class="h-px w-16 bg-white/80" />
          <p class="text-xl font-semibold uppercase tracking-[0.38em] text-white/85">
            {{ slideTitle.subtitle }}
          </p>
        </div>
        <h1 class="text-[86px] font-black uppercase leading-[0.88] tracking-[-0.04em]">
          {{ slideTitle.title }}
        </h1>
      </div>
      <div class="w-fit px-9 py-4 text-3xl font-black tracking-tight text-[#6A2C68] shadow-xl"
        :style="{ clipPath: 'polygon(3% 8%, 96% 0, 100% 78%, 91% 100%, 5% 91%, 0 28%)' }">
        {{ slideTitle.label }}
      </div>
    </div>
  </div>

  <div v-else class="relative w-full shrink-0 overflow-hidden font-sans select-none h-[360px] bg-zink-900">
    <div class="absolute right-0 top-0 w-[580px] h-full">
      <img :src="actionImage" alt="Volleyball Spieler"
        class="w-full h-full object-cover object-top-right brightness-90" />
    </div>

    <div :class="['absolute left-0 top-0 w-[640px] h-full z-10', teamColors.getBadgeBgColor()]"
      :style="{ clipPath: 'polygon(0 0, 100% 0, 74% 100%, 0 100%)' }">
      <div class="p-10 text-white">
        <p class="text-xl font-bold tracking-widest text-slate-100 uppercase mb-2">
          {{ slideTitle.subtitle }}
        </p>
        <h1 class="text-[52px] font-black uppercase tracking-tight leading-none mb-6">
          {{ slideTitle.title }}
        </h1>
        <span :class="[
          'inline-block font-black text-xl px-6 py-2 rounded-full shadow-md bg-white',
          teamColors.getHomeIconColor(),
        ]">
          {{ slideTitle.label }}
        </span>
      </div>
    </div>

    <div :class="[
      'absolute left-0 top-0 w-[720px] h-full z-0',
      teamColors.getResultBgColorWithOpacity('90'),
    ]" :style="{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }"></div>

    <div v-if="matchDay" :class="[
      'absolute bottom-0 left-0 w-[580px] h-[64px] z-20 flex items-center px-10 gap-8 text-white',
      teamColors.getResultBgColorWithOpacity('90'),
    ]" :style="{ clipPath: 'polygon(0 0, 93% 0, 100% 100%, 0 100%)' }">
      <div class="flex items-center gap-2">
        <Calendar class="w-6 h-6 shrink-0" />
        <span class="font-bold text-lg">{{ germanWeekdayName(matchDay.date) }}, {{ matchDay.date }}</span>
      </div>

      <div class="flex items-center gap-2">
        <MapPin class="w-6 h-6 shrink-0" />
        <span class="font-bold text-lg">{{ matchDay.location }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { MapPin, Calendar } from 'lucide-vue-next';
import { germanWeekdayName } from '@/lib/grouping';
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';
import { useTeamColors } from '@/composables/useTeamColors';
import { useActionImages } from '@/composables/useActionImages';

const props = defineProps<{
  slideTitle: SlideTitle;
  matchDay?: MatchDayMetaData;
  format?: 'square' | 'stories';
}>();
const teamColors = useTeamColors(props.slideTitle.subtitle);
const { loadActionImages, getActionImagesForTeam } = useActionImages();

onMounted(() => {
  void loadActionImages();
});

const actionImage = computed(() => {
  const images = getActionImagesForTeam(props.slideTitle.subtitle);
  const hash = simpleHash(props.slideTitle.label);
  const index = hash % images.length;
  return `https://maximiliankleissl.github.io/wvv-posts-config/Action_Images/${images[index]}`;
});

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
</script>
