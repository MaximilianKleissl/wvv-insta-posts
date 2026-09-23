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

const styles = computed(() => ({
  density: 'normal' as const,
  cardPadding: 'p-8',
  cardRadius: 'rounded-3xl',
  logoSize: 'w-32 h-32',
  textSize: 'text-4xl',
}));

const overviewStyles = computed(() => ({
  density: 'normal' as const,
  cardPadding: 'p-4',
  cardRadius: 'rounded-2xl',
  logoSize: 'w-16 h-16',
  textSize: 'text-xl',
}));

// Dynamic grid allocation based on match count to balance empty spaces
const containerGridClass = computed(() => {
  return 'grid min-h-0 flex-1 grid-cols-1 auto-rows-fr gap-4 w-full';
});

const teamTextSize = computed(() => 'text-3xl');
const metaTextSize = computed(() => 'text-base');

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.season.club,
  title: matchDays.value.some((md) => md.match_day_result) ? 'Ergebnisse' : 'Volleyballwochenende',
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
        :theme-team-name="season.club"
        :team-text-size="teamTextSize"
        :meta-text-size="metaTextSize"
      />
    </div>
  </SharedContainer>
</template>
