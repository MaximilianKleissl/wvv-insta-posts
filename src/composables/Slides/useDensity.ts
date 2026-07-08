import { computed, ComputedRef } from "vue";

export type Density = "normal" | "compact" | "tight";

export type SlideStyles = {
  cardPadding: string;
  cardRadius: string;
  logoSize: string;
  textSize: string;
  clockSize: string;
};

export function useSlideDensity(itemCount: ComputedRef<number> | number) {
  const count = computed(() => typeof itemCount === "number" ? itemCount : itemCount.value);

  const density = computed<Density>(() => {
    if (count.value >= 5) return "tight";
    if (count.value >= 3) return "compact";
    return "normal";
  });

  const styles = computed(() => ({
    cardPadding: density.value === "normal" ? "p-8" : density.value === "compact" ? "p-5" : "p-4",
    cardRadius: density.value === "normal" ? "rounded-3xl" : "rounded-2xl",
    logoSize: density.value === "normal" ? "w-32 h-32" : density.value === "compact" ? "w-24 h-24" : "w-18 h-18",
    textSize: density.value === "normal" ? "text-3xl" : density.value === "compact" ? "text-2xl" : "text-xl",
    clockSize: density.value === "normal" ? "text-4xl" : density.value === "compact" ? "text-3xl" : "text-2xl",
  }));

  return { density, styles };
}