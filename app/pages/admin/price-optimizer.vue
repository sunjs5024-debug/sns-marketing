<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "가격 최적화", robots: "noindex, nofollow" });

type Item = {
  optionId: string;
  productId: string;
  productName: string;
  categoryName: string;
  platform: "SNS" | "RANK";
  optionLabel: string;
  quantity: number;
  currentPrice: number;
  source: "mapped" | "suggested";
  serviceId: number | null;
  serviceName: string | null;
  rate: number | null;       // USD per 1000
  costUsd: number | null;
  costKrw: number | null;
  marginPct: number | null;
};
type Resp = {
  ok: boolean;
  items: Item[];
  counts: { total: number; mapped: number; suggested: number; unprofitable: number };
};

const USD_TO_KRW = 1400;

const { data, refresh, pending } = await useFetch<Resp>("/api/admin/urpanel/price-optimize");

// 마진율 (markup) 설정
const markupPct = ref(100); // 100% = 원가 × 2
const markupMultiplier = computed(() => 1 + markupPct.value / 100);

// 필터
const filter = ref<"all" | "unprofitable" | "mapped" | "suggested">("unprofitable");
const platformFilter = ref<"" | "SNS" | "RANK">("");

const filtered = computed(() => {
  if (!data.value?.items) return [];
  let items = data.value.items;
  if (platformFilter.value) items = items.filter((i) => i.platform === platformFilter.value);
  if (filter.value === "unprofitable") {
    items = items.filter((i) => i.marginPct !== null && i.marginPct < 30);
  } else if (filter.value === "mapped") {
    items = items.filter((i) => i.source === "mapped");
  } else if (filter.value === "suggested") {
    items = items.filter((i) => i.source === "suggested");
  }
  return items;
});

// 새 가격 계산
function projectedPrice(item: Item): number {
  if (item.costKrw === null) return item.currentPrice;
  return Math.max(100, Math.round((item.costKrw * markupMultiplier.value) / 100) * 100);
}
function priceDiff(item: Item): number {
  return projectedPrice(item) - item.currentPrice;
}
function marginAfter(item: Item): number {
  if (item.costKrw === null) return 0;
  const newP = projectedPrice(item);
  return Math.round(((newP - item.costKrw) / newP) * 100);
}

// 체크박스 — 기본: 마진 부족 항목 자동 체크
const selected = ref<Record<string, boolean>>({});
watch(
  filtered,
  (items) => {
    const next: Record<string, boolean> = { ...selected.value };
    for (const i of items) {
      // 처음 등장하는 항목만 자동 체크 (이미 있는 건 사용자 선택 존중)
      if (next[i.optionId] === undefined) {
        next[i.optionId] = i.marginPct === null || i.marginPct < 30;
      }
    }
    selected.value = next;
  },
  { immediate: true },
);

const selectedCount = computed(() => Object.values(selected.value).filter(Boolean).length);

function toggleAllVisible(value: boolean) {
  const next = { ...selected.value };
  for (const i of filtered.value) next[i.optionId] = value;
  selected.value = next;
}

const applying = ref(false);
async function applyAll() {
  if (selectedCount.value === 0) return;
  const updates = filtered.value
    .filter((i) => selected.value[i.optionId])
    .map((i) => ({
      optionId: i.optionId,
      newPrice: projectedPrice(i),
      // 매핑 안 됐는데 추천 있으면 같이 매핑
      ...(i.source === "suggested" && i.serviceId ? { mapServiceId: i.serviceId } : {}),
    }));

  if (!confirm(`${updates.length}개 옵션 가격을 일괄 변경합니다. 계속할까요?\n(미매핑 + 추천 있음 항목은 매핑까지 함께 적용됩니다)`)) return;

  applying.value = true;
  try {
    const res = await $fetch<{ ok: boolean; priceUpdated: number; mapped: number }>("/api/admin/urpanel/bulk-price", {
      method: "POST",
      body: { updates },
    });
    alert(`✓ ${res.priceUpdated}건 가격 조정${res.mapped ? ` · ${res.mapped}건 매핑 동시 적용` : ''}`);
    await refresh();
  } catch (e) {
    console.error(e);
    alert("적용 실패");
  } finally {
    applying.value = false;
  }
}

