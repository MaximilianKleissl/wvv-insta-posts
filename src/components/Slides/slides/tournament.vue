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
  cardPadding: 'px-6 py-4',
  cardRadius: 'rounded-[28px]',
  logoSize: 'w-28 h-28',
  textSize: 'text-3xl',
}));

// Computed properties
const teams = computed(() => {
  const allTeams = props.matchDay.teams ?? [];
  return [...allTeams.filter((team) => !isHomeClub(team)), ...allTeams.filter((team) => isHomeClub(team))]; // sort us to the end
});

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));

const isOdd = computed(() => teams.value.length % 2 === 1);
</script>

<template>
  <SharedContainer :id="id" :slide-title="slideTitle" :format="format">
    <div
      class="flex items-center gap-3 text-2xl font-bold mb-2"
      :class="[teamColors.getPrimaryTextColorWithOpacity('80')]"
    >
      <Users :class="['w-7 h-7', teamColors.getHomeIconColor()]" />
      <span>Teilnehmende Mannschaften</span>
    </div>
    <div class="grid gap-4 content-start flex-1 min-h-0 overflow-hidden grid-cols-2 auto-rows-fr">
      <CardFrame
        v-for="(team, index) in teams"
        :key="team"
        :team-name="props.matchDay.team"
        :styles="styles"
        :fill="true"
        :class="isOdd && index === teams.length - 1 ? 'col-span-2' : ''"
      >
        <div
          class="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 text-center"
        >
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
