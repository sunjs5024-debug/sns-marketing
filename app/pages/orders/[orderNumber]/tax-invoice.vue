<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "세금계산서 신청", robots: "noindex, nofollow" });

const route = useRoute();
const orderNumber = computed(() => String(route.params.orderNumber));

type TaxInvoiceRequest = {
  id: string;
  companyName: string;
  bizRegNo: string;
  ceoName: string;
  address: string;
  businessType: string | null;
  businessItem: string | null;
  taxEmail: string;
  status: "REQUESTED" | "ISSUED" | "REJECTED";
  requestedAt: string;
  issuedAt: string | null;
  rejectReason: string | null;
};
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  buyerEmail: string;
  items: Array<{ productName: string; totalPrice: number }>;
  taxInvoiceRequest: TaxInvoiceRequest | null;
};

const { data: order, refresh } = await useFetch<Order>(`/api/orders/${orderNumber.value}/tax-invoice`);
if (!order.value) throw createError({ statusCode: 404 });

const existing = computed(() => order.value!.taxInvoiceRequest);

// 신청 가능한 주문인지 확인
const isPayable = computed(() =>
  ["PAID", "PROCESSING", "COMPLETED"].includes(order.value!.status),
);

// 폼 (기존 신청 있으면 기존 값으로 초기화)
const form = ref({
  companyName: "",
  bizRegNo: "",
  ceoName: "",
  address: "",
  businessType: "",
  businessItem: "",
  taxEmail: "",
});
watch(
  existing,
  (e) => {
    if (e) {
      form.value = {
        companyName: e.companyName,
        bizRegNo: e.bizRegNo,
        ceoName: e.ceoName,
        address: e.address,
        businessType: e.businessType ?? "",
        businessItem: e.businessItem ?? "",
        taxEmail: e.taxEmail,
      };
    } else {
      // 신규 → 주문 이메일로 기본 채우기
      form.value.taxEmail = order.value?.buyerEmail ?? "";
    }
  },
  { immediate: true },
);

const submitting = ref(false);
const errorMsg = ref<string | null>(null);
const successMsg = ref<string | null>(null);

