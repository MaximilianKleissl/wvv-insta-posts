<script setup lang="ts">
import { computed } from 'vue';
import { fileToBase64 } from '@/composables/useConfigEditor';

const props = withDefaults(
  defineProps<{
    label: string;
    targetPath: string;
    modelValue?: string | null;
    existing?: boolean | null;
    existingPreviewUrl?: string;
    required?: boolean;
  }>(),
  {
    modelValue: null,
    existing: null,
    existingPreviewUrl: undefined,
    required: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
  };
  return map[ext] ?? 'image/png';
}

const previewSrc = computed(() => {
  if (props.modelValue) return `data:${mimeFromPath(props.targetPath)};base64,${props.modelValue}`;
  return props.existingPreviewUrl;
});

const badgeText = computed(() => {
  if (props.modelValue) return 'wird hochgeladen';
  if (props.existing === true) return 'vorhanden';
  if (props.required) return 'Logo fehlt';
  if (props.existing === false) return 'neu';
  return 'Status …';
});

const badgeClass = computed(() => {
  if (props.modelValue) return 'bg-blue-100 text-blue-700';
  if (props.existing === true) return 'bg-green-100 text-green-800';
  if (props.required) return 'bg-red-100 text-red-700';
  if (props.existing === false) return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-500';
});

const missingRequired = computed(
  () => props.required && props.existing === false && !props.modelValue,
);

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  emit('update:modelValue', await fileToBase64(file));
  input.value = '';
}
</script>

<template>
  <div
    class="rounded-lg border bg-white p-3"
    :class="missingRequired ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100"
      >
        <img
          v-if="previewSrc"
          :src="previewSrc"
          :alt="label"
          class="h-full w-full object-contain"
        />
        <span v-else class="text-[10px] text-gray-400">kein Bild</span>
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-gray-800">{{ label }}</p>
        <p class="truncate font-mono text-xs text-gray-500">{{ targetPath }}</p>
        <span
          class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
          :class="badgeClass"
        >
          {{ badgeText }}
        </span>
      </div>

      <div class="flex shrink-0 flex-col gap-1">
        <label
          class="cursor-pointer rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-800"
        >
          Bild wählen
          <input type="file" accept="image/*" class="hidden" @change="onFile" />
        </label>
        <button
          v-if="modelValue"
          class="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
          @click="emit('update:modelValue', null)"
        >
          entfernen
        </button>
      </div>
    </div>
  </div>
</template>
