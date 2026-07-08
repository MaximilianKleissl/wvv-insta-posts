<template>
  <div 
    class="relative w-full overflow-hidden font-sans select-none h-[360px] bg-zink-900"
  >
  <div class="absolute right-0 top-0 w-[580px] h-full">
    <img 
      :src="actionImage" 
      alt="Volleyball Spieler" 
      class="w-full h-full object-cover object-top-right brightness-90"
    />
  </div>

  <div 
    class="absolute left-0 top-0 w-[640px] h-full z-10 bg-green-800"
    :style="{clipPath: 'polygon(0 0, 100% 0, 74% 100%, 0 100%)' }"
  >
    <div class="p-10 text-white">
      <p class="text-xl font-bold tracking-widest text-slate-100 uppercase mb-2">{{slideTitle.subtitle}}</p>
      <h1 class="text-[52px] font-black uppercase tracking-tight leading-none mb-6">
        {{ slideTitle.title }}
      </h1>
      <span 
        class="inline-block font-black text-xl px-6 py-2 rounded-full shadow-md bg-white text-green-800"
      >
        {{slideTitle.label}}
      </span>
    </div>
  </div>

  <div 
    class="absolute left-0 top-0 w-[720px] h-full z-0 bg-green-900"
    :style="{clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }"
  ></div>

  <div
  v-if="matchDay" 
    class="absolute bottom-0 left-0 w-[580px] h-[64px] bg-white z-20 flex items-center px-10 gap-8 text-green-800"
    :style="{ clipPath: 'polygon(0 0, 93% 0, 100% 100%, 0 100%)' }"
  >
    <div class="flex items-center gap-2">
      <Calendar class="w-6 h-6 shrink-0" />
      <span class="font-bold text-lg">{{ germanWeekdayName(matchDay.date) }}, {{ matchDay.date }}</span>
    </div>

    <div class="flex items-center gap-2">
      <MapPin class="w-6 h-6 shrink-0" />
      <span class="font-bold text-lg">{{matchDay.location}}</span>
    </div>
  </div>

</div>

</template>

<script setup lang="ts">
import { computed } from "vue";
import { MapPin, Calendar } from "lucide-vue-next";
import { germanWeekdayName } from "@/lib/grouping";
import { TEAM_ACTION_IMAGE_MAP, ACTION_IMAGES } from "@/lib/slide-constants";
import type { SlideTitle, MatchDayMetaData } from "@/lib/slide-types";

const props = defineProps<{
  slideTitle: SlideTitle
  matchDay?: MatchDayMetaData
}>();

const actionImage = computed(() => {
  const images = getActionImagesForTeam(props.slideTitle.subtitle);
  const hash = simpleHash(props.slideTitle.label);
  const index = hash % images.length;
  return `/action-images/${images[index]}`;
});

function getActionImagesForTeam(teamName: string): readonly string[] {
  return TEAM_ACTION_IMAGE_MAP[teamName] ?? ACTION_IMAGES.DEFAULT;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
</script>
