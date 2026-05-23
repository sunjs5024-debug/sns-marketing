<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "결제 진행", robots: "noindex, nofollow" });

// 결제수단 영문 코드 → 한글 표시
const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "계좌이체",
  CARD: "신용카드",
  KAKAOPAY: "카카오페이",
  NAVERPAY: "네이버페이",
  TOSS: "토스",
};

const route = useRoute();
const orderNumber = computed(() => String(route.params.orderNumber));

const { data: order } = await useFetch(`/api/orders/${orderNumber.value}`);
if (!order.value) throw createError({ statusCode: 404 });

if (order.value.status !== "PENDING") {
  await navigateTo(`/orders/${orderNumber.value}`);
}

const pending = ref(false);
async function pay() {
  pending.value = true;
  try {
    await $fetch(`/api/orders/${orderNumber.value}/pay`, { method: "POST" });
    refreshNuxtData("header");
    await navigateTo(`/orders/${orderNumber.value}?paid=1`);
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div v-if="order" class="mx-auto max-w-lg px-4 py-16 text-center">
    <div class="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 anim-pulse">
      <div class="grid h-full w-full place-items-center rounded-2xl bg-white text-3xl">💳</div>
    </div>
    <h1 class="mt-6 font-display text-2xl text-neutral-900">결제를 진행할 차례입니다</h1>
    <p class="mt-2 text-sm text-neutral-500">주문번호 {{ order.orderNumber }}</p>

    <div class="mt-8 rounded-3xl border border-neutral-100 bg-white p-6 text-left">
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-neutral-500">상품 수</dt>
          <dd>{{ order.items.length }}건</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-neutral-500">결제 수단</dt>
          <dd>{{ order.paymentMethod ? (PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod) : "—" }}</dd>
        </div>
        <div class="flex justify-between border-t border-neutral-100 pt-2 text-neutral-600">
          <dt>상품 금액</dt>
          <dd>{{ formatPrice(order.totalAmount) }}</dd>
        </div>
        <div v-if="order.pointsUsed > 0" class="flex justify-between text-rose-600">
          <dt>포인트 사용</dt>
          <dd>−{{ order.pointsUsed.toLocaleString("ko-KR") }}P</dd>
        </div>
        <div class="flex justify-between border-t border-neutral-100 pt-2 text-base">
          <dt class="text-neutral-900">결제 금액</dt>
          <dd class="font-display text-neutral-900">{{ formatPrice(order.finalAmount) }}</dd>
        </div>
      </dl>
    </div>

    <p class="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
      ⚠ 현재 환경엔 PG가 연동되어 있지 않습니다. 아래 버튼을 누르면 <b>mock 결제로 즉시 완료</b>됩니다.
    </p>

    <button type="button" :disabled="pending" class="mt-6 w-full rounded-full bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-700 disabled:opacity-60" @click="pay">
      {{ pending ? "결제 중…" : `${formatPrice(order.finalAmount)} 결제 완료 (mock)` }}
    </button>
  </div>
</template>
