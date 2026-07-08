<template>
  <img
    v-if="logoUrl"
    :src="logoUrl"
    :alt="teamName"
    :class="[sizeClass, 'object-contain shrink-0']"
  />
  <div v-else :class="[sizeClass, fallbackClass]">
    <span class="text-xl font-bold text-green-800 text-muted">?</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLogo } from '@/composables/useLogo';

interface TeamLogoProps {
  teamName: string;
  sizeClass?: string;
  fallbackClass?: string;
  basePath?: string;
  customLibrary?: Record<string, string>;
}

const props = withDefaults(defineProps<TeamLogoProps>(), {
  sizeClass: 'w-12 h-12',
  fallbackClass: 'flex items-center justify-center bg-muted rounded-full border border-border',
});

const { getLogoUrl } = useLogo(props.basePath, props.customLibrary);

const logoUrl = computed(() => getLogoUrl(props.teamName));
</script>
