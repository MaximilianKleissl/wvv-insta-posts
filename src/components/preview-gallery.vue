<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import SlideOverview from '@/components/Slides/slide-overview.vue';
import SlideMatchday from '@/components/Slides/slide-matchday.vue';
import SlideTournament from '@/components/Slides/slide-tournament.vue';
import { isTournamentMatchDay, parseGermanDate } from '@/lib/grouping';
import { toPng } from 'html-to-image';

import { sortedMatchDaysForWeekend } from '@/lib/grouping';
import { buildWeekendCaption } from '@/lib/caption';
import type { SeasonData } from '@/lib/types';
import { getSlideBoxStyle, getSlidePreviewStyle, getSlideScale } from '@/lib/slide-format';

interface PreviewSlideRef {
  slideId: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
  matchDayOriginalIndex?: number;
}

import type { SlideFormatMode } from '@/lib/slide-format';

const props = withDefaults(
  defineProps<{
    season: SeasonData;
    exporting?: boolean;
    format?: SlideFormatMode;
  }>(),
  {
    format: 'square',
  },
);

const emit = defineEmits<{
  exportWeekend: [weekendIndex: number];
}>();

const selectedWeekendIndex = ref<number | null>(null);

const availableWeekendIndexes = computed(() => {
  return props.season.weekends.map((_, i) => i);
});

const findNextWeekendIndex = (): number | null => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 0; i < props.season.weekends.length; i++) {
    const weekend = props.season.weekends[i];
    for (const matchDay of weekend.matchDays) {
      const matchDate = parseGermanDate(matchDay.date);
      if (matchDate && matchDate >= now) {
        return i;
      }
    }
  }

  // If no future weekend found, return the first one
  return props.season.weekends.length > 0 ? 0 : null;
};

watch(
  availableWeekendIndexes,
  (indexes) => {
    if (!indexes.includes(selectedWeekendIndex.value ?? -1)) {
      selectedWeekendIndex.value = findNextWeekendIndex();
    }
  },
  { immediate: true },
);

const selectedWeekend = computed(() => {
  if (selectedWeekendIndex.value === null) return null;
  return props.season.weekends[selectedWeekendIndex.value] ?? null;
});

const slides = computed<PreviewSlideRef[]>(() => {
  if (selectedWeekendIndex.value === null) return [];

  const weekendIndex = selectedWeekendIndex.value;
  const weekend = props.season.weekends[weekendIndex];
  const refs: PreviewSlideRef[] = [];

  if (weekend.matchDays.length > 1) {
    refs.push({
      slideId: `overview-${weekendIndex}`,
      weekendIndex,
      kind: 'overview',
    });
  }

  sortedMatchDaysForWeekend(weekend).forEach((md) => {
    const originalIndex = weekend.matchDays.indexOf(md);
    refs.push({
      slideId: `matchday-${weekendIndex}-${originalIndex}`,
      weekendIndex,
      kind: 'matchday',
      matchDayOriginalIndex: originalIndex,
    });
  });

  return refs;
});

const caption = computed(() => {
  if (selectedWeekendIndex.value === null) return '';
  return buildWeekendCaption(props.season, selectedWeekendIndex.value);
});

const expandedSlide = ref<PreviewSlideRef | null>(null);

const openExpandedPreview = (slide: PreviewSlideRef) => {
  expandedSlide.value = slide;
};

const closeExpandedPreview = () => {
  expandedSlide.value = null;
};

const thumbnailStyle = computed(() =>
  getSlidePreviewStyle(props.format, 216, props.format === 'stories' ? 420 : 216),
);
const expandedPreviewStyle = computed(() =>
  getSlidePreviewStyle(props.format, 700, props.format === 'stories' ? 900 : 700),
);
const thumbnailScale = computed(() =>
  getSlideScale(props.format, 216, props.format === 'stories' ? 420 : 216),
);
const expandedPreviewScale = computed(() =>
  getSlideScale(props.format, 700, props.format === 'stories' ? 900 : 700),
);

const nextSlide = () => {
  if (!expandedSlide.value) return;

  const idx = slides.value.findIndex((s) => s.slideId === expandedSlide.value!.slideId);
  if (idx === -1) return;

  expandedSlide.value = slides.value[(idx + 1) % slides.value.length];
};

const previousSlide = () => {
  if (!expandedSlide.value) return;

  const idx = slides.value.findIndex((s) => s.slideId === expandedSlide.value!.slideId);
  if (idx === -1) return;

  expandedSlide.value = slides.value[(idx - 1 + slides.value.length) % slides.value.length];
};

const downloadCurrentSlide = async () => {
  if (!expandedSlide.value) return;

  const slideId = expandedSlide.value.slideId;
  const node = document.getElementById(slideId);
  if (!node) return;

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${slideId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download slide:', error);
  }
};
</script>

