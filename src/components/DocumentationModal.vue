<script setup lang="ts">
import { ref } from "vue";

const isOpen = ref(false);

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

defineExpose({
  open,
  close,
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="close"
  >
    <div class="max-h-[90vh] max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Benutzerdokumentation</h2>
        <button
          @click="close"
          class="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="prose prose-sm max-w-none text-gray-700">
        <h3 class="text-lg font-semibold text-gray-900">Header-Menü</h3>
        <p>
          In der Kopfzeile finden Sie drei Buttons für verschiedene Funktionen:
        </p>
        <ul class="list-disc pl-5">
          <li><strong>↑ (Upload)</strong> - JSON-Dateien hochladen oder Beispieldaten laden</li>
          <li><strong>↓ (Export)</strong> - Alle Spieltage als ZIP-Datei exportieren</li>
          <li><strong># (Statistiken)</strong> - Übersicht über Wochenende, Spieltage und Spiele</li>
          <li><strong>? (Dokumentation)</strong> - Diese Hilfe anzeigen</li>
        </ul>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Saison-Import</h3>
        <p>
          Laden Sie über das Upload-Menü eine Metadaten-Datei mit den Feldern
          <code>season</code> und <code>club</code> sowie eine oder mehrere
          JSON-Dateien mit Arrays von Spieltagen hoch. Die Wochenenden werden
          automatisch gruppiert. Alternativ können Sie Beispieldaten laden.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Vorschau</h3>
        <p>
          Wählen Sie ein Wochenende mit dem Schieberegler, um eine Vorschau der
          generierten Grafiken zu sehen.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Export</h3>
        <p>
          Über das Export-Menü können Sie alle Spieltage als ZIP-Datei exportieren.
          Die ZIP-Datei enthält alle Grafiken und Bildtexte.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Dateiformat</h3>
        <p>
          Die Spieltag-Dateien müssen ein Array von Objekten mit folgenden Feldern
          enthalten:
        </p>
        <ul class="list-disc pl-5">
          <li><code>team</code> - Name des Teams</li>
          <li><code>home</code> - Heimspiel (true/false)</li>
          <li><code>date</code> - Datum im Format DD.MM.YYYY</li>
          <li><code>location</code> - Spielort</li>
          <li>
            <code>matches</code> (optional) - Array von Spielen mit
            <code>time</code>, <code>home</code>, <code>away</code>
          </li>
          <li>
            <code>teams</code> (optional) - Array von Teamnamen für Turniere
          </li>
        </ul>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Logos</h3>
        <p>
          Logos werden automatisch aus dem Ordner <code>public/logos</code>
          geladen. Wenn kein Logo gefunden wird, wird stattdessen der Teamname als
          Text angezeigt.
        </p>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="close"
          class="rounded-lg bg-green-900 px-4 py-2 text-white hover:bg-green-800"
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
</template>
