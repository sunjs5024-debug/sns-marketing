<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "입금 안내", robots: "noindex, nofollow" });

const route = useRoute();
const orderNumber = computed(() => String(route.params.orderNumber));

const { data: order, refresh } = await useFetch(`/api/orders/${orderNumber.value}`);
if (!order.value) throw createError({ statusCode: 404 });

// 이미 결제된 주문은 상세로 이동
if (order.value.status !== "PENDING") {
  await navigateTo(`/orders/${orderNumber.value}`);
}

// 회사 계좌 정보 (charge/request 와 동일)
const BANK_INFO = {
  bank: "KB국민은행",
  accountNumber: "892501-00-080455",
  accountHolder: "주식회사 영천기획",
};

const copiedKey = ref<string | null>(null);
async function copyText(key: string, text: string) {
  if (import.meta.client && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    copiedKey.value = key;
    setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = null;
    }, 1500);
  }
}

function timeLeft(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "만료";
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hrs > 0) return `${hrs}시간 ${mins}분 남음`;
  return `${mins}분 남음`;
}

// 자동 새로고침 — 입금 매칭 즉시 반영
let pollTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  pollTimer = setInterval(async () => {
    await refresh();
    if (order.value && order.value.status !== "PENDING") {
      if (pollTimer) clearInterval(pollTimer);
      await navigateTo(`/orders/${orderNumber.value}?paid=1`);
    }
  }, 5000);
});
onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div v-if="order" class="mx-auto max-w-2xl px-4 pt-10 pb-20 sm:px-6">
    <header>
      <h1 class="font-display text-2xl text-neutral-900">입금 안내</h1>
      <p class="mt-1.5 text-sm text-neutral-500">
        주문번호 <span class="font-mono">{{ order.orderNumber }}</span>
      </p>
    </header>

    <!-- 입금 정보 카드 -->
    <section class="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-xs text-white">⏳</span>
          <h2 class="text-base text-neutral-900">입금 대기 중</h2>
        </div>
        <span class="text-[11px] text-amber-700">
          {{ timeLeft(order.expiresAt) }}
        </span>
      </div>

      <p class="mt-4 text-sm text-neutral-600">
        아래 계좌로 <b class="text-neutral-900">정확한 금액</b>과 <b class="text-neutral-900">입금자명</b>으로 송금해주세요.
        입금 확인 즉시 자동으로 주문이 완료됩니다.
      </p>

      <dl class="mt-5 divide-y divide-neutral-100 rounded-xl border border-neutral-100 text-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">은행</dt>
          <dd class="text-neutral-900">{{ BANK_INFO.bank }}</dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">계좌번호</dt>
          <dd class="flex items-center gap-2">
            <span class="font-mono text-neutral-900">{{ BANK_INFO.accountNumber }}</span>
            <button
              type="button"
              class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              @click="copyText('acc', BANK_INFO.accountNumber)"
            >{{ copiedKey === 'acc' ? '복사됨' : '복사' }}</button>
          </dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">예금주</dt>
          <dd class="text-neutral-900">{{ BANK_INFO.accountHolder }}</dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">금액</dt>
          <dd class="flex items-center gap-2">
            <span class="font-display text-base text-neutral-900">{{ formatPrice(order.finalAmount) }}</span>
            <button
              type="button"
              class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              @click="copyText('amt', String(order.finalAmount))"
            >{{ copiedKey === 'amt' ? '복사됨' : '복사' }}</button>
          </dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">입금자명</dt>
          <dd class="flex items-center gap-2">
            <span class="font-display text-base text-neutral-900">{{ order.depositorName ?? '—' }}</span>
            <button
              v-if="order.depositorName"
              type="button"
              class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              @click="copyText('dep', order.depositorName!)"
            >{{ copiedKey === 'dep' ? '복사됨' : '복사' }}</button>
          </dd>
        </div>
      </dl>

      <div class="mt-4 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
        <span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
        입금 확인 중 · 5초마다 자동 체크
      </div>
    </section>

    <!-- 주문 요약 -->
    <section class="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 class="text-sm text-neutral-900">주문 요약</h2>
      <ul class="mt-3 space-y-2 text-sm">
        <li
          v-for="it in order.items ?? []"
          :key="it.id"
          class="flex items-start justify-between gap-3"
        >
          <div class="min-w-0 flex-1">
            <p class="line-clamp-1 text-neutral-900">{{ it.productName }}</p>
            <p class="text-xs text-neutral-500">{{ it.optionLabel ?? '기본' }} · {{ it.quantity }}개</p>
          </div>
          <span class="font-display text-neutral-900">{{ formatPrice(it.totalPrice) }}</span>
        </li>
      </ul>
      <div class="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-sm">
        <span class="text-neutral-500">결제 금액</span>
        <span class="font-display text-base text-neutral-900">{{ formatPrice(order.finalAmount) }}</span>
      </div>
    </section>

    <p class="mt-6 text-center text-[11px] text-neutral-400">
      24시간 내 미입금 시 자동 취소됩니다.
    </p>
  </div>
</template>
