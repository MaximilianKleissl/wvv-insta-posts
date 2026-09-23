<template>
  <div class="relative w-20 h-20 shrink-0">
    <!-- Das Logo -->
    <div class="w-full h-full flex items-center justify-center rounded-2xl">
      <TeamLogo
        v-if="md.homeTeam"
        :team-name="md.homeTeam"
        size-class="w-full h-full object-contain"
        :theme-team-name="md.home ? md.homeTeam : undefined"
        fallback-class=""
      />
    </div>

    <!-- Der Eck-Badge (Top-Right) -->
    <div
      :class="[
        'absolute -top-1.5 -right-1.5 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md shadow-sm z-10',
        md.home
          ? [teamColors.getBadgeBgColor(), 'text-white']
          : 'bg-slate-200 text-slate-700 border border-slate-300/50',
      ]"
    >
      {{ md.home ? BADGE_LABELS.HOME : BADGE_LABELS.AWAY }}
    </div>
  </div>
</template>

<script setup lang="ts">
import TeamLogo from './TeamLogo.vue';
import { BADGE_LABELS } from '@/lib/slide-constants';
import { useTeamColors } from '@/composables/useTeamColors';

const props = defineProps<{
  md: {
    home: boolean;
    homeTeam?: string;
  };
}>();
const teamColors = useTeamColors(props.md.homeTeam ?? '');
</script>
