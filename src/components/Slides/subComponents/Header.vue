<template>
  <div :class="[
    'relative w-full shrink-0 overflow-hidden font-sans select-none',
    format === 'stories' ? 'h-[700px]' : 'h-[340px]',
  ]" :style="{ backgroundColor: schemeColor }">
    <div class="absolute inset-y-0 right-0 w-[72%] opacity-95" :style="{
      backgroundImage: `url(${actionImage})`,
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
      maskImage: 'linear-gradient(90deg, transparent 10%, black 15%, black 95%, transparent 100%)',
    }" />
    <div class="absolute inset-0" :style="gradientStyle" />
    <div :class="[
      'relative z-10 flex h-full flex-col text-white',
      format === 'stories' ? 'p-14' : 'p-10',
    ]">
      <div class="max-w-[640px] pt-2">
        <div class="mt-5 mb-5 flex items-center gap-4">
          <span class="h-px w-16 bg-white/80" />
          <p class="text-xl font-semibold uppercase tracking-[0.38em] text-white/85">
            {{ slideTitle.subtitle }}
          </p>
        </div>
        <h1 :class="[
          'font-black uppercase leading-[0.88] tracking-[-0.04em] mb-4',
          format === 'stories' ? 'text-[80px]' : 'text-[49px]',
        ]">
          {{ slideTitle.title }}
        </h1>
      </div>
      <div :class="[
        'w-fit font-black tracking-tight shadow-xl',
        format === 'stories' ? 'px-9 py-2 text-3xl' : 'px-6 py-2 text-xl',
        'bg-white/95',
      ]" :style="{
        color: schemeColor,
        clipPath: 'polygon(3% 8%, 96% 0, 100% 78%, 91% 100%, 5% 91%, 0 28%)',
      }">
        {{ slideTitle.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { SlideTitle } from '@/lib/slide-types';
import { useActionImages } from '@/composables/useActionImages';
import { useTeamColors } from '@/composables/useTeamColors';

const props = defineProps<{
  slideTitle: SlideTitle;
  format?: 'square' | 'stories';
}>();
const teamColors = useTeamColors(props.slideTitle.subtitle);
const { loadActionImages, getActionImagesForTeam } = useActionImages();

onMounted(() => {
  void loadActionImages();
});

const actionImage = computed(() => {
  const images = getActionImagesForTeam(props.slideTitle.subtitle);
  const hash = simpleHash(props.slideTitle.label);
  const index = hash % images.length;
  return `https://maximiliankleissl.github.io/wvv-posts-config/Action_Images/${images[index]}`;
});

const schemeColor = computed(() => teamColors.colorScheme.value.imageTint);
const gradientStyle = computed(() => ({
  background: `linear-gradient(90deg, ${schemeColor.value} 0%, ${schemeColor.value}e6 55%, transparent 100%)`,
}));

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
</script>
