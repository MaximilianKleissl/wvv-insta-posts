import { ref } from 'vue';

/** Tracks off-screen slide DOM nodes so exports can rasterize them by id. */
export function useSlideRegistry() {
  const slideNodes = ref<Map<string, HTMLElement>>(new Map());

  const registerSlideNode = (id: string, el: HTMLElement | null) => {
    if (el) slideNodes.value.set(id, el);
    else slideNodes.value.delete(id);
  };

  const registerSlideRef = (slideId: string) => (el: HTMLElement | null) =>
    registerSlideNode(slideId, el);

  const getSlideElement = (id: string) => slideNodes.value.get(id) ?? null;

  return { registerSlideRef, getSlideElement };
}
