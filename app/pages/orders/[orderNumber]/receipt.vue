<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["auth"], layout: false });
useSeoMeta({ title: "거래명세서", robots: "noindex, nofollow" });

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
};
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  pointsUsed: number;
  paymentMethod: string | null;
  depositorName: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  memo: string | null;
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
  address: "경상남도 진주시 에나로77번길 4, 502호",
  email: "dkssudgktka53@gmail.com",
};
const BANK = "KB국민은행 892501-00-080455 (예금주: 주식회사 영천기획)";

const issueDate = computed(() => {
  const d = order.value?.paidAt ?? order.value?.createdAt;
  if (!d) return "";
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
});

const supplyAmount = computed(() => Math.round((order.value?.finalAmount ?? 0) / 1.1));
const taxAmount = computed(() => (order.value?.finalAmount ?? 0) - supplyAmount.value);

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
        <div class="flex gap-2">
          <NuxtLink
            :to="`/orders/${order.orderNumber}/tax-invoice`"
            class="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
          >세금계산서 신청</NuxtLink>
          <button
            type="button"
            class="rounded-full bg-neutral-900 px-4 py-2 text-xs text-white hover:bg-neutral-700"
            @click="printPage"
          >🖨 인쇄 / PDF 저장</button>
        </div>
      </div>
    </div>

    <!-- A4 사이즈 영수증 -->
    <div class="mx-auto my-6 max-w-3xl bg-white px-8 py-10 shadow-lg print:my-0 print:max-w-full print:shadow-none">
      <!-- 헤더 -->
      <header class="text-center border-b-2 border-neutral-900 pb-5">
        <h1 class="font-display text-3xl tracking-tight text-neutral-900">거 래 명 세 서</h1>
        <p class="mt-2 text-xs text-neutral-500">RECEIPT / TRANSACTION STATEMENT</p>
      </header>

      <!-- 발행 정보 -->
      <div class="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p class="text-xs text-neutral-500">발행일</p>
          <p class="mt-1 font-display text-base text-neutral-900">{{ issueDate }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-500">주문번호</p>
          <p class="mt-1 font-mono text-base text-neutral-900">{{ order.orderNumber }}</p>
        </div>
      </div>

      <!-- 공급자/공급받는자 -->
      <section class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- 공급자 (우리) -->
        <div class="rounded-lg border border-neutral-300 p-4">
          <p class="border-b border-neutral-200 pb-2 text-xs font-medium text-neutral-700">공급자 (판매자)</p>
          <dl class="mt-3 space-y-1.5 text-[13px]">
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">상호</dt>
              <dd class="text-neutral-900">{{ COMPANY.name }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">대표자</dt>
              <dd class="text-neutral-900">{{ COMPANY.ceo }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">사업자</dt>
              <dd class="font-mono text-neutral-900">{{ COMPANY.bizRegNo }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">통신판매</dt>
              <dd class="text-neutral-900">{{ COMPANY.mailOrderNo }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">서비스</dt>
              <dd class="text-neutral-900">{{ COMPANY.service }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">주소</dt>
              <dd class="text-neutral-900 leading-snug">{{ COMPANY.address }}</dd>
            </div>
          </dl>
        </div>

        <!-- 공급받는자 (고객) -->
        <div class="rounded-lg border border-neutral-300 p-4">
          <p class="border-b border-neutral-200 pb-2 text-xs font-medium text-neutral-700">공급받는자 (구매자)</p>
          <dl class="mt-3 space-y-1.5 text-[13px]">
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">성명</dt>
              <dd class="text-neutral-900">{{ order.buyerName }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">연락처</dt>
              <dd class="text-neutral-900">{{ order.buyerPhone }}</dd>
            </div>
            <div class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">이메일</dt>
              <dd class="break-all text-neutral-900">{{ order.buyerEmail }}</dd>
            </div>
            <div v-if="order.depositorName" class="flex">
              <dt class="w-20 shrink-0 text-neutral-500">입금자명</dt>
              <dd class="text-neutral-900">{{ order.depositorName }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- 거래 내역 테이블 -->
      <section class="mt-6">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr class="border-b-2 border-neutral-900 bg-neutral-50">
              <th class="px-3 py-2 text-left font-medium text-neutral-700">상품명 / 옵션</th>
              <th class="w-24 px-3 py-2 text-right font-medium text-neutral-700">단가</th>
              <th class="w-16 px-3 py-2 text-right font-medium text-neutral-700">수량</th>
              <th class="w-28 px-3 py-2 text-right font-medium text-neutral-700">금액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in order.items" :key="it.id" class="border-b border-neutral-200">
              <td class="px-3 py-2.5">
                <p class="text-neutral-900">{{ it.productName }}</p>
                <p class="text-[11px] text-neutral-500">{{ it.optionLabel ?? '기본' }}</p>
              </td>
              <td class="px-3 py-2.5 text-right text-neutral-700">{{ formatPrice(it.unitPrice) }}</td>
              <td class="px-3 py-2.5 text-right text-neutral-700">{{ it.quantity }}</td>
              <td class="px-3 py-2.5 text-right font-mono text-neutral-900">{{ formatPrice(it.totalPrice) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 결제 금액 요약 -->
      <section class="mt-5 ml-auto w-full sm:w-2/3">
        <dl class="space-y-1.5 text-[13px]">
          <div class="flex justify-between">
            <dt class="text-neutral-500">상품 합계</dt>
            <dd class="font-mono text-neutral-900">{{ formatPrice(order.totalAmount) }}</dd>
          </div>
          <div v-if="order.pointsUsed > 0" class="flex justify-between text-rose-600">
            <dt>잔액 사용</dt>
            <dd class="font-mono">−{{ order.pointsUsed.toLocaleString('ko-KR') }}원</dd>
          </div>
          <div class="flex justify-between border-t border-neutral-300 pt-2">
            <dt class="text-neutral-500">공급가액 (VAT 별도)</dt>
            <dd class="font-mono text-neutral-900">{{ formatPrice(supplyAmount) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-neutral-500">부가세 (10%)</dt>
            <dd class="font-mono text-neutral-900">{{ formatPrice(taxAmount) }}</dd>
          </div>
          <div class="flex justify-between border-t-2 border-neutral-900 pt-2 text-base">
            <dt class="font-display text-neutral-900">합계 금액</dt>
            <dd class="font-display font-mono text-neutral-900">{{ formatPrice(order.finalAmount) }}</dd>
          </div>
        </dl>
      </section>

      <!-- 결제 정보 -->
      <section class="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-[12px]">
        <p class="font-medium text-neutral-700">결제 정보</p>
        <dl class="mt-2 grid grid-cols-1 gap-1 text-neutral-600 sm:grid-cols-2">
          <div><dt class="inline text-neutral-500">결제 방법: </dt><dd class="inline">계좌이체</dd></div>
          <div><dt class="inline text-neutral-500">결제 상태: </dt><dd class="inline">{{ order.paidAt ? '결제 완료' : '결제 대기' }}</dd></div>
          <div v-if="order.paidAt"><dt class="inline text-neutral-500">결제 일시: </dt><dd class="inline">{{ new Date(order.paidAt).toLocaleString('ko-KR') }}</dd></div>
          <div><dt class="inline text-neutral-500">입금 계좌: </dt><dd class="inline">{{ BANK }}</dd></div>
        </dl>
      </section>

      <!-- 안내 -->
      <footer class="mt-8 border-t border-neutral-200 pt-4 text-center text-[11px] text-neutral-500">
        <p>위와 같이 거래가 정상적으로 이루어졌음을 확인합니다.</p>
        <p class="mt-1">세금계산서 발행을 원하시면 상단 "세금계산서 신청" 버튼을 이용해주세요.</p>
        <p class="mt-3 font-display text-sm text-neutral-700">{{ COMPANY.service }} · {{ COMPANY.name }}</p>
        <p class="mt-1">{{ COMPANY.email }}</p>
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
