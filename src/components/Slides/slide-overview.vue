<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar, MapPin } from 'lucide-vue-next';
import type { SeasonData } from '@/lib/types';
import { sortedMatchDaysForWeekend, germanWeekdayName } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import type { LogoLibrary } from '@/lib/types';
import OverviewHomeOrAway from '@/components/Slides/subComponents/OverviewHomeOrAway.vue';
import { BADGE_LABELS } from '@/lib/slide-constants';
import type { SlideTitle } from '@/lib/slide-types';

interface SlideOverviewProps {
  id: string;
  season: SeasonData;
  weekendIndex: number;
  logoLibrary: LogoLibrary;
}

const props = defineProps<SlideOverviewProps>();

const weekend = computed(() => props.season.weekends[props.weekendIndex]);
const matchDays = computed(() => sortedMatchDaysForWeekend(weekend.value));

const { density, styles } = useSlideDensity(matchDays.value.length);

// Dynamic grid allocation based on match count to balance empty spaces
const containerGridClass = computed(() => {
  if (matchDays.value.length <= 2 || matchDays.value.length >= 5) {
    return 'grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full my-auto';
  }
  return 'flex flex-col gap-4 w-full';
});

const teamTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-xl md:text-2xl';
    case 'compact':
      return 'text-2xl md:text-3xl';
    default:
      return 'text-3xl md:text-4xl';
  }
});

const metaTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-sm md:text-base';
    default:
      return 'text-base md:text-lg';
  }
});

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.season.club,
  title: 'Spiel\nWochenende',
  label: weekend.value.dateRange,
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slideTitle="slideTitle">
    <div :class="containerGridClass">
      <Cell
        v-for="(md, idx) in matchDays"
        :key="idx"
        :styles="styles"
        class="relative flex flex-col sm:flex-row sm:items-center gap-6 p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
      >
        <div
          class="absolute top-0 left-6 px-4 py-1 text-[10px] font-black tracking-widest uppercase rounded-b-lg text-white"
          :class="md.home ? 'bg-emerald-600' : 'bg-green-800'"
        >
          {{ md.home ? BADGE_LABELS.HOME : BADGE_LABELS.AWAY }}
        </div>

        <div
          class="flex w-14 h-14 items-center justify-center rounded-2xl shrink-0 transition-colors"
          :class="md.home ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-green-800'"
        >
          <Home v-if="md.home" :size="26" class="stroke-[2.2]" />
          <Car v-else :size="26" class="stroke-[2.2]" />
        </div>

        <div class="flex-1 min-w-0 z-10 space-y-2">
          <h3
            :class="[
              'font-black tracking-tight truncate leading-tight uppercase text-slate-900',
              teamTextSize,
            ]"
          >
            {{ md.team }}
          </h3>

          <div
            :class="['flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500', metaTextSize]"
          >
            <span class="flex items-center gap-1.5 font-bold text-slate-800">
              <Calendar :size="16" class="text-slate-400 shrink-0" />
              {{ germanWeekdayName(md.date) }}
            </span>
            <span class="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
            <span class="flex items-center gap-1.5 font-medium truncate">
              <MapPin :size="16" class="text-slate-400 shrink-0" />
              {{ md.location }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end shrink-0 sm:border-l sm:border-slate-100 sm:pl-6">
          <OverviewHomeOrAway :md="md" :logoLibrary="logoLibrary" />
        </div>
      </Cell>
    </div>
  </SharedContainer>
</template>
