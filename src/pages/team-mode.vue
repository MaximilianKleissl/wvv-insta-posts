<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Download } from 'lucide-vue-next';
import { useSeasonBootstrap } from '@/composables/useSeasonBootstrap';
import { useSlideRegistry } from '@/composables/useSlideRegistry';
import PageHeader from '@/components/PageHeader.vue';
import FormatToggle from '@/components/FormatToggle.vue';
import StatusPanel from '@/components/StatusPanel.vue';
import SlideTeamSummary from '@/components/Slides/slides/team-summary.vue';
import { groupMatchDaysByTeam, slugify } from '@/lib/grouping';
import { exportTeamZip, type ExportProgress } from '@/lib/export-zip';
import { usePendingSave } from '@/composables/usePendingSave';
import SaveConfirmBar from '@/components/SaveConfirmBar.vue';
import { useToast } from '@/composables/useToast';
import {
  getSlideBoxStyle,
  getSlidePreviewStyle,
  getSlideScale,
  type SlideFormatMode,
} from '@/lib/slide-format';
import type { StatEntry } from '@/components/HeaderMenu.vue';

const router = useRouter();
const { seasonData, loading, error, reload } = useSeasonBootstrap();
const { registerSlideRef, getSlideElement } = useSlideRegistry();

const exporting = ref(false);
const selectedTeam = ref<string | null>(null);
const exportFormat = ref<SlideFormatMode>('portrait_4by5');
const { toast } = useToast();

const season = computed(() => seasonData.value!);

const { pendingSave, saveError, saving: saving, save, confirmSave, cancelSave } = usePendingSave();

const exportProgress = ref<ExportProgress | null>(null);

const teamMatchDays = computed(() => {
  if (!seasonData.value) return [];
  return groupMatchDaysByTeam(seasonData.value);
});

const totalMatchDays = computed(() =>
  teamMatchDays.value.reduce((sum, team) => sum + team.matchDays.length, 0),
);

const totalMatches = computed(() =>
  teamMatchDays.value.reduce(
    (sum, team) =>
      sum +
      team.matchDays.reduce(
        (mdSum, md) => mdSum + (md.matches?.length ?? md.teams?.length ?? 0),
        0,
      ),
    0,
  ),
);

// Labelled for this view: the counts are per team, not per weekend.
const stats = computed<StatEntry[]>(() => [
  { label: 'Mannschaften', value: teamMatchDays.value.length },
  { label: 'Spieltage', value: totalMatchDays.value },
  { label: 'Spiele', value: totalMatches.value },
]);

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
  exportProgress.value = null;
  try {
    const teamData = teamMatchDays.value.find((t) => t.teamName === selectedTeam.value);
    if (!teamData) throw new Error('Team nicht gefunden');

    const { blob, failedSlides } = await exportTeamZip(
      seasonData.value,
      teamData,
      getSlideElement,
      (progress) => (exportProgress.value = progress),
    );
    const fileName = `${slugify(seasonData.value.club)}_${slugify(selectedTeam.value)}_saison.zip`;
    await save(blob, fileName);
    if (failedSlides.length > 0) {
      toast(
        `${failedSlides.length} Bild(er) ließen sich nicht erzeugen. Die übrigen liegen im ZIP.`,
        'warning',
        `Fehlgeschlagen: ${failedSlides.join(', ')}`,
      );
    }
  } catch (err) {
    toast(
      'Export abgebrochen – es wurde keine Datei erzeugt.',
      'error',
      `${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}\n` +
        `Hinweis: Auf iOS muss der Export im Vordergrund bleiben.`,
    );
  } finally {
    exporting.value = false;
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
    <PageHeader :club="seasonData?.club" :season="seasonData?.season" :stats="stats">
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

      <div v-else-if="seasonData" class="space-y-4">
        <FormatToggle v-model="exportFormat" />

        <!-- Team Selection -->
        <div v-if="!selectedTeam" class="space-y-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Wähle ein Team</h2>
            <p class="mt-1 text-sm text-gray-600">
              Für jede Mannschaft gibt es eine Saison-Übersicht, getrennt nach Heim- und
              Auswärtsspielen.
            </p>
          </div>
          <div
            v-if="teamMatchDays.length === 0"
            class="rounded-lg border border-gray-200 bg-white p-8 text-center"
          >
            <p class="text-sm font-medium text-gray-700">Keine Mannschaften gefunden</p>
            <p class="mt-1 text-sm text-gray-500">
              Für diese Saison sind noch keine Spieltage eingetragen. Trage sie im Config-Editor
              unter „Spieltage" ein und veröffentliche sie.
            </p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
          <SaveConfirmBar
            v-if="pendingSave"
            :pending="pendingSave"
            :saving="saving"
            :error="saveError"
            @confirm="confirmSave"
            @cancel="cancelSave"
          />

          <div class="flex items-center justify-between">
            <button
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              @click="selectedTeam = null"
            >
              ← Zurück zur Teamauswahl
            </button>
            <div class="flex flex-col items-end gap-4">
              <div class="flex items-center gap-4">
                <h2 class="text-2xl font-bold text-gray-800">{{ selectedTeam }}</h2>
                <button
                  :disabled="exporting"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Beide Bilder und den Bildtext als ZIP herunterladen"
                  @click="handleExport"
                >
                  <Download class="w-4 h-4" />
                  {{ exporting ? 'Exportiere…' : 'Export' }}
                </button>
              </div>
              <p v-if="exporting" class="text-xs text-gray-600">
                {{
                  exportProgress
                    ? `${exportProgress.current} von ${exportProgress.total} – ${exportProgress.label}`
                    : 'Bilder werden erzeugt …'
                }}
              </p>
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
