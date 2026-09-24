<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useConfigEditor } from '@/composables/useConfigEditor';
import { parseGermanDate } from '@/lib/grouping';
import type { MatchDay } from '@/lib/types';
import MatchDayEditor from '@/components/editor/MatchDayEditor.vue';
import SectionInfo from '@/components/editor/SectionInfo.vue';

const { matchdayFiles, addMatchDay, removeMatchDay, updateMatchDay } = useConfigEditor();

const TEAM_FILTER_NONE = '__none__';
const teamFilter = ref('');

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Saturday + Sunday of the coming weekend (or the current one if we are in it). */
function upcomingWeekend(): { from: string; to: string } {
  const now = new Date();
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  const saturday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate() + 1);
  return { from: isoDate(saturday), to: isoDate(sunday) };
}

const weekendDefault = upcomingWeekend();
const dateFrom = ref(weekendDefault.from);
const dateTo = ref(weekendDefault.to);

/** Monday-to-Sunday week range (0 = current week, 1 = next week). */
function weekRange(offset: 0 | 1): { from: string; to: string } {
  const now = new Date();
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - ((now.getDay() + 6) % 7) + offset * 7,
  );
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  return { from: isoDate(monday), to: isoDate(sunday) };
}

const setThisWeek = () => {
  const range = weekRange(0);
  dateFrom.value = range.from;
  dateTo.value = range.to;
};

const setNextWeek = () => {
  const range = weekRange(1);
  dateFrom.value = range.from;
  dateTo.value = range.to;
};

const teamFilterOptions = computed(() => {
  const teams = new Set<string>();
  for (const matchDays of Object.values(matchdayFiles.value)) {
    for (const md of matchDays) if (md.team) teams.add(md.team);
  }
  return [...teams].sort((a, b) => a.localeCompare(b, 'de'));
});

const sortedFiles = computed(() => Object.keys(matchdayFiles.value).sort());

const addToFile = ref('');
watch(
  () => sortedFiles.value,
  (files) => {
    if (!addToFile.value || !files.includes(addToFile.value)) {
      addToFile.value = files[0] ?? '';
    }
  },
  { immediate: true },
);

function toMidnight(iso: string): number | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getTime();
}

const isFilterActive = () =>
  teamFilter.value !== '' || dateFrom.value !== '' || dateTo.value !== '';

function matchesFilter(matchDay: MatchDay): boolean {
  if (teamFilter.value === TEAM_FILTER_NONE) {
    if (matchDay.team) return false;
  } else if (teamFilter.value && matchDay.team !== teamFilter.value) {
    return false;
  }

  const fromTs = toMidnight(dateFrom.value);
  const toTs = toMidnight(dateTo.value);
  if ((fromTs !== null || toTs !== null) && matchDay.date) {
    const mdTs = parseGermanDate(matchDay.date)?.getTime();
    if (mdTs !== undefined && mdTs !== null) {
      if (fromTs !== null && mdTs < fromTs) return false;
      if (toTs !== null && mdTs > toTs) return false;
    }
  }

  return true;
}

interface VisibleMatchDay {
  file: string;
  index: number;
  matchDay: MatchDay;
}

/** Flat list of all matchdays passing the filters (grouping by file is intentionally removed). */
const visibleItems = computed<VisibleMatchDay[]>(() => {
  const items: VisibleMatchDay[] = [];
  for (const file of sortedFiles.value) {
    const matchDays = matchdayFiles.value[file] ?? [];
    matchDays.forEach((matchDay, index) => {
      if (matchesFilter(matchDay)) items.push({ file, index, matchDay });
    });
  }
  return items;
});

function resetFilters() {
  teamFilter.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}

function totalMatchDays(): number {
  let total = 0;
  for (const matchDays of Object.values(matchdayFiles.value)) total += matchDays.length;
  return total;
}
</script>

<template>
  <div class="space-y-4">
    <SectionInfo title="Was ist hier konfiguriert?">
      Aus diesen Dateien leitet der Viewer die Spieltage und Wochenenden für die Folien ab. Jeder
      Spieltag liegt in einer eigenen Datei ({{ Object.keys(matchdayFiles).length }} vorhanden). Pro
      Spieltag wird der Gastgeber (Heim/Auswärts), Datum, Ort und optional das Ergebnis angegeben.
      Saison und Verein werden im Tab „Metadaten“ gepflegt.
    </SectionInfo>

    <div class="rounded-lg border border-gray-200 bg-white p-3">
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="
            dateFrom === weekRange(0).from && dateTo === weekRange(0).to
              ? 'border-green-800 bg-green-800 text-white'
              : 'border-gray-300 bg-white text-gray-700'
          "
          @click="setThisWeek"
        >
          Diese Woche
        </button>
        <button
          class="rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="
            dateFrom === weekRange(1).from && dateTo === weekRange(1).to
              ? 'border-green-800 bg-green-800 text-white'
              : 'border-gray-300 bg-white text-gray-700'
          "
          @click="setNextWeek"
        >
          Nächste Woche
        </button>
        <span class="hidden text-xs text-gray-500 sm:inline">·</span>
        <label class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">von</span>
          <input v-model="dateFrom" type="date" class="editor-input w-auto" />
        </label>
        <label class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">bis</span>
          <input v-model="dateTo" type="date" class="editor-input w-auto" />
        </label>
        <button class="editor-add" @click="resetFilters">Filter zurücksetzen</button>
        <span class="ml-auto text-xs text-gray-500">
          {{ isFilterActive() ? 'gefiltert · ' : '' }}{{ totalMatchDays() }} Spieltage gesamt
        </span>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3">
        <span class="text-xs text-gray-500">Mannschaft:</span>
        <button
          class="rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="
            teamFilter === ''
              ? 'border-green-800 bg-green-800 text-white'
              : 'border-gray-300 bg-white text-gray-700'
          "
          @click="teamFilter = ''"
        >
          Alle
        </button>
        <button
          class="rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="
            teamFilter === TEAM_FILTER_NONE
              ? 'border-green-800 bg-green-800 text-white'
              : 'border-gray-300 bg-white text-gray-700'
          "
          @click="teamFilter = TEAM_FILTER_NONE"
        >
          Keine
        </button>
        <button
          v-for="team in teamFilterOptions"
          :key="team"
          class="rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="
            teamFilter === team
              ? 'border-green-800 bg-green-800 text-white'
              : 'border-gray-300 bg-white text-gray-700'
          "
          @click="teamFilter = team"
        >
          {{ team }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <span class="text-xs text-gray-500">Spieltag hinzufügen in:</span>
      <select
        v-model="addToFile"
        class="editor-input w-auto max-w-[220px]"
        :disabled="sortedFiles.length === 0"
      >
        <option v-for="file in sortedFiles" :key="file" :value="file">{{ file }}</option>
      </select>
      <button class="editor-add" :disabled="!addToFile" @click="addMatchDay(addToFile)">
        + Spieltag hinzufügen
      </button>
    </div>

    <div class="space-y-3">
      <template v-if="visibleItems.length > 0">
        <MatchDayEditor
          v-for="item in visibleItems"
          :key="`${item.file}-${item.index}`"
          :model-value="item.matchDay"
          :index="item.index"
          :file="item.file"
          @update:model-value="updateMatchDay(item.file, item.index, $event)"
          @remove="removeMatchDay(item.file, item.index)"
        />
      </template>
      <div v-else-if="isFilterActive()" class="text-sm text-gray-500">
        Keine Spieltage entsprechen den Filtern.
      </div>
      <div v-else class="text-sm text-gray-500">Noch keine Spieltage vorhanden.</div>
    </div>
  </div>
</template>
