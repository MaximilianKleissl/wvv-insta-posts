<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar, MapPin } from 'lucide-vue-next';
import type { SeasonData, MatchDay } from '@/lib/types';
import { isTournamentMatchDay } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import TeamLogo from '@/components/Slides/subComponents/TeamLogo.vue';
import { BADGE_LABELS } from '@/lib/slide-constants';
import type { SlideTitle } from '@/lib/slide-types';

interface SlideTeamSummaryProps {
  id: string;
  season: SeasonData;
  teamName: string;
  matchDays: MatchDay[];
}

const props = defineProps<SlideTeamSummaryProps>();

const isHomeClub = (teamName: string) => teamName.startsWith(props.season.club);

const totalOpponents = computed(() => {
  return props.matchDays.reduce((sum, md) => {
    if (isTournamentMatchDay(md)) {
      return sum + (md.teams?.length ?? 0);
    }
    return sum + (md.matches?.length ?? 0);
  }, 0);
});

const { density, styles } = useSlideDensity(totalOpponents.value);

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: 'Saison\nÜbersicht',
  title: props.teamName,
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
      <div class="grid grid-cols-2 content-start gap-4 overflow-y-auto">
        <Cell v-for="(md, idx) in sortedMatchDays" :key="idx" :styles="styles" :class="[
          md.home
            ? 'border-2 border-green-700/50 bg-green-50 shadow-md'
            : 'bg-white/80',
        ]">
          <template #left_part>
            <div :class="[
              'flex min-w-20 flex-col items-center rounded-lg pt-1',
              md.home ? 'bg-green-800/25' : 'bg-slate-100',
            ]">
              <Home v-if="md.home" :size="22" class="stroke-[2.2] text-green-800" />
              <Car v-else :size="22" class="stroke-[2.2] text-slate-500" />
              <div
                class="flex w-full items-center justify-center gap-1 rounded-b-lg bg-green-800 p-1 text-center text-[9px] font-black uppercase tracking-widest text-white">
                <MapPin v-if="!md.home" :size="12" class="shrink-0 text-green-100" />
                {{ md.home ? BADGE_LABELS.HOME_SHORT : md.location }}
              </div>
            </div>
          </template>

          <div class="z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-3">
            <div class="flex flex-wrap items-center justify-center gap-3">
              <div v-for="(opponent, oppIdx) in getOpponents(md)" :key="oppIdx"
                class="flex items-center justify-center rounded-xl bg-slate-50 p-2">
                <TeamLogo :team-name="opponent" :size-class="opponentLogoSize" />
              </div>
            </div>
            <div :class="[
              'flex items-center gap-2 font-black tracking-tight',
              md.home ? 'text-lg text-green-900' : 'text-base text-slate-700',
            ]">
              <Calendar :size="md.home ? 19 : 17" :class="md.home ? 'text-green-700' : 'text-slate-400'"
                class="shrink-0" />
              {{ md.date }}
            </div>
          </div>
        </Cell>
      </div>
    </div>
  </SharedContainer>
</template>
