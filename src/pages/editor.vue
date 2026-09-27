<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigEditor } from '@/composables/useConfigEditor';
import StatusPanel from '@/components/StatusPanel.vue';
import SpieltageTab from '@/components/editor/SpieltageTab.vue';
import MetadataTab from '@/components/editor/MetadataTab.vue';
import LogoTab from '@/components/editor/LogoTab.vue';
import SponsorenTab from '@/components/editor/SponsorenTab.vue';
import AktionsbilderTab from '@/components/editor/AktionsbilderTab.vue';
import PublizierenTab from '@/components/editor/PublizierenTab.vue';
import SectionInfo from '@/components/editor/SectionInfo.vue';

const router = useRouter();
const { metadata, loading, error, loaded, loadAll, changeCount } = useConfigEditor();

onMounted(() => {
  void loadAll();
});

const tabs = [
  { id: 'spieltage', label: 'Spieltage', component: SpieltageTab },
  { id: 'aktionsbilder', label: 'Team', component: AktionsbilderTab },
  { id: 'logos', label: 'Logos', component: LogoTab },
  { id: 'sponsoren', label: 'Sponsoren', component: SponsorenTab },
  { id: 'metadaten', label: 'Metadaten', component: MetadataTab },
  { id: 'publizieren', label: 'Veröffentlichen', component: PublizierenTab },
] as const;

type TabId = (typeof tabs)[number]['id'];
const activeTab = ref<TabId>('spieltage');
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-3 sm:p-6">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            @click="router.push('/')"
          >
            ← Zurück
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Config-Editor</h1>
            <p v-if="metadata.club" class="text-sm text-gray-500">
              {{ metadata.club }} · {{ metadata.season }}
            </p>
          </div>
        </div>
        <button
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          :disabled="loading"
          @click="loadAll"
        >
          Neu laden
        </button>
      </div>

      <div class="mb-6 space-y-3">
        <SectionInfo title="Hier änderst du die Daten hinter den Bildern">
          Jeder Reiter erklärt oben, was er tut. Änderungen werden erst im Reiter
          <strong>Veröffentlichen</strong> wirksam. Die Startseite liest die Daten direkt aus dem
          Konfigurations-Repository und zeigt sie danach sofort an.
        </SectionInfo>
        <div
          v-if="changeCount > 0"
          class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
          role="status"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold text-amber-800">
              {{ changeCount }} ungespeicherte Änderung{{ changeCount === 1 ? '' : 'en' }}
            </p>
            <p class="mt-1 text-xs leading-relaxed text-amber-700">
              Sie greifen erst nach dem Veröffentlichen. Wechsle dazu in den Reiter
              <strong>Veröffentlichen</strong>.
            </p>
          </div>
        </div>
      </div>

      <StatusPanel
        v-if="loading"
        variant="loading"
        title="Konfiguration wird geladen…"
        message="Spieltage, Logos, Sponsoren und Aktionsbilder kommen vom Konfigurationsserver."
      />

      <StatusPanel
        v-else-if="error"
        variant="error"
        title="Konfiguration konnte nicht geladen werden"
        :message="error"
        action-label="Erneut laden"
        @action="loadAll"
      />

      <template v-else-if="loaded">
        <div class="mb-6 flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :aria-current="activeTab === tab.id"
            class="rounded-full px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === tab.id
                ? 'bg-green-800 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-green-700 hover:text-green-700'
            "
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <component :is="tabs.find((t) => t.id === activeTab)?.component" />
      </template>
    </div>
  </div>
</template>
