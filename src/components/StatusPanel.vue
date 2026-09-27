<script setup lang="ts">
import { AlertCircle, Inbox, Loader2 } from 'lucide-vue-next';

/**
 * Single presentation for the three "nothing to show yet" states of the app:
 * loading, failed, and empty. Keeping them here means every page explains the
 * situation the same way and offers the same way out.
 */
const props = withDefaults(
  defineProps<{
    variant: 'loading' | 'error' | 'empty';
    /** Short headline, e.g. "Daten konnten nicht geladen werden". */
    title?: string;
    /** Detail line, e.g. the underlying error or what to do next. */
    message?: string;
    /** Label of the recovery button, e.g. "Erneut laden". */
    actionLabel?: string;
  }>(),
  { title: '', message: '', actionLabel: '' },
);

const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center"
    :class="{
      'border-gray-200 bg-white': props.variant === 'loading' || props.variant === 'empty',
      'border-red-200 bg-red-50': props.variant === 'error',
    }"
    :role="props.variant === 'error' ? 'alert' : 'status'"
  >
    <Loader2
      v-if="props.variant === 'loading'"
      class="h-7 w-7 animate-spin text-green-800"
      aria-hidden="true"
    />
    <AlertCircle
      v-else-if="props.variant === 'error'"
      class="h-7 w-7 text-red-600"
      aria-hidden="true"
    />
    <Inbox v-else class="h-7 w-7 text-gray-400" aria-hidden="true" />

    <div>
      <p
        class="text-sm font-medium"
        :class="props.variant === 'error' ? 'text-red-800' : 'text-gray-700'"
      >
        {{ props.title }}
      </p>
      <p
        v-if="props.message"
        class="mt-1 text-sm"
        :class="props.variant === 'error' ? 'text-red-600' : 'text-gray-500'"
      >
        {{ props.message }}
      </p>
    </div>

    <button
      v-if="props.actionLabel"
      type="button"
      class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      @click="emit('action')"
    >
      {{ props.actionLabel }}
    </button>
  </div>
</template>
