<template>
  <div class="flex shrink-0 flex-col items-center gap-2">
    <div
      class="flex shrink-0 items-center justify-center rounded-2xl px-4 py-3 shadow-md"
      :style="{ backgroundColor: badgeColor }"
    >
      <span class="block text-5xl font-black leading-none tracking-[0.12em] text-white">
        {{ badgeText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MatchResult } from '@/lib/types';
import { useTeamColors } from '@/composables/useTeamColors';

const props = withDefaults(
  defineProps<{
    teamName?: string;
    result?: MatchResult | string;
    bgColor?: string;
  }>(),
  {
    teamName: undefined,
    result: undefined,
    bgColor: undefined,
  },
);

const teamColors = useTeamColors(props.teamName ?? '');

/** Falls back to a neutral slate so an unthemed badge stays readable. */
const badgeColor = computed(() => {
  if (props.bgColor) return props.bgColor;
  if (props.teamName) return teamColors.getInkColor();
  return 'rgba(30, 41, 59, 0.1)';
});

const badgeText = computed(() =>
  props.result
    ? typeof props.result === 'string'
      ? props.result
      : `${props.result.home} : ${props.result.away}`
    : 'VS',
);
</script>
