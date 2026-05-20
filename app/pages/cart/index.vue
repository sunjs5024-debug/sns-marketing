<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useHead({ title: "장바구니" });

const { data: items, refresh } = await useFetch("/api/cart");

const total = computed(() =>
  (items.value ?? []).reduce(
    (sum, it) => sum + (it.option?.price ?? it.product.basePrice) * it.quantity,
    0,
  ),
);

async function updateQty(id: string, delta: number, current: number) {
  const next = Math.max(1, current + delta);
  await $fetch(`/api/cart/${id}`, { method: "PATCH", body: { quantity: next } });
  await refresh();
  refreshNuxtData("header");
}

async function saveMeta(id: string, targetUrl: string, memo: string) {
  await $fetch(`/api/cart/${id}`, { method: "PATCH", body: { targetUrl, memo } });
}

async function remove(id: string) {
  if (!confirm("이 상품을 장바구니에서 빼시겠어요?")) return;
  await $fetch(`/api/cart/${id}`, { method: "DELETE" });
  await refresh();
  refreshNuxtData("header");
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="font-display text-3xl text-neutral-900">장바구니</h1>
    <p class="mt-1 text-sm text-neutral-500">{{ (items ?? []).length }}개 상품</p>

    <div v-if="(items ?? []).length === 0" class="mt-12 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">
      <p class="text-sm text-neutral-500">장바구니가 비어있어요.</p>
      <NuxtLink to="/sns" class="mt-4 inline-flex rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700">상품 보러가기</NuxtLink>
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul class="space-y-3">
        <li v-for="it in items ?? []" :key="it.id" class="rounded-3xl border border-neutral-100 bg-white p-4">
          <div class="flex gap-4">
            <BrandIcon
              v-if="platformKeyFor(it.product.category.slug)"
              :kind="platformKeyFor(it.product.category.slug)!"
              :size="48"
              class="shrink-0"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs text-neutral-500">{{ it.product.category.name }}</p>
              <NuxtLink :to="`/products/${it.product.slug}`" class="line-clamp-2 text-sm text-neutral-900 hover:underline">
                {{ it.product.name }}
              </NuxtLink>
              <p v-if="it.option" class="mt-1 text-xs text-neutral-600">옵션: {{ it.option.label }}</p>
              <p class="mt-1 font-display text-base text-neutral-900">
                {{ formatPrice((it.option?.price ?? it.product.basePrice) * it.quantity) }}
              </p>
            </div>
          </div>
          <div class="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-sm">
            <div class="flex items-center gap-3">
              <span class="text-xs text-neutral-500 w-16">수량</span>
              <div class="inline-flex items-center rounded-full border border-neutral-200">
                <button type="button" class="h-8 w-8 text-neutral-600 hover:text-neutral-900" @click="updateQty(it.id, -1, it.quantity)">−</button>
                <span class="w-10 text-center text-sm">{{ it.quantity }}</span>
                <button type="button" class="h-8 w-8 text-neutral-600 hover:text-neutral-900" @click="updateQty(it.id, +1, it.quantity)">+</button>
              </div>
              <button type="button" class="ml-auto text-xs text-neutral-500 hover:text-rose-600" @click="remove(it.id)">삭제</button>
            </div>
            <label class="flex items-start gap-3">
              <span class="mt-2 text-xs text-neutral-500 w-16 shrink-0">타겟 URL</span>
              <input
                :value="it.targetUrl ?? ''"
                type="url"
                placeholder="https://instagram.com/내계정"
                class="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none"
                @blur="(e) => saveMeta(it.id, (e.target as HTMLInputElement).value, it.memo ?? '')"
              />
            </label>
            <label class="flex items-start gap-3">
              <span class="mt-2 text-xs text-neutral-500 w-16 shrink-0">요청사항</span>
              <textarea
                :value="it.memo ?? ''"
                rows="2"
                placeholder="자연스러운 시간 분산으로 부탁드려요"
                class="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none"
                @blur="(e) => saveMeta(it.id, it.targetUrl ?? '', (e.target as HTMLTextAreaElement).value)"
              />
            </label>
          </div>
        </li>
      </ul>

      <aside class="h-fit space-y-3 rounded-3xl border border-neutral-100 bg-white p-6">
        <h2 class="font-display text-lg text-neutral-900">결제 요약</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between text-neutral-600">
            <dt>상품 금액</dt>
            <dd>{{ formatPrice(total) }}</dd>
          </div>
          <div class="flex justify-between text-neutral-600">
            <dt>할인</dt>
            <dd>-0원</dd>
          </div>
          <div class="border-t border-neutral-100 pt-2 flex justify-between text-base">
            <dt class="text-neutral-900">총 결제 금액</dt>
            <dd class="font-display text-neutral-900">{{ formatPrice(total) }}</dd>
          </div>
        </dl>
        <NuxtLink to="/checkout" class="block w-full rounded-full bg-neutral-900 py-3 text-center text-sm text-white hover:bg-neutral-700">주문하기</NuxtLink>
      </aside>
    </div>
  </div>
</template>
