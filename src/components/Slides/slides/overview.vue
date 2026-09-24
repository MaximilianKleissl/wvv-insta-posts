<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData } from '@/lib/types';
import { sortedMatchDaysForWeekend } from '@/lib/grouping';
import SharedContainer from '../layout/SharedContainer.vue';
import OverviewMatchDayCard from '../cards/OverviewMatchDayCard.vue';
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
  format: 'portrait_4by5',
});

const weekend = computed(() => props.season.weekends[props.weekendIndex]);
const matchDays = computed(() => sortedMatchDaysForWeekend(weekend.value));

const overviewStyles = computed(() => ({
  cardPadding: 'px-6 py-4',
  cardRadius: 'rounded-[28px]',
}));

// Dynamic grid allocation based on match count to balance empty spaces
const containerGridClass = computed(() => {
  return (
    'grid min-h-0 flex-1 content-center gap-8 w-full' +
    (matchDays.value.length < 5 ? ' grid-cols-1' : ' grid-cols-2')
  );
});

// Each row takes at most 33% of the available height, so single or double
// match day cards don't stretch across the whole slide.
const gridStyle = computed(() => ({
  gridAutoRows: 'minmax(0, min(33.333%, 1fr))',
}));

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.season.club,
  title: matchDays.value.some((md) => md.match_day_result) ? 'Ergebnisse' : 'Volleyballwochenende',
  label: [weekend.value.dateRange],
}));
</script>

<template>
  <SharedContainer :id="id" :slide-title="slideTitle" :format="format">
    <div :class="containerGridClass" :style="gridStyle">
      <OverviewMatchDayCard
        v-for="md in matchDays"
        :key="getMatchDayKey(md)"
        :md="md"
        :styles="overviewStyles"
        :theme-team-name="season.club"
      />
    </div>
  </SharedContainer>
</template>
