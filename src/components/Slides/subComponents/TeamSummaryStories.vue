<template>
  <div class="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-6">
    <Cell
      v-for="fixture in fixtures"
      :key="fixture.matchDay.date"
      :styles="storyCardStyles"
      :border-color="teamColors.getHomeBorderColor('60')"
      :tint-hex="teamColors.colorScheme.value.imageTint"
      layout="vertical"
      :show-left-panel="false"
      background-class="bg-white/80 backdrop-blur-[3px]"
      custom-class="border-2 overflow-visible justify-center"
      :show-badge="true"
      :badge-class="[
        'absolute -left-3 -top-4 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg',
        teamColors.getBadgeBgColor(),
      ]"
    >
      <template #badge>
        <Home v-if="fixture.matchDay.home" :size="17" :stroke-width="2.5" />
        <Car v-else :size="17" :stroke-width="2.5" />
        <span>{{ fixture.matchDay.home ? 'Heimspiel' : 'Auswärtsspiel' }}</span>
      </template>

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
            :team-name="fixture.matchDay.home ? clubName : (fixture.opponents[0] ?? clubName)"
            :theme-team-name="fixture.matchDay.home ? teamName : undefined"
            size-class="h-24 w-24"
          />
          <span class="max-w-55 text-xl font-black leading-[1.05] text-slate-900">
            {{ fixture.matchDay.home ? teamName : fixture.opponents.join(' / ') }}
          </span>
        </div>

        <div class="flex w-20 shrink-0 flex-col items-center">
          <VsBadge
            :bg-color="teamColors.getBadgeBgColor()"
            :hairline-color="hairlineColor"
          />
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
          <span class="max-w-55 text-lg font-black leading-[1.05] text-slate-900">
            {{ fixture.matchDay.home ? fixture.opponents.join(' / ') : teamName }}
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
          <span>{{ fixture.matchDay.date }}</span>
        </div>
        <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
      </div>
    </Cell>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Home, Car, Calendar } from 'lucide-vue-next';
import TeamLogo from './TeamLogo.vue';
import VsBadge from './VsBadge.vue';
import Cell from './Cell.vue';
import { useTeamColors } from '@/composables/useTeamColors';
import type { MatchDayFixture } from '@/lib/slide-types';
import type { SlideStyles } from '@/composables/Slides/useDensity.ts';

const props = defineProps<{
  fixtures: MatchDayFixture[];
  teamName: string;
  clubName: string;
}>();

const teamColors = useTeamColors(props.teamName);
const hairlineColor = computed(() => teamColors.getHairlineColor());

const storyCardStyles = computed<SlideStyles>(() => ({
  density: 'normal',
  cardPadding: 'px-8 py-5',
  cardRadius: 'rounded-[28px]',
  logoSize: 'h-24 w-24',
  textSize: 'text-4xl',
}));
</script>
