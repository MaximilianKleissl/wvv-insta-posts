import { ref } from 'vue';
import { describeSaveResult, needsShareFlow, saveFile } from '@/lib/save-file';
import { useToast } from '@/composables/useToast';

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
 *
 * A failed save deliberately keeps the file in `pendingSave`: a rejected share sheet must not cost
 * the user a full re-export, so the confirm button stays available for another attempt.
 */
export function usePendingSave() {
  const { toast } = useToast();
  const pendingSave = ref<PendingSave | null>(null);
  const saving = ref(false);
  /**
   * Kept alongside `pendingSave` so a failure stays visible next to the retry button. A toast is
   * too easy to miss – and it expires – while the file is still sitting there unsaved.
   */
  const saveError = ref<string | null>(null);

  const report = async (target: PendingSave) => {
    const feedback = describeSaveResult(
      await saveFile(target.blob, target.fileName),
      target.fileName,
    );
    toast(feedback.message, feedback.type, feedback.detail);
  };

  const save = async (blob: Blob, fileName: string): Promise<void> => {
    const target: PendingSave = { blob, fileName };
    saveError.value = null;
    if (needsShareFlow(fileName)) {
      pendingSave.value = target;
      return;
    }
    await report(target);
  };

  const confirmSave = async (): Promise<void> => {
    const target = pendingSave.value;
    if (!target || saving.value) return;
    saving.value = true;
    saveError.value = null;
    try {
      const result = await saveFile(target.blob, target.fileName);
      const feedback = describeSaveResult(result, target.fileName);
      toast(feedback.message, feedback.type, feedback.detail);

      // Only let go of the file once it is verifiably stored. A failed share sheet and an anchor
      // click iOS may have ignored both leave the user with a retry button instead of forcing a
      // full re-export.
      const stored =
        result.status === 'shared' ||
        result.status === 'cancelled' ||
        (result.status === 'downloaded' && result.reliable);

      if (stored) {
        pendingSave.value = null;
      } else {
        saveError.value = `${feedback.message} ${feedback.detail ?? ''}`.trim();
      }
    } finally {
      saving.value = false;
    }
  };

  const cancelSave = (): void => {
    pendingSave.value = null;
    saveError.value = null;
  };

  return { pendingSave, saveError, saving, save, confirmSave, cancelSave };
}
