<template>
  <!-- <div
    v-if="result"
    :class="[
      'flex items-center gap-3 px-5 py-2 rounded-2xl shadow-lg',
      teamColors.getResultBgColor(),
    ]"
  >
    <span class="text-6xl font-black text-white leading-none">{{ result.home }}</span>
    <span :class="['text-3xl font-black', teamColors.getAccentColor()]"> : </span>
    <span class="text-6xl font-black text-white leading-none">{{ result.away }}</span>
  </div> -->

  <VsBadge
    v-if="result"
    :bg-color="teamColors.getBadgeBgColor()"
    :text-color="teamColors.getHomeIconColor()"
    :badge-text="`${result.home} : ${result.away}`"
  />

  <VsBadge
    v-else
    :bg-color="teamColors.getBadgeBgColor()"
    :text-color="teamColors.getHomeIconColor()"
  />
</template>

<script setup lang="ts">
import VsBadge from './VsBadge.vue';
import type { MatchResult } from '@/lib/types';
import { useTeamColors } from '@/composables/useTeamColors';

const props = defineProps<{
  teamName: string;
  result?: MatchResult;
}>();

const teamColors = useTeamColors(props.teamName);
</script>
