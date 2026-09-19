<template>
  <div
    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner"
    :class="[borderColor, bgColor]"
  >
    <span class="block text-xl font-black leading-none tracking-tight" :class="[textColor]">
      VS
    </span>
  </div>
</template>

<script setup lang="ts">
interface VsBadgeProps {
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
}

withDefaults(defineProps<VsBadgeProps>(), {
  borderColor: 'border-slate-800/20',
  bgColor: 'bg-slate-800/10',
  textColor: 'text-slate-800',
});
</script>
