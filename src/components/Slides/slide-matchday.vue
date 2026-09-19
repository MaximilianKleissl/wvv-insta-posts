<script setup lang="ts">
import { computed } from 'vue';
import { sortMatches } from '@/lib/grouping';
import { Clock } from 'lucide-vue-next';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import VsBadge from '@/components/Slides/subComponents/VsBadge.vue';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import TeamLogo from '@/components/Slides/subComponents/TeamLogo.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { pickFormatClass } from '@/lib/slide-format';
import { getMatchDaySlideTitle, getMatchKey, getMatchDayItemCount } from '@/lib/slide-utils';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'square',
});

// Composables
const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);
const { styles } = useSlideDensity(computed(() => getMatchDayItemCount(props.matchDay)));

const matchdayStyles = computed(() =>
  props.format === 'square'
    ? {
        ...styles.value,
        cardPadding: 'p-4',
        cardRadius: 'rounded-2xl',
        logoSize: 'w-16 h-16',
        textSize: 'text-xl',
      }
    : styles.value,
);

// Computed properties
const matches = computed(() => sortMatches(props.matchDay));

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));

const cellClass = computed(() => pickFormatClass(props.format, '', 'flex-1 min-h-0'));
const contentGap = computed(() => pickFormatClass(props.format, 'gap-1', 'gap-4'));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <Cell
      v-for="m in matches"
      :key="getMatchKey(m)"
      :styles="matchdayStyles"
      :border-color="teamColors.getHomeBorderColor('60')"
      :compact="format === 'square'"
      :class="cellClass"
    >
      <template #left_part>
        <Clock :class="['w-6 h-6 mb-1 shrink-0', teamColors.getHomeIconColor()]" />
        <span :class="['text-3xl font-bold tracking-tighter', teamColors.getHomeIconColor()]">{{
          m.time
        }}</span>
        <span
          :class="[
            'text-xl font-bold text-muted uppercase tracking-wider mt-0.5',
            teamColors.getHomeIconColor(),
          ]"
          >Uhr</span
        >
      </template>

      <div :class="['flex min-w-0 flex-1 items-center justify-between px-1', contentGap]">
        <div class="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
          <TeamLogo
            :team-name="m.home"
            :theme-team-name="isHomeClub(m.home) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize"
          />
          <span
            class="font-black leading-tight wrap w-full"
            :class="[styles.textSize, getTeamTextColor(m.home)]"
          >
            {{ m.home }}
          </span>
        </div>

        <!-- Result -->
        <div
          v-if="m.result"
          :class="[
            'flex items-center gap-3 px-5 py-2 rounded-2xl shadow-lg',
            teamColors.getResultBgColor(),
          ]"
        >
          <span class="text-6xl font-black text-white leading-none">{{ m.result.home }}</span>
          <span :class="['text-3xl font-black', teamColors.getAccentColor()]"> : </span>
          <span class="text-6xl font-black text-white leading-none">{{ m.result.away }}</span>
        </div>

        <VsBadge
          v-else
          :border-color="teamColors.getHomeBorderColor('20')"
          :bg-color="teamColors.getHomeBgColor()"
          :text-color="teamColors.getHomeIconColor()"
        />

        <div class="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
          <TeamLogo
            :team-name="m.away"
            :theme-team-name="isHomeClub(m.away) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize"
          />
          <span
            :class="[
              styles.textSize,
              'font-black leading-tight wrap w-full',
              getTeamTextColor(m.away),
            ]"
          >
            {{ m.away }}
          </span>
        </div>
      </div>
    </Cell>
  </SharedContainer>
</template>
