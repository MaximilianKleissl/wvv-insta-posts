<script setup lang="ts">
import { computed } from 'vue';
import { Users } from 'lucide-vue-next';
import SharedContainer from './sharedContainer.vue';
import { useSlideDensity } from '@/composables/Slides/useDensity.ts';
import Cell from '@/components/Slides/subComponents/Cell.vue';
import TeamLogo from '@/components/Slides/subComponents/TeamLogo.vue';
import { useTeamHighlight } from '@/composables/useTeamHighlight';
import { useTeamColors } from '@/composables/useTeamColors';
import type { SlideTitle, SlideMatchdayProps } from '@/lib/slide-types';
import { pickFormatClass } from '@/lib/slide-format';
import { getMatchDaySlideTitle, getMatchDayItemCount } from '@/lib/slide-utils';

const props = withDefaults(defineProps<SlideMatchdayProps>(), {
  format: 'square',
});

// Composables
const { getTeamTextColor, isHomeClub } = useTeamHighlight(props.season, props.matchDay.team);
const teamColors = useTeamColors(props.matchDay.team);
const { styles } = useSlideDensity(computed(() => getMatchDayItemCount(props.matchDay)));

// Computed properties
const teams = computed(() => props.matchDay.teams ?? []);

const slideTitle = computed<SlideTitle>(() => ({
  ...getMatchDaySlideTitle(props.matchDay),
}));

const gridClass = computed(() =>
  pickFormatClass(props.format, 'grid-cols-2', 'grid-cols-1 auto-rows-fr'),
);
const cellClass = computed(() => pickFormatClass(props.format, undefined, 'min-h-0'));
</script>

<template>
  <SharedContainer :id="id" :styles="styles" :slide-title="slideTitle" :format="format">
    <div
      class="flex items-center gap-3 text-2xl font-bold mb-2"
      :class="[teamColors.getPrimaryTextColorWithOpacity('80')]"
    >
      <Users :class="['w-7 h-7', teamColors.getHomeIconColor()]" />
      <span>Teilnehmende Mannschaften</span>
    </div>
    <div :class="['grid gap-4 content-start flex-1 overflow-hidden', gridClass]">
      <Cell
        v-for="team in teams"
        :key="team"
        :styles="styles"
        :border-color="teamColors.getHomeBorderColor('60')"
        :tint-hex="teamColors.colorScheme.value.imageTint"
        :class="cellClass"
      >
        <template #left_part>
          <TeamLogo
            :team-name="team"
            :theme-team-name="isHomeClub(team) ? props.matchDay.team : undefined"
            :size-class="styles.logoSize"
          />
        </template>
        <span
          class="font-extrabold leading-snug truncate"
          :class="[styles.textSize, getTeamTextColor(team)]"
        >
          {{ team }}
        </span>
      </Cell>
    </div>
  </SharedContainer>
</template>
