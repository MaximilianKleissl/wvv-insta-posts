<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData } from '@/lib/types';
import { sortedMatchDaysForWeekend } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import OverviewMatchDayCard from './subComponents/OverviewMatchDayCard.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import type { SlideTitle } from '@/lib/slide-types';
import type { SlideFormatMode } from '@/lib/slide-format';
import { getMatchDayKey } from '@/lib/slide-utils';

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

const { density, styles } = useSlideDensity(computed(() => matchDays.value.length));
const overviewStyles = computed(() => ({
  ...styles.value,
  cardPadding: 'p-4',
  cardRadius: 'rounded-2xl',
}));

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

  return 'text-2xl md:text-3xl';
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
  label: [weekend.value.dateRange],
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div :class="containerGridClass">
      <OverviewMatchDayCard
        v-for="md in matchDays"
        :key="getMatchDayKey(md)"
        :md="md"
        :styles="overviewStyles"
        :compact="format === 'square'"
        :format="format"
        :theme-team-name="season.club"
        :team-text-size="teamTextSize"
        :meta-text-size="metaTextSize"
      />
    </div>
  </SharedContainer>
</template>
