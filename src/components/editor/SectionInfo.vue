<script setup lang="ts">
import { Info } from 'lucide-vue-next';

defineProps<{ title: string }>();
</script>

<template>
  <div class="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
    <Info :size="16" class="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
    <div class="min-w-0">
      <p class="text-xs font-semibold text-blue-800">{{ title }}</p>
      <p class="mt-1 text-xs leading-relaxed text-blue-700"><slot /></p>
    </div>
  </div>
</template>
