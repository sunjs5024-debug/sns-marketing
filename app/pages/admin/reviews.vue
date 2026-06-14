<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "리뷰 관리", robots: "noindex, nofollow" });

type Item = {
  id: string;
  rating: number;
  content: string;
  isVerified: boolean;
  rejectedAt: string | null;
  adminMemo: string | null;
  createdAt: string;
  user: { email: string; name: string };
  product: { name: string; slug: string };
  order: { orderNumber: string };
};
type Resp = {
  items: Item[];
  summary: { pending: number; approved: number; rejected: number };
};

const filter = ref<"pending" | "approved" | "rejected" | "all">("pending");
const { data, refresh, pending } = await useFetch<Resp>(() => `/api/admin/reviews?status=${filter.value}`);

const updating = ref<string | null>(null);

async function approve(id: string) {
  if (!confirm("이 리뷰를 승인하시겠습니까? (공개 후기 페이지에 노출됩니다)")) return;
  updating.value = id;
  try {
    await $fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      body: { action: "approve" },
    });
    await refresh();
  } catch (e) {
    console.error(e);
    alert("처리 실패");
  } finally {
    updating.value = null;
  }
}

async function reject(id: string) {
  const reason = prompt("거절 사유 (선택):") ?? "";
  updating.value = id;
  try {
    await $fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      body: { action: "reject", adminMemo: reason || "관리자 거절" },
    });
    await refresh();
  } catch (e) {
    console.error(e);
    alert("처리 실패");
  } finally {
    updating.value = null;
  }
}

function statusOf(it: Item): "pending" | "approved" | "rejected" {
  if (it.rejectedAt) return "rejected";
  if (it.isVerified) return "approved";
  return "pending";
}

const STATUS_LABEL = { pending: "승인 대기", approved: "승인됨", rejected: "거절됨" } as const;
const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
} as const;
</script>

<template>
  <div>
    <!-- 카운터 -->
    <section class="grid gap-3 sm:grid-cols-3">
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'pending' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'pending'"
      >
        <p class="text-xs text-neutral-500">승인 대기</p>
        <p class="mt-1 font-display text-2xl text-amber-600">{{ data?.summary.pending ?? 0 }}</p>
      </button>
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'approved' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'approved'"
      >
        <p class="text-xs text-neutral-500">승인됨 (공개)</p>
        <p class="mt-1 font-display text-2xl text-emerald-600">{{ data?.summary.approved ?? 0 }}</p>
      </button>
      <button
        type="button"
        :class="['rounded-2xl border bg-white p-5 text-left transition', filter === 'rejected' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-neutral-200 hover:border-neutral-400']"
        @click="filter = 'rejected'"
      >
        <p class="text-xs text-neutral-500">거절됨</p>
        <p class="mt-1 font-display text-2xl text-rose-600">{{ data?.summary.rejected ?? 0 }}</p>
      </button>
    </section>

    <div class="mt-4 flex items-center justify-between">
      <h1 class="font-display text-xl text-neutral-900">리뷰 관리</h1>
      <button
        type="button"
        class="text-xs text-indigo-600 hover:underline"
        :class="filter === 'all' ? 'font-medium' : ''"
        @click="filter = 'all'"
      >전체 보기</button>
    </div>

    <!-- 리스트 -->
    <section class="mt-3 rounded-3xl border border-neutral-100 bg-white">
      <div v-if="pending" class="p-12 text-center text-sm text-neutral-400">불러오는 중…</div>
      <div v-else-if="!data?.items.length" class="p-12 text-center text-sm text-neutral-500">
        해당 상태의 리뷰가 없습니다.
      </div>
      <ul v-else class="divide-y divide-neutral-100">
        <li v-for="it in data.items" :key="it.id" class="p-5">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <!-- 좌측: 메타 -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>{{ new Date(it.createdAt).toLocaleString("ko-KR") }}</span>
                <span>·</span>
                <span class="font-mono">{{ it.order.orderNumber }}</span>
                <span>·</span>
                <span>{{ it.user.email }}</span>
                <span :class="['rounded-full border px-2 py-0.5 text-[10px]', STATUS_STYLE[statusOf(it)]]">
                  {{ STATUS_LABEL[statusOf(it)] }}
                </span>
              </div>
              <p class="mt-2 text-sm text-neutral-700">
                <NuxtLink :to="`/sns/${it.product.slug.split('-')[0]}`" class="text-xs text-indigo-600 hover:underline">{{ it.product.name }}</NuxtLink>
              </p>
              <div class="mt-2 text-amber-500">{{ "★".repeat(it.rating) }}<span class="text-neutral-200">{{ "★".repeat(5 - it.rating) }}</span></div>
              <p class="mt-2 whitespace-pre-line rounded-xl bg-neutral-50 px-3 py-2.5 text-[13px] leading-6 text-neutral-800">{{ it.content }}</p>
              <p v-if="it.adminMemo" class="mt-2 text-[11px] text-neutral-500">📝 관리자 메모: {{ it.adminMemo }}</p>
            </div>
            <!-- 우측: 액션 -->
            <div class="flex shrink-0 flex-col gap-1.5">
              <button
                v-if="!it.isVerified"
                type="button"
                :disabled="updating === it.id"
                class="rounded-full bg-emerald-600 px-4 py-1.5 text-xs text-white hover:bg-emerald-700 disabled:opacity-40"
                @click="approve(it.id)"
              >✓ 승인</button>
              <button
                v-if="!it.rejectedAt"
                type="button"
                :disabled="updating === it.id"
                class="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                @click="reject(it.id)"
              >✕ 거절</button>
              <NuxtLink
                :to="`/orders/${it.order.orderNumber}`"
                target="_blank"
                class="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-center text-xs text-neutral-700 hover:bg-neutral-50"
              >주문 보기</NuxtLink>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
