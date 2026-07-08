import { ref, onMounted } from "vue";
import type { LogoLibrary } from "@/lib/types";
import {
  loadLogoLibrary,
  addLogoToLibrary,
  removeLogoFromLibrary,
} from "@/lib/logo-matcher";

export function useLogoLibrary() {
  const library = ref<LogoLibrary>({});

  onMounted(() => {
    library.value = loadLogoLibrary();
  });

  const addLogo = (teamName: string, dataUrl: string) => {
    library.value = addLogoToLibrary(library.value, teamName, dataUrl);
  };

  const removeLogo = (teamName: string) => {
    library.value = removeLogoFromLibrary(library.value, teamName);
  };

  return {
    library,
    addLogo,
    removeLogo,
  };
}
