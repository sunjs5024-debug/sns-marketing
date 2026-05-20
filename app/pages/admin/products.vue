<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["admin"] });

const { data: products } = await useFetch("/api/admin/products");
</script>

<template>
  <div class="rounded-3xl border border-neutral-100 bg-white">
    <div class="border-b border-neutral-100 p-5">
      <h2 class="font-display text-lg text-neutral-900">상품 목록</h2>
      <p class="mt-1 text-xs text-neutral-500">
        총 {{ (products ?? []).length }}건. 등록·수정은 현재 prisma/seed.ts 에서 관리합니다.
      </p>
    </div>
    <ul class="divide-y divide-neutral-100">
      <li v-for="p in products ?? []" :key="p.id" class="flex items-start justify-between px-5 py-4 text-sm">
        <div class="min-w-0">
          <div class="flex items-center gap-2 text-xs text-neutral-500">
            <span>{{ p.category.name }}</span>
            <BadgePill v-if="p.badge" :badge="p.badge" />
            <span v-if="!p.isActive" class="text-rose-500">비활성</span>
          </div>
          <p class="mt-1 text-neutral-900">{{ p.name }}</p>
          <p class="mt-0.5 text-xs text-neutral-500">
            옵션 {{ p.options.length }}개 · ★ {{ p.rating.toFixed(1) }} · 판매 {{ p.salesCount.toLocaleString("ko-KR") }}
          </p>
        </div>
        <span class="font-display text-base text-neutral-900">{{ formatPrice(p.basePrice) }}~</span>
      </li>
    </ul>
  </div>
</template>
