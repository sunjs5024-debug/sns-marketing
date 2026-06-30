<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["admin"] });

type Charge = {
  id: string;
  chargeNumber: string;
  amount: number;
  depositorName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  bankReceivedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  expiresAt: string;
  createdAt: string;
  user: { id: string; name: string; email: string; points: number };
};

const STATUS_LABEL: Record<Charge["status"], string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  EXPIRED: "만료",
};
const STATUS_COLOR: Record<Charge["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  EXPIRED: "bg-neutral-200 text-neutral-600 border-neutral-300",
};

const { data: charges, refresh } = await useFetch<Charge[]>("/api/admin/charges", {
  default: () => [],
});

const filter = ref<Charge["status"] | "ALL">("ALL");
const search = ref("");
const filtered = computed(() => {
  let list = charges.value ?? [];
  if (filter.value !== "ALL") list = list.filter((c) => c.status === filter.value);
  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter((c) =>
      c.chargeNumber.toLowerCase().includes(q) ||
      c.depositorName.toLowerCase().includes(q) ||
      c.user.name.toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q),
    );
  }
  return list;
});

const counts = computed(() => {
  const list = charges.value ?? [];
  return {
    pending: list.filter((c) => c.status === "PENDING").length,
    approved: list.filter((c) => c.status === "APPROVED").length,
    rejected: list.filter((c) => c.status === "REJECTED").length,
    expired: list.filter((c) => c.status === "EXPIRED").length,
    total: list.length,
  };
});

async function approve(id: string) {
  if (!confirm("이 충전 신청을 승인하시겠습니까? (사용자 잔액 즉시 반영)")) return;
  await $fetch(`/api/admin/charges/${id}/approve`, { method: "POST" });
  await refresh();
}

async function reject(id: string) {
  const reason = prompt("반려 사유 (선택)") ?? "관리자 반려";
  if (!confirm("정말 반려하시겠습니까?")) return;
  await $fetch(`/api/admin/charges/${id}/reject`, { method: "POST", body: { reason } });
  await refresh();
}
</script>

<template>
  <div>
    <div class="grid gap-3 sm:grid-cols-4">
      <div class="rounded-3xl border border-amber-100 bg-amber-50 p-4">
        <p class="text-xs text-amber-700">대기</p>
        <p class="mt-1 font-display text-2xl text-amber-900">{{ counts.pending }}</p>
      </div>
      <div class="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-xs text-emerald-700">승인</p>
        <p class="mt-1 font-display text-2xl text-emerald-900">{{ counts.approved }}</p>
      </div>
      <div class="rounded-3xl border border-rose-100 bg-rose-50 p-4">
        <p class="text-xs text-rose-700">반려</p>
        <p class="mt-1 font-display text-2xl text-rose-900">{{ counts.rejected }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-4">
        <p class="text-xs text-neutral-500">전체</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ counts.total }}</p>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <div class="flex gap-1">
        <button v-for="s in ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'] as const" :key="s"
          :class="[
            'rounded-full px-3 py-1.5 text-xs',
            filter === s ? 'bg-neutral-900 text-white' : 'border border-neutral-200 bg-white text-neutral-700',
          ]"
          @click="filter = s"
        >
          {{ s === 'ALL' ? '전체' : STATUS_LABEL[s as Charge['status']] }}
        </button>
      </div>
      <input v-model="search" type="search" placeholder="검색 (번호/입금자명/회원)" class="ml-auto w-72 rounded-full border border-neutral-200 px-4 py-1.5 text-sm focus:border-neutral-900 focus:outline-none" />
    </div>

    <div class="mt-4 rounded-3xl border border-neutral-100 bg-white">
      <ul class="divide-y divide-neutral-100">
        <li v-if="filtered.length === 0" class="p-12 text-center text-sm text-neutral-500">결과 없음</li>
        <li v-for="c in filtered" :key="c.id" class="px-5 py-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>{{ new Date(c.createdAt).toLocaleString("ko-KR") }}</span>
                <span>·</span>
                <span class="font-mono">{{ c.chargeNumber }}</span>
              </div>
              <p class="mt-1 text-sm text-neutral-900">
                <b class="text-base">{{ formatPrice(c.amount) }}</b>
                <span class="ml-3 text-neutral-500">입금자명: <b class="text-neutral-900">{{ c.depositorName }}</b></span>
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                회원: {{ c.user.name }} ({{ c.user.email }}) · 현재 잔액: {{ c.user.points.toLocaleString("ko-KR") }}원
              </p>
              <p v-if="c.status === 'APPROVED' && c.approvedAt" class="mt-1 text-xs text-emerald-700">
                ✓ {{ new Date(c.approvedAt).toLocaleString("ko-KR") }} 승인 ·
                <span v-if="c.bankReceivedAt">은행 입금: {{ new Date(c.bankReceivedAt).toLocaleString("ko-KR") }}</span>
              </p>
              <p v-if="c.status === 'REJECTED'" class="mt-1 text-xs text-rose-600">
                반려: {{ c.rejectReason ?? '-' }}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span :class="['rounded-full border px-2.5 py-1 text-[11px]', STATUS_COLOR[c.status]]">
                {{ STATUS_LABEL[c.status] }}
              </span>
              <div v-if="c.status === 'PENDING'" class="flex gap-1">
                <button type="button" class="rounded-full bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700" @click="approve(c.id)">승인</button>
                <button type="button" class="rounded-full border border-rose-300 bg-white px-3 py-1 text-xs text-rose-700 hover:bg-rose-50" @click="reject(c.id)">반려</button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
