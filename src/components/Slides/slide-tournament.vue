<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData, MatchDay } from '@/lib/types';
import { sortMatches, isTournamentMatchDay } from '@/lib/grouping';
import { Users } from 'lucide-vue-next';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import TeamLogo from '@/components/Slides/subComponents/TeamLogo.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';

interface SlideMatchdayProps {
  id: string;
  season: SeasonData;
  matchDay: MatchDay;
}

const props = defineProps<SlideMatchdayProps>();

// Composables
const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);
const { styles } = useSlideDensity(
  computed(() => {
    const tournament = isTournamentMatchDay(props.matchDay);
    const teams = props.matchDay.teams ?? [];
    const matches = sortMatches(props.matchDay);
    return tournament ? teams.length : matches.length;
  }),
);

// Computed properties
const teams = computed(() => props.matchDay.teams ?? []);

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.matchDay.team,
  title: `${props.matchDay.home ? 'Heim' : 'Auswärts'}-Spieltag`,
  label: props.matchDay.match_day_name ?? props.matchDay.date,
}));

const matchDayMeta = computed<MatchDayMetaData>(() => ({
  date: props.matchDay.date,
  location: props.matchDay.location,
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :match-day="matchDayMeta">
    <div
      :class="[
        'flex items-center gap-3 text-2xl font-bold mb-2',
        teamColors.getPrimaryTextColorWithOpacity('80'),
      ]"
    >
      <Users :class="['w-7 h-7', teamColors.getHomeIconColor()]" />
      <span>Teilnehmende Mannschaften</span>
    </div>
    <div class="grid grid-cols-2 gap-4 content-start flex-1 overflow-hidden">
      <Cell
        v-for="(team, idx) in teams"
        :key="idx"
        :styles="styles"
        :border-color="teamColors.getHomeBorderColor('60')"
      >
        <template #left_part>
          <TeamLogo
            :team-name="team"
            :theme-team-name="isHomeClub(team) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize"
          />
        </template>
        <span
          class="font-extrabold leading-snug truncate"
          :class="[styles.textSize, getTeamTextColor(team)]"
        >
          {{ team }}
        </span>
      </Cell>
    </div>
  </SharedContainer>
</template>
