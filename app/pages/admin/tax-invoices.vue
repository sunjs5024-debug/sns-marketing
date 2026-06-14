<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "세금계산서 관리", robots: "noindex, nofollow" });

type Item = {
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
  adminMemo: string | null;
  user: { email: string; name: string };
  order: {
    orderNumber: string;
    finalAmount: number;
    paidAt: string | null;
    items: Array<{ productName: string }>;
    _count: { items: number };
  };
};
type Resp = {
  items: Item[];
  summary: { requested: number; issued: number; rejected: number };
};

const filter = ref<"all" | "REQUESTED" | "ISSUED" | "REJECTED">("REQUESTED");
const { data, refresh, pending } = await useFetch<Resp>(() =>
  `/api/admin/tax-invoices${filter.value !== "all" ? `?status=${filter.value}` : ""}`,
);

const updating = ref<string | null>(null);
const expandedId = ref<string | null>(null);

async function setStatus(id: string, status: Item["status"], reason?: string) {
  updating.value = id;
  try {
    await $fetch(`/api/admin/tax-invoices/${id}`, {
      method: "PATCH",
      body: { status, rejectReason: reason ?? null },
    });
    await refresh();
  } catch (e) {
    console.error(e);
    alert("처리 실패");
  } finally {
    updating.value = null;
  }
}

async function markIssued(id: string) {
  if (!confirm("이 세금계산서를 발행 완료로 처리하시겠습니까?\n(이메일 발송은 별도)")) return;
  await setStatus(id, "ISSUED");
}

async function reject(id: string) {
  const reason = prompt("거절 사유를 입력해주세요:");
  if (!reason) return;
  await setStatus(id, "REJECTED", reason);
}

async function revert(id: string) {
  if (!confirm("처리 상태를 '발행 대기'로 되돌리시겠습니까?")) return;
  await setStatus(id, "REQUESTED");
}

