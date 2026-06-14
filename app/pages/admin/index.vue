<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["admin"] });

type Stats = {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  completedOrders: number;
  revenue: number;
  userCount: number;
  productCount: number;
};
type TimeSeries = {
  period: "day" | "week" | "month";
  labels: string[];
  orderCounts: number[];
  revenues: number[];
};

const { data: stats } = await useFetch<Stats>("/api/admin/stats");

const period = ref<"day" | "week" | "month">("day");
const { data: series, refresh: refreshSeries } = await useFetch<TimeSeries>(
  "/api/admin/timeseries",
  { query: { period } },
);
watch(period, () => refreshSeries());

const periodLabel = computed(() =>
  period.value === "day" ? "최근 14일 (일별)" :
  period.value === "week" ? "최근 12주 (주별)" :
  "최근 12개월 (월별)",
);

// 차트 SVG 계산
const CHART_W = 700;
const CHART_H = 220;
const PAD_L = 50;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 28;
const plotW = computed(() => CHART_W - PAD_L - PAD_R);
const plotH = computed(() => CHART_H - PAD_T - PAD_B);

const maxRevenue = computed(() => Math.max(...(series.value?.revenues ?? [0]), 1));
const maxOrders = computed(() => Math.max(...(series.value?.orderCounts ?? [0]), 1));

function fmtKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;
  return n.toLocaleString("ko-KR");
}

const totalRangeRevenue = computed(() =>
  (series.value?.revenues ?? []).reduce((s, v) => s + v, 0),
);
const totalRangeOrders = computed(() =>
  (series.value?.orderCounts ?? []).reduce((s, v) => s + v, 0),
);

// 상품별 매출 TOP 10 + 최근 활동
type TopProduct = { productId: string; productName: string; orderCount: number; quantitySum: number; revenue: number };
type Activity = { type: "order" | "charge" | "signup"; at: string; title: string; detail: string; amount?: number; status?: string; link?: string };
const { data: topProducts } = await useFetch<TopProduct[]>("/api/admin/top-products");
const { data: activity } = await useFetch<Activity[]>("/api/admin/recent-activity");

const ACTIVITY_ICON: Record<Activity["type"], string> = {
  order: "🛒",
  charge: "💰",
  signup: "👤",
};
const ACTIVITY_COLOR: Record<Activity["type"], string> = {
  order: "bg-indigo-50 text-indigo-700",
  charge: "bg-emerald-50 text-emerald-700",
  signup: "bg-amber-50 text-amber-700",
};

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}
</script>

