<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";
import { STATUS_LABEL, STATUS_STYLE } from "~~/server/utils/orderStatus";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "주문 상세", robots: "noindex, nofollow" });

const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "계좌이체",
  CARD: "신용카드",
  KAKAOPAY: "카카오페이",
  NAVERPAY: "네이버페이",
  TOSS: "토스",
};

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

    <!-- 입금 대기 중이면 입금 안내 페이지로 이동 -->
    <div
      v-else-if="order.status === 'PENDING' && order.paymentMethod === 'TRANSFER'"
      class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
    >
      <div class="text-sm">
        <p class="text-amber-900">입금 대기 중인 주문입니다</p>
        <p class="mt-0.5 text-xs text-amber-700">계좌 정보를 다시 확인하시려면 아래 버튼을 눌러주세요.</p>
      </div>
      <NuxtLink
        :to="`/checkout/${order.orderNumber}/pay`"
        class="rounded-full bg-amber-600 px-4 py-2 text-xs text-white hover:bg-amber-700"
      >입금 안내 보기 →</NuxtLink>
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
        <li v-for="it in order.items" :key="it.id" class="rounded-2xl bg-neutral-50 p-3">
          <div class="flex items-start gap-3">
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
          </div>

          <!-- 진행률 (외부 발주된 항목만) -->
          <div v-if="it.externalOrderId" class="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-neutral-500">진행 상태</span>
              <span
                :class="[
                  'rounded-full px-2 py-0.5',
                  it.externalStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  it.externalStatus === 'In progress' || it.externalStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                  it.externalStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                  it.externalStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                  'bg-neutral-100 text-neutral-600'
                ]"
              >
                {{
                  it.externalStatus === 'Pending' ? '대기 중' :
                  it.externalStatus === 'In progress' || it.externalStatus === 'Processing' ? '작업 중' :
                  it.externalStatus === 'Completed' ? '완료' :
                  it.externalStatus === 'Partial' ? '부분 완료' :
                  it.externalStatus === 'Cancelled' ? '취소됨' :
                  it.externalStatus ?? '확인 중'
                }}
              </span>
            </div>
            <!-- 진행률 바 (remains 기반) -->
            <div v-if="typeof it.remainsCount === 'number'" class="mt-2">
              <div class="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all"
                  :style="{ width: `${Math.max(0, Math.min(100, Math.round(((it.quantity - it.remainsCount) / it.quantity) * 100)))}%` }"
                ></div>
              </div>
              <p class="mt-1 text-[11px] text-neutral-500">
                {{ (it.quantity - it.remainsCount).toLocaleString('ko-KR') }} / {{ it.quantity.toLocaleString('ko-KR') }} 완료
                ({{ Math.round(((it.quantity - it.remainsCount) / it.quantity) * 100) }}%)
              </p>
            </div>
            <p v-if="it.lastSyncedAt" class="mt-1 text-[10px] text-neutral-400">
              마지막 확인: {{ new Date(it.lastSyncedAt).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>

          <!-- 발주 실패 안내 -->
          <div v-else-if="order.status === 'PAID' && it.dispatchError" class="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
            ⚠ 작업 시작 지연 — 관리자가 확인 중입니다.
          </div>
        </li>
      </ul>
    </section>

    <section class="mt-4 rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">결제 정보</h2>
      <dl class="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-neutral-500">결제 방법</dt>
        <dd>{{ order.paymentMethod ? (PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod) : "—" }}</dd>
        <dt class="text-neutral-500">상품 금액</dt>
        <dd>{{ formatPrice(order.totalAmount) }}</dd>
        <template v-if="order.pointsUsed > 0">
          <dt class="text-rose-500">포인트 사용</dt>
          <dd class="text-rose-600">−{{ order.pointsUsed.toLocaleString("ko-KR") }}P</dd>
        </template>
        <dt class="text-neutral-900">실 결제 금액</dt>
        <dd class="font-display text-neutral-900">{{ formatPrice(order.finalAmount || order.totalAmount) }}</dd>
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
        <dd class="break-all">{{ order.buyerEmail }}</dd>
      </dl>
    </section>

    <!-- 결과보고서 / 영수증 / 세금계산서 (결제 완료 주문만) -->
    <section
      v-if="['PAID','PROCESSING','COMPLETED'].includes(order.status)"
      class="mt-4 rounded-3xl border border-neutral-100 bg-white p-6"
    >
      <h2 class="font-display text-lg text-neutral-900">증빙 서류</h2>
      <p class="mt-1 text-xs text-neutral-500">작업 결과보고서, 거래명세서, 세금계산서</p>
      <div class="mt-4 grid gap-2 sm:grid-cols-3">
        <NuxtLink
          :to="`/orders/${order.orderNumber}/report`"
          class="flex items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-3 text-sm text-indigo-900 hover:from-indigo-100 hover:to-purple-100"
        >
          📊 결과보고서
        </NuxtLink>
        <NuxtLink
          :to="`/orders/${order.orderNumber}/receipt`"
          class="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50"
        >
          🧾 거래명세서
        </NuxtLink>
        <NuxtLink
          :to="`/orders/${order.orderNumber}/tax-invoice`"
          class="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50"
        >
          📄 세금계산서
        </NuxtLink>
      </div>
    </section>

    <!-- 후기 작성 (완료된 주문만) -->
    <section
      v-if="order.status === 'COMPLETED'"
      class="mt-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6"
    >
      <div class="flex items-start gap-3">
        <span class="text-2xl">⭐</span>
        <div class="flex-1">
          <h2 class="font-display text-lg text-neutral-900">서비스가 마음에 드셨나요?</h2>
          <p class="mt-1 text-xs text-neutral-600">
            소중한 후기 한 줄이 다른 분들에게 큰 도움이 됩니다.
            <br class="sm:hidden" />
            관리자 승인 후 <NuxtLink to="/reviews" class="underline">고객 후기 페이지</NuxtLink>에 노출됩니다.
          </p>
          <NuxtLink
            :to="`/reviews/write/${order.orderNumber}`"
            class="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-700"
          >
            ✍️ 후기 작성하기
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
