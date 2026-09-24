<script setup lang="ts">
import { computed } from 'vue';
import type { SeasonData, MatchDay } from '@/lib/types';
import { homeAwayLabel, isTournamentMatchDay, sortMatchDays } from '@/lib/grouping';
import SharedContainer from '../layout/SharedContainer.vue';
import TeamSummaryCard from '../cards/TeamSummaryCard.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
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

const clubName = computed(() => props.season.club);
const { isHomeClub } = useTeamHighlight(props.season, props.teamName);
const isHomeSlide = computed(() => props.gameType === 'home');

const slideMatchDays = computed(() =>
  props.matchDays.filter((matchDay) => matchDay.home === isHomeSlide.value),
);

const fixtures = computed<MatchDayFixture[]>(() => {
  const sorted = sortMatchDays(slideMatchDays.value);

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
  <SharedContainer :id="id" :slide-title="slideTitle" :format="format">
    <TeamSummaryCard :fixtures="fixtures" :team-name="teamName" :club-name="clubName" />
  </SharedContainer>
</template>
