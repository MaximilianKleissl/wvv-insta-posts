<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar, MapPin } from 'lucide-vue-next';
import type { SeasonData, MatchDay } from '@/lib/types';
import { isTournamentMatchDay } from '@/lib/grouping';
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
  gameType: 'home' | 'away';
}

const props = defineProps<SlideTeamSummaryProps>();

const { getTeamTextColor } = useTeamHighlight(props.season);
const isHomeClub = (teamName: string) => teamName.startsWith(props.season.club);
const isHomeSlide = computed(() => props.gameType === 'home');
const isDenseSummary = computed(() => slideMatchDays.value.length > 4);

const slideMatchDays = computed(() =>
  props.matchDays.filter((matchDay) => matchDay.home === isHomeSlide.value),
);

const totalOpponents = computed(() => {
  return slideMatchDays.value.reduce((sum, md) => {
    if (isTournamentMatchDay(md)) {
      return sum + (md.teams?.length ?? 0);
    }
    return sum + (md.matches?.length ?? 0);
  }, 0);
});

const { density, styles } = useSlideDensity(totalOpponents.value);

const summaryStyles = computed(() => ({
  ...styles.value,
  cardPadding: isDenseSummary.value ? 'p-2' : styles.value.cardPadding,
  cardRadius: isDenseSummary.value ? 'rounded-xl' : styles.value.cardRadius,
}));

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.teamName,
  title: isHomeSlide.value ? 'Heimspiele' : 'Auswärtsspiele',
  label: props.season.season,
}));

const sortedMatchDays = computed(() => {
  return [...slideMatchDays.value].sort((a, b) => {
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
  if (isDenseSummary.value) return 'w-6 h-6';

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
  <SharedContainer :id="id" :styles="summaryStyles" :slide-title="slideTitle">
    <div class="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden">
      <div :class="[
        'mx-auto grid min-h-0 w-full flex-1 gap-4 overflow-y-auto pr-2',
        isDenseSummary
          ? 'h-full max-w-4xl auto-rows-fr grid-cols-2'
          : 'max-w-3xl grid-cols-1 content-start',
      ]">
        <Cell v-for="(md, idx) in sortedMatchDays" :key="idx" :styles="summaryStyles" :class="[
          'w-full',
          isDenseSummary ? 'h-full' : '',
          md.home
            ? 'border-2 border-green-700/50 bg-green-50 shadow-md'
            : 'bg-white/80',
        ]">
          <template #left_part>
            <div :class="[
              'flex min-w-20 flex-col items-center rounded-lg',
              isDenseSummary ? 'pt-0' : 'pt-1',
              md.home ? 'bg-green-800/25' : 'bg-slate-100',
            ]">
              <Home v-if="md.home" :size="isDenseSummary ? 16 : 22" class="stroke-[2.2] text-green-800" />
              <Car v-else :size="isDenseSummary ? 16 : 22" class="stroke-[2.2] text-slate-500" />
              <div :class="[
                'flex w-full items-center justify-center gap-1 rounded-b-lg bg-green-800 text-center font-black uppercase tracking-widest text-white',
                isDenseSummary ? 'p-0.5 text-[7px]' : 'p-1 text-[9px]',
              ]">
                <MapPin v-if="!md.home" :size="isDenseSummary ? 9 : 12" class="shrink-0 text-green-100" />
                {{ md.home ? BADGE_LABELS.HOME_SHORT : md.location }}
              </div>
            </div>
          </template>

          <div :class="[
            'z-10 flex min-w-0 flex-1 flex-col items-center justify-center',
            isDenseSummary ? 'gap-1' : 'gap-3',
          ]">
            <div :class="[
              'flex flex-wrap items-center justify-center',
              isDenseSummary ? 'gap-1' : 'gap-3',
            ]">
              <div v-for="(opponent, oppIdx) in getOpponents(md)" :key="oppIdx" :class="[
                'flex items-center justify-center rounded-xl',
                isDenseSummary ? 'p-0.5' : 'p-2',
              ]">
                <TeamLogo :team-name="opponent" :size-class="opponentLogoSize" />
                <span :class="['ml-2 font-semibold leading-tight', getTeamTextColor(opponent)]">
                  {{ opponent }}
                </span>
              </div>
            </div>
            <div :class="[
              'flex items-center font-black tracking-tight',
              isDenseSummary ? 'gap-1 text-xs' : 'gap-2',
              md.home
                ? isDenseSummary ? 'text-sm text-green-900' : 'text-lg text-green-900'
                : isDenseSummary ? 'text-xs text-slate-700' : 'text-base text-slate-700',
            ]">
              <Calendar :size="isDenseSummary ? 13 : md.home ? 19 : 17"
                :class="md.home ? 'text-green-700' : 'text-slate-400'" class="shrink-0" />
              {{ md.date }}
            </div>
          </div>
        </Cell>
      </div>
    </div>
  </SharedContainer>
</template>