// 사업자등록번호 자동 하이픈
function normalizeBizRegNo(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

async function submit() {
  errorMsg.value = null;
  successMsg.value = null;
  if (!/^\d{3}-\d{2}-\d{5}$/.test(form.value.bizRegNo)) {
    errorMsg.value = "사업자등록번호는 000-00-00000 형식으로 입력해주세요."; return;
  }
  submitting.value = true;
  try {
    await $fetch(`/api/orders/${orderNumber.value}/tax-invoice`, {
      method: "POST",
      body: {
        companyName: form.value.companyName.trim(),
        bizRegNo: form.value.bizRegNo.trim(),
        ceoName: form.value.ceoName.trim(),
        address: form.value.address.trim(),
        businessType: form.value.businessType.trim() || null,
        businessItem: form.value.businessItem.trim() || null,
        taxEmail: form.value.taxEmail.trim(),
      },
    });
    successMsg.value = "✓ 세금계산서 신청이 접수되었습니다. 영업일 기준 1~3일 내 발행됩니다.";
    await refresh();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMsg.value = err.data?.statusMessage ?? err.statusMessage ?? "신청 실패";
  } finally {
    submitting.value = false;
  }
}

const STATUS_LABEL: Record<TaxInvoiceRequest["status"], string> = {
  REQUESTED: "발행 대기",
  ISSUED: "발행 완료",
  REJECTED: "발행 거절",
};
const STATUS_STYLE: Record<TaxInvoiceRequest["status"], string> = {
  REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
  ISSUED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};
</script>

<template>
  <div v-if="order" class="mx-auto max-w-2xl px-4 pt-8 pb-20 sm:px-6">
    <header>
      <NuxtLink :to="`/orders/${order.orderNumber}`" class="text-xs text-neutral-500 hover:text-neutral-900">← 주문 상세</NuxtLink>
      <h1 class="mt-2 font-display text-2xl text-neutral-900">세금계산서 신청</h1>
      <p class="mt-1 text-sm text-neutral-500">사업자 회원 대상 · 신청 후 영업일 1~3일 내 이메일로 발행됩니다.</p>
    </header>

    <!-- 주문 요약 -->
    <section class="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <p class="text-xs text-neutral-500">주문번호 <span class="font-mono">{{ order.orderNumber }}</span></p>
      <p class="mt-1 text-sm text-neutral-700 truncate">
        {{ order.items[0]?.productName ?? '—' }}
        <span v-if="order.items.length > 1" class="text-neutral-500">외 {{ order.items.length - 1 }}건</span>
      </p>
      <p class="mt-2 font-display text-xl text-neutral-900">{{ formatPrice(order.finalAmount) }}</p>
    </section>

    <!-- 결제 미완료 안내 -->
    <section v-if="!isPayable" class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
      ⚠ 결제 완료된 주문만 세금계산서 신청이 가능합니다.
    </section>

    <!-- 기존 신청 상태 -->
    <section v-if="existing" class="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-base text-neutral-900">현재 상태</h2>
        <span :class="['rounded-full border px-2.5 py-1 text-[11px]', STATUS_STYLE[existing.status]]">
          {{ STATUS_LABEL[existing.status] }}
        </span>
      </div>
      <dl class="mt-3 space-y-1 text-xs text-neutral-600">
        <div><dt class="inline text-neutral-500">신청일: </dt><dd class="inline">{{ new Date(existing.requestedAt).toLocaleString('ko-KR') }}</dd></div>
        <div v-if="existing.issuedAt"><dt class="inline text-neutral-500">발행일: </dt><dd class="inline">{{ new Date(existing.issuedAt).toLocaleString('ko-KR') }}</dd></div>
        <div v-if="existing.rejectReason" class="mt-2 rounded-lg bg-rose-50 p-2 text-rose-700">
          반려 사유: {{ existing.rejectReason }}
        </div>
      </dl>
    </section>

    <!-- 신청 폼 (발행 완료가 아닐 때만) -->
    <section v-if="isPayable && existing?.status !== 'ISSUED'" class="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 class="font-display text-base text-neutral-900">
        {{ existing ? '신청 정보 수정' : '사업자 정보 입력' }}
      </h2>
      <p class="mt-1 text-xs text-neutral-500">필수 정보만 정확히 입력해주세요.</p>

      <p v-if="errorMsg" class="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ errorMsg }}</p>
      <p v-if="successMsg" class="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{{ successMsg }}</p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="text-xs text-neutral-500">상호 <span class="text-rose-500">*</span></span>
          <input
            v-model="form.companyName"
            type="text"
            required
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">사업자등록번호 <span class="text-rose-500">*</span></span>
          <input
            :value="form.bizRegNo"
            type="text"
            placeholder="000-00-00000"
            required
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-mono focus:border-neutral-900 focus:outline-none"
            @input="form.bizRegNo = normalizeBizRegNo(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">대표자명 <span class="text-rose-500">*</span></span>
          <input
            v-model="form.ceoName"
            type="text"
            required
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">세금계산서 수신 이메일 <span class="text-rose-500">*</span></span>
          <input
            v-model="form.taxEmail"
            type="email"
            required
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs text-neutral-500">사업장 주소 <span class="text-rose-500">*</span></span>
          <input
            v-model="form.address"
            type="text"
            required
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">업태 (선택)</span>
          <input
            v-model="form.businessType"
            type="text"
            placeholder="예: 서비스업"
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">종목 (선택)</span>
          <input
            v-model="form.businessItem"
            type="text"
            placeholder="예: 광고대행"
            class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        :disabled="submitting"
        class="mt-5 w-full rounded-xl bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
        @click="submit"
      >
        {{ submitting ? "처리 중…" : existing ? "수정 후 재신청" : "세금계산서 신청" }}
      </button>
    </section>

    <p class="mt-6 text-center text-[11px] text-neutral-400">
      개인 회원은 세금계산서 발행 의무가 없습니다. 신청은 사업자 회원만 가능합니다.<br />
      발행 관련 문의는 텔레그램 @snssocialfactory 으로 부탁드립니다.
    </p>
  </div>
</template>
