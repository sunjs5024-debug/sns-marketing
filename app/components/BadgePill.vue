<script setup lang="ts">
import type { Badge } from "~~/generated/prisma/enums";

const props = defineProps<{ badge: Badge }>();

const styles: Record<Badge, string> = {
  HOT: "bg-red-500 text-white",
  BEST: "bg-orange-500 text-white",
  SALE: "bg-blue-500 text-white",
  NEW: "bg-emerald-500 text-white",
};
</script>

<template>
  <span
    :class="['inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide', styles[badge]]"
  >
    {{ badge }}
  </span>
</template>
