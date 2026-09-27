import { computed, type Ref } from 'vue';

const FALLBACK_CLUB_NAME = 'Werderaner VV';

/**
 * Header text. Club and season are taken from the loaded configuration so the
 * title can never drift away from the data the slides are built from; the
 * fallback only shows while the data is still loading or failed to load.
 */
export function useHeader(
  club?: Ref<string | null | undefined>,
  season?: Ref<string | null | undefined>,
) {
  const clubName = computed(() => club?.value?.trim() || FALLBACK_CLUB_NAME);
  const subtitle = computed(() => {
    const label = season?.value?.trim();
    return label ? `Social Media Generator · Saison ${label}` : 'Social Media Generator';
  });

  return {
    clubName,
    subtitle,
  };
}
