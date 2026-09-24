<template>
  <CardFrame
    :team-name="themeTeamName"
    :styles="styles"
    :fill="true"
    :badge-class="[
      'text-[13px] font-black uppercase tracking-[0.2em] text-white',
      teamColors.getBadgeBgColor(),
    ]"
  >
    <!-- DAY -->
    <template #badge>
      <Calendar :size="17" :stroke-width="2.6" />
      <span>{{ weekdayLabel }}</span>
    </template>

    <!-- =====================================================
         MATCH
    ====================================================== -->
    <div class="relative flex flex-1 flex-col px-8 pb-5 pt-3">
      <!-- Very subtle background branding -->
      <div
        :class="[
          'pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.025] blur-3xl',
          teamColors.getHighlightColor(),
        ]"
      />

      <!-- Main match row -->
      <div class="relative flex min-h-0 flex-1 items-center justify-center">
        <!-- =================================================
             LOGO
        ================================================== -->
        <div class="absolute left-0 top-1/2 -translate-y-1/2">
          <div
            class="relative flex h-[116px] w-[116px] items-center justify-center rounded-[26px] bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.09)] ring-1 ring-slate-200/80"
          >
            <div
              :class="[
                'absolute left-0 top-5 h-14 w-1 rounded-r-full',
                teamColors.getHighlightColor(),
              ]"
            />

            <HomeTeamIndication :md="md" />
          </div>
        </div>

        <!-- =================================================
             CENTER
        ================================================== -->
        <div class="flex max-w-[620px] flex-col items-center justify-center text-center">
          <span class="mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">
            Volleyball
          </span>

          <h3
            :class="[
              `
                max-w-full
                font-black uppercase
                leading-[0.9]
                tracking-[-0.055em]
                text-slate-950
              `,
              teamTextSize,
            ]"
            :title="md.team"
          >
            {{ md.team }}
          </h3>

          <div class="mt-4 flex items-center gap-2.5">
            <span class="h-px w-12 bg-slate-200" />

            <span :class="['h-2 w-2 rounded-full', teamColors.getHighlightColor()]" />

            <span class="h-px w-12 bg-slate-200" />
          </div>
        </div>
        <div>
          <div
            v-if="md.match_day_result"
            :class="[
              `
                relative
                flex min-w-[108px]
                flex-col items-center
                justify-center
                overflow-hidden
                rounded-[22px]
                px-5 pb-4 pt-5
                shadow-[0_12px_30px_rgba(15,23,42,0.16)]
              `,
              teamColors.getResultBgColor(),
            ]"
          >
            <div :class="['absolute inset-x-0 top-0 h-1.5', teamColors.getHighlightColor()]" />

            <span
              :class="[
                'text-[9px] font-black uppercase tracking-[0.25em]',
                teamColors.getAccentColor(),
              ]"
            >
              Ergebnis
            </span>

            <span class="mt-1 text-[38px] font-black leading-none tracking-[-0.06em] text-white">
              {{ md.match_day_result }}
            </span>
          </div>
        </div>
      </div>

      <!-- =====================================================
           LOCATION
      ====================================================== -->
      <div class="flex justify-center pt-2">
        <div
          class="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white px-5 py-2.5 shadow-[0_5px_20px_rgba(15,23,42,0.05)]"
        >
          <MapPin :size="17" :stroke-width="2.6" :class="teamColors.getAccentColor()" />

          <span class="text-[13px] font-extrabold tracking-[-0.01em] text-slate-700">
            {{ md.location }}
          </span>
        </div>
      </div>
    </div>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
}>();

const teamColors = useTeamColors(props.themeTeamName);

const weekdayLabel = computed(() => germanWeekdayName(props.md.date));
</script>
