<script setup lang="ts">
import { Share2, X } from 'lucide-vue-next';
import type { PendingSave } from '@/composables/usePendingSave';

/**
 * Confirmation step for the iOS save flow. Once a file has been rendered, the share sheet still
 * needs a live tap, so we park the finished blob here until the user explicitly saves it.
 */
const props = defineProps<{
  pending: PendingSave;
  saving?: boolean;
  hint?: string;
}>();

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    role="status"
  >
    <div class="min-w-0">
      <p class="text-sm font-medium text-green-900">{{ props.pending.fileName }} ist fertig</p>
      <p class="mt-1 text-sm text-green-800">
        {{
          props.hint ??
          'Zum Speichern antippen – iOS öffnet dann das Teilen-Menü, über das du die Datei in „Dateien“ ablegen kannst.'
        }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <button
        type="button"
        :disabled="props.saving"
        class="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
        @click="emit('confirm')"
      >
        <Share2 class="h-4 w-4" aria-hidden="true" />
        {{ props.saving ? 'Wird gespeichert…' : 'Jetzt speichern' }}
      </button>
      <button
        type="button"
        :disabled="props.saving"
        class="rounded-lg border border-green-300 bg-white p-2 text-green-800 transition hover:bg-green-100 disabled:opacity-50"
        title="Verwerfen"
        @click="emit('cancel')"
      >
        <X class="h-4 w-4" aria-hidden="true" />
        <span class="sr-only">Verwerfen</span>
      </button>
    </div>
  </div>
</template>
