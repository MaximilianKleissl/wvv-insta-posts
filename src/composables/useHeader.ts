import { computed } from "vue";

export function useHeader() {
  const clubName = computed(() => "Werderaner VV");
  const subtitle = computed(() => "Social Media Generator");

  return {
    clubName,
    subtitle,
  };
}
