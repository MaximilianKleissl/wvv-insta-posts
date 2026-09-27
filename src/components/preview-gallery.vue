<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import SlideOverview from '@/components/Slides/slides/overview.vue';
import SlideMatchday from '@/components/Slides/slides/matchday.vue';
import SlideTournament from '@/components/Slides/slides/tournament.vue';
import { isTournamentMatchDay, parseGermanDate } from '@/lib/grouping';
import { toPng } from 'html-to-image';

import { sortedMatchDaysForWeekend } from '@/lib/grouping';
import { buildWeekendCaption } from '@/lib/caption';
import type { SeasonData } from '@/lib/types';
import { getSlideBoxStyle, getSlidePreviewStyle, getSlideScale } from '@/lib/slide-format';
import { useToast } from '@/composables/useToast';
import StatusPanel from '@/components/StatusPanel.vue';

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
    format: 'portrait_4by5',
  },
);

const router = useRouter();

const emit = defineEmits<{
  exportWeekend: [weekendIndex: number];
}>();

const { toast } = useToast();

const selectedWeekendIndex = ref<number | null>(null);
const downloadingSlide = ref(false);
const copied = ref(false);
let copiedResetTimer: number | undefined;

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
  if (!node) {
    toast('Bild konnte nicht erzeugt werden. Bitte erneut versuchen.', 'error');
    return;
  }

  downloadingSlide.value = true;
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
    toast(
      'Bild konnte nicht gespeichert werden. Bitte erneut versuchen oder den Export nutzen.',
      'error',
    );
  } finally {
    downloadingSlide.value = false;
  }
};

// -- Keyboard support for the lightbox and the caption --

const onKeydown = (event: KeyboardEvent) => {
  if (!expandedSlide.value) return;
  if (event.key === 'ArrowRight') nextSlide();
  else if (event.key === 'ArrowLeft') previousSlide();
  else if (event.key === 'Escape') closeExpandedPreview();
};

onMounted(() => document.addEventListener('keydown', onKeydown));

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  window.clearTimeout(copiedResetTimer);
});

const copyCaption = async () => {
  try {
    await navigator.clipboard.writeText(caption.value);
    copied.value = true;
    window.clearTimeout(copiedResetTimer);
    copiedResetTimer = window.setTimeout(() => (copied.value = false), 2000);
  } catch {
    toast('Kopieren nicht möglich – bitte den Text manuell markieren.', 'error');
  }
};

const expandedSlidePosition = computed(() => {
  if (!expandedSlide.value) return 0;
  return slides.value.findIndex((s) => s.slideId === expandedSlide.value!.slideId) + 1;
});
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow flex flex-col gap-4">
    <div class="flex justify-between">
      <div>
        <h2 class="text-xl font-bold mb-1">Wochenenden</h2>
        <p class="text-sm text-gray-600">
          Wähle ein Wochenende und sieh dir alle Bilder als Galerie an. Ein Klick auf eine Vorschau
          öffnet die Großansicht.
        </p>
      </div>
      <div>
        <button
          v-if="selectedWeekendIndex !== null"
          :disabled="props.exporting"
          class="rounded-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 transition"
          @click="emit('exportWeekend', selectedWeekendIndex)"
        >
          {{ props.exporting ? 'Exportiere…' : 'Export' }}
        </button>
        <p v-if="props.exporting" class="-mt-2 text-sm text-gray-500">
          Bilder werden erzeugt – bitte den Tab nicht wechseln.
        </p>
      </div>
      
    </div>

    <StatusPanel
      v-if="availableWeekendIndexes.length === 0"
      variant="empty"
      title="Für diese Saison sind noch keine Spieltage eingetragen"
      message="Lege die Spieltage im Config-Editor an und veröffentliche sie, damit sie hier erscheinen."
      action-label="Config-Editor öffnen"
      @action="router.push('/editor')"
    />

    <template v-else>
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div class="flex items-center gap-4">
          <input
            type="range"
            aria-label="Wochenende auswählen"
            :min="0"
            :max="availableWeekendIndexes.length - 1"
            :value="selectedWeekendIndex ?? 0"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-900"
            @input="selectedWeekendIndex = Number(($event.target as HTMLInputElement).value)"
          />
          <span class="text-sm font-medium text-gray-700 min-w-20 text-right">
            {{ props.season.weekends[selectedWeekendIndex ?? 0]?.dateRangeShort }}
          </span>
        </div>
      </div>

      <div v-if="selectedWeekend" class="space-y-4">
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="(slide, index) in slides"
            :key="slide.slideId"
            type="button"
            :aria-label="`Bild ${index + 1} von ${slides.length} in Großansicht öffnen`"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-2 transition hover:border-green-700 hover:bg-gray-100"
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
          </button>
        </div>

        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div class="mb-2 flex items-center justify-between gap-3">
            <label class="text-sm font-semibold text-gray-700">Bildtext für Instagram</label>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              @click="copyCaption"
            >
              {{ copied ? 'Kopiert!' : 'Text kopieren' }}
            </button>
          </div>
          <p class="text-sm text-gray-700 whitespace-pre-line">{{ caption }}</p>
        </div>

        
      </div>
    </template>

    <div
      v-if="expandedSlide"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Großansicht des Bildes"
      @click="closeExpandedPreview"
    >
      <div
        class="relative max-h-[95vh] max-w-[95vw] overflow-auto rounded-3xl bg-white p-4 shadow-2xl"
        @click.stop
      >
        <button
          type="button"
          class="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
          title="Schließen (Esc)"
          aria-label="Großansicht schließen"
          @click="closeExpandedPreview"
        >
          ×
        </button>

        <div class="flex flex-col pt-8">
          <p class="mb-3 text-center text-sm font-medium text-gray-600">
            Bild {{ expandedSlidePosition }} von {{ slides.length }}
          </p>
          <div class="mb-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              class="rounded-lg bg-gray-800 px-4 py-2 font-medium text-white transition hover:bg-gray-900"
              title="Vorheriges Bild (Pfeil links)"
              @click="previousSlide"
            >
              ‹ Zurück
            </button>
            <button
              type="button"
              :disabled="downloadingSlide"
              class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
              @click="downloadCurrentSlide"
            >
              {{ downloadingSlide ? 'Wird gespeichert…' : 'Bild herunterladen' }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-gray-800 px-4 py-2 font-medium text-white transition hover:bg-gray-900"
              title="Nächstes Bild (Pfeil rechts)"
              @click="nextSlide"
            >
              Weiter ›
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

          <p class="mt-3 text-center text-xs text-gray-500">
            Mit den Pfeiltasten blättern, mit Esc schließen.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
