<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();
</script>

<template>
  <div
    class="fixed inset-x-3 bottom-3 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="flex max-w-md items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg"
      :class="{
        'bg-green-700': toast.type === 'success',
        'bg-amber-600': toast.type === 'warning',
        'bg-red-600': toast.type === 'error',
      }"
      :role="toast.type === 'error' ? 'alert' : 'status'"
    >
      <div class="min-w-0 flex-1">
        <p>{{ toast.message }}</p>
        <p
          v-if="toast.detail"
          class="mt-1 font-mono text-xs leading-relaxed font-normal break-words opacity-90"
        >
          {{ toast.detail }}
        </p>
      </div>
      <button
        type="button"
        class="-mr-1 shrink-0 rounded p-1 opacity-80 transition hover:bg-black/20 hover:opacity-100"
        title="Meldung schließen"
        @click="dismiss(toast.id)"
      >
        <X class="h-4 w-4" aria-hidden="true" />
        <span class="sr-only">Meldung schließen</span>
      </button>
    </div>
  </div>
</template>
