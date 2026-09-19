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
import { useHeader } from '@/composables/useHeader';
import { useTeamColors } from '@/composables/useTeamColors';
import { BADGE_LABELS } from '@/lib/slide-constants';
import type { SlideTitle } from '@/lib/slide-types';
import type { SlideFormatMode } from '@/lib/slide-format';
import { getMatchDayKey } from '@/lib/slide-utils';

interface SlideTeamSummaryProps {
  id: string;
  season: SeasonData;
  teamName: string;
  matchDays: MatchDay[];
  gameType: 'home' | 'away';
  format?: SlideFormatMode;
}

const props = withDefaults(defineProps<SlideTeamSummaryProps>(), {
  format: 'square',
});

const { clubName } = useHeader();
const { isHomeClub, getTeamTextColor } = useTeamHighlight(props.season, props.teamName);
const teamColors = useTeamColors(props.teamName);
const isHomeSlide = computed(() => props.gameType === 'home');

const slideMatchDays = computed(() =>
  props.matchDays.filter((matchDay) => matchDay.home === isHomeSlide.value),
);

const isDenseSummary = computed(() => slideMatchDays.value.length > 4);

const sortedMatchDays = computed(() => {
  return [...slideMatchDays.value].sort((a, b) => {
    const aDate = new Date(a.date.split('.').reverse().join('-')).getTime();
    const bDate = new Date(b.date.split('.').reverse().join('-')).getTime();
    return aDate - bDate;
  });
});

/**
 * One pass over the slide's match days derives both the unique opponents per
 * match day (used for rendering) and the pairing count (used for density),
 * so the participant-filtering logic is not duplicated across templates.
 */
const matchDayMetrics = computed(() => {
  const opponentsByMatchDay = new Map<MatchDay, string[]>();
  let opponentCount = 0;

  for (const md of slideMatchDays.value) {
    const participatingTeams = isTournamentMatchDay(md)
      ? (md.teams ?? [])
      : (md.matches ?? []).flatMap((match) => [match.home, match.away]);

    const opponents = Array.from(new Set(participatingTeams.filter((team) => !isHomeClub(team))));
    opponentsByMatchDay.set(md, opponents);
    opponentCount += isTournamentMatchDay(md) ? (md.teams?.length ?? 0) : (md.matches?.length ?? 0);
  }

  return { opponentsByMatchDay, opponentCount };
});

const opponentsByMatchDay = computed(() => matchDayMetrics.value.opponentsByMatchDay);
const totalOpponents = computed(() => matchDayMetrics.value.opponentCount);

const getOpponents = (matchDay: MatchDay): string[] =>
  opponentsByMatchDay.value.get(matchDay) ?? [];

const { density, styles } = useSlideDensity(totalOpponents);

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

const storyFixtures = computed(() =>
  sortedMatchDays.value.map((matchDay) => ({
    matchDay,
    opponents: getOpponents(matchDay),
  })),
);

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

const homeBadgeTextSize = computed(() => (isDenseSummary.value ? 'text-sm' : 'text-lg'));
const awayBadgeTextSize = computed(() =>
  isDenseSummary.value ? 'text-sm text-slate-700' : 'text-base text-slate-700',
);
</script>

