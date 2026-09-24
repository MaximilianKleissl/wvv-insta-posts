<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData, MatchDay } from '@/lib/types';
import { homeAwayLabel, isTournamentMatchDay } from '@/lib/grouping';
import SharedContainer from '../layout/SharedContainer.vue';
import TeamSummaryCard from '../cards/TeamSummaryCard.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import type { SlideTitle, MatchDayFixture } from '@/lib/slide-types';

interface SlideTeamSummaryProps {
  id: string;
  season: SeasonData;
  teamName: string;
  matchDays: MatchDay[];
  gameType: 'home' | 'away';
}

const props = defineProps<SlideTeamSummaryProps>();

const clubName = computed(() => props.season.club);
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

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.teamName,
  title: homeAwayLabel(isHomeSlide.value, 'plural'),
  label: [props.season.season],
}));
</script>

<template>
  <SharedContainer :id="id" :slide-title="slideTitle" :format="'portrait_4by5'">
    <TeamSummaryCard :fixtures="fixtures" :team-name="teamName" :club-name="clubName" />
  </SharedContainer>
</template>
