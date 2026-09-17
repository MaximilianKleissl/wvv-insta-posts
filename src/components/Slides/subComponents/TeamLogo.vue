<template>
  <div v-if="logoUrl && !imageError" :class="[sizeClass, 'relative shrink-0 overflow-hidden']">
    <!-- Hidden, only used to detect load/error -->
    <img :src="logoUrl" class="hidden" @error="handleImageError" @load="handleImageLoad" />

    <svg v-if="imageLoaded" :class="[sizeClass, 'block']" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <!-- Default SVG mask type is luminance: white pixels -> opaque, black -> transparent -->
        <mask :id="whiteMaskId">
          <image :href="logoUrl" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
        </mask>

        <!-- Same image, colors inverted: original black becomes white -> opaque here -->
        <mask :id="tintMaskId">
          <image :href="logoUrl" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"
            style="filter: invert(1)" />
        </mask>
      </defs>

      <rect width="100" height="100" fill="#ffffff" :mask="`url(#${whiteMaskId})`" />
      <rect width="100" height="100" :fill="tintColor" :mask="`url(#${tintMaskId})`" />
    </svg>
  </div>

  <div v-else :class="[sizeClass, fallbackClass]">
    <span :class="['text-xl font-bold text-muted', teamColors.getHomeIconColor()]">
      ?
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLogo } from '@/composables/useLogo';
import { useTeamColors } from '@/composables/useTeamColors';

interface TeamLogoProps {
  teamName: string;
  themeTeamName?: string;
  sizeClass?: string;
  fallbackClass?: string;
}

const props = withDefaults(defineProps<TeamLogoProps>(), {
  sizeClass: 'w-12 h-12',
  fallbackClass:
    'flex items-center justify-center bg-muted rounded-full border border-border',
});

const { getLogoUrl } = useLogo();

const teamColors = useTeamColors(props.themeTeamName ?? props.teamName);

const logoUrl = computed(() => getLogoUrl(props.teamName));
const tintColor = computed(() => teamColors.colorScheme.value.imageTint);

const imageError = ref(false);
const imageLoaded = ref(false);

// Unique per-instance IDs so multiple logos on one page don't collide on url(#id)
const uid = Math.random().toString(36).slice(2, 10);
const whiteMaskId = `logo-white-mask-${uid}`;
const tintMaskId = `logo-tint-mask-${uid}`;

watch(
  logoUrl,
  () => {
    imageError.value = false;
    imageLoaded.value = false;
  },
  { immediate: true },
);

const handleImageError = () => {
  imageError.value = true;
};
const handleImageLoad = () => {
  imageLoaded.value = true;
};
</script>