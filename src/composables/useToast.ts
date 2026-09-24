import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

function push(message: string, type: Toast['type'] = 'success') {
  const id = ++nextId;
  toasts.value.push({ id, message, type });
  window.setTimeout(() => dismiss(id), 4000);
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToast() {
  return { toasts, toast: push };
}
