import { ref } from 'vue';

export type ToastType = 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  /** Optional second line: the underlying reason, failing paths, environment report. */
  detail?: string;
}

/** Errors stay long enough to be read and acted on; confirmations can get out of the way. */
const DURATION_MS: Record<ToastType, number> = {
  success: 4000,
  warning: 10_000,
  error: 20_000,
};

/** A runaway export must not paper over the screen with notices. */
const MAX_VISIBLE = 4;

const toasts = ref<Toast[]>([]);
let nextId = 0;

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function push(message: string, type: ToastType = 'success', detail?: string) {
  const id = ++nextId;
  toasts.value.push({ id, message, type, detail });
  while (toasts.value.length > MAX_VISIBLE) dismiss(toasts.value[0].id);
  window.setTimeout(() => dismiss(id), DURATION_MS[type]);
}

export function useToast() {
  return { toasts, toast: push, dismiss };
}
