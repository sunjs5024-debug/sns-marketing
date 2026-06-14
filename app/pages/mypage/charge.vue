<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "포인트 충전", robots: "noindex, nofollow" });

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
};
type BankInfo = { bank: string; accountNumber: string; accountHolder: string };

const STATUS_META: Record<
  Charge["status"],
  { label: string; chip: string; dot: string }
> = {
  PENDING: { label: "입금 대기", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  APPROVED: { label: "승인 완료", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "반려", chip: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  EXPIRED: { label: "만료", chip: "bg-neutral-100 text-neutral-500", dot: "bg-neutral-400" },
};

const QUICK_AMOUNTS = [10000, 30000, 50000, 100000, 300000, 500000];

const amount = ref<number>(10000);
const depositorName = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);
const lastResult = ref<{ charge: Charge; bankInfo: BankInfo } | null>(null);
const copiedKey = ref<string | null>(null);

const { data: charges, refresh } = await useFetch<Charge[]>("/api/charge/my", {
  default: () => [],
});

async function submit() {
  error.value = null;
  if (amount.value < 1) { error.value = "충전 금액을 입력해주세요."; return; }
  if (!depositorName.value.trim()) { error.value = "입금자명을 입력해주세요."; return; }
  submitting.value = true;
  try {
    const res = await $fetch<{ charge: Charge; bankInfo: BankInfo }>("/api/charge/request", {
      method: "POST",
      body: { amount: amount.value, depositorName: depositorName.value.trim() },
    });
    lastResult.value = res;
    await refresh();
    if (import.meta.client) {
      nextTick(() => {
        document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    error.value = err.data?.statusMessage ?? err.statusMessage ?? "충전 신청에 실패했습니다.";
  } finally {
    submitting.value = false;
  }
}

async function copyText(key: string, text: string) {
  if (import.meta.client && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    copiedKey.value = key;
    setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = null;
    }, 1500);
  }
}

function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "만료";
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hrs > 0) return `${hrs}시간 ${mins}분 남음`;
  return `${mins}분 남음`;
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 pt-10 pb-20 sm:px-6">
    <!-- 헤더 -->
    <header>
      <h1 class="font-display text-2xl text-neutral-900">포인트 충전</h1>
      <p class="mt-1.5 text-sm text-neutral-500">계좌이체 후 입금 SMS가 도착하면 자동으로 승인됩니다.</p>
    </header>

    <!-- 신청 직후 안내 카드 -->
    <section
      v-if="lastResult"
      id="result-card"
      class="mt-8 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs text-white">✓</span>
          <h2 class="text-base text-neutral-900">신청 완료</h2>
        </div>
        <span class="font-mono text-[11px] text-neutral-400">{{ lastResult.charge.chargeNumber }}</span>
      </div>

      <p class="mt-4 text-sm text-neutral-600">
        아래 계좌로 <b class="text-neutral-900">정확한 금액</b>과 <b class="text-neutral-900">입금자명</b>으로 송금해주세요.
      </p>

      <dl class="mt-5 divide-y divide-neutral-100 rounded-xl border border-neutral-100 text-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">은행</dt>
          <dd class="text-neutral-900">{{ lastResult.bankInfo.bank }}</dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">계좌번호</dt>
          <dd class="flex items-center gap-2">
            <span class="font-mono text-neutral-900">{{ lastResult.bankInfo.accountNumber }}</span>
            <button
              type="button"
              class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              @click="copyText('acc', lastResult.bankInfo.accountNumber)"
            >{{ copiedKey === 'acc' ? '복사됨' : '복사' }}</button>
          </dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">예금주</dt>
          <dd class="text-neutral-900">{{ lastResult.bankInfo.accountHolder }}</dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">금액</dt>
          <dd class="flex items-center gap-2">
            <span class="font-display text-base text-neutral-900">{{ formatPrice(lastResult.charge.amount) }}</span>
            <button
              type="button"
              class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              @click="copyText('amt', lastResult.charge.amount.toString())"
            >{{ copiedKey === 'amt' ? '복사됨' : '복사' }}</button>
          </dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-neutral-500">입금자명</dt>
          <dd class="flex items-center gap-2">
            <span class="font-display text-base text-neutral-900">{{ lastResult.charge.depositorName }}</span>
            <button
              type="button"
              class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              @click="copyText('dep', lastResult.charge.depositorName)"
            >{{ copiedKey === 'dep' ? '복사됨' : '복사' }}</button>
          </dd>
        </div>
      </dl>

      <p class="mt-4 text-xs text-neutral-500">
        {{ timeLeft(lastResult.charge.expiresAt) }} · 24시간 내 미입금 시 자동 만료
      </p>

      <button
        type="button"
        class="mt-5 w-full rounded-xl border border-neutral-200 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
        @click="lastResult = null"
      >새 충전 신청</button>
    </section>

    <!-- 신청 폼 -->
    <section v-else class="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
      <Transition name="fade">
        <p v-if="error" class="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ error }}</p>
      </Transition>

      <!-- 금액 -->
      <label class="block">
        <span class="text-xs text-neutral-500">충전 금액</span>
        <div class="relative mt-1.5">
          <input
            v-model.number="amount"
            type="number"
            min="1"
            required
            class="block w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
            placeholder="10,000"
          />
          <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">원</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="v in QUICK_AMOUNTS"
            :key="v"
            type="button"
            :class="[
              'rounded-md border px-2.5 py-1 text-xs transition',
              amount === v
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-400',
            ]"
            @click="amount = v"
          >+{{ v.toLocaleString('ko-KR') }}</button>
        </div>
      </label>

      <!-- 입금자명 -->
      <label class="mt-5 block">
        <span class="text-xs text-neutral-500">입금자명</span>
        <input
          v-model="depositorName"
          type="text"
          required
          maxlength="20"
          class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
          placeholder="실제 이체할 때 사용할 이름"
        />
        <span class="mt-1.5 block text-[11px] text-neutral-400">
          한 글자라도 다르면 자동 매칭이 안 됩니다.
        </span>
      </label>

      <!-- 제출 -->
      <button
        type="button"
        :disabled="submitting || amount < 1 || !depositorName.trim()"
        class="mt-6 w-full rounded-xl bg-neutral-900 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        @click="submit"
      >
        <span v-if="submitting" class="inline-flex items-center gap-2">
          <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          신청 중…
        </span>
        <span v-else>충전 신청</span>
      </button>
    </section>

    <!-- 충전 내역 -->
    <section class="mt-10">
      <div class="flex items-baseline justify-between">
        <h2 class="text-sm text-neutral-900">충전 내역</h2>
        <span class="text-[11px] text-neutral-400">최근 30건</span>
      </div>

      <div class="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <ul v-if="(charges ?? []).length > 0" class="divide-y divide-neutral-100">
          <li
            v-for="c in charges ?? []"
            :key="c.id"
            class="px-5 py-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 text-[11px] text-neutral-400">
                  <span>{{ new Date(c.createdAt).toLocaleString("ko-KR", { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                  <span>·</span>
                  <span class="font-mono">{{ c.chargeNumber }}</span>
                </div>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="font-display text-base text-neutral-900">{{ formatPrice(c.amount) }}</span>
                  <span class="text-xs text-neutral-500">· {{ c.depositorName }}</span>
                </div>
                <p v-if="c.status === 'PENDING'" class="mt-0.5 text-[11px] text-amber-700">
                  {{ timeLeft(c.expiresAt) }}
                </p>
                <p v-else-if="c.status === 'APPROVED' && c.approvedAt" class="mt-0.5 text-[11px] text-emerald-700">
                  {{ new Date(c.approvedAt).toLocaleString("ko-KR", { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }} 자동 승인
                </p>
                <p v-else-if="c.status === 'REJECTED' && c.rejectReason" class="mt-0.5 text-[11px] text-rose-600">
                  {{ c.rejectReason }}
                </p>
              </div>
              <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px]', STATUS_META[c.status].chip]">
                <span :class="['h-1.5 w-1.5 rounded-full', STATUS_META[c.status].dot]"></span>
                {{ STATUS_META[c.status].label }}
              </span>
            </div>
          </li>
        </ul>
        <div v-else class="px-6 py-14 text-center">
          <p class="text-sm text-neutral-500">아직 충전 내역이 없습니다.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
