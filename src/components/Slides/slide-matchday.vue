<script setup lang="ts">
import { computed } from 'vue';
import { sortMatches } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import MatchStoryCard from '@/components/Slides/subComponents/MatchStoryCard.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { getMatchDaySlideTitle, getMatchKey, getMatchDayItemCount } from '@/lib/slide-utils';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'portrait_4by5',
});

const { styles } = useSlideDensity(computed(() => getMatchDayItemCount(props.matchDay)));

const matches = computed(() => sortMatches(props.matchDay));

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div class="relative flex min-h-0 flex-1 flex-col gap-6">
      <MatchStoryCard
        v-for="m in matches"
        :key="getMatchKey(m)"
        :match="m"
        :match-day="props.matchDay"
        :season="season"
      />
    </div>
  </SharedContainer>
</template>
