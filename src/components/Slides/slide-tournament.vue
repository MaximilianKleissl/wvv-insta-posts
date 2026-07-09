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
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';

interface SlideMatchdayProps {
  id: string;
  season: SeasonData;
  matchDay: MatchDay;
}

const props = defineProps<SlideMatchdayProps>();

// Composables
const { getTeamTextColor } = useTeamHighlight(props.season);
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
    <div class="flex items-center gap-3 text-2xl font-bold text-muted-green-800/80 mb-2">
      <Users class="w-7 h-7 text-green-800" />
      <span>Teilnehmende Mannschaften</span>
    </div>
    <div class="grid grid-cols-2 gap-4 content-start flex-1 overflow-hidden">
      <Cell v-for="(team, idx) in teams" :key="idx" :styles="styles">
        <template #left_part>
          <TeamLogo :team-name="team" :size-class="styles.logoSize" />
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
