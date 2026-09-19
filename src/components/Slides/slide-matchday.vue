<script setup lang="ts">
import { computed } from 'vue';
import { sortMatches } from '@/lib/grouping';
import { Clock } from 'lucide-vue-next';
import SharedContainer from './sharedContainer.vue';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import MatchTeam from '@/components/Slides/subComponents/MatchTeam.vue';
import MatchScore from '@/components/Slides/subComponents/MatchScore.vue';
import MatchStoryCard from '@/components/Slides/subComponents/MatchStoryCard.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { getMatchDaySlideTitle, getMatchKey, getMatchDayItemCount } from '@/lib/slide-utils';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'square',
});

const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);
const { styles } = useSlideDensity(computed(() => getMatchDayItemCount(props.matchDay)));

const matchdayStyles = computed(() => ({
  ...styles.value,
  cardPadding: 'p-4',
  cardRadius: 'rounded-2xl',
  logoSize: 'w-16 h-16',
  textSize: 'text-xl',
}));

const matches = computed(() => sortMatches(props.matchDay));

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div v-if="format === 'stories'" class="relative flex min-h-0 flex-1 flex-col gap-6">
      <MatchStoryCard
        v-for="m in matches"
        :key="getMatchKey(m)"
        :match="m"
        :match-day="props.matchDay"
        :season="season"
      />
    </div>

    <Cell
      v-for="m in matches"
      v-else
      :key="getMatchKey(m)"
      :styles="matchdayStyles"
      :border-color="teamColors.getHomeBorderColor('60')"
      :tint-hex="teamColors.colorScheme.value.imageTint"
      compact
    >
      <template #left_part>
        <Clock :class="['w-6 h-6 mb-1 shrink-0', teamColors.getHomeIconColor()]" />
        <span :class="['text-3xl font-bold tracking-tighter', teamColors.getHomeIconColor()]">{{
          m.time
        }}</span>
        <span
          :class="[
            'text-xl font-bold text-muted uppercase tracking-wider mt-0.5',
            teamColors.getHomeIconColor(),
          ]"
          >Uhr</span
        >
      </template>

      <div class="flex min-w-0 flex-1 items-center justify-between gap-1 px-1">
        <MatchTeam
          :team-name="m.home"
          :theme-team-name="isHomeClub(m.home) ? props.matchDay.team : undefined"
          :logo-size="styles.logoSize"
          :text-class="[styles.textSize, getTeamTextColor(m.home)]"
        />

        <MatchScore :team-name="props.matchDay.team" :result="m.result" />

        <MatchTeam
          :team-name="m.away"
          :theme-team-name="isHomeClub(m.away) ? props.matchDay.team : undefined"
          :logo-size="styles.logoSize"
          :text-class="[styles.textSize, getTeamTextColor(m.away)]"
        />
      </div>
    </Cell>
  </SharedContainer>
</template>
