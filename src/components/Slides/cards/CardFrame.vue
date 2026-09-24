<template>
  <div
    class="relative flex min-w-0 flex-col backdrop-blur-[3px] border-2 overflow-visible justify-center px-6 py-4 rounded-[28px]"
    :class="[bgClass, teamColors.getHomeBorderColor(), fill ? 'flex-1 min-h-0' : '']"
    :style="cardStyle"
  >
    <slot />
    <div
      v-if="hasBadge"
      class="font-black text-white z-6 absolute -left-3 -top-4 flex items-center gap-2 rounded-full px-5 py-2 uppercase tracking-[0.16em] shadow-lg text-base"
      :class="badgeClass"
    >
      <slot name="badge" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { hexToRgba } from '@/lib/team-colors';
import { useTeamColors } from '@/composables/useTeamColors';

const props = withDefaults(
  defineProps<{
    teamName: string;
    fill?: boolean;
    badgeClass?: string | string[];
  }>(),
  {
    fill: false,
    badgeClass: undefined,
  },
);

const slots = useSlots();
const teamColors = useTeamColors(props.teamName);

const hasBadge = computed(() => Boolean(slots.badge));
const bgClass = computed(() => teamColors.getHomeBgColor());

const cardStyle = computed(() => ({
  boxShadow: `0 18px 40px ${hexToRgba(teamColors.colorScheme.value.imageTint, 0.12)}`,
}));
</script>
