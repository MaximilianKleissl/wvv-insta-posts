<script setup lang="ts">
import { computed } from 'vue';
import { sortMatches } from '@/lib/grouping';
import SharedContainer from '../layout/SharedContainer.vue';
import MatchCard from '../cards/MatchCard.vue';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { getMatchDaySlideTitle, getMatchKey } from '@/lib/slide-utils';

// Each card (row) may only take at most 33% of the available height, so a
// match day with only one or two matches doesn't stretch the cards.
const MATCH_ROW_CLASS = 'min-h-0 max-h-[33.333%]';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'portrait_4by5',
});

const matches = computed(() => sortMatches(props.matchDay));

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));
</script>

<template>
  <SharedContainer :id="id" :slide-title="slideTitle" :format="format">
    <div class="relative flex min-h-0 flex-1 flex-col justify-center gap-6">
      <MatchCard
        v-for="m in matches"
        :key="getMatchKey(m)"
        :class="MATCH_ROW_CLASS"
        :match="m"
        :match-day="props.matchDay"
        :season="season"
        :format="format"
      />
    </div>
  </SharedContainer>
</template>
