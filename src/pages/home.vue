<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSeasonData } from '@/composables/useSeasonData';
import { useLogoLibrary } from '@/composables/useLogoLibrary';
import PageHeader from '@/components/PageHeader.vue';
import SlideOverview from '@/components/Slides/slide-overview.vue';
import SlideMatchday from '@/components/Slides/slide-matchday.vue';
import PreviewGallery from '@/components/preview-gallery.vue';
import { SAMPLE_SEASON_FILES } from '@/lib/sample-data';
import { sortedMatchDaysForWeekend, slugify } from '@/lib/grouping';
import { getBundledLogoEntries } from '@/lib/logo-assets';
import {
  exportSeasonZip,
  downloadBlob,
  seasonZipFileName,
  type ExportProgress,
} from '@/lib/export-zip';
import { parseSeasonImportFiles } from '@/lib/schema';
import type { SeasonData } from '@/lib/types';

interface SlideRef {
  slideId: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
  matchDayOriginalIndex?: number;
}

const { rawJson, setRawJson, parseJson, setSeasonData, validationResult, seasonData } =
  useSeasonData();
const { library } = useLogoLibrary();

const exporting = ref(false);
const progress = ref<ExportProgress | null>(null);
const importState = ref<{
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}>({
  status: 'idle',
  message: '',
});

const slideNodes = ref<Map<string, HTMLElement>>(new Map());

const registerSlideNode = (id: string, el: HTMLElement | null) => {
  if (el) slideNodes.value.set(id, el);
  else slideNodes.value.delete(id);
};

const registerSlideRef = (slideId: string) => (el: HTMLElement | null) =>
  registerSlideNode(slideId, el);

const season = computed<SeasonData>(() => seasonData.value!);

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

const handleLoadSample = async () => {
  await importFiles(SAMPLE_SEASON_FILES);
};

const importFiles = async (files: Array<File | { name: string; content: string }>) => {
  importState.value = { status: 'loading', message: 'Lade Dateien...' };

  try {
    const result = await parseSeasonImportFiles(files);
    if (!result.success || !result.data) {
      importState.value = {
        status: 'error',
        message: result.issues?.[0]?.message ?? 'Import fehlgeschlagen.',
      };
      return;
    }

    setSeasonData(result.data);
    setRawJson(JSON.stringify(result.data, null, 2));
    importState.value = {
      status: 'success',
      message: `${files.length} Datei(en) verarbeitet. ${result.data.weekends.length} Wochenende erkannt.`,
    };
  } catch (error) {
    importState.value = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Import fehlgeschlagen.',
    };
  }
};

const handleFileInputChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  if (files.length === 0) return;

  await importFiles(files);
  input.value = '';
};

const allSlideRefs = computed<SlideRef[]>(() => {
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
    weekend.matchDays.forEach((md) => {
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

const bundledLogoEntries = computed(() => getBundledLogoEntries(import.meta.env.BASE_URL));

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
      @file-upload="handleFileInputChange"
      @load-sample="handleLoadSample"
      @export-all="handleExport"
    />

    <main class="max-w-4xl mx-auto space-y-8">
      <div
        v-if="validationResult && !validationResult.success"
        class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
      >
        <p v-if="validationResult.parseError">
          Ungueltiges JSON: {{ validationResult.parseError }}
        </p>
        <p v-for="(issue, i) in validationResult.issues" :key="i">
          <strong>{{ issue.path }}:</strong> {{ issue.message }}
        </p>
      </div>

      <span v-if="importState.status === 'error'" class="block text-sm font-medium text-red-600">
        {{ importState.message }}
      </span>
      <span
        v-else-if="importState.status === 'loading'"
        class="block text-sm font-medium text-blue-600"
      >
        {{ importState.message }}
      </span>

      <PreviewGallery
        v-if="seasonData"
        :season="season"
        :logoLibrary="library"
        :exporting="exporting"
        @exportWeekend="handleExportSingleWeekend"
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
          :weekendIndex="slide.weekendIndex"
          :logoLibrary="library"
        />
        <SlideMatchday
          v-else
          :id="slide.slideId"
          :season="season"
          :matchDay="
            season.weekends[slide.weekendIndex].matchDays[slide.matchDayOriginalIndex ?? 0]
          "
          :logoLibrary="library"
        />
      </div>
    </div>
  </div>
</template>
