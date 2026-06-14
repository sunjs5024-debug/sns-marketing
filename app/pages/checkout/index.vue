<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "주문하기", robots: "noindex, nofollow" });

const { data: items } = await useFetch("/api/cart");
if (!items.value || items.value.length === 0) {
  await navigateTo("/cart");
}

const { data: authData } = useAuth();
const userInfo = authData.value?.user as { name?: string; email?: string } | undefined;

const buyerName = ref(userInfo?.name ?? "");
const buyerPhone = ref("");
const buyerEmail = ref(userInfo?.email ?? "");
const depositorName = ref(userInfo?.name ?? "");
const memo = ref("");
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
  if (!buyerName.value.trim()) { errorMsg.value = "이름을 입력해주세요."; return; }
  if (!buyerPhone.value.trim()) { errorMsg.value = "연락처를 입력해주세요."; return; }
  if (!buyerEmail.value.trim()) { errorMsg.value = "이메일을 입력해주세요."; return; }
  if (!depositorName.value.trim()) { errorMsg.value = "입금자명을 입력해주세요."; return; }
  pending.value = true;
  try {
    const res = await $fetch<{ orderNumber: string }>("/api/orders/create", {
      method: "POST",
      body: {
        buyerName: buyerName.value,
        buyerPhone: buyerPhone.value,
        buyerEmail: buyerEmail.value,
        memo: memo.value || null,
        depositorName: depositorName.value.trim(),
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
    <p class="mt-1.5 text-sm text-neutral-500">계좌이체로 결제됩니다. 입금 확인 즉시 자동으로 주문이 완료됩니다.</p>

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
          <h2 class="font-display text-lg text-neutral-900">결제 정보</h2>

          <div class="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
            <span class="text-base">🏦</span>
            <div>
              <p class="text-neutral-900">계좌이체</p>
              <p class="text-[11px] text-neutral-500">KB국민은행 892501-00-080455 · 주식회사 영천기획</p>
            </div>
          </div>

          <label class="mt-4 block">
            <span class="text-xs text-neutral-500">입금자명 <span class="text-rose-500">*</span></span>
            <input
              v-model="depositorName"
              type="text"
              required
              maxlength="20"
              class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              placeholder="실제 이체할 때 사용할 이름"
            />
            <span class="mt-1.5 block text-[11px] text-neutral-400">
              입금자명이 한 글자라도 다르면 자동 매칭이 안 됩니다.
            </span>
          </label>
        </section>
      </div>

      <aside class="h-fit space-y-3 rounded-3xl border border-neutral-100 bg-white p-6 lg:sticky lg:top-20">
        <h2 class="font-display text-lg text-neutral-900">결제 금액</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between text-neutral-600">
            <dt>상품 금액</dt>
            <dd>{{ formatPrice(total) }}</dd>
          </div>
          <div class="border-t border-neutral-100 pt-2 flex justify-between text-base">
            <dt class="text-neutral-900">총 결제 금액</dt>
            <dd class="font-display text-neutral-900">{{ formatPrice(total) }}</dd>
          </div>
        </dl>
        <button type="submit" :disabled="pending" class="w-full rounded-full bg-neutral-900 py-3 text-center text-sm text-white hover:bg-neutral-700 disabled:opacity-60">
          {{ pending ? "처리 중…" : `${formatPrice(total)} 주문하기` }}
        </button>
        <p class="text-center text-[11px] text-neutral-400">다음 화면에서 계좌 정보를 안내합니다</p>
        <NuxtLink to="/cart" class="block text-center text-xs text-neutral-500 hover:text-neutral-700">← 장바구니로 돌아가기</NuxtLink>
      </aside>
    </form>
  </div>
</template>
