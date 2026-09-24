<template>
  <div
    class="relative w-full shrink-0 overflow-hidden font-sans select-none"
    :class="formatClasses.headerHeight"
    :style="{ backgroundColor: schemeColor }"
  >
    <div class="absolute inset-y-0 right-0 w-[72%] opacity-95" :style="actionImageStyle" />
    <div class="absolute inset-0" :style="gradientStyle" />
    <div class="relative z-10 flex h-full flex-col text-white" :class="formatClasses.headerPadding">
      <div class="max-w-160 pt-2">
        <div class="mt-10 mb-5 flex items-center gap-4">
          <span class="h-px w-16 bg-white/80" />
          <p class="text-3xl font-semibold uppercase tracking-[0.38em] text-white/85">
            {{ slideTitle.subtitle }}
          </p>
        </div>
        <h1 class="mb-4 font-black uppercase leading-[0.88] tracking-[-0.04em] text-6xl">
          {{ slideTitle.title }}
        </h1>
      </div>
      <LabelContainer
        :labels="slideTitle.label"
        :color="schemeColor"
        :flex-direction="formatClasses.headerLabelFlexDirection"
        :chip-classes="formatClasses.seasonClasses"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { SlideTitle } from '@/lib/slide-types';
import { getFormatClasses, type SlideFormatMode } from '@/lib/slide-format';
import { hashString } from '@/lib/slide-utils';
import { CONFIG_BASE_URL } from '@/lib/config';
import { useActionImages } from '@/composables/useActionImages';
import { useTeamColors } from '@/composables/useTeamColors';
import LabelContainer from './LabelContainer.vue';

const props = withDefaults(
  defineProps<{
    slideTitle: SlideTitle;
    format?: SlideFormatMode;
  }>(),
  { format: 'portrait_4by5' },
);
const teamColors = useTeamColors(props.slideTitle.subtitle);
const { loadActionImages, getActionImagesForTeam } = useActionImages();
const formatClasses = computed(() => getFormatClasses(props.format));

onMounted(() => {
  void loadActionImages();
});

const actionImage = computed(() => {
  const images = getActionImagesForTeam(props.slideTitle.subtitle);
  if (images.length === 0) return '';

  const index = hashString(props.slideTitle.label.join(' ')) % images.length;
  return `${CONFIG_BASE_URL}/Action_Images/${images[index]}`;
});

const schemeColor = computed(() => teamColors.colorScheme.value.imageTint);
const actionImageStyle = computed(() => ({
  ...(actionImage.value ? { backgroundImage: `url(${actionImage.value})` } : {}),
  backgroundPosition: 'center top',
  backgroundSize: 'cover',
  maskImage: 'linear-gradient(90deg, transparent 10%, black 15%, black 95%, transparent 100%)',
}));
const gradientStyle = computed(() => ({
  background: `linear-gradient(90deg, ${schemeColor.value} 0%, ${schemeColor.value}e6 55%, transparent 100%)`,
}));
</script>
