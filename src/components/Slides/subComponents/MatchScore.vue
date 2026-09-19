<template>
  <VsBadge
    :bg-color="badgeBgColor"
    :text-color="badgeTextColor"
    :badge-text="badgeText"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VsBadge from './VsBadge.vue';
import type { MatchResult } from '@/lib/types';
import { useTeamColors } from '@/composables/useTeamColors';

const props = defineProps<{
  teamName: string;
  result?: MatchResult;
}>();

const teamColors = useTeamColors(props.teamName);

const badgeBgColor = computed(() => teamColors.getBadgeBgColor());
const badgeTextColor = computed(() => teamColors.getHomeIconColor());
const badgeText = computed(() =>
  props.result ? `${props.result.home} : ${props.result.away}` : undefined,
);
</script>