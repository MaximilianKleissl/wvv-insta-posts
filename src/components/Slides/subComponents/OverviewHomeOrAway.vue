<template>
  <div class="relative w-20 h-20 shrink-0">
    <!-- Das Logo -->
    <div
      class="w-full h-full flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm"
    >
      <TeamLogo
        v-if="md.homeTeam"
        :team-name="md.homeTeam"
        :custom-library="logoLibrary"
        size-class="w-full h-full object-contain p-3"
        fallback-class=""
      />
    </div>

    <!-- Der Eck-Badge (Top-Right) -->
    <div
      :class="[
        'absolute -top-1.5 -right-1.5 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md shadow-sm z-10',
        md.home
          ? 'bg-green-800 text-white'
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
import type { LogoLibrary } from '@/lib/types';

defineProps<{
  md: {
    home: boolean;
    homeTeam?: string;
  };
  logoLibrary: LogoLibrary;
}>();
</script>
