<template>
  <CardFrame :team-name="matchDay.team" :fill="true">
    <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
      <TeamLogo
        :team-name="match.home"
        :theme-team-name="homeThemeTeamName"
        size-class="h-24 w-24"
      />
      <span
        class="max-w-55 font-black leading-[1.05] text-slate-900"
        :class="formatClasses.teamTextSize"
      >
        {{ match.home }}
      </span>
    </div>

    <VsBadge :team-name="matchDay.team" :result="match.result" />

    <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
      <TeamLogo
        :team-name="match.away"
        :theme-team-name="awayThemeTeamName"
        size-class="h-24 w-24"
      />
      <span
        class="max-w-55 font-black leading-[1.05] text-slate-900"
        :class="formatClasses.teamTextSize"
      >
        {{ match.away }}
      </span>
    </div>

    <template #footer>
      <Clock :size="20" />
      <span>{{ match.time }} Uhr</span>
    </template>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Clock } from 'lucide-vue-next';
import CardFrame from './CardFrame.vue';
import TeamLogo from '../parts/TeamLogo.vue';
import VsBadge from '../parts/VsBadge.vue';
import type { Match, MatchDay, SeasonData } from '@/lib/types';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { SlideFormatMode, getFormatClasses } from '@/lib/slide-format';

const props = defineProps<{
  match: Match;
  matchDay: MatchDay;
  season: SeasonData;
  format: SlideFormatMode;
}>();

const { isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);

const homeThemeTeamName = computed(() =>
  isHomeClub(props.match.home) ? props.matchDay.team : undefined,
);
const awayThemeTeamName = computed(() =>
  isHomeClub(props.match.away) ? props.matchDay.team : undefined,
);

const formatClasses = computed(() => getFormatClasses(props.format));
</script>
