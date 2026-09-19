<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, MapPin } from 'lucide-vue-next';
import type { SeasonData } from '@/lib/types';
import { sortedMatchDaysForWeekend, germanWeekdayName } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import HomeTeamIndication from '@/components/Slides/subComponents/HomeTeamIndication.vue';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle } from '@/lib/slide-types';

import type { SlideFormatMode } from '@/lib/slide-format';

interface SlideOverviewProps {
  id: string;
  season: SeasonData;
  weekendIndex: number;
  format?: SlideFormatMode;
}

const props = withDefaults(defineProps<SlideOverviewProps>(), {
  format: 'square',
});

const weekend = computed(() => props.season.weekends[props.weekendIndex]);
const matchDays = computed(() => sortedMatchDaysForWeekend(weekend.value));

const { density, styles } = useSlideDensity(matchDays.value.length);
const teamColors = useTeamColors(props.season.club);
const overviewStyles = computed(() =>
  props.format === 'stories'
    ? {
      ...styles.value,
      cardPadding: 'p-4',
      cardRadius: 'rounded-2xl',
    }
    : {
      ...styles.value,
      cardPadding: 'p-4',
      cardRadius: 'rounded-2xl',
    },
);

// Dynamic grid allocation based on match count to balance empty spaces
const containerGridClass = computed(() => {
  if (props.format === 'stories') {
    return 'grid min-h-0 flex-1 grid-cols-1 auto-rows-fr gap-4 w-full';
  }

  if (matchDays.value.length <= 2 || matchDays.value.length >= 5) {
    return 'grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full my-auto';
  }
  return 'flex flex-col gap-4 w-full';
});

const teamTextSize = computed(() => {
  if (props.format === 'stories') {
    switch (density.value) {
      case 'tight':
        return 'text-xl';
      case 'compact':
        return 'text-2xl';
      default:
        return 'text-3xl';
    }
  }

  switch (density.value) {
    case 'tight':
      return 'text-2xl md:text-3xl';
    case 'compact':
      return 'text-2xl md:text-3xl';
    default:
      return 'text-2xl md:text-3xl';
  }
});

const metaTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-base md:text-lg';
    default:
      return 'text-lg md:text-xl';
  }
});

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.season.club,
  title: 'Spiel\nWochenende',
  label: weekend.value.dateRange,
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div :class="containerGridClass">
      <Cell v-for="(md, idx) in matchDays" :key="idx" :styles="overviewStyles"
        :border-color="teamColors.getHomeBorderColor('60')" :compact="format === 'square'"
        :class="format === 'stories' ? 'min-h-0 overflow-hidden' : 'relative overflow-hidden'">
        <template #left_part>
          <!-- <div :class="[
            'items-center flex flex-col rounded-lg pt-1 min-w-[90px]',
            teamColors.getLeftPanelBgColor(),
          ]">
            <Home v-if="md.home" :size="26" :class="['stroke-[2.2]', teamColors.getHomeIconColor()]" />
            <Car v-else :size="26" class="stroke-[2.2]" />
            <div :class="[
              'top-0 text-center left-6 p-1 text-xs w-full font-black tracking-widest uppercase rounded-b-lg text-white',
              teamColors.getBadgeBgColor(),
            ]">
              {{ md.home ? BADGE_LABELS.HOME_SHORT : BADGE_LABELS.AWAY_SHORT }}
            </div>
          </div> -->
          <HomeTeamIndication :md="md" />

        </template>

        <div class="flex-1 min-w-0 z-10 space-y-2 rounded-2xl bg-white/45 px-4 py-3">
          <h3 :class="[
            'font-black tracking-tight truncate leading-tight uppercase text-slate-900',
            format === 'stories' ? 'text-2xl' : '',
            teamTextSize,
          ]">
            {{ md.team }}
          </h3>

          <div
            :class="['flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500', format === 'stories' ? 'text-base' : metaTextSize]">
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

        <div v-if="md.match_day_result" class="flex items-center justify-center shrink-0">
          <div :class="[
            'relative flex flex-col items-center justify-center min-w-[92px] px-4 py-2 rounded-2xl shadow-lg overflow-hidden',
            teamColors.getResultBgColor(),
          ]">
            <!-- subtle highlight -->
            <div :class="['absolute inset-x-0 top-0 h-1', teamColors.getHighlightColor()]" />

            <span :class="[
              'text-xs uppercase tracking-[0.25em] font-black',
              teamColors.getAccentColor(),
            ]">
              Ergebnis
            </span>

            <span class="text-5xl leading-none font-black text-white tracking-tight">
              {{ md.match_day_result }}
            </span>
          </div>
        </div>

      </Cell>
    </div>
  </SharedContainer>
</template>
