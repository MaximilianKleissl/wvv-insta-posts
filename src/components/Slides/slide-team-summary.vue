<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar, MapPin, Trophy } from 'lucide-vue-next';
import type { SeasonData, MatchDay } from '@/lib/types';
import { germanWeekdayName, isTournamentMatchDay } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import TeamLogo from '@/components/Slides/subComponents/TeamLogo.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { BADGE_LABELS } from '@/lib/slide-constants';
import type { SlideTitle } from '@/lib/slide-types';

interface SlideTeamSummaryProps {
  id: string;
  season: SeasonData;
  teamName: string;
  matchDays: MatchDay[];
}

const props = defineProps<SlideTeamSummaryProps>();

const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season);

const totalOpponents = computed(() => {
  return props.matchDays.reduce((sum, md) => {
    if (isTournamentMatchDay(md)) {
      return sum + (md.teams?.length ?? 0);
    }
    return sum + (md.matches?.length ?? 0);
  }, 0);
});

const { density, styles } = useSlideDensity(totalOpponents.value);

const opponentTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-sm md:text-base';
    case 'compact':
      return 'text-base md:text-lg';
    default:
      return 'text-lg md:text-xl';
  }
});

const metaTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-xs md:text-sm';
    default:
      return 'text-sm md:text-base';
  }
});

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.teamName,
  title: 'Saison\nÜbersicht',
  label: props.season.season,
}));

const sortedMatchDays = computed(() => {
  return [...props.matchDays].sort((a, b) => {
    const aDate = new Date(a.date.split('.').reverse().join('-')).getTime();
    const bDate = new Date(b.date.split('.').reverse().join('-')).getTime();
    return aDate - bDate;
  });
});

const getOpponents = (matchDay: MatchDay): string[] => {
  const participatingTeams = isTournamentMatchDay(matchDay)
    ? (matchDay.teams ?? [])
    : (matchDay.matches ?? []).flatMap((match) => [match.home, match.away]);

  const opponents = participatingTeams.filter((team) => !isHomeClub(team));

  // Remove duplicate teams when a match day contains multiple pairings.
  return Array.from(new Set(opponents));
};

const opponentLogoSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'w-8 h-8';
    case 'compact':
      return 'w-10 h-10';
    default:
      return 'w-12 h-12';
  }
});
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle">
    <div class="flex flex-col gap-3 w-full max-h-full overflow-hidden">
      <!-- <div class="flex items-center gap-3 text-2xl font-bold text-muted-green-800/80 mb-2">
        <Trophy class="w-7 h-7 text-green-800" />
        <span>{{ matchDays.length }} Spieltage</span>
      </div> -->

      <div class="grid grid-cols-2 gap-3 overflow-y-auto">
        <Cell v-for="(md, idx) in sortedMatchDays" :key="idx" :styles="styles">
          <template #left_part>
            <div class="bg-green-800/20 items-center flex flex-col rounded-lg pt-1 min-w-20">
              <Home v-if="md.home" :size="22" class="stroke-[2.2]" />
              <Car v-else :size="22" class="stroke-[2.2]" />
              <div
                class="top-0 text-center left-6 p-1 text-[9px] w-full font-black tracking-widest uppercase rounded-b-lg text-white bg-green-800">
                {{ md.home ? BADGE_LABELS.HOME_SHORT : BADGE_LABELS.AWAY_SHORT }}
              </div>
            </div>
          </template>

          <div class="flex-1 min-w-0 z-10 space-y-1">
            <div :class="['flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500', metaTextSize]">
              <span class="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar :size="14" class="text-slate-400 shrink-0" />
                {{ md.date }}
              </span>
              <span class="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
              <span class="flex items-center gap-1.5 font-medium truncate">
                <MapPin :size="14" class="text-slate-400 shrink-0" />
                {{ md.location }}
              </span>
            </div>

            <div class="flex flex-wrap gap-2 items-center">
              <div v-for="(opponent, oppIdx) in getOpponents(md)" :key="oppIdx"
                class="flex items-center gap-2 rounded-lg px-3 py-2">
                <TeamLogo :team-name="opponent" :size-class="opponentLogoSize" />
                <span :class="['font-semibold truncate', opponentTextSize, getTeamTextColor(opponent)]">
                  {{ opponent }}
                </span>
              </div>
            </div>
          </div>
        </Cell>
      </div>
    </div>
  </SharedContainer>
</template>
