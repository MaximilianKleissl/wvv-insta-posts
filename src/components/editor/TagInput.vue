<script lang="ts">
let instanceCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    placeholder?: string;
    suggestions?: string[];
  }>(),
  { placeholder: 'Enter zum Hinzufügen', suggestions: () => [] },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const draft = ref('');

const datalistId = `taginput-${++instanceCounter}-datalist`;

/** Case-insensitive lookup: returns the canonical suggestion for entered text. */
function canonicalize(raw: string): string | null {
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;
  const match = props.suggestions.find((s) => s.toLowerCase() === lower);
  if (match && !props.modelValue.includes(match)) return match;
  return null;
}

function add() {
  const value = draft.value.trim();
  if (!value) return;
  const canonical = canonicalize(value);
  if (canonical) {
    emit('update:modelValue', [...props.modelValue, canonical]);
    draft.value = '';
  }
}

function addSuggestion(suggestion: string) {
  if (props.modelValue.includes(suggestion)) return;
  emit('update:modelValue', [...props.modelValue, suggestion]);
}

function remove(index: number) {
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit('update:modelValue', next);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    add();
  } else if (event.key === 'Backspace' && draft.value === '' && props.modelValue.length > 0) {
    remove(props.modelValue.length - 1);
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData('text') ?? '';
  const parts = text
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const next = [...props.modelValue];
  for (const part of parts) {
    const canonical = canonicalize(part);
    if (canonical && !next.includes(canonical)) next.push(canonical);
  }
  if (next.length !== props.modelValue.length) emit('update:modelValue', next);
}

const remainingSuggestions = computed(() =>
  props.suggestions.filter((s) => !props.modelValue.includes(s)),
);
</script>

<template>
  <div class="space-y-1.5">
    <div
      class="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white p-1.5 focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/15"
    >
      <span
        v-for="(tag, i) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-900"
      >
        {{ tag }}
        <button
          class="text-green-700 transition hover:text-red-600"
          :aria-label="`${tag} entfernen`"
          @click="remove(i)"
        >
          ✕
        </button>
      </span>
      <input
        v-model="draft"
        class="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-sm text-gray-800 outline-none"
        :placeholder="modelValue.length === 0 ? placeholder : '…'"
        :list="suggestions.length > 0 ? datalistId : undefined"
        @keydown="onKeydown"
        @paste="onPaste"
      />
    </div>

    <div v-if="remainingSuggestions.length > 0" class="flex flex-wrap gap-1">
      <button
        v-for="suggestion in remainingSuggestions"
        :key="suggestion"
        class="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800 transition hover:border-green-600 hover:bg-green-100"
        @click="addSuggestion(suggestion)"
      >
        + {{ suggestion }}
      </button>
    </div>

    <datalist v-if="suggestions.length > 0" :id="datalistId">
      <option v-for="suggestion in suggestions" :key="suggestion" :value="suggestion" />
    </datalist>
  </div>
</template>