<template>
  <div v-if="stats" class="space-y-6">
    <!-- 통계 카드 -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">전체 주문</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.totalOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-amber-50 p-5">
        <p class="text-xs text-neutral-500">결제 대기</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.pendingOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-blue-50 p-5">
        <p class="text-xs text-neutral-500">결제 완료 (진행 포함)</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.paidOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-emerald-50 p-5">
        <p class="text-xs text-neutral-500">완료</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.completedOrders.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">누적 매출</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ formatPrice(stats.revenue) }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">회원 수</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.userCount.toLocaleString("ko-KR") }}</p>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-5">
        <p class="text-xs text-neutral-500">상품 수</p>
        <p class="mt-1 font-display text-2xl text-neutral-900">{{ stats.productCount.toLocaleString("ko-KR") }}</p>
      </div>
    </div>

    <!-- 통계 차트 -->
    <div class="rounded-3xl border border-neutral-100 bg-white p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-lg text-neutral-900">통계 추이</h2>
          <p class="mt-1 text-xs text-neutral-500">{{ periodLabel }} · 결제완료 이상 주문 기준 (환불은 매출에서 제외)</p>
        </div>
        <div class="inline-flex rounded-full bg-neutral-100 p-1 text-sm">
          <button
            v-for="opt in [{ v: 'day', label: '일' }, { v: 'week', label: '주' }, { v: 'month', label: '월' }] as const"
            :key="opt.v"
            type="button"
            :class="[
              'rounded-full px-4 py-1.5 transition',
              period === opt.v ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-200',
            ]"
            @click="period = opt.v"
          >{{ opt.label }}</button>
        </div>
      </div>

      <div v-if="series" class="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <!-- 매출 막대 차트 -->
        <div>
          <p class="mb-2 text-xs text-neutral-500">매출 (원)</p>
          <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="w-full">
            <!-- 그리드 -->
            <g stroke="#e5e7eb" stroke-width="1">
              <line
                v-for="(_, i) in [0, 1, 2, 3, 4]"
                :key="`g-${i}`"
                :x1="PAD_L"
                :x2="CHART_W - PAD_R"
                :y1="PAD_T + (plotH * i) / 4"
                :y2="PAD_T + (plotH * i) / 4"
              />
            </g>
            <!-- Y축 라벨 -->
            <g fill="#9ca3af" font-size="10" text-anchor="end" font-family="sans-serif">
              <text
                v-for="i in [0, 1, 2, 3, 4]"
                :key="`y-${i}`"
                :x="PAD_L - 6"
                :y="PAD_T + (plotH * i) / 4 + 4"
              >{{ fmtKRW(Math.round((maxRevenue * (4 - i)) / 4)) }}</text>
            </g>
            <!-- 막대 -->
            <g>
              <rect
                v-for="(v, i) in series.revenues"
                :key="`b-${i}`"
                :x="PAD_L + (plotW * i) / series.revenues.length + 3"
                :y="PAD_T + plotH - (plotH * v) / maxRevenue"
                :width="plotW / series.revenues.length - 6"
                :height="(plotH * v) / maxRevenue"
                fill="url(#barGradient)"
                rx="3"
              >
                <title>{{ series.labels[i] }}: {{ formatPrice(v) }}</title>
              </rect>
            </g>
            <!-- X축 라벨 (간격 두고 표시) -->
            <g fill="#9ca3af" font-size="10" text-anchor="middle" font-family="sans-serif">
              <text
                v-for="(label, i) in series.labels"
                :key="`x-${i}`"
                v-show="series.labels.length <= 7 || i % Math.ceil(series.labels.length / 7) === 0"
                :x="PAD_L + (plotW * i) / series.labels.length + plotW / series.labels.length / 2"
                :y="CHART_H - 10"
              >{{ label }}</text>
            </g>
            <defs>
              <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <p class="mt-2 text-xs text-neutral-500">
            합계: <span class="font-display text-sm text-neutral-900">{{ formatPrice(totalRangeRevenue) }}</span>
          </p>
        </div>

        <!-- 주문 건수 막대 차트 -->
        <div>
          <p class="mb-2 text-xs text-neutral-500">주문 건수</p>
          <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="w-full">
            <g stroke="#e5e7eb" stroke-width="1">
              <line
                v-for="(_, i) in [0, 1, 2, 3, 4]"
                :key="`go-${i}`"
                :x1="PAD_L"
                :x2="CHART_W - PAD_R"
                :y1="PAD_T + (plotH * i) / 4"
                :y2="PAD_T + (plotH * i) / 4"
              />
            </g>
            <g fill="#9ca3af" font-size="10" text-anchor="end" font-family="sans-serif">
              <text
                v-for="i in [0, 1, 2, 3, 4]"
                :key="`yo-${i}`"
                :x="PAD_L - 6"
                :y="PAD_T + (plotH * i) / 4 + 4"
              >{{ Math.round((maxOrders * (4 - i)) / 4) }}</text>
            </g>
            <g>
              <rect
                v-for="(v, i) in series.orderCounts"
                :key="`bo-${i}`"
                :x="PAD_L + (plotW * i) / series.orderCounts.length + 3"
                :y="PAD_T + plotH - (plotH * v) / maxOrders"
                :width="plotW / series.orderCounts.length - 6"
                :height="(plotH * v) / maxOrders"
                fill="#f472b6"
                rx="3"
              >
                <title>{{ series.labels[i] }}: {{ v }}건</title>
              </rect>
            </g>
            <g fill="#9ca3af" font-size="10" text-anchor="middle" font-family="sans-serif">
              <text
                v-for="(label, i) in series.labels"
                :key="`xo-${i}`"
                v-show="series.labels.length <= 7 || i % Math.ceil(series.labels.length / 7) === 0"
                :x="PAD_L + (plotW * i) / series.labels.length + plotW / series.labels.length / 2"
                :y="CHART_H - 10"
              >{{ label }}</text>
            </g>
          </svg>
          <p class="mt-2 text-xs text-neutral-500">
            합계: <span class="font-display text-sm text-neutral-900">{{ totalRangeOrders.toLocaleString("ko-KR") }}건</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 인기 상품 TOP10 + 최근 활동 -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 상품별 매출 TOP 10 -->
      <div class="rounded-3xl border border-neutral-100 bg-white p-5 sm:p-6">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg text-neutral-900">상품별 매출 TOP 10</h2>
          <span class="text-[11px] text-neutral-400">최근 30일</span>
        </div>
        <div v-if="(topProducts ?? []).length === 0" class="mt-6 py-8 text-center text-sm text-neutral-500">
          아직 주문이 없습니다.
        </div>
        <ol v-else class="mt-4 space-y-2">
          <li
            v-for="(p, i) in topProducts ?? []"
            :key="p.productId"
            class="flex items-center gap-3 rounded-xl bg-neutral-50 p-3"
          >
            <span :class="['grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-display', i < 3 ? 'bg-amber-400 text-white' : 'bg-neutral-200 text-neutral-600']">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm text-neutral-900">{{ p.productName }}</p>
              <p class="text-[11px] text-neutral-500">{{ p.orderCount }}건 · 수량 {{ p.quantitySum.toLocaleString('ko-KR') }}</p>
            </div>
            <span class="shrink-0 font-display text-sm text-indigo-700">{{ p.revenue.toLocaleString('ko-KR') }}원</span>
          </li>
        </ol>
      </div>

      <!-- 최근 활동 피드 -->
      <div class="rounded-3xl border border-neutral-100 bg-white p-5 sm:p-6">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg text-neutral-900">최근 활동</h2>
          <span class="text-[11px] text-neutral-400">최신 20건</span>
        </div>
        <div v-if="(activity ?? []).length === 0" class="mt-6 py-8 text-center text-sm text-neutral-500">
          최근 활동이 없습니다.
        </div>
        <ul v-else class="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          <li
            v-for="(a, i) in activity ?? []"
            :key="i"
            class="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50"
          >
            <span :class="['grid h-8 w-8 shrink-0 place-items-center rounded-full text-base', ACTIVITY_COLOR[a.type]]">
              {{ ACTIVITY_ICON[a.type] }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-neutral-900">
                <component :is="a.link ? 'NuxtLink' : 'span'" :to="a.link" class="hover:underline">
                  {{ a.title }}
                </component>
              </p>
              <p class="text-[11px] text-neutral-500">{{ a.detail }}</p>
              <p class="mt-0.5 text-[10px] text-neutral-400">{{ relTime(a.at) }}</p>
            </div>
            <span v-if="a.amount" class="shrink-0 font-display text-xs text-neutral-700">{{ a.amount.toLocaleString('ko-KR') }}원</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 바로가기 -->
    <div class="rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">바로가기</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink to="/admin/orders" class="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">주문 처리하기</NuxtLink>
        <NuxtLink to="/admin/dispatches" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">발주 현황</NuxtLink>
        <NuxtLink to="/admin/charges" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">충전 관리</NuxtLink>
        <NuxtLink to="/admin/tax-invoices" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">세금계산서</NuxtLink>
        <NuxtLink to="/admin/users" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">회원 관리</NuxtLink>
        <NuxtLink to="/admin/products" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">상품 관리</NuxtLink>
      </div>
    </div>
  </div>
</template>
