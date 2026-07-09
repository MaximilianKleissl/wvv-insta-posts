<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSeasonData } from '@/composables/useSeasonData';
import PageHeader from '@/components/PageHeader.vue';
import SlideOverview from '@/components/Slides/slide-overview.vue';
import SlideMatchday from '@/components/Slides/slide-matchday.vue';
import SlideTournament from '@/components/Slides/slide-tournament.vue';
import PreviewGallery from '@/components/preview-gallery.vue';
import { fetchSeasonData } from '@/lib/sample-data';
import { sortedMatchDaysForWeekend, slugify } from '@/lib/grouping';
import { exportSeasonZip, downloadBlob, seasonZipFileName } from '@/lib/export-zip';
import type { ExportProgress } from '@/lib/export-zip';
import { isTournamentMatchDay } from '@/lib/grouping';

interface SlideRef {
  slideId: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
  matchDayOriginalIndex?: number;
}

const { setSeasonData, seasonData, loading, error } = useSeasonData();

const exporting = ref(false);
const progress = ref<ExportProgress | null>(null);

const slideNodes = ref<Map<string, HTMLElement>>(new Map());

const registerSlideNode = (id: string, el: HTMLElement | null) => {
  if (el) slideNodes.value.set(id, el);
  else slideNodes.value.delete(id);
};

const registerSlideRef = (slideId: string) => (el: HTMLElement | null) =>
  registerSlideNode(slideId, el);

const season = computed(() => seasonData.value);

const getSlideElement = (id: string) => slideNodes.value.get(id) ?? null;

const weekendCount = computed(() => seasonData.value?.weekends.length ?? 0);
const matchDayCount = computed(
  () => seasonData.value?.weekends.reduce((sum, w) => sum + w.matchDays.length, 0) ?? 0,
);
const matchCount = computed(
  () =>
    seasonData.value?.weekends.reduce(
      (sum, w) =>
        sum +
        w.matchDays.reduce((mdSum, md) => mdSum + (md.matches?.length ?? md.teams?.length ?? 0), 0),
      0,
    ) ?? 0,
);

onMounted(async () => {
  loading.value = true;
  try {
    const data = await fetchSeasonData();
    setSeasonData(data);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Daten';
  } finally {
    loading.value = false;
  }
});

const exportSlides = computed<SlideRef[]>(() => {
  if (!seasonData.value) return [];
  const refs: SlideRef[] = [];
  seasonData.value.weekends.forEach((weekend, weekendIndex) => {
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
  });
  return refs;
});

const handleExport = async () => {
  if (!seasonData.value) return;
  exporting.value = true;
  progress.value = null;
  try {
    const blob = await exportSeasonZip(seasonData.value, undefined, getSlideElement, (p) => {
      progress.value = p;
    });
    downloadBlob(blob, seasonZipFileName(seasonData.value));
    alert('ZIP erstellt - Der Download hat begonnen.');
  } catch (err) {
    alert(`Export fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
  } finally {
    exporting.value = false;
    progress.value = null;
  }
};

const handleExportSingleWeekend = async (weekendIndex: number) => {
  if (!seasonData.value) return;
  exporting.value = true;
  progress.value = null;
  try {
    const blob = await exportSeasonZip(seasonData.value, [weekendIndex], getSlideElement, (p) => {
      progress.value = p;
    });
    const weekend = seasonData.value.weekends[weekendIndex];
    const fileName = `${slugify(seasonData.value.club)}_${weekend.dateRange.replace(/\s+/g, '_')}.zip`;
    downloadBlob(blob, fileName);
    alert('ZIP erstellt - Der Download hat begonnen.');
  } catch (err) {
    alert(`Export fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
  } finally {
    exporting.value = false;
    progress.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <PageHeader
      :exporting="exporting"
      :export-progress="progress"
      :weekend-count="weekendCount"
      :match-day-count="matchDayCount"
      :match-count="matchCount"
      @export-all="handleExport"
    />

    <main class="max-w-4xl mx-auto space-y-8">
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"
        ></div>
        <p class="mt-4 text-gray-600">Lade Daten...</p>
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {{ error }}
      </div>

      <PreviewGallery
        v-else-if="seasonData"
        :season="season"
        :exporting="exporting"
        @export-weekend="handleExportSingleWeekend"
      />
    </main>

    <div style="position: absolute; left: -15000px; top: 0; width: 0; height: 0; overflow: hidden">
      <div
        v-for="slide in exportSlides"
        :key="slide.slideId"
        :ref="registerSlideRef(slide.slideId)"
        class="absolute"
        style="width: 1080px; height: 1080px"
      >
        <SlideOverview
          v-if="slide.kind === 'overview'"
          :id="slide.slideId"
          :season="season"
          :weekend-index="slide.weekendIndex"
        />
        <SlideTournament
          v-else-if="
            isTournamentMatchDay(
              season.weekends[slide.weekendIndex].matchDays[slide.matchDayOriginalIndex ?? 0],
            )
          "
          :id="slide.slideId"
          :season="season"
          :match-day="
            season.weekends[slide.weekendIndex].matchDays[slide.matchDayOriginalIndex ?? 0]
          "
        />
        <SlideMatchday
          v-else
          :season="season"
          :match-day="
            season.weekends[slide.weekendIndex].matchDays[slide.matchDayOriginalIndex ?? 0]
          "
        />
      </div>
    </div>
  </div>
</template>
