<template>
  <div
    class='rounded-full flex items-center justify-center shrink-0 shadow-inner w-12 h-12',
    :class="[
      borderColor,
      bgColor,
    ]"
  >
    <span class="block leading-none text-xl font-black tracking-tight" :class="[textColor]"> VS </span>
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