function copyToClipboard(text: string) {
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

const STATUS_LABEL: Record<Item["status"], string> = {
  REQUESTED: "발행 대기",
  ISSUED: "발행 완료",
  REJECTED: "발행 거절",
};
const STATUS_STYLE: Record<Item["status"], string> = {
  REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
  ISSUED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};
</script>

<template>
  <div>
    <!-- 카운터 -->
    <section class="grid gap-3 sm:grid-cols-3">
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'REQUESTED' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'REQUESTED'"
      >
        <p class="text-xs text-neutral-500">발행 대기</p>
        <p class="mt-1 font-display text-2xl text-amber-700">{{ data?.summary.requested ?? 0 }}</p>
      </button>
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'ISSUED' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'ISSUED'"
      >
        <p class="text-xs text-neutral-500">발행 완료</p>
        <p class="mt-1 font-display text-2xl text-emerald-700">{{ data?.summary.issued ?? 0 }}</p>
      </button>
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'REJECTED' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'REJECTED'"
      >
        <p class="text-xs text-neutral-500">발행 거절</p>
        <p class="mt-1 font-display text-2xl text-rose-700">{{ data?.summary.rejected ?? 0 }}</p>
      </button>
    </section>

    <!-- 필터 + 액션 -->
    <section class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="f in [{v:'all',l:'전체'},{v:'REQUESTED',l:'대기'},{v:'ISSUED',l:'완료'},{v:'REJECTED',l:'거절'}]"
          :key="f.v"
          type="button"
          :class="['rounded-full px-3 py-1.5 text-xs transition', filter === f.v ? 'bg-neutral-900 text-white' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400']"
          @click="filter = f.v as typeof filter"
        >{{ f.l }}</button>
      </div>
      <button type="button" class="rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50" @click="refresh()">새로고침</button>
    </section>

    <!-- 안내 -->
    <section class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-xs text-blue-800">
      💡 세금계산서 발행은 <b>홈택스</b>(또는 더존/이지캐셔 등)에서 별도 진행. 발행 완료 후 "발행 완료" 처리하세요.
    </section>

    <!-- 목록 -->
    <section class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div v-if="pending" class="px-6 py-12 text-center text-sm text-neutral-500">불러오는 중…</div>
      <div v-else-if="(data?.items ?? []).length === 0" class="px-6 py-12 text-center text-sm text-neutral-500">
        해당 조건의 신청이 없습니다.
      </div>
      <ul v-else class="divide-y divide-neutral-100">
        <li v-for="r in data?.items ?? []" :key="r.id" class="px-5 py-4">
          <!-- 요약 행 -->
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                <span>{{ new Date(r.requestedAt).toLocaleString("ko-KR", { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                <span>·</span>
                <NuxtLink :to="`/orders/${r.order.orderNumber}`" class="font-mono text-indigo-600 hover:underline">{{ r.order.orderNumber }}</NuxtLink>
                <span>·</span>
                <span>{{ formatPrice(r.order.finalAmount) }}</span>
              </div>
              <p class="mt-1 text-sm text-neutral-900">
                <b>{{ r.companyName }}</b>
                <span class="ml-2 font-mono text-xs text-neutral-600">{{ r.bizRegNo }}</span>
              </p>
              <p class="text-xs text-neutral-500">
                대표 {{ r.ceoName }} · {{ r.user.name }} ({{ r.user.email }})
              </p>
            </div>
            <span :class="['shrink-0 rounded-full border px-2.5 py-1 text-[11px]', STATUS_STYLE[r.status]]">
              {{ STATUS_LABEL[r.status] }}
            </span>
          </div>

          <!-- 펼치기 -->
          <button
            type="button"
            class="mt-2 text-[11px] text-indigo-600 hover:underline"
            @click="expandedId = expandedId === r.id ? null : r.id"
          >{{ expandedId === r.id ? '접기 ▴' : '상세 정보 ▾' }}</button>

          <div v-if="expandedId === r.id" class="mt-3 space-y-3 rounded-xl bg-neutral-50 p-4 text-xs">
            <dl class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div><dt class="text-neutral-500">상호</dt><dd class="text-neutral-900">{{ r.companyName }}</dd></div>
              <div><dt class="text-neutral-500">사업자등록번호</dt><dd class="font-mono text-neutral-900">{{ r.bizRegNo }}</dd></div>
              <div><dt class="text-neutral-500">대표자</dt><dd class="text-neutral-900">{{ r.ceoName }}</dd></div>
              <div><dt class="text-neutral-500">수신 이메일</dt><dd class="break-all text-neutral-900">{{ r.taxEmail }}</dd></div>
              <div class="sm:col-span-2"><dt class="text-neutral-500">주소</dt><dd class="text-neutral-900">{{ r.address }}</dd></div>
              <div v-if="r.businessType"><dt class="text-neutral-500">업태</dt><dd class="text-neutral-900">{{ r.businessType }}</dd></div>
              <div v-if="r.businessItem"><dt class="text-neutral-500">종목</dt><dd class="text-neutral-900">{{ r.businessItem }}</dd></div>
              <div v-if="r.order.paidAt"><dt class="text-neutral-500">결제 일시</dt><dd class="text-neutral-900">{{ new Date(r.order.paidAt).toLocaleString('ko-KR') }}</dd></div>
              <div v-if="r.issuedAt"><dt class="text-neutral-500">발행 일시</dt><dd class="text-neutral-900">{{ new Date(r.issuedAt).toLocaleString('ko-KR') }}</dd></div>
            </dl>
            <p v-if="r.rejectReason" class="rounded-lg bg-rose-50 p-2 text-rose-700">반려 사유: {{ r.rejectReason }}</p>

            <!-- 빠른 복사 -->
            <div class="flex flex-wrap gap-2">
              <button type="button" class="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] hover:bg-neutral-50" @click="copyToClipboard(r.bizRegNo)">사업자번호 복사</button>
              <button type="button" class="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] hover:bg-neutral-50" @click="copyToClipboard(`${r.companyName}\n${r.bizRegNo}\n${r.ceoName}\n${r.address}\n${r.taxEmail}\n${formatPrice(r.order.finalAmount)}`)">전체 정보 복사</button>
            </div>

            <!-- 액션 -->
            <div class="flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
              <button
                v-if="r.status === 'REQUESTED'"
                type="button"
                :disabled="updating === r.id"
                class="rounded-full bg-emerald-600 px-4 py-2 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                @click="markIssued(r.id)"
              >✓ 발행 완료 처리</button>
              <button
                v-if="r.status === 'REQUESTED'"
                type="button"
                :disabled="updating === r.id"
                class="rounded-full bg-rose-100 px-4 py-2 text-xs text-rose-700 hover:bg-rose-200 disabled:opacity-50"
                @click="reject(r.id)"
              >✗ 거절</button>
              <button
                v-if="r.status !== 'REQUESTED'"
                type="button"
                :disabled="updating === r.id"
                class="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                @click="revert(r.id)"
              >↺ 대기로 되돌리기</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <p class="mt-4 text-[11px] text-neutral-400">
      💡 신청 정보 전체 복사 → 홈택스에서 직접 발행 → "발행 완료" 처리 흐름을 권장합니다.
    </p>
  </div>
</template>
