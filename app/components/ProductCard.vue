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
  optionCount?: number;
}>();
</script>

<template>
  <NuxtLink
    :to="`/products/${slug}`"
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-xl sm:rounded-3xl"
  >
    <!-- 그라데이션 글로우 (호버 시) -->
    <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl" />
    </div>

    <!-- 이미지 영역 -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div class="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
        <BrandIcon v-if="iconKey" :kind="iconKey" :size="80" class="sm:[--size:88px]" />
        <span v-else class="text-5xl sm:text-6xl">📦</span>
      </div>

      <!-- 뱃지 -->
      <div v-if="badge" class="absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
        <BadgePill :badge="badge" />
      </div>

      <!-- 옵션 수 (있을 때만) -->
      <div v-if="optionCount && optionCount > 0" class="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-neutral-700 shadow-sm backdrop-blur-sm sm:right-3 sm:top-3">
        {{ optionCount }}가지 옵션
      </div>
    </div>

    <!-- 정보 영역 -->
    <div class="relative flex flex-1 flex-col p-3 sm:p-4">
      <span class="text-[10px] font-medium uppercase tracking-wider text-indigo-600 sm:text-[11px]">{{ categoryName }}</span>
      <h3 class="mt-1 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-neutral-800 group-hover:text-neutral-900 sm:min-h-[2.75rem]">{{ name }}</h3>

      <!-- 별점 + 판매수 -->
      <div class="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
        <span class="inline-flex items-center gap-0.5">
          <span class="text-amber-400">★</span>
          <span class="font-medium text-neutral-700">{{ rating.toFixed(1) }}</span>
        </span>
        <span class="text-neutral-300">·</span>
        <span>판매 {{ salesCount.toLocaleString("ko-KR") }}</span>
      </div>

      <!-- 가격 -->
      <div class="mt-3 flex items-end justify-between border-t border-neutral-100 pt-3">
        <div>
          <span class="text-[10px] text-neutral-400">최저가</span>
          <p class="mt-0.5 font-display text-base text-neutral-900 sm:text-lg">
            {{ formatPrice(basePrice) }}<span class="text-xs font-medium text-neutral-500">~</span>
          </p>
        </div>
        <!-- 호버 시 화살표 -->
        <span class="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-neutral-600 transition-all group-hover:bg-neutral-900 group-hover:text-white">
          →
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
