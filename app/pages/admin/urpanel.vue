<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "urpanel 연동", robots: "noindex, nofollow" });

type Service = {
  service: number | string;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
};
type BalanceResp = { ok: boolean; balance?: string; currency?: string; error?: string };
type ServicesResp = { ok: boolean; total?: number; count?: number; services: Service[]; error?: string };

const search = ref("");
const platform = ref<string>("");

const { data: balance, refresh: refreshBalance } = await useFetch<BalanceResp>("/api/admin/urpanel/balance");

const query = computed(() => {
  const p = new URLSearchParams();
  if (search.value.trim()) p.set("q", search.value.trim());
  if (platform.value) p.set("platform", platform.value);
  return p.toString();
});

const { data: services, refresh: refreshServices, pending } = await useFetch<ServicesResp>(() =>
  `/api/admin/urpanel/services${query.value ? `?${query.value}` : ""}`,
);

const PLATFORMS = [
  { v: "", label: "전체" },
  { v: "instagram", label: "Instagram" },
  { v: "youtube", label: "YouTube" },
  { v: "tiktok", label: "TikTok" },
  { v: "facebook", label: "Facebook" },
  { v: "twitter", label: "Twitter/X" },
  { v: "telegram", label: "Telegram" },
  { v: "threads", label: "Threads" },
  { v: "spotify", label: "Spotify" },
];

// USD → KRW 환산 (고정 환율, 추후 실시간 API 가능)
const USD_TO_KRW = 1400;
function usdToKrw(usd: string | number): number {
  const n = typeof usd === "string" ? parseFloat(usd) : usd;
  return Math.round((isNaN(n) ? 0 : n) * USD_TO_KRW);
}

// 복사
const copiedId = ref<string | null>(null);
async function copyServiceId(id: string | number) {
  if (import.meta.client && navigator.clipboard) {
    await navigator.clipboard.writeText(String(id));
    copiedId.value = String(id);
    setTimeout(() => {
      if (copiedId.value === String(id)) copiedId.value = null;
    }, 1500);
  }
}
</script>

