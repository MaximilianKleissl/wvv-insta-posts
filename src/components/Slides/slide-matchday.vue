<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData, MatchDay } from '@/lib/types';
import { sortMatches, isTournamentMatchDay } from '@/lib/grouping';
import { Clock } from 'lucide-vue-next';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import VsBadge from '@/components/Slides/subComponents/VsBadge.vue';
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
const matches = computed(() => sortMatches(props.matchDay));

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
    <Cell v-for="(m, idx) in matches" :key="idx" :styles="styles">
      <template #left_part>
        <Clock class="w-6 h-6 text-green-800 mb-1 shrink-0" />
        <span class="text-3xl font-bold text-green-800 tracking-tighter">{{ m.time }}</span>
        <span class="text-lg font-bold text-green-800 text-muted uppercase tracking-wider mt-0.5"
          >Uhr</span
        >
      </template>

      <div class="flex-1 flex items-center justify-between gap-4 px-2">
        <div class="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
          <TeamLogo :team-name="m.home" :size-class="styles.logoSize" />
          <span
            class="font-black leading-tight wrap w-full"
            :class="[styles.textSize, getTeamTextColor(m.home)]"
          >
            {{ m.home }}
          </span>
        </div>

        <!-- Result -->
        <div
          class="flex items-center gap-3 px-5 py-2 rounded-2xl bg-green-900 shadow-lg"
          v-if="m.result"
        >
          <span class="text-6xl font-black text-white leading-none">{{ m.result.home }}</span>
          <span class="text-3xl font-black text-green-200"> : </span>
          <span class="text-6xl font-black text-white leading-none">{{ m.result.away }}</span>
        </div>

        <VsBadge v-else />

        <div class="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
          <TeamLogo :team-name="m.away" :size-class="styles.logoSize" />
          <span
            :class="[
              styles.textSize,
              'font-black leading-tight wrap w-full',
              getTeamTextColor(m.away),
            ]"
          >
            {{ m.away }}
          </span>
        </div>
      </div>
    </Cell>
  </SharedContainer>
</template>
