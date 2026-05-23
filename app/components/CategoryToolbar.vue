<script setup lang="ts">
// 카테고리 페이지 공용 toolbar — 정렬 + 뱃지 필터 + 가격대 필터
// v-model 로 양방향 바인딩 (페이지가 URL 동기화 담당)

defineProps<{
  total: number;
  sort: string;
  badge: string | null;
  price: string | null;
}>();

const emit = defineEmits<{
  (e: "update:sort", v: string): void;
  (e: "update:badge", v: string | null): void;
  (e: "update:price", v: string | null): void;
  (e: "reset"): void;
}>();

const SORT_OPTIONS = [
  { value: "popular", label: "인기순" },
  { value: "newest", label: "신상품순" },
  { value: "price-asc", label: "낮은 가격순" },
  { value: "price-desc", label: "높은 가격순" },
  { value: "rating", label: "평점순" },
];

const BADGE_OPTIONS = [
  { value: "HOT", label: "🔥 HOT", color: "border-rose-300 bg-rose-50 text-rose-700" },
  { value: "BEST", label: "👑 BEST", color: "border-amber-300 bg-amber-50 text-amber-700" },
  { value: "SALE", label: "💸 SALE", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  { value: "NEW", label: "✨ NEW", color: "border-indigo-300 bg-indigo-50 text-indigo-700" },
];

const PRICE_OPTIONS = [
  { value: "under-10k", label: "1만원 미만" },
  { value: "10k-50k", label: "1만~5만원" },
  { value: "50k-100k", label: "5만~10만원" },
  { value: "over-100k", label: "10만원 이상" },
];

function toggleBadge(v: string) {
  emit("update:badge", v === ($attrs.badge as string) ? null : v);
}
function togglePrice(v: string) {
  emit("update:price", v === ($attrs.price as string) ? null : v);
}

const $attrs = useAttrs() as Record<string, unknown>;
</script>

<template>
  <div class="rounded-3xl border border-neutral-100 bg-white p-4 sm:p-5">
    <!-- 1행: 결과 수 + 정렬 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-neutral-600">
        총 <span class="font-display text-neutral-900">{{ total.toLocaleString("ko-KR") }}</span>개 상품
      </div>
      <div class="flex items-center gap-2 text-sm">
        <label class="text-xs text-neutral-500">정렬</label>
        <select
          :value="sort"
          class="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
          @change="emit('update:sort', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="o in SORT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <!-- 2행: 뱃지 필터 + 가격 필터 -->
    <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
      <span class="shrink-0 text-xs text-neutral-500">뱃지</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="b in BADGE_OPTIONS"
          :key="b.value"
          type="button"
          :class="[
            'rounded-full border px-3 py-1 text-xs transition whitespace-nowrap',
            badge === b.value
              ? `${b.color} border-current font-bold`
              : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400',
          ]"
          @click="emit('update:badge', badge === b.value ? null : b.value)"
        >{{ b.label }}</button>
      </div>

      <span class="hidden h-4 w-px bg-neutral-200 sm:block" />

      <span class="shrink-0 text-xs text-neutral-500">가격</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="p in PRICE_OPTIONS"
          :key="p.value"
          type="button"
          :class="[
            'rounded-full border px-3 py-1 text-xs transition whitespace-nowrap',
            price === p.value
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400',
          ]"
          @click="emit('update:price', price === p.value ? null : p.value)"
        >{{ p.label }}</button>
      </div>

      <button
        v-if="badge || price || sort !== 'popular'"
        type="button"
        class="ml-auto rounded-full px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
        @click="emit('reset')"
      >초기화 ×</button>
    </div>
  </div>
</template>
