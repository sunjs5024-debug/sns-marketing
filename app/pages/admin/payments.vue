<script setup lang="ts">
import { formatPrice } from "#shared/catalog";
import { STATUS_LABEL, STATUS_STYLE } from "~~/server/utils/orderStatus";
import type { OrderStatus } from "~~/generated/prisma/enums";

definePageMeta({ middleware: ["admin"] });

const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "계좌이체",
  CARD: "신용카드",
  KAKAOPAY: "카카오페이",
  NAVERPAY: "네이버페이",
  TOSS: "토스",
};

type Payment = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string | null;
  paymentKey: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  user: { name: string; email: string };
  _count: { items: number };
};

const { data: payments } = await useFetch<Payment[]>("/api/admin/payments");

const q = ref("");
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return payments.value ?? [];
  return (payments.value ?? []).filter(
    (p) =>
      p.orderNumber.toLowerCase().includes(s) ||
      p.buyerName.toLowerCase().includes(s) ||
      p.buyerEmail.toLowerCase().includes(s) ||
      p.user.email.toLowerCase().includes(s),
  );
});

const totalAmount = computed(() =>
  filtered.value
    .filter((p) => p.status !== "REFUNDED")
    .reduce((sum, p) => sum + p.totalAmount, 0),
);
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">결제 건수 (필터 적용 후)</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ filtered.length.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">합계 금액 (환불 제외)</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ formatPrice(totalAmount) }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">평균 결제 금액</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">
          {{ filtered.length ? formatPrice(Math.round(totalAmount / Math.max(filtered.filter(p => p.status !== "REFUNDED").length, 1))) : "—" }}
        </p>
      </div>
    </div>

    <div class="rounded-3xl border border-neutral-100 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-5">
        <div>
          <h2 class="font-display text-lg text-neutral-900">결제 내역</h2>
          <p class="mt-1 text-xs text-neutral-500">결제 완료 이상 주문 (최근 200건)</p>
        </div>
        <input
          v-model="q"
          type="search"
          placeholder="주문번호·구매자·이메일 검색"
          class="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead class="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th class="px-4 py-3 text-left">결제일</th>
              <th class="px-4 py-3 text-left">주문번호</th>
              <th class="px-4 py-3 text-left">구매자</th>
              <th class="px-4 py-3 text-left">상품</th>
              <th class="px-4 py-3 text-left">결제수단</th>
              <th class="px-4 py-3 text-right">금액</th>
              <th class="px-4 py-3 text-left">상태</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="p in filtered" :key="p.id" class="hover:bg-neutral-50">
              <td class="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                {{ p.paidAt ? new Date(p.paidAt).toLocaleString("ko-KR") : "—" }}
              </td>
              <td class="px-4 py-3 font-mono text-xs text-neutral-700">{{ p.orderNumber }}</td>
              <td class="px-4 py-3">
                <div class="text-neutral-900">{{ p.buyerName }}</div>
                <div class="text-xs text-neutral-500">{{ p.buyerEmail }}</div>
              </td>
              <td class="px-4 py-3 text-neutral-700">{{ p._count.items }}건</td>
              <td class="px-4 py-3 text-neutral-700">
                {{ p.paymentMethod ? (PAYMENT_LABEL[p.paymentMethod] ?? p.paymentMethod) : "—" }}
              </td>
              <td class="px-4 py-3 text-right font-display text-neutral-900">
                {{ formatPrice(p.totalAmount) }}
              </td>
              <td class="px-4 py-3">
                <span :class="['rounded-full px-2.5 py-1 text-[11px]', STATUS_STYLE[p.status]]">
                  {{ STATUS_LABEL[p.status] }}
                </span>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-neutral-500">
                결제 내역이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
