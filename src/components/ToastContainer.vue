<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg"
      :class="toast.type === 'success' ? 'bg-green-700' : 'bg-red-600'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
