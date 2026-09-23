<template>
  <div
    :class="[
      'relative flex min-w-0 flex-col bg-white/80 backdrop-blur-[3px] border-2 overflow-visible justify-center',
      styles.cardPadding,
      styles.cardRadius,
      teamColors.getHomeBorderColor('60'),
      fill ? 'flex-1 min-h-0' : '',
    ]"
    :style="cardStyle"
  >
    <div v-if="label" class="flex items-center justify-center gap-3 pt-2">
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" /> 
        <span
          :class="[
            'text-sm font-bold uppercase tracking-[0.28em]',
            teamColors.getPrimaryTextColorWithOpacity('80'),
          ]"
        >
          {{ label }}
        </span>
        <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
    </div>

    <div class="mt-3 flex min-h-0 flex-1 items-center justify-between gap-3">
      <slot />
    </div>

    <div v-if="$slots.footer" class="mt-4 flex items-center gap-3">
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
      <div
        :class="[
          'flex items-center gap-2 rounded-full px-5 py-2 text-lg font-black tracking-wide',
          teamColors.getHomeBgColor(),
          teamColors.getHomeIconColor(),
        ]"
      >
        <slot name="footer" />
      </div>
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
    </div>

    <div v-if="hasBadge" :class="['absolute z-10', badgeClass]">
      <slot name="badge" />
    </div>
  </div>
</template>

<script lang="ts">
import type { SlideStyles } from '@/composables/Slides/useDensity';

const CARD_FRAME_STYLES: SlideStyles = {
  density: 'normal',
  cardPadding: 'px-8 py-5',
  cardRadius: 'rounded-[28px]',
  logoSize: 'h-24 w-24',
  textSize: 'text-4xl',
};
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { hexToRgba } from '@/lib/team-colors';
import { useTeamColors } from '@/composables/useTeamColors';

const props = withDefaults(
  defineProps<{
    teamName: string;
    label?: string;
    fill?: boolean;
    badgeClass?: string | string[];
    styles?: SlideStyles;
  }>(),
  {
    label: undefined,
    fill: false,
    badgeClass: undefined,
    styles: () => CARD_FRAME_STYLES,
  },
);

const slots = useSlots();
const teamColors = useTeamColors(props.teamName);

const hairlineColor = computed(() => teamColors.getHairlineColor());
const hasBadge = computed(() => Boolean(slots.badge));

const cardStyle = computed(() => ({
  boxShadow: `0 18px 40px ${hexToRgba(teamColors.colorScheme.value.imageTint, 0.12)}`,
}));
</script>
