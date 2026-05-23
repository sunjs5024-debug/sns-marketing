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

    <!-- 바로가기 -->
    <div class="rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">바로가기</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink to="/admin/orders" class="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">주문 처리하기</NuxtLink>
        <NuxtLink to="/admin/payments" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">결제 내역</NuxtLink>
        <NuxtLink to="/admin/users" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">회원 관리</NuxtLink>
        <NuxtLink to="/admin/products" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">상품 관리</NuxtLink>
      </div>
    </div>
  </div>
</template>
