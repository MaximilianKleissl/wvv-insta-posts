<template>
  <div class="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden">
    <div
      :class="[
        'mx-auto grid min-h-0 w-full flex-1 gap-6 overflow-y-auto pr-2',
        isDense
          ? 'h-full max-w-4xl auto-rows-fr grid-cols-2'
          : 'max-w-4xl grid-cols-1 content-start',
      ]"
    >
      <Cell
        v-for="fixture in fixtures"
        :key="getMatchDayKey(fixture.matchDay)"
        :styles="styles"
        :border-color="fixture.matchDay.home ? teamColors.getHomeBorderColor('60') : undefined"
        :tint-hex="teamColors.colorScheme.value.imageTint"
        :emphasis="fixture.matchDay.home"
        :class="[
          'relative w-full overflow-hidden',
          isDense ? 'h-full' : '',
          'backdrop-blur-[2px]',
          fixture.matchDay.home ? teamColors.getHomeBgColor() : 'bg-white/80',
        ]"
      >
        <template #left_part>
          <div
            :class="[
              'flex min-w-20 flex-col items-center rounded-lg',
              isDense ? 'pt-0' : 'pt-1',
              fixture.matchDay.home ? teamColors.getLeftPanelBgColor() : 'bg-slate-100',
            ]"
          >
            <Home
              v-if="fixture.matchDay.home"
              :size="isDense ? 16 : 22"
              :class="['stroke-[2.2]', teamColors.getHomeIconColor()]"
            />
            <Car v-else :size="isDense ? 16 : 22" class="stroke-[2.2] text-slate-500" />
            <div
              :class="[
                'flex w-full items-center justify-center gap-1 rounded-b-lg text-center font-black uppercase tracking-widest text-white',
                teamColors.getBadgeBgColor(),
                isDense ? 'p-0.5 text-[7px]' : 'p-1 text-[9px]',
              ]"
            >
              <MapPin
                v-if="!fixture.matchDay.home"
                :size="isDense ? 9 : 12"
                :class="['shrink-0', teamColors.getAccentColor()]"
              />
              {{ fixture.matchDay.home ? BADGE_LABELS.HOME_SHORT : fixture.matchDay.location }}
            </div>
          </div>
        </template>

        <div
          :class="[
            'z-10 flex min-w-0 flex-1 flex-col items-center justify-center',
            isDense ? 'gap-1' : 'gap-3',
          ]"
        >
          <div
            :class="[
              'w-full rounded-2xl border bg-white/45 px-3 py-2',
              teamColors.getHomeBorderColor('20'),
              'flex flex-wrap items-center justify-center',
              isDense ? 'gap-1' : 'gap-3',
            ]"
          >
            <div
              v-for="opponent in fixture.opponents"
              :key="opponent"
              :class="[
                'flex items-center justify-center rounded-xl border bg-white/65',
                teamColors.getHomeBorderColor('20'),
                isDense ? 'p-0.5' : 'p-2',
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
              'flex items-center rounded-full px-4 py-1.5 font-black tracking-tight',
              teamColors.getHomeBgColor(),
              isDense ? 'gap-1 text-sm' : 'gap-2',
              fixture.matchDay.home
                ? [homeBadgeTextSize, teamColors.colorScheme.value.primaryDark]
                : awayBadgeTextSize,
            ]"
          >
            <Calendar
              :size="isDense ? 13 : fixture.matchDay.home ? 19 : 17"
              :class="fixture.matchDay.home ? teamColors.getDateTextColor() : 'text-slate-400'"
              class="shrink-0"
            />
            {{ fixture.matchDay.date }}
          </div>
        </div>
      </Cell>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar, MapPin } from 'lucide-vue-next';
import Cell from './Cell.vue';
import TeamLogo from './TeamLogo.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideStyles } from '@/composables/Slides/useDensity';
import type { MatchDayFixture } from '@/lib/slide-types';
import type { SeasonData } from '@/lib/types';
import { BADGE_LABELS } from '@/lib/slide-constants';
import { getMatchDayKey } from '@/lib/slide-utils';

const props = defineProps<{
  fixtures: MatchDayFixture[];
  season: SeasonData;
  teamName: string;
  styles: SlideStyles;
  isDense: boolean;
  opponentLogoSize: string;
}>();

const { getTeamTextColor } = useTeamHighlight(props.season, props.teamName);
const teamColors = useTeamColors(props.teamName);

const homeBadgeTextSize = computed(() => (props.isDense ? 'text-sm' : 'text-lg'));
const awayBadgeTextSize = computed(() =>
  props.isDense ? 'text-sm text-slate-700' : 'text-base text-slate-700',
);
</script>
