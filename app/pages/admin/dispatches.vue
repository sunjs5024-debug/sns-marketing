<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "발주 현황", robots: "noindex, nofollow" });

type DispatchItem = {
  id: string;
  productName: string;
  optionLabel: string | null;
  quantity: number;
  targetUrl: string | null;
  externalProvider: string | null;
  externalServiceId: number | null;
  externalOrderId: string | null;
  externalStatus: string | null;
  externalCharge: number | null;
  startCount: number | null;
  remainsCount: number | null;
  dispatchedAt: string | null;
  dispatchedAttempts: number;
  dispatchError: string | null;
  lastSyncedAt: string | null;
  order: { orderNumber: string; status: string; depositorName: string | null; createdAt: string };
};
type Resp = { items: DispatchItem[]; counts: { pending: number; failed: number; completed: number } };

const filter = ref<"all" | "pending" | "failed" | "completed">("all");
const { data, refresh, pending } = await useFetch<Resp>(() => `/api/admin/dispatches?filter=${filter.value}`);

const syncing = ref(false);
async function syncNow() {
  syncing.value = true;
  try {
    await $fetch("/api/admin/urpanel/sync-now", { method: "POST" });
    await refresh();
  } catch (e) {
    console.error(e);
    alert("동기화 실패");
  } finally {
    syncing.value = false;
  }
}

const retrying = ref<string | null>(null);
async function retryDispatch(orderNumber: string, orderItemId: string) {
  retrying.value = orderItemId;
  try {
    await $fetch(`/api/admin/orders/${orderNumber}/dispatch`, {
      method: "POST",
      body: { resetAttempts: true },
    });
    await refresh();
  } catch (e) {
    console.error(e);
    alert("재시도 실패");
  } finally {
    retrying.value = null;
  }
}

function statusKr(s: string | null): string {
  if (!s) return "—";
  switch (s) {
    case "Pending": return "대기";
    case "In progress":
    case "Processing": return "작업 중";
    case "Completed": return "완료";
    case "Partial": return "부분";
    case "Cancelled": return "취소";
    default: return s;
  }
}
function statusStyle(s: string | null): string {
  switch (s) {
    case "Completed": return "bg-emerald-50 text-emerald-700";
    case "In progress":
    case "Processing": return "bg-blue-50 text-blue-700";
    case "Partial": return "bg-amber-50 text-amber-700";
    case "Cancelled": return "bg-rose-50 text-rose-700";
    case "Pending": return "bg-neutral-100 text-neutral-600";
    default: return "bg-neutral-50 text-neutral-500";
  }
}
</script>

