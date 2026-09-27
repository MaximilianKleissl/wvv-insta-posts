<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { X } from 'lucide-vue-next';

const isOpen = ref(false);
const dialogRef = ref<HTMLElement | null>(null);

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close();
}

// Move focus into the dialog when it opens so keyboard users are not stranded
// behind the overlay, and give Escape the expected "dismiss" behaviour.
watch(isOpen, async (open) => {
  if (!open) {
    document.removeEventListener('keydown', onKeydown);
    return;
  }
  document.addEventListener('keydown', onKeydown);
  await nextTick();
  dialogRef.value?.focus();
});

// The dialog can be torn down while open (navigating to another view), so do not
// leave the listener behind.
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

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
    <div
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="docs-title"
      tabindex="-1"
      class="max-h-[90vh] max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl outline-none"
    >
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="docs-title" class="text-2xl font-bold text-gray-900">Benutzerdokumentation</h2>
          <p class="mt-1 text-sm text-gray-600">
            So erstellst du aus dem Spielplan fertige Instagram-Beiträge.
          </p>
        </div>
        <button
          type="button"
          aria-label="Hilfe schließen"
          title="Hilfe schließen (Esc)"
          class="shrink-0 rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
          @click="close"
        >
          <X class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div class="prose prose-sm max-w-none text-gray-700">
        <h3 class="text-lg font-semibold text-gray-900">Die drei Modi</h3>
        <p>
          Die App hat drei Bereiche. Du wechselst zwischen ihnen über die Buttons oben in der grünen
          Kopfzeile.
        </p>
        <ul class="list-disc pl-5">
          <li>
            <strong>Wochenende-Modus</strong> (Startseite) – Bilder für ein einzelnes
            Spielwochenende erstellen
          </li>
          <li><strong>Team-Modus</strong> – eine Saison-Übersicht pro Mannschaft</li>
          <li>
            <strong>Config-Editor</strong> (Stiftsymbol <code>✎</code>) – Spielplan, Logos,
            Sponsoren und Aktionsbilder pflegen
          </li>
        </ul>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Wochenende-Modus</h3>
        <ol class="list-decimal pl-5">
          <li>
            <strong>Format wählen.</strong> <em>Portrait 4:5</em> eignet sich für Beiträge im Feed,
            <em>Stories</em> für Story und Reel. Die Vorschau und der Export folgen dieser Wahl.
          </li>
          <li>
            <strong>Wochenende wählen.</strong> Der Schieberegler springt automatisch auf das
            nächste Wochenende mit einem Spieltag. Die Datumsspanne steht rechts daneben.
          </li>
          <li>
            <strong>Vorschau prüfen.</strong> Jedes Bild entspricht einer Datei im späteren Export.
            Steht in der Kachel ein Mannschaftsname statt eines Logos, fehlt dem Gegner das Logo.
          </li>
          <li>
            <strong> Einzelbild sichern.</strong> Tippe eine Vorschau an: Du landest in der
            Großansicht und kannst mit <em>Bild herunterladen</em> genau dieses eine Bild als PNG
            speichern. Mit <em>Weiter</em> und <em>Zurück</em> (oder den Pfeiltasten) blätterst du
            durch alle Bilder, mit <em>Esc</em> schließt du die Ansicht.
          </li>
          <li>
            <strong>Alles exportieren.</strong> Der Button <em>Export</em> lädt das gewählte
            Wochenende als ZIP herunter.
          </li>
        </ol>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Bildtext</h3>
        <p>
          Unter den Vorschauen steht der passende Bildtext für Instagram. Mit
          <em>Text kopieren</em> übernimmst du ihn in die Zwischenablage und fügst ihn beim Posten
          ein.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">In der ZIP-Datei</h3>
        <p>
          Die ZIP enthält einen Ordner pro Wochenende mit allen Bildern als PNG (1080&nbsp;px breit,
          doppelte Auflösung) sowie den Bildtext als Textdatei.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Team-Modus</h3>
        <p>
          Wähle eine Mannschaft, siehst du je eine Saison-Übersicht für Heim- und Auswärtsspiele.
          <em>Export</em> liefert beide Bilder und den Bildtext als ZIP. Die Vorschau lässt sich
          oben zwischen Portrait und Stories umschalten.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Config-Editor</h3>
        <p>
          Der Editor schreibt die Daten, aus denen die Bilder entstehen, direkt in das
          Konfigurations-Repository. Jeder Reiter erklärt oben, was er tut. Wichtig:
        </p>
        <ul class="list-disc pl-5">
          <li>Änderungen erst im Reiter <strong>Veröffentlichen</strong> wirksam machen.</li>
          <li>
            Danach sind sie sofort sichtbar – die Startseite liest ihre Daten direkt aus dem
            Repository. Zeigt sie noch den alten Stand, aktualisiere die Seite einmal neu.
          </li>
          <li>
            Der Reiter <strong>Veröffentlichen</strong> warnt vor fehlenden Logos, Sponsoren ohne
            Zuordnung und Mannschaften ohne eigene Aktionsbilder.
          </li>
          <li>
            Wurde die Konfiguration zwischenzeitlich woanders geändert, lehnt das Veröffentlichen ab
            – dann oben <strong>Neu laden</strong> und die Änderungen erneut prüfen.
          </li>
        </ul>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Woher kommen die Daten?</h3>
        <p>
          Spielplan, Logos, Sponsoren und Aktionsbilder liegen in einem Konfigurations-Repository
          auf GitHub. Die Startseite liest die Dateien direkt von dort, ohne Umweg über eine
          Website. Alles wird im Browser verarbeitet, es wird nichts auf einem Server
          zusammengebaut.
        </p>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Symbole in der Kopfzeile</h3>
        <ul class="list-disc pl-5">
          <li><strong>#</strong> – Statistiken der geladenen Daten</li>
          <li><strong>✎</strong> – Config-Editor öffnen</li>
          <li><strong>?</strong> – diese Hilfe anzeigen</li>
        </ul>

        <h3 class="mt-4 text-lg font-semibold text-gray-900">Wenn etwas nicht klappt</h3>
        <ul class="list-disc pl-5">
          <li>
            <strong>„Daten konnten nicht geladen werden"</strong> – Internetverbindung prüfen und
            über <em>Erneut laden</em> versuchen. Bleibt es dabei, den Config-Editor öffnen und dort
            <em>Neu laden</em> wählen.
          </li>
          <li>
            <strong>Export bricht ab</strong> – Browser-Tab nicht wechseln; Bilder werden im
            Hintergrund erzeugt. Sehr große Bildschirmfenster verkürzen die Wartezeit.
          </li>
          <li>
            <strong>Kein Logo in der Vorschau</strong> – im Reiter <strong>Logos</strong> prüfen, ob
            das Logo hochgeladen wurde.
          </li>
        </ul>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="rounded-lg bg-green-900 px-4 py-2 text-white transition hover:bg-green-800"
          @click="close"
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
</template>
