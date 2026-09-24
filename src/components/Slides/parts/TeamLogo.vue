<template>
  <div v-if="logoUrl && !imageError" :class="[sizeClass, 'relative shrink-0 overflow-hidden']">
    <!-- Hidden, only used to detect load/error -->
    <img :src="logoUrl" class="hidden" @error="handleImageError" @load="handleImageLoad" />

    <svg
      v-if="imageLoaded && themeTeamName"
      :class="[sizeClass, 'block']"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <mask :id="whiteMaskId">
          <image
            :href="logoUrl"
            x="0"
            y="0"
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid meet"
          />
        </mask>

        <mask :id="tintMaskId">
          <image
            :href="logoUrl"
            x="0"
            y="0"
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid meet"
            style="filter: invert(1)"
          />
        </mask>
      </defs>

      <rect width="100" height="100" fill="#ffffff" :mask="`url(#${whiteMaskId})`" />
      <rect width="100" height="100" :fill="tintColor" :mask="`url(#${tintMaskId})`" />
    </svg>

    <!-- Untheme: original colors as-is -->
    <img
      v-else-if="imageLoaded"
      :src="logoUrl"
      :alt="teamName"
      :class="[sizeClass, 'object-contain shrink-0']"
    />
  </div>

  <div v-else :class="[sizeClass, fallbackClass]">
    <span :class="['text-xl font-bold text-muted', teamColors.getHomeIconColor()]"> ? </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { useLogo } from '@/composables/useLogo';
import { useTeamColors } from '@/composables/useTeamColors';

interface TeamLogoProps {
  teamName: string;
  themeTeamName?: string;
  sizeClass?: string;
  fallbackClass?: string;
}

const props = withDefaults(defineProps<TeamLogoProps>(), {
  themeTeamName: undefined,
  sizeClass: 'w-12 h-12',
  fallbackClass: 'flex items-center justify-center bg-muted rounded-full',
});

const { getLogoUrl } = useLogo();

const teamColors = useTeamColors(props.themeTeamName ?? props.teamName);

const logoUrl = computed(() => getLogoUrl(props.teamName));
const tintColor = computed(() => teamColors.colorScheme.value.imageTint);

const imageError = ref(false);
const imageLoaded = ref(false);

const uid = useId();
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
