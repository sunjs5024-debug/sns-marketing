<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "urpanel 자동 매핑", robots: "noindex, nofollow" });

type Suggestion = {
  optionId: string;
  productId: string;
  productName: string;
  categoryName: string;
  platform: "SNS" | "RANK";
  optionLabel: string;
  quantity: number;
  sellPrice: number;
  suggested: {
    serviceId: number;
    serviceName: string;
    rate: string;
    category: string;
    score: number;
    reasons: string[];
    costUsd: number;
  } | null;
  reasons: string[];
};
type Resp = { ok: boolean; total: number; matched: number; unmatched: number; suggestions: Suggestion[] };

const USD_TO_KRW = 1400;
const { data, refresh, pending } = await useFetch<Resp>("/api/admin/urpanel/suggest-mappings");

// 가격 자동 조정 옵션 (recomputeAutoSelect 보다 먼저 선언 필요)
const autoPriceEnabled = ref(true);
const markupPct = ref(100); // 100% = 원가의 2배 (즉 markup multiplier = 2.0)
const markupMultiplier = computed(() => 1 + markupPct.value / 100);

// 체크박스 — 적용할 매핑 선택
const selected = ref<Record<string, boolean>>({});
function calcMarginPct(sellKrw: number, costUsd: number): number {
  const costKrw = costUsd * USD_TO_KRW;
  if (sellKrw <= 0 || costKrw <= 0) return 0;
  return Math.round(((sellKrw - costKrw) / sellKrw) * 100);
}
function recomputeAutoSelect() {
  const v = data.value;
  if (!v?.suggestions) return;
  const next: Record<string, boolean> = {};
  for (const s of v.suggestions) {
    if (!s.suggested) continue;
    if (s.suggested.score < 40) continue;
    // 가격 자동 조정 ON 이면 손해 무시 (어차피 가격 올라가서 마진 확보됨)
    if (autoPriceEnabled.value) {
      next[s.optionId] = true;
    } else {
      const margin = calcMarginPct(s.sellPrice, s.suggested.costUsd);
      if (margin >= 20) next[s.optionId] = true;
    }
  }
  selected.value = next;
}
watch(() => data.value, recomputeAutoSelect, { immediate: true });
// 가격 조정 토글이 바뀌면 자동 체크 룰 재적용
watch(autoPriceEnabled, () => recomputeAutoSelect());

const selectedCount = computed(() => Object.values(selected.value).filter(Boolean).length);

function toggleAll(value: boolean) {
  const next: Record<string, boolean> = {};
  for (const s of data.value?.suggestions ?? []) {
    if (s.suggested) next[s.optionId] = value;
  }
  selected.value = next;
}

// 새 가격 계산 (UI 미리보기용)
function projectedNewPrice(costUsd: number): number {
  const krw = costUsd * USD_TO_KRW * markupMultiplier.value;
  return Math.max(100, Math.round(krw / 100) * 100);
}

const applying = ref(false);
async function applyAll() {
  if (selectedCount.value === 0) return;
  const mappings = (data.value?.suggestions ?? [])
    .filter((s) => selected.value[s.optionId] && s.suggested)
    .map((s) => ({
      optionId: s.optionId,
      serviceId: s.suggested!.serviceId,
      costUsd: s.suggested!.costUsd,
    }));

  const msg = autoPriceEnabled.value
    ? `${mappings.length}개 옵션에 매핑 적용 + 가격을 마진율 ${markupPct.value}% (원가 × ${markupMultiplier.value.toFixed(1)})로 일괄 변경합니다. 계속할까요?`
    : `${mappings.length}개 옵션에 매핑만 적용 (가격 변경 없음). 계속할까요?`;
  if (!confirm(msg)) return;

  applying.value = true;
  try {
    const res = await $fetch<{ ok: boolean; applied: number; priceUpdated: number }>("/api/admin/urpanel/apply-mappings", {
      method: "POST",
      body: {
        mappings,
        autoPriceMarkup: autoPriceEnabled.value ? markupMultiplier.value : 0,
      },
    });
    alert(`✓ ${res.applied}개 매핑 완료${res.priceUpdated ? ` · ${res.priceUpdated}개 가격 조정` : ''}`);
    await refresh();
  } catch (e) {
    console.error(e);
    alert("매핑 적용 실패");
  } finally {
    applying.value = false;
  }
}

