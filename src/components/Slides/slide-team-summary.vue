<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData, MatchDay } from '@/lib/types';
import { isTournamentMatchDay } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import TeamSummaryStories from './subComponents/TeamSummaryStories.vue';
import TeamSummaryGrid from './subComponents/TeamSummaryGrid.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useHeader } from '@/composables/useHeader';
import type { SlideTitle, MatchDayFixture } from '@/lib/slide-types';
import type { SlideFormatMode } from '@/lib/slide-format';

interface SlideTeamSummaryProps {
  id: string;
  season: SeasonData;
  teamName: string;
  matchDays: MatchDay[];
  gameType: 'home' | 'away';
  format?: SlideFormatMode;
}

const props = withDefaults(defineProps<SlideTeamSummaryProps>(), {
  format: 'portrait_4by5',
});

const { clubName } = useHeader();
const { isHomeClub } = useTeamHighlight(props.season, props.teamName);
const isHomeSlide = computed(() => props.gameType === 'home');

const slideMatchDays = computed(() =>
  props.matchDays.filter((matchDay) => matchDay.home === isHomeSlide.value),
);

const fixtures = computed<MatchDayFixture[]>(() => {
  const sorted = [...slideMatchDays.value].sort((a, b) => {
    const aDate = new Date(a.date.split('.').reverse().join('-')).getTime();
    const bDate = new Date(b.date.split('.').reverse().join('-')).getTime();
    return aDate - bDate;
  });

  return sorted.map((matchDay) => ({
    matchDay,
    opponents: getOpponents(matchDay),
  }));
});

/**
 * One pass over the slide's match days derives both the unique opponents per
 * match day (used for rendering) and the pairing count (used for density),
 * so the participant-filtering logic is not duplicated.
 */
const opponentsByMatchDay = computed(() => {
  const map = new Map<MatchDay, string[]>();
  let opponentCount = 0;

  for (const md of slideMatchDays.value) {
    const participatingTeams = isTournamentMatchDay(md)
      ? (md.teams ?? [])
      : (md.matches ?? []).flatMap((match) => [match.home, match.away]);

    map.set(md, Array.from(new Set(participatingTeams.filter((team) => !isHomeClub(team)))));
    opponentCount += isTournamentMatchDay(md) ? (md.teams?.length ?? 0) : (md.matches?.length ?? 0);
  }

  return { map, opponentCount };
});

const getOpponents = (matchDay: MatchDay): string[] =>
  opponentsByMatchDay.value.map.get(matchDay) ?? [];

const totalOpponents = computed(() => opponentsByMatchDay.value.opponentCount);
const isDenseSummary = computed(() => slideMatchDays.value.length > 4);

const { density, styles } = useSlideDensity(totalOpponents);

const summaryStyles = computed(() => ({
  ...styles.value,
  cardPadding: isDenseSummary.value ? 'p-2' : styles.value.cardPadding,
  cardRadius: isDenseSummary.value ? 'rounded-xl' : styles.value.cardRadius,
}));

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

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.teamName,
  title: isHomeSlide.value ? 'Heimspiele' : 'Auswärtsspiele',
  label: [props.season.season],
}));
</script>

<template>
  <SharedContainer :id="id" :styles="summaryStyles" :slide-title="slideTitle" :format="format">
    <TeamSummaryStories
      v-if="format === 'stories' || format === 'portrait_4by5'"
      :fixtures="fixtures"
      :team-name="teamName"
      :club-name="clubName"
    />
    <TeamSummaryGrid
      v-else
      :fixtures="fixtures"
      :season="season"
      :team-name="teamName"
      :styles="summaryStyles"
      :is-dense="isDenseSummary"
      :opponent-logo-size="opponentLogoSize"
    />
  </SharedContainer>
</template>