<template>
  <div>
    <!-- 도구 안내 -->
    <div class="mb-4 grid gap-3 sm:grid-cols-2">
      <NuxtLink
        to="/admin/urpanel-auto-map"
        class="flex items-center justify-between rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50 px-5 py-4 transition hover:from-indigo-100 hover:to-pink-100"
      >
        <div>
          <p class="text-sm text-indigo-900">🤖 자동 매핑 제안</p>
          <p class="mt-0.5 text-xs text-indigo-700">미매핑 상품에 urpanel 서비스 자동 추천</p>
        </div>
        <span class="text-indigo-600">→</span>
      </NuxtLink>
      <NuxtLink
        to="/admin/price-optimizer"
        class="flex items-center justify-between rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-4 transition hover:from-emerald-100 hover:to-cyan-100"
      >
        <div>
          <p class="text-sm text-emerald-900">💰 가격 최적화</p>
          <p class="mt-0.5 text-xs text-emerald-700">원가 기반 가격 일괄 조정 + 마진 확인</p>
        </div>
        <span class="text-emerald-600">→</span>
      </NuxtLink>
    </div>

    <!-- 잔액 카드 -->
    <section class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl border border-neutral-200 bg-white p-5">
        <p class="text-xs text-neutral-500">urpanel 잔액</p>
        <div v-if="balance?.ok" class="mt-1">
          <p class="font-display text-2xl text-neutral-900">${{ balance.balance }}</p>
          <p class="mt-0.5 text-xs text-neutral-500">≈ {{ usdToKrw(balance.balance ?? '0').toLocaleString('ko-KR') }}원 (환율 {{ USD_TO_KRW }})</p>
        </div>
        <p v-else class="mt-2 text-xs text-rose-600">{{ balance?.error ?? '조회 실패' }}</p>
        <button
          type="button"
          class="mt-3 rounded-md border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50"
          @click="refreshBalance()"
        >새로고침</button>
      </div>

      <div class="rounded-2xl border border-neutral-200 bg-white p-5">
        <p class="text-xs text-neutral-500">서비스 총 개수</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">
          {{ services?.total?.toLocaleString('ko-KR') ?? '—' }}
        </p>
        <p class="mt-0.5 text-xs text-neutral-500">필터 결과 {{ services?.count?.toLocaleString('ko-KR') ?? 0 }}건 표시</p>
      </div>

      <div class="rounded-2xl border border-neutral-200 bg-white p-5">
        <p class="text-xs text-neutral-500">API 연결 상태</p>
        <p v-if="balance?.ok" class="mt-1 inline-flex items-center gap-1.5 text-sm text-emerald-700">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
          연결됨
        </p>
        <p v-else class="mt-1 inline-flex items-center gap-1.5 text-sm text-rose-700">
          <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          연결 실패
        </p>
        <p class="mt-2 text-[11px] text-neutral-400">URPANEL_API_KEY 환경변수 확인</p>
      </div>
    </section>

    <!-- 필터 -->
    <section class="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="search"
          type="text"
          placeholder="서비스명/카테고리 검색 (예: Korean, Followers)"
          class="flex-1 min-w-[200px] rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          @keydown.enter="refreshServices()"
        />
        <select
          v-model="platform"
          class="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
        >
          <option v-for="p in PLATFORMS" :key="p.v" :value="p.v">{{ p.label }}</option>
        </select>
        <button
          type="button"
          class="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm text-white hover:bg-neutral-700"
          @click="refreshServices()"
        >검색</button>
      </div>
    </section>

    <!-- 서비스 목록 -->
    <section class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div v-if="pending" class="px-6 py-12 text-center text-sm text-neutral-500">불러오는 중…</div>

      <div v-else-if="!services?.ok" class="px-6 py-12 text-center text-sm text-rose-600">
        {{ services?.error ?? '서비스 목록 조회 실패' }}
      </div>

      <div v-else-if="(services?.services ?? []).length === 0" class="px-6 py-12 text-center text-sm text-neutral-500">
        검색 결과 없음
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead class="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th class="px-4 py-2.5 text-left">ID</th>
              <th class="px-4 py-2.5 text-left">카테고리</th>
              <th class="px-4 py-2.5 text-left">서비스명</th>
              <th class="px-4 py-2.5 text-right">단가 (per 1000)</th>
              <th class="px-4 py-2.5 text-right">min ~ max</th>
              <th class="px-4 py-2.5 text-center"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="s in services?.services ?? []" :key="s.service" class="hover:bg-neutral-50">
              <td class="px-4 py-3 font-mono text-xs text-neutral-700">{{ s.service }}</td>
              <td class="px-4 py-3 text-xs text-neutral-500">{{ s.category }}</td>
              <td class="px-4 py-3 text-neutral-900">{{ s.name }}</td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-neutral-900">${{ s.rate }}</span>
                <span class="ml-1 text-[11px] text-neutral-400">≈ {{ usdToKrw(s.rate).toLocaleString('ko-KR') }}원</span>
              </td>
              <td class="px-4 py-3 text-right font-mono text-xs text-neutral-500">
                {{ Number(s.min).toLocaleString('ko-KR') }} ~ {{ Number(s.max).toLocaleString('ko-KR') }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-center">
                <button
                  type="button"
                  class="whitespace-nowrap rounded-md border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50"
                  @click="copyServiceId(s.service)"
                >{{ copiedId === String(s.service) ? '✓ 복사됨' : 'ID 복사' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="mt-4 text-[11px] text-neutral-400">
      💡 환율은 1 USD = {{ USD_TO_KRW.toLocaleString('ko-KR') }}원 고정 환산.
      서비스 ID를 복사해서 상품관리에서 매핑하면 자동 발주 가능.
    </p>
  </div>
</template>
