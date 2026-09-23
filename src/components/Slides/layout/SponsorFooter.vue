<template>
  <footer :class="['flex flex-col items-center pb-10', formatClasses.footerGap]">
    <p class="text-xs font-semibold tracking-[0.14em] text-gray-600 uppercase">
      {{ formatClasses.sponsorLabel }}
    </p>
    <div :class="['flex items-center justify-center', formatClasses.sponsorGap]">
      <img
        v-for="logo in sponsorLogos"
        :key="logo.src"
        :src="logo.src"
        :alt="logo.alt"
        :class="[formatClasses.sponsorLogoHeight, 'w-auto object-contain brightness-95']"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getFormatClasses, type SlideFormatMode } from '@/lib/slide-format';

const props = defineProps<{
  format: SlideFormatMode;
  sponsorLogos: ReadonlyArray<{ src: string; alt: string }>;
}>();

const formatClasses = computed(() => getFormatClasses(props.format));
</script>
