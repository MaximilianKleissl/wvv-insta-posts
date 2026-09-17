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
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, MatchDayMetaData } from '@/lib/slide-types';

interface SlideMatchdayProps {
  id: string;
  season: SeasonData;
  matchDay: MatchDay;
}

const props = defineProps<SlideMatchdayProps>();

// Composables
const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);
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
    <Cell v-for="(m, idx) in matches" :key="idx" :styles="styles" :border-color="teamColors.getHomeBorderColor('60')">
      <template #left_part>
        <Clock :class="['w-6 h-6 mb-1 shrink-0', teamColors.getHomeIconColor()]" />
        <span :class="['text-3xl font-bold tracking-tighter', teamColors.getHomeIconColor()]">{{ m.time }}</span>
        <span
          :class="['text-lg font-bold text-muted uppercase tracking-wider mt-0.5', teamColors.getHomeIconColor()]">Uhr</span>
      </template>

      <div class="flex-1 flex items-center justify-between gap-4 px-2">
        <div class="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
          <TeamLogo :team-name="m.home" :theme-team-name="isHomeClub(m.home) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize" />
          <span class="font-black leading-tight wrap w-full" :class="[styles.textSize, getTeamTextColor(m.home)]">
            {{ m.home }}
          </span>
        </div>

        <!-- Result -->
        <div v-if="m.result"
          :class="['flex items-center gap-3 px-5 py-2 rounded-2xl shadow-lg', teamColors.getResultBgColor()]">
          <span class="text-6xl font-black text-white leading-none">{{ m.result.home }}</span>
          <span :class="['text-3xl font-black', teamColors.getAccentColor()]"> : </span>
          <span class="text-6xl font-black text-white leading-none">{{ m.result.away }}</span>
        </div>

        <VsBadge v-else :border-color="teamColors.getHomeBorderColor('20')" :bg-color="teamColors.getHomeBgColor()"
          :text-color="teamColors.getHomeIconColor()" />

        <div class="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
          <TeamLogo :team-name="m.away" :theme-team-name="isHomeClub(m.away) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize" />
          <span :class="[
            styles.textSize,
            'font-black leading-tight wrap w-full',
            getTeamTextColor(m.away),
          ]">
            {{ m.away }}
          </span>
        </div>
      </div>
    </Cell>
  </SharedContainer>
</template>
