<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Download } from 'lucide-vue-next';
import { useSeasonBootstrap } from '@/composables/useSeasonBootstrap';
import { useSlideRegistry } from '@/composables/useSlideRegistry';
import PageHeader from '@/components/PageHeader.vue';
import SlideTeamSummary from '@/components/Slides/slides/team-summary.vue';
import { groupMatchDaysByTeam, slugify } from '@/lib/grouping';
import { exportTeamZip, downloadBlob } from '@/lib/export-zip';
import type { ExportProgress } from '@/lib/export-zip';
import {
  getSlideBoxStyle,
  getSlidePreviewStyle,
  getSlideScale,
  type SlideFormatMode,
} from '@/lib/slide-format';

const router = useRouter();
const { seasonData, loading, error } = useSeasonBootstrap();
const { registerSlideRef, getSlideElement } = useSlideRegistry();

const exporting = ref(false);
const progress = ref<ExportProgress | null>(null);
const selectedTeam = ref<string | null>(null);
const exportFormat = ref<SlideFormatMode>('portrait_4by5');

const season = computed(() => seasonData.value!);

const teamMatchDays = computed(() => {
  if (!seasonData.value) return [];
  return groupMatchDaysByTeam(seasonData.value);
});

const teamCount = computed(() => teamMatchDays.value.length);
const totalMatchDays = computed(() =>
  teamMatchDays.value.reduce((sum, team) => sum + team.matchDays.length, 0),
);

const exportSlides = computed(() => {
  if (!seasonData.value || !selectedTeam.value) return [];
  const teamData = teamMatchDays.value.find((t) => t.teamName === selectedTeam.value);
  if (!teamData) return [];

  return [
    ...(['home', 'away'] as const)
      .filter((gameType) =>
        teamData.matchDays.some((matchDay) =>
          gameType === 'home' ? matchDay.home : !matchDay.home,
        ),
      )
      .map((gameType) => ({
        slideId: `team-${gameType}-${slugify(selectedTeam.value!)}`,
        kind: 'team-summary' as const,
        teamName: selectedTeam.value!,
        gameType,
      })),
  ];
});

const handleExport = async () => {
  if (!seasonData.value || !selectedTeam.value) return;
  exporting.value = true;
  progress.value = null;
  try {
    const teamData = teamMatchDays.value.find((t) => t.teamName === selectedTeam.value);
    if (!teamData) throw new Error('Team nicht gefunden');

    const blob = await exportTeamZip(seasonData.value, teamData, getSlideElement, (p) => {
      progress.value = p;
    });
    const fileName = `${slugify(seasonData.value.club)}_${slugify(selectedTeam.value)}_saison.zip`;
    downloadBlob(blob, fileName);
    alert('ZIP erstellt - Der Download hat begonnen.');
  } catch (err) {
    alert(`Export fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
  } finally {
    exporting.value = false;
    progress.value = null;
  }
};

const selectTeam = (teamName: string) => {
  selectedTeam.value = teamName;
};

const goBack = () => {
  router.push('/');
};

const teamPreviewStyle = computed(() =>
  getSlidePreviewStyle(exportFormat.value, 540, exportFormat.value === 'stories' ? 900 : 540),
);
const teamPreviewScale = computed(() =>
  getSlideScale(exportFormat.value, 540, exportFormat.value === 'stories' ? 900 : 540),
);
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <PageHeader
      :exporting="exporting"
      :export-progress="progress"
      :weekend-count="teamCount"
      :match-day-count="totalMatchDays"
      :match-count="0"
      @export-all="handleExport"
    >
      <template #extra-actions>
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          @click="goBack"
        >
          Zurück zum Wochenende-Modus
        </button>
      </template>
    </PageHeader>

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

      <div v-else-if="seasonData" class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Format:</span>
          <button
            v-for="mode in ['portrait_4by5', 'stories'] as const"
            :key="mode"
            type="button"
            :class="[
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              exportFormat === mode
                ? 'border-green-800 bg-green-800 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-700 hover:text-green-700',
            ]"
            @click="exportFormat = mode"
          >
            {{ mode === 'portrait_4by5' ? 'Portrait 4:5' : 'Stories' }}
          </button>
        </div>

        <!-- Team Selection -->
        <div v-if="!selectedTeam" class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-800">Wähle ein Team</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <button
              v-for="team in teamMatchDays"
              :key="team.teamName"
              class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-left"
              @click="selectTeam(team.teamName)"
            >
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ team.teamName }}</h3>
              <p class="text-sm text-gray-600">{{ team.matchDays.length }} Spieltage</p>
            </button>
          </div>
        </div>

        <!-- Team Summary View -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between">
            <button
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              @click="selectedTeam = null"
            >
              ← Zurück zur Teamauswahl
            </button>
            <div class="flex items-center gap-4">
              <h2 class="text-2xl font-bold text-gray-800">{{ selectedTeam }}</h2>
              <button
                :disabled="exporting"
                class="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                title="Team-ZIP herunterladen"
                @click="handleExport"
              >
                <Download class="w-4 h-4" />
                {{ exporting ? 'Erstelle ZIP...' : 'Download' }}
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-for="gameType in ['home', 'away'] as const"
              v-show="
                teamMatchDays
                  .find((t) => t.teamName === selectedTeam)
                  ?.matchDays.some((md) => (gameType === 'home' ? md.home : !md.home))
              "
              :key="gameType"
              class="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div
                class="mx-auto max-w-full overflow-hidden border border-gray-200 bg-white shadow-sm"
                :style="teamPreviewStyle"
              >
                <div
                  class="origin-top-left"
                  :style="{
                    transform: `scale(${teamPreviewScale})`,
                    ...getSlideBoxStyle(exportFormat),
                  }"
                >
                  <SlideTeamSummary
                    :id="`preview-${gameType}-${slugify(selectedTeam)}`"
                    :season="season"
                    :team-name="selectedTeam"
                    :game-type="gameType"
                    :match-days="
                      teamMatchDays.find((t) => t.teamName === selectedTeam)?.matchDays || []
                    "
                    :format="exportFormat"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Hidden export slides -->
    <div
      v-if="seasonData && selectedTeam"
      style="position: absolute; left: -15000px; top: 0; width: 0; height: 0; overflow: hidden"
    >
      <div
        v-for="slide in exportSlides"
        :key="slide.slideId"
        :ref="registerSlideRef(slide.slideId)"
        class="absolute"
        :style="getSlideBoxStyle(exportFormat)"
      >
        <SlideTeamSummary
          :id="slide.slideId"
          :season="season"
          :team-name="slide.teamName"
          :game-type="slide.gameType"
          :match-days="teamMatchDays.find((t) => t.teamName === slide.teamName)?.matchDays || []"
          :format="exportFormat"
        />
      </div>
    </div>
  </div>
</template>
