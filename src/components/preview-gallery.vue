<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import SlideOverview from '@/components/Slides/slide-overview.vue';
import SlideMatchday from '@/components/Slides/slide-matchday.vue';
import { sortedMatchDaysForWeekend } from '@/lib/grouping';
import { buildWeekendCaption } from '@/lib/caption';
import type { SeasonData, LogoLibrary } from '@/lib/types';

interface PreviewSlideRef {
  slideId: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
  matchDayOriginalIndex?: number;
}

const props = defineProps<{
  season: SeasonData;
  logoLibrary: LogoLibrary;
  exporting?: boolean;
}>();

const emit = defineEmits<{
  exportWeekend: [weekendIndex: number];
}>();

const selectedWeekendIndex = ref<number | null>(null);

const availableWeekendIndexes = computed(() => {
  return props.season.weekends.map((_, i) => i);
});

watch(
  availableWeekendIndexes,
  (indexes) => {
    if (!indexes.includes(selectedWeekendIndex.value ?? -1)) {
      selectedWeekendIndex.value = indexes[0] ?? null;
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
          @input="selectedWeekendIndex = Number(($event.target as HTMLInputElement).value)"
          class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-900"
        />
        <span class="text-sm font-medium text-gray-700 min-w-[80px] text-right">
          {{ props.season.weekends[selectedWeekendIndex ?? 0]?.dateRangeShort }}
        </span>
      </div>
    </div>

    <div v-if="selectedWeekend" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="slide in slides"
          :key="slide.slideId"
          class="rounded-2xl border border-gray-200 bg-gray-50 p-2"
        >
          <div class="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700">
            <span>{{ slide.kind === 'overview' ? 'Übersicht' : 'Spieltag' }}</span>
            <button
              type="button"
              class="rounded-full bg-green-900 px-3 py-1 text-xs font-semibold text-white hover:bg-green-800"
              @click="openExpandedPreview(slide)"
            >
              Groß ansehen
            </button>
          </div>
          <div
            class="mx-auto h-[240px] w-[240px] overflow-hidden border border-gray-200 bg-white shadow-sm"
          >
            <div
              class="origin-top-left"
              style="transform: scale(0.204); width: 1080px; height: 1080px"
            >
              <SlideOverview
                v-if="slide.kind === 'overview'"
                :id="slide.slideId"
                :season="props.season"
                :weekendIndex="slide.weekendIndex"
                :logoLibrary="props.logoLibrary"
              />
              <SlideMatchday
                v-else
                :id="slide.slideId"
                :season="props.season"
                :matchDay="
                  props.season.weekends[slide.weekendIndex].matchDays[
                    slide.matchDayOriginalIndex ?? 0
                  ]
                "
                :logoLibrary="props.logoLibrary"
              />
            </div>
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-600 whitespace-pre-line bg-gray-100 p-2 rounded">{{ caption }}</p>

      <button
        v-if="selectedWeekendIndex !== null"
        @click="emit('exportWeekend', selectedWeekendIndex)"
        :disabled="props.exporting"
        class="rounded-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 transition"
      >
        {{ props.exporting ? 'Exportiere...' : 'Export' }}
      </button>
    </div>
    <div
      v-if="expandedSlide"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        class="relative max-h-[95vh] max-w-[95vw] overflow-auto rounded-3xl bg-white p-4 shadow-2xl"
      >
        <button
          type="button"
          class="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-700 shadow hover:bg-white"
          @click="closeExpandedPreview"
        >
          Schließen
        </button>
        <div
          class="mx-auto h-[720px] w-[720px] overflow-hidden border border-gray-200 bg-white shadow-sm"
        >
          <div
            class="origin-top-left"
            style="transform: scale(0.6667); width: 1080px; height: 1080px"
          >
            <SlideOverview
              v-if="expandedSlide.kind === 'overview'"
              :id="expandedSlide.slideId"
              :season="props.season"
              :weekendIndex="expandedSlide.weekendIndex"
              :logoLibrary="props.logoLibrary"
            />
            <SlideMatchday
              v-else
              :id="expandedSlide.slideId"
              :season="props.season"
              :matchDay="
                props.season.weekends[expandedSlide.weekendIndex].matchDays[
                  expandedSlide.matchDayOriginalIndex ?? 0
                ]
              "
              :logoLibrary="props.logoLibrary"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
