<script setup lang="ts">
import { AlertCircle, Share2, X } from 'lucide-vue-next';
import type { PendingSave } from '@/composables/usePendingSave';

/**
 * Confirmation step for the iOS save flow. Once a file has been rendered, the share sheet still
 * needs a live tap, so we park the finished blob here until the user explicitly saves it. A failed
 * attempt keeps the button usable as a retry and shows the reason inline.
 */
const props = withDefaults(
  defineProps<{
    pending: PendingSave;
    saving?: boolean;
    error?: string | null;
    hint?: string;
  }>(),
  { saving: false, error: null, hint: '' },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
    :class="props.error ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'"
    role="status"
  >
    <div class="min-w-0">
      <p class="text-sm font-medium" :class="props.error ? 'text-red-900' : 'text-green-900'">
        {{ props.pending.fileName }}
        {{ props.error ? 'konnte nicht gespeichert werden' : 'ist fertig' }}
      </p>
      <p v-if="props.error" class="mt-1 font-mono text-xs leading-relaxed text-red-800">
        {{ props.error }}
      </p>
      <p v-else class="mt-1 text-sm" :class="props.error ? 'text-red-800' : 'text-green-800'">
        {{
          props.hint ||
          'Zum Speichern antippen – iOS öffnet dann das Teilen-Menü, über das du die Datei in „Dateien“ ablegen kannst.'
        }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <button
        type="button"
        :disabled="props.saving"
        class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed"
        :class="
          props.error
            ? 'bg-red-700 hover:bg-red-800 disabled:bg-red-400'
            : 'bg-green-700 hover:bg-green-800 disabled:bg-green-400'
        "
        @click="emit('confirm')"
      >
        <AlertCircle v-if="props.error" class="h-4 w-4" aria-hidden="true" />
        <Share2 v-else class="h-4 w-4" aria-hidden="true" />
        {{
          props.saving ? 'Wird gespeichert…' : props.error ? 'Erneut versuchen' : 'Jetzt speichern'
        }}
      </button>
      <button
        type="button"
        :disabled="props.saving"
        class="rounded-lg border bg-white p-2 transition disabled:opacity-50"
        :class="
          props.error
            ? 'border-red-300 text-red-800 hover:bg-red-100'
            : 'border-green-300 text-green-800 hover:bg-green-100'
        "
        title="Verwerfen"
        @click="emit('cancel')"
      >
        <X class="h-4 w-4" aria-hidden="true" />
        <span class="sr-only">Verwerfen</span>
      </button>
    </div>
  </div>
</template>
