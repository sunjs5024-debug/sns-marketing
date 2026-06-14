<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["auth"], layout: false });
useSeoMeta({ title: "작업 결과 보고서", robots: "noindex, nofollow" });

const route = useRoute();
const orderNumber = computed(() => String(route.params.orderNumber));

type OrderItem = {
  id: string;
  productName: string;
  optionLabel: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  targetUrl: string | null;
  // urpanel 발주 추적 데이터
  externalProvider: string | null;
  externalOrderId: string | null;
  externalStatus: string | null;
  startCount: number | null;
  remainsCount: number | null;
  dispatchedAt: string | null;
  lastSyncedAt: string | null;
  memo: string | null;
};
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  buyerName: string;
  buyerEmail: string;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  items: OrderItem[];
};

const { data: order } = await useFetch<Order>(`/api/orders/${orderNumber.value}`);
if (!order.value) throw createError({ statusCode: 404 });

const COMPANY = {
  name: "주식회사 영천기획",
  service: "SNS소셜팩토리",
  ceo: "김선민",
  bizRegNo: "447-81-03597",
  mailOrderNo: "제 2026-경남진주-0298 호",
  email: "dkssudgktka53@gmail.com",
  url: "https://xn--sns-yg9lh0pw9l.kr",
};

const issueDate = computed(() => {
  const d = order.value?.completedAt ?? order.value?.paidAt ?? order.value?.createdAt;
  if (!d) return "";
  return new Date(d).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
});

const startedAt = computed(() => {
  // 가장 빠른 dispatch 시각
  const items = order.value?.items ?? [];
  const times = items.map((i) => i.dispatchedAt).filter((t): t is string => !!t).map((t) => new Date(t).getTime());
  if (times.length === 0) return null;
  return new Date(Math.min(...times)).toLocaleString("ko-KR");
});

const totalQuantity = computed(() => order.value?.items.reduce((s, i) => s + i.quantity, 0) ?? 0);
const totalProcessed = computed(() => {
  return order.value?.items.reduce((s, i) => {
    const processed = i.quantity - (i.remainsCount ?? 0);
    return s + Math.max(0, processed);
  }, 0) ?? 0;
});
const overallProgress = computed(() => {
  if (totalQuantity.value === 0) return 0;
  return Math.min(100, Math.round((totalProcessed.value / totalQuantity.value) * 100));
});

function progressOf(it: OrderItem): number {
  if (it.quantity === 0) return 0;
  const processed = it.quantity - (it.remainsCount ?? 0);
  return Math.min(100, Math.max(0, Math.round((processed / it.quantity) * 100)));
}
function processedOf(it: OrderItem): number {
  return Math.max(0, it.quantity - (it.remainsCount ?? 0));
}
function statusLabelOf(it: OrderItem): { label: string; color: string } {
  // externalStatus 가 있으면 그대로 한국어 매핑, 없으면 quantity vs remainsCount 추정
  const s = (it.externalStatus ?? "").toLowerCase();
  if (s.includes("complete") || s === "completed") return { label: "완료", color: "text-emerald-700 bg-emerald-50" };
  if (s.includes("partial")) return { label: "부분 완료", color: "text-amber-700 bg-amber-50" };
  if (s.includes("cancel")) return { label: "취소", color: "text-rose-700 bg-rose-50" };
  if (s.includes("progress") || s.includes("process")) return { label: "진행 중", color: "text-blue-700 bg-blue-50" };
  if (s.includes("pending")) return { label: "대기", color: "text-neutral-600 bg-neutral-50" };
  // fallback: progress 100% 면 완료, 아니면 진행 중
  if (progressOf(it) >= 100) return { label: "완료", color: "text-emerald-700 bg-emerald-50" };
  if (it.dispatchedAt) return { label: "진행 중", color: "text-blue-700 bg-blue-50" };
  return { label: "대기", color: "text-neutral-600 bg-neutral-50" };
}

