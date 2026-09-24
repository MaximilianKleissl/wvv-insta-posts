<template>
  <div
    :class="[
      'relative flex min-w-0 flex-col backdrop-blur-[3px] border-2 overflow-visible justify-center',
      bgClass,
      styles.cardPadding,
      styles.cardRadius,
      teamColors.getHomeBorderColor('60'),
      fill ? 'flex-1 min-h-0' : '',
    ]"
    :style="cardStyle"
  >
    <slot />
    <div
      v-if="hasBadge"
      class="z-6 absolute -left-3 -top-4 flex items-center gap-2 rounded-full px-5 py-2 uppercase tracking-[0.16em] shadow-lg"
      :class="badgeClass"
    >
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
    fill?: boolean;
    badgeClass?: string | string[];
    styles?: SlideStyles;
    bgClass?: string;
  }>(),
  {
    fill: false,
    badgeClass: undefined,
    styles: () => CARD_FRAME_STYLES,
    bgClass: 'bg-white/80',
  },
);

const slots = useSlots();
const teamColors = useTeamColors(props.teamName);

const hasBadge = computed(() => Boolean(slots.badge));

const cardStyle = computed(() => ({
  boxShadow: `0 18px 40px ${hexToRgba(teamColors.colorScheme.value.imageTint, 0.12)}`,
}));
</script>
