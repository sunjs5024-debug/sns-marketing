<script setup lang="ts">
import { formatPrice } from "#shared/catalog";
import { STATUS_LABEL, STATUS_STYLE } from "~~/server/utils/orderStatus";
import type { OrderStatus } from "~~/generated/prisma/enums";

definePageMeta({ middleware: ["admin"] });

const { data: orders, refresh } = await useFetch("/api/admin/orders");

const NEXT_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};
const NEXT_LABEL: Record<OrderStatus, string> = {
  PENDING: "결제 대기", PAID: "결제 완료", PROCESSING: "진행 시작", COMPLETED: "완료 처리", CANCELLED: "취소", REFUNDED: "환불",
};

async function updateStatus(id: string, status: OrderStatus) {
  await $fetch(`/api/admin/orders/${id}`, { method: "PATCH", body: { status } });
  await refresh();
}
</script>

<template>
  <div class="rounded-3xl border border-neutral-100 bg-white">
    <div class="border-b border-neutral-100 p-5">
      <h2 class="font-display text-lg text-neutral-900">주문 목록 (최근 100건)</h2>
      <p class="mt-1 text-xs text-neutral-500">총 {{ (orders ?? []).length }}건. 상태를 변경하면 즉시 반영됩니다.</p>
    </div>
    <ul class="divide-y divide-neutral-100">
      <li v-if="(orders ?? []).length === 0" class="px-5 py-12 text-center text-sm text-neutral-500">아직 주문이 없습니다.</li>
      <li v-for="o in orders ?? []" :key="o.id" class="px-5 py-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-xs text-neutral-500">
              <span>{{ new Date(o.createdAt).toLocaleString("ko-KR") }}</span>
              <span>·</span>
              <span class="font-mono">{{ o.orderNumber }}</span>
              <span>·</span>
              <span>{{ o.user.name }} ({{ o.user.email }})</span>
            </div>
            <p class="mt-1 text-sm text-neutral-900">
              {{ o.items[0]?.productName }}
              <span v-if="o.items.length > 1" class="text-neutral-500"> 외 {{ o.items.length - 1 }}건</span>
            </p>
            <ul class="mt-2 space-y-0.5 text-xs text-neutral-500">
              <li v-for="it in o.items" :key="it.id" class="truncate">
                · {{ it.productName }}
                <span v-if="it.optionLabel"> ({{ it.optionLabel }})</span>
                × {{ it.quantity }}
                <span v-if="it.targetUrl" class="ml-2 text-indigo-600">{{ it.targetUrl }}</span>
              </li>
            </ul>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-display text-sm text-neutral-900">{{ formatPrice(o.totalAmount) }}</span>
            <span :class="['rounded-full px-2.5 py-1 text-[11px]', STATUS_STYLE[o.status]]">
              {{ STATUS_LABEL[o.status] }}
            </span>
            <div class="flex gap-1">
              <button
                v-for="s in NEXT_OPTIONS[o.status]"
                :key="s"
                type="button"
                class="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-700 hover:bg-neutral-50"
                @click="updateStatus(o.id, s)"
              >→ {{ NEXT_LABEL[s] }}</button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
