<script setup lang="ts">
import { computed } from 'vue';
import { Users } from 'lucide-vue-next';
import SharedContainer from '../layout/SharedContainer.vue';
import CardFrame from '../cards/CardFrame.vue';
import TeamLogo from '../parts/TeamLogo.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { getMatchDaySlideTitle } from '@/lib/slide-utils';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'portrait_4by5',
});

// Composables
const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);

const styles = computed(() => ({
  density: 'normal' as const,
  cardPadding: 'p-8',
  cardRadius: 'rounded-3xl',
  logoSize: 'w-32 h-32',
  textSize: 'text-4xl',
}));

// Computed properties
const teams = computed(() => props.matchDay.teams ?? []);

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));

const gridClass = computed(() => 'grid-cols-1 auto-rows-fr');
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div
      class="flex items-center gap-3 text-2xl font-bold mb-2"
      :class="[teamColors.getPrimaryTextColorWithOpacity('80')]"
    >
      <Users :class="['w-7 h-7', teamColors.getHomeIconColor()]" />
      <span>Teilnehmende Mannschaften</span>
    </div>
    <div :class="['grid gap-4 content-start flex-1 overflow-hidden', gridClass]">
      <CardFrame
        v-for="team in teams"
        :key="team"
        :team-name="props.matchDay.team"
        :styles="styles"
        :fill="true"
      >
        <div class="flex w-full min-w-0 flex-col items-center justify-center gap-2 text-center">
          <TeamLogo
            :team-name="team"
            :theme-team-name="isHomeClub(team) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize"
          />
          <span
            class="font-extrabold leading-snug wrap-break-word"
            :class="[styles.textSize, getTeamTextColor(team)]"
          >
            {{ team }}
          </span>
        </div>
      </CardFrame>
    </div>
  </SharedContainer>
</template>