<template>
  <SharedContainer :id="id" :styles="summaryStyles" :slide-title="slideTitle" :format="format">
    <template v-if="format === 'stories'">
      <div class="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-6">
        <article
          v-for="fixture in storyFixtures"
          :key="fixture.matchDay.date"
          class="relative flex min-h-0 flex-1 flex-col justify-center overflow-visible rounded-[28px] border-2 border-[#6A2C68]/55 bg-white/80 px-8 py-5 shadow-[0_18px_40px_rgba(55,26,54,0.12)] backdrop-blur-[3px]"
        >
          <div
            class="absolute -left-3 -top-4 flex items-center gap-2 rounded-full bg-[#6A2C68] px-5 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg"
          >
            <Home v-if="fixture.matchDay.home" :size="17" :stroke-width="2.5" />
            <Car v-else :size="17" :stroke-width="2.5" />
            <span>{{ fixture.matchDay.home ? 'Heimspiel' : 'Auswärtsspiel' }}</span>
          </div>

          <div class="flex items-center justify-center gap-3 pt-2">
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
            <span class="text-sm font-bold uppercase tracking-[0.28em] text-[#6A2C68]/75">
              Matchday
            </span>
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
          </div>

          <div class="mt-3 flex min-h-0 flex-1 items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
              <TeamLogo
                :team-name="fixture.matchDay.home ? clubName : (fixture.opponents[0] ?? clubName)"
                :theme-team-name="fixture.matchDay.home ? teamName : undefined"
                size-class="h-24 w-24"
              />
              <span class="max-w-[220px] text-xl font-black leading-[1.05] text-slate-900">
                {{ fixture.matchDay.home ? teamName : fixture.opponents.join(' / ') }}
              </span>
            </div>

            <div class="flex w-20 shrink-0 flex-col items-center gap-2">
              <div class="h-6 w-px bg-[#6A2C68]/20" />
              <span
                class="flex h-11 w-11 items-center justify-center rounded-full bg-[#6A2C68] text-xs font-black tracking-[0.12em] text-white shadow-md"
              >
                VS
              </span>
              <div class="h-6 w-px bg-[#6A2C68]/20" />
            </div>

            <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
              <div class="flex items-center justify-center gap-1">
                <TeamLogo
                  v-for="opponent in fixture.matchDay.home ? fixture.opponents : [teamName]"
                  :key="opponent"
                  :team-name="!fixture.matchDay.home && opponent === teamName ? clubName : opponent"
                  :theme-team-name="
                    !fixture.matchDay.home && opponent === teamName ? teamName : undefined
                  "
                  size-class="h-24 w-24"
                />
              </div>
              <span class="max-w-[220px] text-lg font-black leading-[1.05] text-slate-900">
                {{ fixture.matchDay.home ? fixture.opponents.join(' / ') : teamName }}
              </span>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
            <div
              class="flex items-center gap-2 rounded-full bg-[#6A2C68]/10 px-5 py-2 text-lg font-black tracking-wide text-[#6A2C68]"
            >
              <Calendar :size="20" />
              <span>{{ fixture.matchDay.date }}</span>
            </div>
            <div class="h-px flex-1 bg-[#6A2C68]/20" />
          </div>
        </article>
      </div>
    </template>

    <div v-else class="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden">
      <div
        :class="[
          'mx-auto grid min-h-0 w-full flex-1 gap-6 overflow-y-auto pr-2',
          isDenseSummary
            ? 'h-full max-w-4xl auto-rows-fr grid-cols-2'
            : 'max-w-4xl grid-cols-1 content-start',
        ]"
      >
        <Cell
          v-for="md in sortedMatchDays"
          :key="getMatchDayKey(md)"
          :styles="summaryStyles"
          :border-color="md.home ? teamColors.getHomeBorderColor('60') : undefined"
          :class="[
            'relative w-full overflow-hidden',
            isDenseSummary ? 'h-full' : '',
            'backdrop-blur-[2px] shadow-[0_10px_24px_rgba(55,26,54,0.08)]',
            md.home
              ? [
                  'border-2',
                  teamColors.getHomeBorderColor('95'),
                  teamColors.getHomeBgColor(),
                  'shadow-md',
                ]
              : 'bg-white/80',
          ]"
        >
          <template #left_part>
            <div
              :class="[
                'flex min-w-20 flex-col items-center rounded-lg',
                isDenseSummary ? 'pt-0' : 'pt-1',
                md.home ? teamColors.getLeftPanelBgColor() : 'bg-slate-100',
              ]"
            >
              <Home
                v-if="md.home"
                :size="isDenseSummary ? 16 : 22"
                :class="['stroke-[2.2]', teamColors.getHomeIconColor()]"
              />
              <Car v-else :size="isDenseSummary ? 16 : 22" class="stroke-[2.2] text-slate-500" />
              <div
                :class="[
                  'flex w-full items-center justify-center gap-1 rounded-b-lg text-center font-black uppercase tracking-widest text-white',
                  teamColors.getBadgeBgColor(),
                  isDenseSummary ? 'p-0.5 text-[7px]' : 'p-1 text-[9px]',
                ]"
              >
                <MapPin
                  v-if="!md.home"
                  :size="isDenseSummary ? 9 : 12"
                  :class="['shrink-0', teamColors.getAccentColor()]"
                />
                {{ md.home ? BADGE_LABELS.HOME_SHORT : md.location }}
              </div>
            </div>
          </template>

          <div
            :class="[
              'z-10 flex min-w-0 flex-1 flex-col items-center justify-center',
              isDenseSummary ? 'gap-1' : 'gap-3',
            ]"
          >
            <div
              :class="[
                'w-full rounded-2xl border border-[#6A2C68]/10 bg-white/45 px-3 py-2',
                'flex flex-wrap items-center justify-center',
                isDenseSummary ? 'gap-1' : 'gap-3',
              ]"
            >
              <div
                v-for="opponent in getOpponents(md)"
                :key="opponent"
                :class="[
                  'flex items-center justify-center rounded-xl border border-[#6A2C68]/10 bg-white/65',
                  isDenseSummary ? 'p-0.5' : 'p-2',
                ]"
              >
                <TeamLogo :team-name="opponent" :size-class="opponentLogoSize" />
                <span :class="['ml-2 font-semibold leading-tight', getTeamTextColor(opponent)]">
                  {{ opponent }}
                </span>
              </div>
            </div>
            <div
              :class="[
                'flex items-center rounded-full bg-[#6A2C68]/10 px-4 py-1.5 font-black tracking-tight',
                isDenseSummary ? 'gap-1 text-sm' : 'gap-2',
                md.home
                  ? [homeBadgeTextSize, teamColors.colorScheme.value.primaryDark]
                  : awayBadgeTextSize,
              ]"
            >
              <Calendar
                :size="isDenseSummary ? 13 : md.home ? 19 : 17"
                :class="md.home ? teamColors.getDateTextColor() : 'text-slate-400'"
                class="shrink-0"
              />
              {{ md.date }}
            </div>
          </div>
        </Cell>
      </div>
    </div>
  </SharedContainer>
</template>
