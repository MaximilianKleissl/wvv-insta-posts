import { ref, computed } from "vue";
import type { SeasonData } from "@/lib/types";
import type { ValidationResult } from "@/lib/schema";
import { validateSeasonJson } from "@/lib/schema";
import { SAMPLE_SEASON_JSON } from "@/lib/sample-data";

export function useSeasonData() {
  const rawJson = ref(SAMPLE_SEASON_JSON);
  const validationResult = ref<ValidationResult | null>(
    validateSeasonJson(SAMPLE_SEASON_JSON),
  );

  const parseJson = (jsonString: string) => {
    rawJson.value = jsonString;
    if (!jsonString.trim()) {
      validationResult.value = null;
      return;
    }
    const result = validateSeasonJson(jsonString);
    validationResult.value = result;
  };

  const setSeasonData = (value: SeasonData) => {
    validationResult.value = { success: true, data: value };
    rawJson.value = JSON.stringify(value, null, 2);
  };

  const seasonData = computed(() =>
    validationResult.value?.success ? validationResult.value.data : undefined,
  );

  return {
    rawJson,
    setRawJson: (value: string) => { rawJson.value = value; },
    parseJson,
    setSeasonData,
    validationResult,
    seasonData,
  };
}
