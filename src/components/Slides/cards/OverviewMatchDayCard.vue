<template>
  <CardFrame :team-name="themeTeamName" :styles="styles" :fill="true">
    <HomeTeamIndication :md="md" />

    <div class="min-w-0 flex-1 space-y-2 rounded-2xl bg-white/45 px-4 py-3">
      <h3
        :class="[
          'font-black tracking-tight truncate leading-tight uppercase text-slate-900',
          teamTextSize,
        ]"
      >
        {{ md.team }}
      </h3>

      <div :class="['flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500', metaTextSize]">
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
      <div
        :class="[
          'relative flex flex-col items-center justify-center min-w-23 px-4 py-2 rounded-2xl shadow-lg overflow-hidden',
          teamColors.getResultBgColor(),
        ]"
      >
        <div :class="['absolute inset-x-0 top-0 h-1', teamColors.getHighlightColor()]" />

        <span
          :class="['text-xs uppercase tracking-[0.25em] font-black', teamColors.getAccentColor()]"
        >
          Ergebnis
        </span>

        <span class="text-5xl leading-none font-black text-white tracking-tight">
          {{ md.match_day_result }}
        </span>
      </div>
    </div>
  </CardFrame>
</template>

<script setup lang="ts">
import { Calendar, MapPin } from 'lucide-vue-next';
import CardFrame from './CardFrame.vue';
import HomeTeamIndication from '../parts/HomeTeamIndication.vue';
import type { MatchDay } from '@/lib/types';
import type { SlideStyles } from '@/composables/Slides/useDensity';
import { germanWeekdayName } from '@/lib/grouping';
import { useTeamColors } from '@/composables/useTeamColors';

const props = defineProps<{
  md: MatchDay;
  styles: SlideStyles;
  themeTeamName: string;
  teamTextSize: string;
  metaTextSize: string;
}>();

const teamColors = useTeamColors(props.themeTeamName);
</script>
