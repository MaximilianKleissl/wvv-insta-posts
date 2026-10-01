<template>
  <div
    class="relative flex min-w-0 flex-1 flex-col backdrop-blur-[3px] border-2 overflow-visible justify-center px-6 py-4 rounded-[28px] min-h-0"
    :style="cardStyle"
  >
    <slot />
    <div
      v-if="hasBadge"
      class="font-black text-white z-6 absolute -left-3 -top-4 flex items-center gap-2 rounded-full px-5 py-2 uppercase tracking-[0.16em] shadow-lg text-base"
      :style="{ backgroundColor: badgeColor }"
    >
      <slot name="badge" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useTeamColors } from '@/composables/useTeamColors';

const props = withDefaults(
  defineProps<{
    teamName: string;
    badgeColor?: string;
  }>(),
  {
    badgeColor: undefined,
  },
);

const slots = useSlots();
const teamColors = useTeamColors(props.teamName);

const hasBadge = computed(() => Boolean(slots.badge));

const cardStyle = computed(() => ({
  backgroundColor: teamColors.getSurfaceColor(),
  borderColor: teamColors.getEdgeColor(),
  boxShadow: `0 18px 40px ${teamColors.getShadowColor()}`,
}));
</script>
