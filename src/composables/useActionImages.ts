import { ref } from 'vue';

const ACTION_IMAGES_CONFIG_URL =
  'https://maximiliankleissl.github.io/wvv-posts-config/Action_Images/action_images.json';
const DEFAULT_ACTION_IMAGES = ['baumbluetenumzug.jpg'] as const;

const actionImages = ref<Record<string, readonly string[]>>({
  default: DEFAULT_ACTION_IMAGES,
});

export function useActionImages() {
  const loadActionImages = async () => {
    try {
      const response = await fetch(ACTION_IMAGES_CONFIG_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch action images config: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        default?: string[];
        teams?: Record<string, string[]>;
      };

      actionImages.value = {
        default:
          Array.isArray(data.default) && data.default.length > 0
            ? data.default
            : [...DEFAULT_ACTION_IMAGES],
        ...(data.teams ?? {}),
      };
    } catch (error) {
      console.warn('Failed to load action image config, using fallback image.', error);
      actionImages.value = {
        default: [...DEFAULT_ACTION_IMAGES],
      };
    }
  };

  const getActionImagesForTeam = (teamName: string): readonly string[] => {
    const teamImages = actionImages.value[teamName];
    if (Array.isArray(teamImages) && teamImages.length > 0) {
      return teamImages;
    }

    return actionImages.value.default ?? [...DEFAULT_ACTION_IMAGES];
  };

  return {
    actionImages,
    loadActionImages,
    getActionImagesForTeam,
  };
}
