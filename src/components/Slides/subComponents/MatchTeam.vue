<template>
  <div class="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
    <TeamLogo :team-name="teamName" :theme-team-name="themeTeamName" :size-class="logoSize" />
    <span class="w-full font-black leading-tight wrap" :class="textClass">
      {{ teamName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import TeamLogo from './TeamLogo.vue';

withDefaults(
  defineProps<{
    teamName: string;
    themeTeamName?: string;
    logoSize: string;
    textClass: string | string[];
  }>(),
  { themeTeamName: undefined },
);
</script>
