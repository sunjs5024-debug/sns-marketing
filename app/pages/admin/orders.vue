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

// 수동 발주(첫 발주/재발주) — 입금문자 자동매칭이 안 됐거나 테스트 발주용.
//   외부 provider(urpanel/kakao)로 즉시 발주 시도. 결제상태와 무관하게 관리자 권한으로 실행.
const dispatching = ref<string | null>(null);
async function dispatchNow(orderNumber: string) {
  if (!confirm(`${orderNumber} 주문을 지금 발주하시겠어요?\n(외부 provider로 실제 발주가 나갑니다)`)) return;
  dispatching.value = orderNumber;
  try {
    const r = await $fetch<{ dispatched?: number; failed?: number; skipped?: number; errors?: string[] }>(
      `/api/admin/orders/${orderNumber}/dispatch`,
      { method: "POST", body: { resetAttempts: true } },
    );
    const msg = [
      `발주 완료: ${r.dispatched ?? 0}건`,
      r.failed ? `실패: ${r.failed}건` : "",
      r.skipped ? `스킵: ${r.skipped}건` : "",
      r.errors?.length ? `\n오류: ${r.errors.join(", ")}` : "",
    ].filter(Boolean).join(" · ");
    alert(msg || "발주 처리됨");
    await refresh();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    alert(`발주 실패: ${err?.data?.statusMessage ?? err?.statusMessage ?? "알 수 없는 오류"}`);
  } finally {
    dispatching.value = null;
  }
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
                v-if="o.status !== 'CANCELLED' && o.status !== 'REFUNDED'"
                type="button"
                :disabled="dispatching === o.orderNumber"
                class="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                @click="dispatchNow(o.orderNumber)"
              >{{ dispatching === o.orderNumber ? '발주 중…' : '⚡ 발주' }}</button>
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
