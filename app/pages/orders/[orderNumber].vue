<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";
import { STATUS_LABEL, STATUS_STYLE } from "~~/server/utils/orderStatus";

definePageMeta({ middleware: ["auth"] });
useHead({ title: "주문 상세" });

const route = useRoute();
const orderNumber = computed(() => String(route.params.orderNumber));
const paid = computed(() => route.query.paid === "1");

const { data: order } = await useFetch(`/api/orders/${orderNumber.value}`);
if (!order.value) throw createError({ statusCode: 404 });
</script>

<template>
  <div v-if="order" class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
    <NuxtLink to="/orders" class="text-xs text-neutral-500 hover:text-neutral-900">← 내 주문 목록</NuxtLink>

    <div v-if="paid" class="mt-4 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
      🎉 결제가 완료되었습니다. 작업이 곧 시작됩니다.
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-neutral-900">주문 상세</h1>
        <p class="mt-1 text-xs text-neutral-500 font-mono">{{ order.orderNumber }}</p>
      </div>
      <span :class="['inline-flex rounded-full px-3 py-1 text-xs', STATUS_STYLE[order.status]]">
        {{ STATUS_LABEL[order.status] }}
      </span>
    </div>

    <section class="mt-6 rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">주문 상품 ({{ order.items.length }}건)</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="it in order.items" :key="it.id" class="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3">
          <BrandIcon
            v-if="platformKeyFor(it.product.category.slug)"
            :kind="platformKeyFor(it.product.category.slug)!"
            :size="40"
            class="shrink-0"
          />
          <div class="min-w-0 flex-1 text-sm">
            <p class="text-neutral-900">{{ it.productName }}</p>
            <p class="mt-0.5 text-xs text-neutral-500">{{ it.optionLabel ?? "기본" }} · {{ it.quantity }}개</p>
            <p v-if="it.targetUrl" class="mt-1 truncate text-xs text-indigo-600">{{ it.targetUrl }}</p>
            <p v-if="it.memo" class="mt-0.5 text-xs text-neutral-500">메모: {{ it.memo }}</p>
          </div>
          <span class="font-display text-sm text-neutral-900">{{ formatPrice(it.totalPrice) }}</span>
        </li>
      </ul>
    </section>

    <section class="mt-4 rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">결제 정보</h2>
      <dl class="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-neutral-500">결제 방법</dt>
        <dd>{{ order.paymentMethod ?? "—" }}</dd>
        <dt class="text-neutral-500">결제 금액</dt>
        <dd class="font-display text-neutral-900">{{ formatPrice(order.totalAmount) }}</dd>
        <dt class="text-neutral-500">결제 일시</dt>
        <dd>{{ order.paidAt ? new Date(order.paidAt).toLocaleString("ko-KR") : "—" }}</dd>
      </dl>
    </section>

    <section class="mt-4 rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">결제자 정보</h2>
      <dl class="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-neutral-500">이름</dt>
        <dd>{{ order.buyerName }}</dd>
        <dt class="text-neutral-500">연락처</dt>
        <dd>{{ order.buyerPhone }}</dd>
        <dt class="text-neutral-500">이메일</dt>
        <dd>{{ order.buyerEmail }}</dd>
      </dl>
    </section>
  </div>
</template>