<template>
  <div
    v-if="props.season && availableWeekendIndexes.length > 0"
    class="bg-white p-6 rounded-lg shadow flex flex-col gap-2"
  >
    <div>
      <h2 class="text-xl font-bold mb-1">Wochenenden</h2>
      <p class="text-sm text-gray-600">
        Wähle ein Wochenende und schaue dir alle Bilder als Galerie an.
      </p>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div class="flex items-center gap-4">
        <input
          type="range"
          :min="0"
          :max="availableWeekendIndexes.length - 1"
          :value="selectedWeekendIndex ?? 0"
          class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-900"
          @input="selectedWeekendIndex = Number(($event.target as HTMLInputElement).value)"
        />
        <span class="text-sm font-medium text-gray-700 min-w-[80px] text-right">
          {{ props.season.weekends[selectedWeekendIndex ?? 0]?.dateRangeShort }}
        </span>
      </div>
    </div>

    <div v-if="selectedWeekend" class="space-y-4">
      <div class="flex flex-wrap gap-4">
        <div
          v-for="slide in slides"
          :key="slide.slideId"
          class="rounded-2xl border border-gray-200 bg-gray-50 p-2 hover:bg-gray-200"
          @click="openExpandedPreview(slide)"
        >
          <div
            class="mx-auto overflow-hidden border border-gray-200 bg-white shadow-sm"
            :style="thumbnailStyle"
          >
            <div
              class="origin-top-left"
              :style="{
                transform: `scale(${thumbnailScale})`,
                ...getSlideBoxStyle(props.format),
              }"
            >
              <SlideOverview
                v-if="slide.kind === 'overview'"
                :id="slide.slideId"
                :season="props.season"
                :weekend-index="slide.weekendIndex"
                :format="props.format"
              />
              <SlideTournament
                v-else-if="
                  isTournamentMatchDay(
                    props.season.weekends[slide.weekendIndex].matchDays[
                      slide.matchDayOriginalIndex ?? 0
                    ],
                  )
                "
                :id="slide.slideId"
                :season="props.season"
                :match-day="
                  props.season.weekends[slide.weekendIndex].matchDays[
                    slide.matchDayOriginalIndex ?? 0
                  ]
                "
                :format="props.format"
              />
              <SlideMatchday
                v-else
                :id="slide.slideId"
                :season="props.season"
                :match-day="
                  props.season.weekends[slide.weekendIndex].matchDays[
                    slide.matchDayOriginalIndex ?? 0
                  ]
                "
                :format="props.format"
              />
            </div>
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-600 whitespace-pre-line bg-gray-100 p-2 rounded">{{ caption }}</p>

      <button
        v-if="selectedWeekendIndex !== null"
        :disabled="props.exporting"
        class="rounded-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 transition"
        @click="emit('exportWeekend', selectedWeekendIndex)"
      >
        {{ props.exporting ? 'Exportiere...' : 'Export' }}
      </button>
    </div>
    <div
      v-if="expandedSlide"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      @click="closeExpandedPreview"
    >
      <div
        class="relative max-h-[95vh] max-w-[95vw] overflow-auto rounded-3xl bg-white p-4 shadow-2xl"
        @click.stop
      >
        <button
          class="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
          @click="closeExpandedPreview"
        >
          ×
        </button>

        <div class="flex flex-col pt-8">
          <div class="flex justify-between items-center mb-4 gap-4">
            <button
              class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              @click="previousSlide"
            >
              ‹ Previous
            </button>
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md"
              @click="downloadCurrentSlide"
            >
              Download Image
            </button>
            <button
              class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              @click="nextSlide"
            >
              Next ›
            </button>
          </div>

          <div
            class="flex gap-1 overflow-hidden border border-gray-200 bg-white shadow-sm"
            :style="expandedPreviewStyle"
          >
            <div
              class="origin-top-left"
              :style="{
                transform: `scale(${expandedPreviewScale})`,
                ...getSlideBoxStyle(props.format),
              }"
            >
              <SlideOverview
                v-if="expandedSlide.kind === 'overview'"
                :id="expandedSlide.slideId"
                :season="props.season"
                :weekend-index="expandedSlide.weekendIndex"
                :format="props.format"
              />
              <SlideTournament
                v-else-if="
                  isTournamentMatchDay(
                    props.season.weekends[expandedSlide.weekendIndex].matchDays[
                      expandedSlide.matchDayOriginalIndex ?? 0
                    ],
                  )
                "
                :id="expandedSlide.slideId"
                :season="props.season"
                :match-day="
                  props.season.weekends[expandedSlide.weekendIndex].matchDays[
                    expandedSlide.matchDayOriginalIndex ?? 0
                  ]
                "
                :format="props.format"
              />
              <SlideMatchday
                v-else
                :id="expandedSlide.slideId"
                :season="props.season"
                :match-day="
                  props.season.weekends[expandedSlide.weekendIndex].matchDays[
                    expandedSlide.matchDayOriginalIndex ?? 0
                  ]
                "
                :format="props.format"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
