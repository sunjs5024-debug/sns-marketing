<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["admin"] });

const { data: stats } = await useFetch("/api/admin/stats");
</script>

<template>
  <div v-if="stats">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">전체 주문</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.totalOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-amber-50 p-5">
        <p class="text-xs text-neutral-500">결제 대기</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.pendingOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-blue-50 p-5">
        <p class="text-xs text-neutral-500">결제 완료 (진행 포함)</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.paidOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-emerald-50 p-5">
        <p class="text-xs text-neutral-500">완료</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.completedOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">누적 매출</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ formatPrice(stats.revenue) }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">회원 수</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.userCount.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">상품 수</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.productCount.toLocaleString("ko-KR") }}</p>
      </div>
    </div>

    <div class="mt-8 rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">바로가기</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink to="/admin/orders" class="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">주문 처리하기</NuxtLink>
        <NuxtLink to="/admin/products" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">상품 보기</NuxtLink>
      </div>
    </div>
  </div>
</template>
