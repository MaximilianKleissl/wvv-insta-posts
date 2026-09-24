<template>
  <div class="flex shrink-0 flex-col items-center gap-2">
    <div class="h-6 w-px" :style="{ backgroundColor: hairlineColor }" />
    <div
      class="flex shrink-0 items-center justify-center rounded-2xl px-4 py-3 shadow-md"
      :class="[bgColor]"
    >
      <span class="block text-5xl font-black leading-none tracking-[0.12em] text-white">
        {{ badgeText }}
      </span>
    </div>
    <div class="h-6 w-px" :style="{ backgroundColor: hairlineColor }" />
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
    hairlineColor?: string;
  }>(),
  {
    teamName: undefined,
    result: undefined,
    bgColor: undefined,
    hairlineColor: undefined,
  },
);

const teamColors = useTeamColors(props.teamName ?? '');

const bgColor = computed(() => {
  if (props.bgColor) return props.bgColor;
  if (props.teamName) return teamColors.getBadgeBgColor();
  return 'bg-slate-800/10';
});

const hairlineColor = computed(() => props.hairlineColor ?? 'rgba(100, 116, 139, 0.25)');

const badgeText = computed(() =>
  props.result ? (typeof props.result === 'string' ? props.result : `${props.result.home} : ${props.result.away}`) : 'VS',
);
</script>
