<template>
  <article
    :class="[
      'relative flex min-h-0 flex-1 flex-col justify-center overflow-visible rounded-[28px] border-2 bg-white/80 px-8 py-5 backdrop-blur-[3px]',
      teamColors.getHomeBorderColor('60'),
    ]"
    :style="storyCardStyle"
  >
    <div
      :class="[
        'absolute -left-3 -top-4 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg',
        teamColors.getBadgeBgColor(),
      ]"
    >
      <Clock :size="17" :stroke-width="2.5" />
      <span>{{ match.time }} Uhr</span>
    </div>

    <div class="flex items-center justify-center gap-3 pt-2">
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
      <span
        :class="[
          'text-sm font-bold uppercase tracking-[0.28em]',
          teamColors.getPrimaryTextColorWithOpacity('80'),
        ]"
      >
         Matchday
      </span>
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
    </div>

    <div class="mt-3 flex min-h-0 flex-1 items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
        <TeamLogo
          :team-name="match.home"
          :theme-team-name="homeThemeTeamName"
          size-class="h-24 w-24"
        />
        <span class="max-w-55 text-xl font-black leading-[1.05] text-slate-900">
          {{ match.home }}
        </span>
      </div>

      <MatchScore :team-name="matchDay.team" :result="match.result" />

      <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
        <TeamLogo
          :team-name="match.away"
          :theme-team-name="awayThemeTeamName"
          size-class="h-24 w-24"
        />
        <span class="max-w-55 text-xl font-black leading-[1.05] text-slate-900">
          {{ match.away }}
        </span>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-3">
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
      <div
        :class="[
          'flex items-center gap-2 rounded-full px-5 py-2 text-lg font-black tracking-wide',
          teamColors.getHomeBgColor(),
          teamColors.getHomeIconColor(),
        ]"
      >
        <Calendar :size="20" />
        <span>{{ matchDay.date }}</span>
      </div>
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Clock, Calendar } from 'lucide-vue-next';
import TeamLogo from './TeamLogo.vue';
import MatchScore from './MatchScore.vue';
import { hexToRgba } from '@/lib/team-colors';
import type { Match, MatchDay, SeasonData } from '@/lib/types';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';

const props = defineProps<{
  match: Match;
  matchDay: MatchDay;
  season: SeasonData;
}>();

const { isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);

const storyCardStyle = computed(() => ({
  boxShadow: `0 18px 40px ${hexToRgba(teamColors.colorScheme.value.imageTint, 0.12)}`,
}));

const hairlineColor = computed(() => teamColors.getHairlineColor());

const homeThemeTeamName = computed(() =>
  isHomeClub(props.match.home) ? props.matchDay.team : undefined,
);
const awayThemeTeamName = computed(() =>
  isHomeClub(props.match.away) ? props.matchDay.team : undefined,
);
</script>
