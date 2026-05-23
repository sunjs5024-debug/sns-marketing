<script setup lang="ts">
import { formatPrice } from "#shared/catalog";
import { STATUS_LABEL, STATUS_STYLE } from "~~/server/utils/orderStatus";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "내 주문", robots: "noindex, nofollow" });

const { data: orders } = await useFetch("/api/orders");
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="font-display text-3xl text-neutral-900">내 주문</h1>
    <p class="mt-1 text-sm text-neutral-500">총 {{ (orders ?? []).length }}건</p>

    <div v-if="(orders ?? []).length === 0" class="mt-12 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">
      <p class="text-sm text-neutral-500">아직 주문 내역이 없어요.</p>
      <NuxtLink to="/" class="mt-4 inline-flex rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700">상품 보러가기</NuxtLink>
    </div>

    <ul v-else class="mt-6 space-y-3">
      <li v-for="o in orders ?? []" :key="o.id" class="rounded-3xl border border-neutral-100 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-xs text-neutral-500">
              <time>{{ new Date(o.createdAt).toLocaleString("ko-KR") }}</time>
              <span>·</span>
              <span class="font-mono">{{ o.orderNumber }}</span>
            </div>
            <p class="mt-1 text-sm text-neutral-900">
              {{ o.items[0]?.productName }}
              <span v-if="o.items.length > 1" class="text-neutral-500"> 외 {{ o.items.length - 1 }}건</span>
            </p>
          </div>
          <span :class="['inline-flex shrink-0 rounded-full px-3 py-1 text-xs', STATUS_STYLE[o.status]]">
            {{ STATUS_LABEL[o.status] }}
          </span>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="font-display text-base text-neutral-900">{{ formatPrice(o.totalAmount) }}</span>
          <NuxtLink :to="`/orders/${o.orderNumber}`" class="text-xs text-indigo-600 hover:underline">상세 보기 →</NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>
