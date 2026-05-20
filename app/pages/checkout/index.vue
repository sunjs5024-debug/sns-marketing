<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useHead({ title: "주문하기" });

const { data: items } = await useFetch("/api/cart");
if (!items.value || items.value.length === 0) {
  await navigateTo("/cart");
}

const { data: authData } = useAuth();
const userInfo = authData.value?.user as { name?: string; email?: string } | undefined;

const buyerName = ref(userInfo?.name ?? "");
const buyerPhone = ref("");
const buyerEmail = ref(userInfo?.email ?? "");
const memo = ref("");
const paymentMethod = ref<"CARD" | "TRANSFER" | "KAKAOPAY" | "NAVERPAY" | "TOSS">("CARD");
const pending = ref(false);
const errorMsg = ref<string | null>(null);

const total = computed(() =>
  (items.value ?? []).reduce(
    (sum, it) => sum + (it.option?.price ?? it.product.basePrice) * it.quantity,
    0,
  ),
);

async function submit() {
  errorMsg.value = null;
  pending.value = true;
  try {
    const res = await $fetch("/api/orders/create", {
      method: "POST",
      body: {
        buyerName: buyerName.value,
        buyerPhone: buyerPhone.value,
        buyerEmail: buyerEmail.value,
        memo: memo.value || null,
        paymentMethod: paymentMethod.value,
      },
    });
    await navigateTo(`/checkout/${res.orderNumber}/pay`);
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMsg.value = err.data?.statusMessage ?? err.statusMessage ?? "주문 실패";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="font-display text-3xl text-neutral-900">주문 / 결제</h1>

    <p v-if="errorMsg" class="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMsg }}</p>

    <form class="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]" @submit.prevent="submit">
      <div class="space-y-6">
        <section class="rounded-3xl border border-neutral-100 bg-white p-6">
          <h2 class="font-display text-lg text-neutral-900">주문 상품 ({{ (items ?? []).length }}건)</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="it in items ?? []" :key="it.id" class="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3">
              <BrandIcon
                v-if="platformKeyFor(it.product.category.slug)"
                :kind="platformKeyFor(it.product.category.slug)!"
                :size="40"
                class="shrink-0"
              />
              <div class="min-w-0 flex-1 text-sm">
                <p class="line-clamp-1 text-neutral-900">{{ it.product.name }}</p>
                <p class="mt-0.5 text-xs text-neutral-500">{{ it.option?.label ?? "기본" }} · {{ it.quantity }}개</p>
                <p v-if="it.targetUrl" class="mt-0.5 truncate text-xs text-indigo-600">{{ it.targetUrl }}</p>
              </div>
              <span class="font-display text-sm text-neutral-900">
                {{ formatPrice((it.option?.price ?? it.product.basePrice) * it.quantity) }}
              </span>
            </li>
          </ul>
        </section>

        <section class="rounded-3xl border border-neutral-100 bg-white p-6">
          <h2 class="font-display text-lg text-neutral-900">결제자 정보</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs text-neutral-500">이름</span>
              <input v-model="buyerName" required class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
            <label class="block">
              <span class="text-xs text-neutral-500">연락처</span>
              <input v-model="buyerPhone" required placeholder="010-0000-0000" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
            <label class="block sm:col-span-2">
              <span class="text-xs text-neutral-500">이메일 (보고서 수신)</span>
              <input v-model="buyerEmail" type="email" required class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
            <label class="block sm:col-span-2">
              <span class="text-xs text-neutral-500">전체 요청사항 (선택)</span>
              <textarea v-model="memo" rows="2" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
          </div>
        </section>

        <section class="rounded-3xl border border-neutral-100 bg-white p-6">
          <h2 class="font-display text-lg text-neutral-900">결제수단</h2>
          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <label
              v-for="m in [
                { v: 'CARD', label: '신용카드' },
                { v: 'TRANSFER', label: '계좌이체' },
                { v: 'KAKAOPAY', label: '카카오페이' },
                { v: 'NAVERPAY', label: '네이버페이' },
                { v: 'TOSS', label: '토스' },
              ]"
              :key="m.v"
              :class="[
                'cursor-pointer rounded-2xl border bg-white px-3 py-3 text-center text-sm transition',
                paymentMethod === m.v ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200',
              ]"
            >
              <input type="radio" name="paymentMethod" :value="m.v" v-model="paymentMethod" class="sr-only" />
              {{ m.label }}
            </label>
          </div>
          <p class="mt-3 text-[11px] text-neutral-400">
            * 현재 환경엔 PG사 연동이 안 되어 있어, 다음 단계는 mock 결제로 자동 완료됩니다.
          </p>
        </section>
      </div>

      <aside class="h-fit space-y-3 rounded-3xl border border-neutral-100 bg-white p-6">
        <h2 class="font-display text-lg text-neutral-900">최종 결제 금액</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between text-neutral-600">
            <dt>상품 금액</dt>
            <dd>{{ formatPrice(total) }}</dd>
          </div>
          <div class="flex justify-between text-neutral-600">
            <dt>적립 예정</dt>
            <dd class="text-indigo-600">+{{ Math.floor(total * 0.02).toLocaleString("ko-KR") }}P</dd>
          </div>
          <div class="border-t border-neutral-100 pt-2 flex justify-between text-base">
            <dt class="text-neutral-900">총 결제 금액</dt>
            <dd class="font-display text-neutral-900">{{ formatPrice(total) }}</dd>
          </div>
        </dl>
        <button type="submit" :disabled="pending" class="w-full rounded-full bg-neutral-900 py-3 text-center text-sm text-white hover:bg-neutral-700 disabled:opacity-60">
          {{ pending ? "처리 중…" : `${formatPrice(total)} 결제하기` }}
        </button>
        <NuxtLink to="/cart" class="block text-center text-xs text-neutral-500 hover:text-neutral-700">← 장바구니로 돌아가기</NuxtLink>
      </aside>
    </form>
  </div>
</template>
