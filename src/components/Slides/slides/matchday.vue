<script setup lang="ts">
import { computed } from 'vue';
import { sortMatches } from '@/lib/grouping';
import SharedContainer from '../layout/SharedContainer.vue';
import MatchCard from '../cards/MatchCard.vue';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { getMatchDaySlideTitle, getMatchKey } from '@/lib/slide-utils';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'portrait_4by5',
});

const styles = computed(() => ({
  density: 'normal' as const,
  cardPadding: 'p-8',
  cardRadius: 'rounded-3xl',
  logoSize: 'w-32 h-32',
  textSize: 'text-4xl',
}));

const matches = computed(() => sortMatches(props.matchDay));

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div class="relative flex min-h-0 flex-1 flex-col gap-6">
      <MatchCard
        v-for="m in matches"
        :key="getMatchKey(m)"
        :match="m"
        :match-day="props.matchDay"
        :season="season"
        :format="format"
      />
    </div>
  </SharedContainer>
</template>