<template>
  <div>
    <!-- 카운터 -->
    <section class="grid gap-3 sm:grid-cols-3">
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'pending' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'pending'"
      >
        <p class="text-xs text-neutral-500">진행 중</p>
        <p class="mt-1 font-display text-2xl text-blue-700">{{ data?.counts.pending ?? 0 }}</p>
      </button>
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'failed' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'failed'"
      >
        <p class="text-xs text-neutral-500">발주 실패 (재시도 필요)</p>
        <p class="mt-1 font-display text-2xl text-rose-700">{{ data?.counts.failed ?? 0 }}</p>
      </button>
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'completed'"
      >
        <p class="text-xs text-neutral-500">완료</p>
        <p class="mt-1 font-display text-2xl text-emerald-700">{{ data?.counts.completed ?? 0 }}</p>
      </button>
    </section>

    <!-- 필터 + 액션 -->
    <section class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="f in [{v:'all',l:'전체'},{v:'pending',l:'진행 중'},{v:'failed',l:'실패'},{v:'completed',l:'완료'}]"
          :key="f.v"
          type="button"
          :class="['rounded-full px-3 py-1.5 text-xs transition', filter === f.v ? 'bg-neutral-900 text-white' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400']"
          @click="filter = f.v as 'all' | 'pending' | 'failed' | 'completed'"
        >{{ f.l }}</button>
      </div>
      <div class="flex gap-2">
        <button type="button" class="rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50" @click="refresh()">새로고침</button>
        <button
          type="button"
          :disabled="syncing"
          class="rounded-full bg-neutral-900 px-4 py-1.5 text-xs text-white hover:bg-neutral-700 disabled:opacity-60"
          @click="syncNow"
        >{{ syncing ? "동기화 중…" : "지금 동기화" }}</button>
      </div>
    </section>

    <!-- 테이블 -->
    <section class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div v-if="pending" class="px-6 py-12 text-center text-sm text-neutral-500">불러오는 중…</div>
      <div v-else-if="(data?.items ?? []).length === 0" class="px-6 py-12 text-center text-sm text-neutral-500">
        표시할 발주가 없습니다.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead class="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th class="px-3 py-2 text-left">주문번호</th>
              <th class="px-3 py-2 text-left">상품/옵션</th>
              <th class="px-3 py-2 text-left">대상 URL</th>
              <th class="px-3 py-2 text-right">진행률</th>
              <th class="px-3 py-2 text-center">상태</th>
              <th class="px-3 py-2 text-left">urpanel ID</th>
              <th class="px-3 py-2 text-center">조치</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="it in data?.items ?? []" :key="it.id" class="hover:bg-neutral-50">
              <td class="px-3 py-3 align-top">
                <NuxtLink :to="`/orders/${it.order.orderNumber}`" class="font-mono text-xs text-indigo-600 hover:underline">
                  {{ it.order.orderNumber }}
                </NuxtLink>
                <p class="mt-0.5 text-[10px] text-neutral-400">{{ new Date(it.order.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</p>
              </td>
              <td class="px-3 py-3 align-top">
                <p class="text-neutral-900">{{ it.productName }}</p>
                <p class="text-[11px] text-neutral-500">{{ it.optionLabel ?? '기본' }} · {{ it.quantity.toLocaleString('ko-KR') }}개</p>
              </td>
              <td class="px-3 py-3 align-top">
                <a v-if="it.targetUrl" :href="it.targetUrl" target="_blank" rel="noopener" class="truncate inline-block max-w-[200px] text-xs text-indigo-600 hover:underline">{{ it.targetUrl }}</a>
                <span v-else class="text-xs text-rose-500">없음</span>
              </td>
              <td class="px-3 py-3 text-right align-top">
                <span v-if="typeof it.remainsCount === 'number'" class="font-mono text-xs">
                  {{ Math.round(((it.quantity - it.remainsCount) / it.quantity) * 100) }}%
                </span>
                <span v-else class="text-xs text-neutral-400">—</span>
              </td>
              <td class="px-3 py-3 text-center align-top">
                <span v-if="it.externalOrderId" :class="['rounded-full px-2 py-0.5 text-[11px]', statusStyle(it.externalStatus)]">
                  {{ statusKr(it.externalStatus) }}
                </span>
                <span v-else class="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                  실패 ({{ it.dispatchedAttempts }}회)
                </span>
              </td>
              <td class="px-3 py-3 align-top">
                <span v-if="it.externalOrderId" class="font-mono text-xs text-neutral-600">#{{ it.externalOrderId }}</span>
                <p v-if="it.externalServiceId" class="text-[10px] text-neutral-400">svc {{ it.externalServiceId }}</p>
              </td>
              <td class="px-3 py-3 text-center align-top">
                <button
                  v-if="!it.externalOrderId"
                  type="button"
                  :disabled="retrying === it.id"
                  class="whitespace-nowrap rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                  @click="retryDispatch(it.order.orderNumber, it.id)"
                  :title="it.dispatchError ?? '재시도'"
                >{{ retrying === it.id ? '...' : '재시도' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="mt-4 text-[11px] text-neutral-400">
      💡 cron이 5분마다 자동 동기화합니다. "지금 동기화"는 즉시 갱신용. 실패 행에 마우스 올리면 에러 메시지 확인 가능.
    </p>
  </div>
</template>
