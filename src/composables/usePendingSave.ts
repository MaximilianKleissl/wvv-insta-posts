import { ref } from 'vue';
import { needsShareFlow, saveFile, type SaveOutcome } from '@/lib/save-file';

export interface PendingSave {
  blob: Blob;
  fileName: string;
}

/**
 * Bridges the gap between "the export finished" and "we are allowed to save the file".
 *
 * On iOS the share sheet needs a live user gesture, but rendering a ZIP takes long enough that the
 * original tap is spent. So on Apple mobile we build the file first and then wait for a second,
 * deliberate tap before handing it to the share sheet. Desktop/Android save immediately and never
 * show the confirm step.
 */
export function usePendingSave(onDone: (outcome: SaveOutcome, fileName: string) => void) {
  const pendingSave = ref<PendingSave | null>(null);
  const saving = ref(false);

  const save = async (blob: Blob, fileName: string): Promise<void> => {
    if (needsShareFlow(fileName)) {
      pendingSave.value = { blob, fileName };
      return;
    }
    onDone(await saveFile(blob, fileName), fileName);
  };

  const confirmSave = async (): Promise<void> => {
    const target = pendingSave.value;
    if (!target || saving.value) return;
    saving.value = true;
    try {
      const outcome = await saveFile(target.blob, target.fileName);
      pendingSave.value = null;
      onDone(outcome, target.fileName);
    } finally {
      saving.value = false;
    }
  };

  const cancelSave = (): void => {
    pendingSave.value = null;
  };

  return { pendingSave, saving, save, confirmSave, cancelSave };
}