function scoreClass(score: number): string {
  if (score >= 70) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 50) return "text-blue-700 bg-blue-50 border-blue-200";
  if (score >= 30) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-neutral-600 bg-neutral-100 border-neutral-200";
}
function scoreLabel(score: number): string {
  if (score >= 70) return "강추";
  if (score >= 50) return "추천";
  if (score >= 30) return "참고";
  return "낮음";
}
function marginPct(sellKrw: number, costUsd: number): number {
  const costKrw = costUsd * USD_TO_KRW;
  if (sellKrw <= 0 || costKrw <= 0) return 0;
  return Math.round(((sellKrw - costKrw) / sellKrw) * 100);
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <section class="rounded-2xl border border-neutral-200 bg-white p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="font-display text-xl text-neutral-900">urpanel 자동 매핑 제안</h2>
          <p class="mt-1 text-sm text-neutral-500">
            상품명·옵션 키워드를 분석해 적합한 urpanel 서비스를 추천합니다. 검토 후 일괄 적용하세요.
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
          @click="refresh()"
        >다시 분석</button>
      </div>

      <div v-if="data" class="mt-5 grid gap-3 sm:grid-cols-4">
        <div class="rounded-xl bg-neutral-50 p-3">
          <p class="text-xs text-neutral-500">미매핑 옵션</p>
          <p class="mt-0.5 font-display text-xl text-neutral-900">{{ data.total }}</p>
        </div>
        <div class="rounded-xl bg-emerald-50 p-3">
          <p class="text-xs text-emerald-700">자동 추천됨</p>
          <p class="mt-0.5 font-display text-xl text-emerald-900">{{ data.matched }}</p>
        </div>
        <div class="rounded-xl bg-rose-50 p-3">
          <p class="text-xs text-rose-700">매칭 실패</p>
          <p class="mt-0.5 font-display text-xl text-rose-900">{{ data.unmatched }}</p>
        </div>
        <div class="rounded-xl bg-indigo-50 p-3">
          <p class="text-xs text-indigo-700">현재 선택</p>
          <p class="mt-0.5 font-display text-xl text-indigo-900">{{ selectedCount }}</p>
        </div>
      </div>
    </section>

    <!-- 액션 바 -->
    <section class="mt-4 rounded-2xl border border-neutral-200 bg-white px-5 py-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50" @click="toggleAll(true)">전체 선택</button>
          <button type="button" class="rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50" @click="toggleAll(false)">전체 해제</button>
        </div>
        <button
          type="button"
          :disabled="selectedCount === 0 || applying"
          class="rounded-full bg-emerald-600 px-5 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-40"
          @click="applyAll"
        >
          {{ applying ? "적용 중…" : `선택한 ${selectedCount}개 매핑 적용` }}
        </button>
      </div>

      <!-- 가격 자동 조정 옵션 -->
      <div class="mt-3 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-sm">
        <label class="inline-flex cursor-pointer items-center gap-2">
          <input v-model="autoPriceEnabled" type="checkbox" class="h-4 w-4 cursor-pointer accent-indigo-600" />
          <span class="text-neutral-900">매핑 적용 시 가격도 자동 조정</span>
        </label>
        <div v-if="autoPriceEnabled" class="flex items-center gap-2 text-xs">
          <span class="text-neutral-500">마진율</span>
          <input
            v-model.number="markupPct"
            type="number"
            min="0"
            max="500"
            step="10"
            class="w-20 rounded border border-neutral-200 px-2 py-1 text-right focus:border-neutral-900 focus:outline-none"
          />
          <span class="text-neutral-500">% (원가 × {{ markupMultiplier.toFixed(2) }})</span>
        </div>
        <div v-if="autoPriceEnabled" class="flex gap-1">
          <button type="button" class="rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="markupPct = 50">50%</button>
          <button type="button" class="rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="markupPct = 100">100%</button>
          <button type="button" class="rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="markupPct = 200">200%</button>
          <button type="button" class="rounded border border-neutral-200 px-2 py-0.5 text-[11px] hover:bg-neutral-50" @click="markupPct = 300">300%</button>
        </div>
      </div>
      <p v-if="autoPriceEnabled" class="mt-2 text-[11px] text-neutral-400">
        예: 원가 1,000원 → 새 판매가 {{ Math.round(1000 * markupMultiplier / 100) * 100 }}원 · 100원 단위 반올림
      </p>
    </section>

    <!-- 추천 목록 -->
    <section class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div v-if="pending" class="px-6 py-16 text-center text-sm text-neutral-500">분석 중…</div>
      <div v-else-if="(data?.suggestions ?? []).length === 0" class="px-6 py-16 text-center text-sm text-neutral-500">
        매핑 대기 중인 옵션이 없습니다.
      </div>
      <ul v-else class="divide-y divide-neutral-100">
        <li
          v-for="s in data?.suggestions ?? []"
          :key="s.optionId"
          class="px-5 py-4"
          :class="{ 'bg-emerald-50/30': selected[s.optionId] }"
        >
          <div class="grid grid-cols-[auto_1fr_1fr_auto] items-start gap-4">
            <!-- 체크박스 -->
            <input
              v-if="s.suggested"
              type="checkbox"
              :checked="selected[s.optionId]"
              class="mt-1 h-4 w-4 cursor-pointer accent-emerald-600"
              @change="selected[s.optionId] = ($event.target as HTMLInputElement).checked"
            />
            <div v-else></div>

            <!-- 좌측: 우리 상품 -->
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 text-[10px]">
                <span class="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600">{{ s.platform }}</span>
                <span class="text-neutral-500">{{ s.categoryName }}</span>
              </div>
              <p class="mt-1 text-sm text-neutral-900">{{ s.productName }}</p>
              <p class="text-xs text-neutral-500">
                "{{ s.optionLabel }}" · {{ s.quantity.toLocaleString('ko-KR') }}개 · 판매가 {{ s.sellPrice.toLocaleString('ko-KR') }}원
              </p>
            </div>

            <!-- 우측: urpanel 추천 -->
            <div v-if="s.suggested" class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span :class="['rounded-full border px-2 py-0.5 text-[10px]', scoreClass(s.suggested.score)]">
                  {{ scoreLabel(s.suggested.score) }} · {{ s.suggested.score }}
                </span>
                <span class="font-mono text-[10px] text-neutral-500">#{{ s.suggested.serviceId }}</span>
              </div>
              <p class="mt-1 text-sm text-neutral-900">{{ s.suggested.serviceName }}</p>
              <p class="text-xs text-neutral-500">
                원가 ${{ s.suggested.costUsd.toFixed(4) }} ≈ {{ Math.round(s.suggested.costUsd * USD_TO_KRW).toLocaleString('ko-KR') }}원
                <span
                  v-if="s.sellPrice > 0"
                  :class="['ml-1 font-medium', marginPct(s.sellPrice, s.suggested.costUsd) >= 30 ? 'text-emerald-700' : marginPct(s.sellPrice, s.suggested.costUsd) >= 0 ? 'text-amber-700' : 'text-rose-700']"
                >
                  · 마진 {{ marginPct(s.sellPrice, s.suggested.costUsd) }}%
                  <span v-if="marginPct(s.sellPrice, s.suggested.costUsd) < 0" class="ml-0.5">⚠ 손해</span>
                </span>
              </p>
              <!-- 새 가격 미리보기 -->
              <p v-if="autoPriceEnabled && selected[s.optionId]" class="mt-0.5 text-[11px] text-indigo-700">
                → 새 판매가 <b>{{ projectedNewPrice(s.suggested.costUsd).toLocaleString('ko-KR') }}원</b>
                <span class="text-neutral-400">
                  ({{ s.sellPrice > 0 ? `현재 ${s.sellPrice.toLocaleString('ko-KR')}원에서 ${projectedNewPrice(s.suggested.costUsd) - s.sellPrice >= 0 ? '+' : ''}${(projectedNewPrice(s.suggested.costUsd) - s.sellPrice).toLocaleString('ko-KR')}원` : '신규' }})
                </span>
              </p>
              <p class="mt-0.5 text-[10px] text-neutral-400">{{ s.suggested.category }}</p>
            </div>
            <div v-else class="min-w-0">
              <span class="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                매칭 실패
              </span>
              <p class="mt-1 text-[11px] text-neutral-500">{{ s.reasons.join(", ") }}</p>
              <p class="mt-0.5 text-[10px] text-neutral-400">
                💡 상품관리에서 🔍 버튼으로 수동 선택하거나, 카테고리상 urpanel에 없는 서비스일 수 있습니다.
              </p>
            </div>

            <!-- 사유 -->
            <details v-if="s.suggested" class="text-[10px] text-neutral-400">
              <summary class="cursor-pointer hover:text-neutral-600">사유</summary>
              <div class="mt-1 max-w-[180px] space-y-0.5">
                <p v-for="r in s.suggested.reasons" :key="r">{{ r }}</p>
              </div>
            </details>
          </div>
        </li>
      </ul>
    </section>

    <p class="mt-4 text-[11px] text-neutral-400">
      💡 점수 70+ = 강추 (자동 체크) · 50~70 = 추천 (검토 권장) · 30~50 = 참고 (수동 확인 강력 권장)
    </p>
  </div>
</template>
