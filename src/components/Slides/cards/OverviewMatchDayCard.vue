<template>
  <CardFrame :team-name="themeTeamName" :badge-color="teamColors.getInkColor()">
    <template #badge>
      <Calendar :size="20" :stroke-width="2.5" aria-hidden="true" />
      <span>{{ weekdayLabel }}</span>
      <div class="w-5"></div>
      <MapPin :size="20" :stroke-width="2.5" aria-hidden="true" />
      <span class="max-w-[14rem] truncate" :title="md.location">
        {{ md.location }}
      </span>
    </template>

    <!--
      The opponent column is intentionally wider than the team column.
      This gives logos/names more room while keeping the VS badge perfectly centered.
    -->
    <div class="grid min-h-0 flex-1 grid-cols-[1fr_auto_1.6fr] items-center gap-10">
      <!-- Left: club team -->
      <h3
        class="min-w-0 break-words text-center font-black uppercase leading-[1.05] tracking-[-0.035em] text-4xl"
        :style="{ color: teamColors.getInkColor() }"
        :title="md.team"
      >
        {{ md.team }}
      </h3>

      <!-- Middle: VS badge or result -->
      <div class="flex shrink-0 flex-col items-center justify-center">
        <VsBadge
          :team-name="themeTeamName"
          :bg-color="teamColors.getInkColor()"
          :result="md.match_day_result"
        />
      </div>

      <!-- Right: opponents -->
      <ul v-if="opponents.length" class="grid min-w-0 grid-flow-col auto-cols-fr items-start gap-2">
        <li
          v-for="opponent in opponents"
          :key="opponent"
          class="flex min-w-0 flex-col items-center gap-1.5"
          :title="opponent"
        >
          <div
            class="relative flex shrink-0 items-center justify-center"
            :class="opponentLayout.logo"
          >
            <TeamLogo
              :team-name="opponent"
              :theme-team-name="belongsToClub(opponent) ? themeTeamName : undefined"
              size-class="h-full w-full"
            />
          </div>

          <span
            class="max-w-full break-words text-center font-extrabold leading-tight"
            :class="opponentLayout.name"
          >
            {{ opponent }}
          </span>
        </li>
      </ul>

      <p
        v-else
        class="text-center text-[13px] font-bold uppercase tracking-[0.12em] text-slate-300"
      >
        Gegner folgt
      </p>
    </div>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, MapPin } from 'lucide-vue-next';

import { useTeamColors } from '@/composables/useTeamColors';
import { germanWeekdayName, isTournamentMatchDay } from '@/lib/grouping';
import type { MatchDay } from '@/lib/types';

import TeamLogo from '../parts/TeamLogo.vue';
import VsBadge from '../parts/VsBadge.vue';
import CardFrame from './CardFrame.vue';

const props = defineProps<{
  md: MatchDay;
  themeTeamName: string;
}>();

// Above this number of opponents, use the logo layout.
const LARGE_LOGO_MAX_COUNT = 3;

const teamColors = useTeamColors(props.themeTeamName);

const weekdayLabel = computed(() => germanWeekdayName(props.md.date));

function getParticipatingTeams(md: MatchDay): string[] {
  if (isTournamentMatchDay(md)) {
    return md.teams ?? [];
  }

  return (md.matches ?? []).flatMap(({ home, away }) => [home, away]);
}

/**
 * True for any name of the club itself. The config names our teams
 * inconsistently ("Werderaner VV 1990", "… 1990 I", "… 1990 II"), so the club
 * prefix is what tells them apart from a real opponent.
 */
function belongsToClub(name: string): boolean {
  const clubName = props.themeTeamName.trim();
  if (!clubName) return false;

  return name === clubName || name.startsWith(`${clubName} `);
}

const opponents = computed(() => {
  const clubName = props.themeTeamName.trim();
  const ownTeam = props.md.team.trim();

  if (!clubName && !ownTeam) {
    return [];
  }

  const ownNames = new Set([ownTeam, clubName].filter(Boolean));

  if (props.md.matches?.length) {
    // The pairings tell us which of our teams is actually playing: it is the one
    // on our side of every match. Removing that name exactly keeps an intra-club
    // fixture intact, e.g. "… 1990 I" against "… 1990 II".
    for (const match of props.md.matches) {
      const ourSide = (props.md.home ? match.home : match.away).trim();
      if (belongsToClub(ourSide)) {
        ownNames.add(ourSide);
      }
    }
  } else {
    // Without pairings our teams cannot be told apart, so treat every name of
    // the club as ours.
    for (const name of getParticipatingTeams(props.md)) {
      const trimmed = name.trim();
      if (belongsToClub(trimmed)) {
        ownNames.add(trimmed);
      }
    }
  }

  const others = getParticipatingTeams(props.md)
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => !ownNames.has(name));

  return [...new Set(others)];
});

const opponentLayout = computed(() => {
  const count = opponents.value.length;

  if (count > LARGE_LOGO_MAX_COUNT) {
    return {
      logo: 'h-24 w-24 p-1',
      name: 'max-w-[4rem] text-[12px] text-slate-600',
    };
  }

  return {
    logo: 'h-30 w-30 p-2',
    name: 'max-w-[5.5rem] text-[13px] text-slate-600',
  };
});
</script>
