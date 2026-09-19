<template>
  <div class="flex shrink-0 flex-col items-center gap-2">
    <div class="h-6 w-px" :style="{ backgroundColor: hairlineColor }" />
    <div
      class="flex h-11 shrink-0 items-center justify-center rounded-2xl px-2 shadow-md"
      :class="[bgColor]"
    >
      <span class="block text-3xl font-black leading-none tracking-[0.12em] text-white">{{ badgeText }}</span>
    </div>
    <div class="h-6 w-px" :style="{ backgroundColor: hairlineColor }" />
  </div>
</template>

<script setup lang="ts">
interface VsBadgeProps {
  bgColor?: string;
  hairlineColor?: string;
  badgeText?: string;
}

withDefaults(defineProps<VsBadgeProps>(), {
  bgColor: 'bg-slate-800/10',
  hairlineColor: 'rgba(100, 116, 139, 0.25)',
  badgeText: 'VS'
});
</script>
