<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";
import { formatPrice } from "#shared/catalog";
import type { Badge } from "~~/generated/prisma/enums";

defineProps<{
  slug: string;
  name: string;
  basePrice: number;
  badge?: Badge | null;
  rating: number;
  salesCount: number;
  categoryName: string;
  iconKey: PlatformSlug | null;
}>();
</script>

<template>
  <NuxtLink
    :to="`/products/${slug}`"
    class="group flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white transition hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div class="absolute inset-0 grid place-items-center transition group-hover:scale-110">
        <BrandIcon v-if="iconKey" :kind="iconKey" :size="88" />
        <span v-else class="text-6xl">📦</span>
      </div>
      <div v-if="badge" class="absolute left-3 top-3">
        <BadgePill :badge="badge" />
      </div>
    </div>
    <div class="flex flex-1 flex-col p-4">
      <span class="text-xs font-medium text-neutral-500">{{ categoryName }}</span>
      <h3 class="mt-1 line-clamp-2 text-sm text-neutral-800 leading-snug">{{ name }}</h3>
      <div class="mt-auto pt-3 flex items-end justify-between">
        <div>
          <span class="text-[11px] text-neutral-400">최저가</span>
          <p class="font-display text-lg text-neutral-900">
            {{ formatPrice(basePrice) }}<span class="text-xs font-sans font-medium text-neutral-500">~</span>
          </p>
        </div>
        <div class="text-right text-[11px] text-neutral-500">
          <div class="flex items-center justify-end gap-0.5">
            <span class="text-yellow-400">★</span>
            <span>{{ rating.toFixed(1) }}</span>
          </div>
          <div>판매 {{ salesCount.toLocaleString("ko-KR") }}</div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
