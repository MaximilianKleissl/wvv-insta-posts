<template>
  <div class="flex items-center gap-3">
    <template v-if="type === 'line'">
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
    </template>
    <template v-else-if="type === 'label'">
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
    </template>
    <template v-else>
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
      <div
        :class="[
          'flex items-center gap-2 rounded-full px-5 py-2 text-lg font-black tracking-wide',
          teamColors.getHomeBgColor(),
          teamColors.getHomeIconColor(),
        ]"
      >
        <slot />
      </div>
      <div class="h-px flex-1" :style="{ backgroundColor: hairlineColor }" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTeamColors } from '@/composables/useTeamColors';

const props = withDefaults(
  defineProps<{
    teamName: string;
    type?: 'line' | 'label' | 'pill';
    label?: string;
  }>(),
  {
    type: 'pill',
    label: undefined,
  },
);

const teamColors = useTeamColors(props.teamName);
const hairlineColor = computed(() => teamColors.getHairlineColor());
</script>
