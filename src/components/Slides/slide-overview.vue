<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar, MapPin } from 'lucide-vue-next';
import type { SeasonData } from '@/lib/types';
import { sortedMatchDaysForWeekend, germanWeekdayName } from '@/lib/grouping';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import HomeTeamIndication from '@/components/Slides/subComponents/HomeTeamIndication.vue';
import TeamLogo from '@/components/Slides/subComponents/TeamLogo.vue';
import { BADGE_LABELS } from '@/lib/slide-constants';
import { useHeader } from '@/composables/useHeader';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle } from '@/lib/slide-types';

import type { SlideFormatMode } from '@/lib/slide-format';

interface SlideOverviewProps {
  id: string;
  season: SeasonData;
  weekendIndex: number;
  format?: SlideFormatMode;
}

const props = withDefaults(defineProps<SlideOverviewProps>(), {
  format: 'square',
});

const { clubName } = useHeader();
const weekend = computed(() => props.season.weekends[props.weekendIndex]);
const matchDays = computed(() => sortedMatchDaysForWeekend(weekend.value));

const storyFixtures = computed(() =>
  matchDays.value
    .map((matchDay) => {
      const match = matchDay.matches?.[0];
      if (!match) return null;
      return {
        date: matchDay.date,
        home: match.home,
        away: match.away,
      };
    })
    .filter((fixture): fixture is { date: string; home: string; away: string } => fixture !== null),
);

const { density, styles } = useSlideDensity(matchDays.value.length);
const primaryTeamName = computed(() => matchDays.value[0]?.team ?? props.season.club);
const teamColors = useTeamColors(primaryTeamName.value);

// Dynamic grid allocation based on match count to balance empty spaces
const containerGridClass = computed(() => {
  if (props.format === 'stories') {
    return 'flex flex-1 flex-col gap-6 w-full';
  }

  if (matchDays.value.length <= 2 || matchDays.value.length >= 5) {
    return 'grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full my-auto';
  }
  return 'flex flex-col gap-4 w-full';
});

const teamTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-xl md:text-2xl';
    case 'compact':
      return 'text-2xl md:text-3xl';
    default:
      return 'text-3xl md:text-4xl';
  }
});

const metaTextSize = computed(() => {
  switch (density.value) {
    case 'tight':
      return 'text-sm md:text-base';
    default:
      return 'text-base md:text-lg';
  }
});

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.format === 'stories' ? matchDays.value[0]?.team ?? props.season.club : props.season.club,
  title: props.format === 'stories' ? 'Heimspiele' : 'Spiel\nWochenende',
  label: props.format === 'stories' ? props.season.season : weekend.value.dateRange,
}));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <template v-if="format === 'stories'">
      <div class="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-7">
        <article v-for="fixture in storyFixtures" :key="`${fixture.date}-${fixture.home}-${fixture.away}`"
          class="relative flex min-h-0 flex-1 flex-col justify-center overflow-visible rounded-[28px] border-2 border-[#6A2C68]/55 bg-white/80 px-8 py-6 shadow-[0_18px_40px_rgba(55,26,54,0.12)] backdrop-blur-[3px]">
          <div
            class="absolute -left-3 -top-4 flex items-center gap-2 rounded-full bg-[#6A2C68] px-5 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg">
            <Home :size="17" :stroke-width="2.5" />
            <span>Heimspiel</span>
          </div>

          <div class="flex items-center justify-center gap-3 pt-2">
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
            <span class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6A2C68]/75">Matchday</span>
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
          </div>

          <div class="mt-4 flex min-h-0 flex-1 items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 text-center">
              <TeamLogo :team-name="fixture.home === props.season.club ? clubName : fixture.home"
                :theme-team-name="fixture.home === props.season.club ? primaryTeamName : undefined"
                size-class="h-28 w-28" />
              <span class="max-w-[210px] text-xl font-black leading-[1.05] text-slate-900">
                {{ fixture.home }}
              </span>
            </div>

            <div class="flex w-20 shrink-0 flex-col items-center gap-3">
              <div class="h-8 w-px bg-[#6A2C68]/20" />
              <span
                class="flex h-12 w-12 items-center justify-center rounded-full bg-[#6A2C68] text-sm font-black tracking-[0.12em] text-white shadow-md">
                VS
              </span>
              <div class="h-8 w-px bg-[#6A2C68]/20" />
            </div>

            <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 text-center">
              <TeamLogo :team-name="fixture.away" size-class="h-28 w-28" />
              <span class="max-w-[210px] text-xl font-black leading-[1.05] text-slate-900">
                {{ fixture.away }}
              </span>
            </div>
          </div>

          <div class="mt-5 flex items-center gap-3">
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
            <div
              class="flex items-center gap-2 rounded-full bg-[#6A2C68]/10 px-5 py-2 text-lg font-black tracking-wide text-[#6A2C68]">
              <Calendar :size="20" />
              <span>{{ fixture.date }}</span>
            </div>
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
          </div>
        </article>
      </div>
    </template>

    <div v-else :class="containerGridClass">
      <Cell v-for="(md, idx) in matchDays" :key="idx" :styles="styles"
        :border-color="teamColors.getHomeBorderColor('60')" class="relative overflow-hidden">
        <template #left_part>
          <div :class="[
            'items-center flex flex-col rounded-lg pt-1 min-w-[90px]',
            teamColors.getLeftPanelBgColor(),
          ]">
            <Home v-if="md.home" :size="26" :class="['stroke-[2.2]', teamColors.getHomeIconColor()]" />
            <Car v-else :size="26" class="stroke-[2.2]" />
            <div :class="[
              'top-0 text-center left-6 p-1 text-[10px] w-full font-black tracking-widest uppercase rounded-b-lg text-white',
              teamColors.getBadgeBgColor(),
            ]">
              {{ md.home ? BADGE_LABELS.HOME_SHORT : BADGE_LABELS.AWAY_SHORT }}
            </div>
          </div>
        </template>

        <div class="flex-1 min-w-0 z-10 space-y-2 rounded-2xl border border-[#6A2C68]/10 bg-white/45 px-4 py-3">
          <h3 :class="[
            'font-black tracking-tight truncate leading-tight uppercase text-slate-900',
            teamTextSize,
          ]">
            {{ md.team }}
          </h3>

          <div :class="['flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500', metaTextSize]">
            <span class="flex items-center gap-1.5 font-bold text-slate-800">
              <Calendar :size="16" class="text-slate-400 shrink-0" />
              {{ germanWeekdayName(md.date) }}
            </span>
            <span class="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
            <span class="flex items-center gap-1.5 font-medium truncate">
              <MapPin :size="16" class="text-slate-400 shrink-0" />
              {{ md.location }}
            </span>
          </div>
        </div>

        <div v-if="md.match_day_result" class="flex items-center justify-center shrink-0">
          <div :class="[
            'relative flex flex-col items-center justify-center min-w-[92px] px-4 py-2 rounded-2xl shadow-lg overflow-hidden',
            teamColors.getResultBgColor(),
          ]">
            <!-- subtle highlight -->
            <div :class="['absolute inset-x-0 top-0 h-1', teamColors.getHighlightColor()]" />

            <span :class="[
              'text-[10px] uppercase tracking-[0.25em] font-black',
              teamColors.getAccentColor(),
            ]">
              Ergebnis
            </span>

            <span class="text-4xl leading-none font-black text-white tracking-tight">
              {{ md.match_day_result }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end shrink-0 sm:pl-6">
          <HomeTeamIndication :md="md" />
        </div>
      </Cell>
    </div>
  </SharedContainer>
</template>