function marginClass(m: number | null): string {
  if (m === null) return "text-neutral-400";
  if (m >= 50) return "text-emerald-700";
  if (m >= 30) return "text-emerald-600";
  if (m >= 0) return "text-amber-700";
  return "text-rose-700";
}
</script>

<template>
  <div>
    <section class="rounded-2xl border border-neutral-200 bg-white p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="font-display text-xl text-neutral-900">가격 최적화</h2>
          <p class="mt-1 text-sm text-neutral-500">
            매핑된 상품과 매핑 추천된 상품의 현재 가격 vs 원가 기반 추천 가격을 비교하고 일괄 조정합니다.
          </p>
        </div>
        <button type="button" class="rounded-xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50" @click="refresh()">다시 분석</button>
      </div>

      <div v-if="data" class="mt-5 grid gap-3 sm:grid-cols-4">
        <div class="rounded-xl bg-neutral-50 p-3">
          <p class="text-xs text-neutral-500">대상 옵션</p>
          <p class="mt-0.5 font-display text-xl text-neutral-900">{{ data.counts.total }}</p>
        </div>
        <div class="rounded-xl bg-emerald-50 p-3">
          <p class="text-xs text-emerald-700">이미 매핑됨</p>
          <p class="mt-0.5 font-display text-xl text-emerald-900">{{ data.counts.mapped }}</p>
        </div>
        <div class="rounded-xl bg-blue-50 p-3">
          <p class="text-xs text-blue-700">매핑 추천</p>
          <p class="mt-0.5 font-display text-xl text-blue-900">{{ data.counts.suggested }}</p>
        </div>
        <div class="rounded-xl bg-rose-50 p-3">
          <p class="text-xs text-rose-700">마진 부족 (&lt; 30%)</p>
          <p class="mt-0.5 font-display text-xl text-rose-900">{{ data.counts.unprofitable }}</p>
        </div>
      </div>
    </section>

    <!-- 액션 + 마진율 -->
    <section class="mt-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- 필터 -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap gap-1">
            <button v-for="f in [{v:'unprofitable',l:'마진 부족'},{v:'mapped',l:'매핑됨'},{v:'suggested',l:'추천'},{v:'all',l:'전체'}]" :key="f.v" type="button" :class="['rounded-full px-3 py-1.5 text-xs transition', filter === f.v ? 'bg-neutral-900 text-white' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400']" @click="filter = f.v as typeof filter">{{ f.l }}</button>
          </div>
          <select v-model="platformFilter" class="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none">
            <option value="">전체 플랫폼</option>
            <option value="SNS">SNS</option>
            <option value="RANK">상위노출</option>
          </select>
        </div>
        <button
          type="button"
          :disabled="selectedCount === 0 || applying"
          class="rounded-full bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-40"
          @click="applyAll"
        >{{ applying ? '적용 중…' : `선택한 ${selectedCount}건 가격 적용` }}</button>
      </div>

      <!-- 마진율 -->
      <div class="mt-3 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-sm">
        <span class="text-neutral-700">새 가격 = 원가 × {{ markupMultiplier.toFixed(2) }} (마진율 {{ markupPct }}%)</span>
        <input v-model.number="markupPct" type="number" min="0" max="500" step="10" class="w-20 rounded border border-neutral-200 px-2 py-1 text-right text-xs focus:border-neutral-900 focus:outline-none" />
        <div class="flex gap-1">
          <button v-for="p in [50, 100, 200, 300]" :key="p" type="button" class="rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="markupPct = p">{{ p }}%</button>
        </div>
        <button type="button" class="ml-auto rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="toggleAllVisible(true)">보이는 항목 전체 선택</button>
        <button type="button" class="rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="toggleAllVisible(false)">전체 해제</button>
      </div>
    </section>

    <!-- 테이블 -->
    <section class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div v-if="pending" class="px-6 py-16 text-center text-sm text-neutral-500">분석 중…</div>
      <div v-else-if="filtered.length === 0" class="px-6 py-16 text-center text-sm text-neutral-500">
        조건에 맞는 항목 없음
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-neutral-50 text-[11px] text-neutral-500">
            <tr>
              <th class="px-3 py-2 text-left">✓</th>
              <th class="px-3 py-2 text-left">상품 / 옵션</th>
              <th class="px-3 py-2 text-left">urpanel 서비스</th>
              <th class="px-3 py-2 text-right">원가</th>
              <th class="px-3 py-2 text-right">현재가</th>
              <th class="px-3 py-2 text-right">새 가격</th>
              <th class="px-3 py-2 text-right">마진</th>
              <th class="px-3 py-2 text-center">출처</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="i in filtered" :key="i.optionId" :class="selected[i.optionId] ? 'bg-indigo-50/30' : 'hover:bg-neutral-50'">
              <td class="px-3 py-3">
                <input type="checkbox" :checked="selected[i.optionId]" class="h-4 w-4 cursor-pointer accent-indigo-600" @change="selected[i.optionId] = ($event.target as HTMLInputElement).checked" />
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-1 text-[10px]">
                  <span class="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600">{{ i.platform }}</span>
                  <span class="text-neutral-500">{{ i.categoryName }}</span>
                </div>
                <p class="mt-0.5 text-sm text-neutral-900">{{ i.productName }}</p>
                <p class="text-[11px] text-neutral-500">"{{ i.optionLabel }}" · {{ i.quantity.toLocaleString('ko-KR') }}개</p>
              </td>
              <td class="px-3 py-3 max-w-[200px]">
                <p class="truncate text-xs text-neutral-700" :title="i.serviceName ?? ''">{{ i.serviceName ?? '—' }}</p>
                <p class="text-[10px] font-mono text-neutral-400">#{{ i.serviceId }} · ${{ (i.rate ?? 0).toFixed(2) }}/1k</p>
              </td>
              <td class="px-3 py-3 text-right text-xs">
                <span v-if="i.costKrw">{{ Math.round(i.costKrw).toLocaleString('ko-KR') }}원</span>
              </td>
              <td class="px-3 py-3 text-right text-xs">
                {{ i.currentPrice.toLocaleString('ko-KR') }}원
              </td>
              <td class="px-3 py-3 text-right">
                <p class="text-sm font-medium text-indigo-700">{{ projectedPrice(i).toLocaleString('ko-KR') }}원</p>
                <p :class="['text-[10px]', priceDiff(i) >= 0 ? 'text-emerald-600' : 'text-rose-600']">{{ priceDiff(i) >= 0 ? '+' : '' }}{{ priceDiff(i).toLocaleString('ko-KR') }}원</p>
              </td>
              <td class="px-3 py-3 text-right">
                <p :class="['text-xs', marginClass(i.marginPct)]">현재 {{ i.marginPct ?? '—' }}%</p>
                <p class="text-[10px] text-emerald-700">→ {{ marginAfter(i) }}%</p>
              </td>
              <td class="px-3 py-3 text-center">
                <span v-if="i.source === 'mapped'" class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">매핑됨</span>
                <span v-else class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">추천</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="mt-4 text-[11px] text-neutral-400">
      💡 "추천" 출처는 가격 적용 시 매핑까지 함께 들어갑니다 · 기본 필터는 "마진 부족 (&lt; 30%)" — 손해 또는 마진 낮은 것부터 보여줌
    </p>
  </div>
</template>