function printPage() {
  if (import.meta.client) window.print();
}
</script>

<template>
  <div v-if="order" class="min-h-screen bg-neutral-100 print:bg-white">
    <!-- 상단 액션 (인쇄 시 숨김) -->
    <div class="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3 shadow-sm print:hidden">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <NuxtLink :to="`/orders/${order.orderNumber}`" class="text-sm text-neutral-600 hover:text-neutral-900">← 주문으로 돌아가기</NuxtLink>
        <button
          type="button"
          class="rounded-full bg-neutral-900 px-4 py-2 text-xs text-white hover:bg-neutral-700"
          @click="printPage"
        >🖨 인쇄 / PDF 저장</button>
      </div>
    </div>

    <!-- A4 결과보고서 -->
    <div class="mx-auto my-6 max-w-3xl bg-white px-8 py-10 shadow-lg print:my-0 print:max-w-full print:shadow-none">
      <!-- 헤더 -->
      <header class="text-center border-b-2 border-indigo-700 pb-5">
        <div class="inline-flex items-center gap-2">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-base font-display text-white">S</span>
          <span class="font-display text-lg text-neutral-700">{{ COMPANY.service }}</span>
        </div>
        <h1 class="mt-3 font-display text-3xl tracking-tight text-neutral-900">작 업 결 과 보 고 서</h1>
        <p class="mt-1 text-xs text-neutral-500">PERFORMANCE / DELIVERY REPORT</p>
      </header>

      <!-- 주문 메타 -->
      <section class="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p class="text-xs text-neutral-500">발행일</p>
          <p class="mt-1 font-display text-base text-neutral-900">{{ issueDate }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-500">주문번호</p>
          <p class="mt-1 font-mono text-base text-neutral-900">{{ order.orderNumber }}</p>
        </div>
      </section>

      <!-- 종합 요약 -->
      <section class="mt-6 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
        <p class="text-xs uppercase tracking-widest text-indigo-700">OVERALL PROGRESS</p>
        <div class="mt-2 flex items-end justify-between">
          <p class="font-display text-4xl text-indigo-900">{{ overallProgress }}%</p>
          <div class="text-right text-xs text-neutral-600">
            <p>총 {{ totalQuantity.toLocaleString('ko-KR') }} 중</p>
            <p class="font-display text-base text-neutral-900">{{ totalProcessed.toLocaleString('ko-KR') }} 처리</p>
          </div>
        </div>
        <!-- 전체 진행률 바 -->
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            :style="{ width: `${overallProgress}%` }"
          />
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2 text-[11px] text-neutral-700">
          <div>
            <p class="text-neutral-500">주문일</p>
            <p class="mt-0.5 font-medium">{{ new Date(order.createdAt).toLocaleDateString('ko-KR') }}</p>
          </div>
          <div>
            <p class="text-neutral-500">작업 시작</p>
            <p class="mt-0.5 font-medium">{{ startedAt ?? '대기 중' }}</p>
          </div>
          <div>
            <p class="text-neutral-500">완료 일시</p>
            <p class="mt-0.5 font-medium">{{ order.completedAt ? new Date(order.completedAt).toLocaleString('ko-KR') : '진행 중' }}</p>
          </div>
        </div>
      </section>

      <!-- 상품별 작업 상세 -->
      <section class="mt-6">
        <h2 class="font-display text-base text-neutral-900">상품별 작업 결과</h2>
        <div class="mt-3 space-y-3">
          <article
            v-for="it in order.items"
            :key="it.id"
            class="rounded-2xl border border-neutral-200 p-4"
          >
            <!-- 상단: 상품명 + 상태 -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <p class="text-sm text-neutral-900">{{ it.productName }}</p>
                <p class="text-xs text-neutral-500">{{ it.optionLabel ?? '기본' }}</p>
              </div>
              <span :class="['shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium', statusLabelOf(it).color]">
                {{ statusLabelOf(it).label }}
              </span>
            </div>

            <!-- 대상 URL -->
            <div v-if="it.targetUrl" class="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-[11px]">
              <span class="text-neutral-500">대상 URL: </span>
              <span class="break-all font-mono text-neutral-700">{{ it.targetUrl }}</span>
            </div>

            <!-- 진행률 바 -->
            <div class="mt-3">
              <div class="flex items-baseline justify-between text-[11px]">
                <span class="text-neutral-500">진행률</span>
                <span class="font-display text-sm text-neutral-900">
                  {{ processedOf(it).toLocaleString('ko-KR') }} / {{ it.quantity.toLocaleString('ko-KR') }}
                  <span class="text-neutral-400">({{ progressOf(it) }}%)</span>
                </span>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  class="h-full transition-all"
                  :class="progressOf(it) >= 100 ? 'bg-emerald-500' : 'bg-blue-500'"
                  :style="{ width: `${progressOf(it)}%` }"
                />
              </div>
            </div>

            <!-- 발주 상세 (urpanel 데이터) -->
            <dl class="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
              <div>
                <dt class="text-neutral-500">발주 시각</dt>
                <dd class="mt-0.5 text-neutral-800">{{ it.dispatchedAt ? new Date(it.dispatchedAt).toLocaleString('ko-KR') : '—' }}</dd>
              </div>
              <div v-if="it.startCount !== null">
                <dt class="text-neutral-500">시작 카운트</dt>
                <dd class="mt-0.5 font-mono text-neutral-800">{{ it.startCount.toLocaleString('ko-KR') }}</dd>
              </div>
              <div v-if="it.externalOrderId">
                <dt class="text-neutral-500">발주 ID</dt>
                <dd class="mt-0.5 font-mono text-neutral-800">#{{ it.externalOrderId }}</dd>
              </div>
              <div v-if="it.lastSyncedAt">
                <dt class="text-neutral-500">최종 동기화</dt>
                <dd class="mt-0.5 text-neutral-800">{{ new Date(it.lastSyncedAt).toLocaleString('ko-KR') }}</dd>
              </div>
            </dl>

            <p v-if="it.memo" class="mt-2 text-[11px] text-neutral-500">📝 {{ it.memo }}</p>
          </article>
        </div>
      </section>

      <!-- 보장 안내 -->
      <section class="mt-6 rounded-2xl bg-emerald-50 p-4 text-[11px] leading-6 text-emerald-900">
        <p class="font-medium">✓ 30일 유지 보장</p>
        <p class="mt-1 text-emerald-800">
          본 결과는 작업 완료 시점 기준이며, 작업일로부터 30일간 자동 유지가 보장됩니다.
          유지 기간 내 이탈이 30% 이상 발생할 경우 자동 리필 처리되며, 본 보고서를 첨부하여
          텔레그램(@snssocialfactory) 또는 {{ COMPANY.email }} 로 문의 주시면 1영업일 내 처리해드립니다.
        </p>
      </section>

      <!-- 안내 -->
      <footer class="mt-8 border-t border-neutral-200 pt-4 text-center text-[11px] text-neutral-500">
        <p>본 보고서는 작업 결과의 투명한 증빙을 위해 자동 발행되었습니다.</p>
        <p class="mt-1">법적 효력이 있는 거래 증빙은 별도의 거래명세서 또는 세금계산서를 활용해주세요.</p>
        <p class="mt-3 font-display text-sm text-neutral-700">{{ COMPANY.service }} · {{ COMPANY.name }}</p>
        <p class="mt-1">통신판매업 신고: {{ COMPANY.mailOrderNo }} · 사업자등록: {{ COMPANY.bizRegNo }}</p>
        <p class="mt-1">{{ COMPANY.url }} · {{ COMPANY.email }}</p>
      </footer>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4;
    margin: 12mm;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
