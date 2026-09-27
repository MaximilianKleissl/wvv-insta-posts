<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSeasonBootstrap } from '@/composables/useSeasonBootstrap';
import { useSlideRegistry } from '@/composables/useSlideRegistry';
import PageHeader from '@/components/PageHeader.vue';
import FormatToggle from '@/components/FormatToggle.vue';
import StatusPanel from '@/components/StatusPanel.vue';
import SlideOverview from '@/components/Slides/slides/overview.vue';
import SlideMatchday from '@/components/Slides/slides/matchday.vue';
import SlideTournament from '@/components/Slides/slides/tournament.vue';
import PreviewGallery from '@/components/preview-gallery.vue';
import { sortedMatchDaysForWeekend, slugify } from '@/lib/grouping';
import { exportSeasonZip, downloadBlob } from '@/lib/export-zip';
import { useToast } from '@/composables/useToast';
import { getSlideBoxStyle, type SlideFormatMode } from '@/lib/slide-format';
import { isTournamentMatchDay } from '@/lib/grouping';
import type { StatEntry } from '@/components/HeaderMenu.vue';

const router = useRouter();

interface SlideRef {
  slideId: string;
  weekendIndex: number;
  kind: 'overview' | 'matchday';
  matchDayOriginalIndex?: number;
}

const { seasonData, loading, error, reload } = useSeasonBootstrap();
const { registerSlideRef, getSlideElement } = useSlideRegistry();

const exporting = ref(false);
const exportFormat = ref<SlideFormatMode>('portrait_4by5');
const { toast } = useToast();

const season = computed(() => seasonData.value!);

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

const stats = computed<StatEntry[]>(() => [
  { label: 'Wochenenden', value: weekendCount.value },
  { label: 'Spieltage', value: matchDayCount.value },
  { label: 'Spiele', value: matchCount.value },
]);

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

const handleExportSingleWeekend = async (weekendIndex: number) => {
  if (!seasonData.value) return;
  exporting.value = true;
  try {
    const blob = await exportSeasonZip(seasonData.value, [weekendIndex], getSlideElement);
    const weekend = seasonData.value.weekends[weekendIndex];
    const fileName = `${slugify(seasonData.value.club)}_${weekend.dateRange.replace(/\s+/g, '_')}.zip`;
    downloadBlob(blob, fileName);
    toast('ZIP erstellt – der Download hat begonnen.');
  } catch (err) {
    toast(
      `Export fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      'error',
    );
  } finally {
    exporting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <PageHeader :club="seasonData?.club" :season="seasonData?.season" :stats="stats">
      <template #extra-actions>
        <button
          class="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          @click="router.push('/team-mode')"
        >
          Team-Modus
        </button>
      </template>
    </PageHeader>

    <main class="max-w-4xl mx-auto space-y-8">
      <StatusPanel
        v-if="loading"
        variant="loading"
        title="Spielplan wird geladen…"
        message="Daten kommen vom Konfigurationsserver."
      />

      <StatusPanel
        v-else-if="error"
        variant="error"
        title="Spielplan konnte nicht geladen werden"
        :message="error"
        action-label="Erneut laden"
        @action="reload"
      />

      <div v-if="seasonData" class="space-y-4">
        <FormatToggle v-model="exportFormat" />

        <PreviewGallery
          :season="season"
          :exporting="exporting"
          :format="exportFormat"
          @export-weekend="handleExportSingleWeekend"
        />
      </div>
    </main>

    <div
      v-if="seasonData"
      style="position: absolute; left: -15000px; top: 0; width: 0; height: 0; overflow: hidden"
    >
      <div
        v-for="slide in exportSlides"
        :key="slide.slideId"
        :ref="registerSlideRef(slide.slideId)"
        class="absolute"
        :style="getSlideBoxStyle(exportFormat)"
      >
        <SlideOverview
          v-if="slide.kind === 'overview'"
          :id="slide.slideId"
          :season="season"
          :weekend-index="slide.weekendIndex"
          :format="exportFormat"
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
          :format="exportFormat"
        />
        <SlideMatchday
          v-else
          :id="slide.slideId"
          :season="season"
          :match-day="
            season.weekends[slide.weekendIndex].matchDays[slide.matchDayOriginalIndex ?? 0]
          "
          :format="exportFormat"
        />
      </div>
    </div>
  </div>
</template>
