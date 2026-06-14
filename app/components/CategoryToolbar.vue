<script setup lang="ts">
// 카테고리 페이지 공용 toolbar — 정렬 + 뱃지 필터 + 가격대 필터
// v-model 로 양방향 바인딩 (페이지가 URL 동기화 담당)

const props = defineProps<{
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

// 활성 필터 개수 (정렬은 제외)
const activeFilterCount = computed(() => {
  let n = 0;
  if (props.badge) n++;
  if (props.price) n++;
  return n;
});

// 필터 펼침 토글 (모바일에서 유용)
const filterOpen = ref(false);
</script>

<template>
  <div class="sticky top-16 z-30 -mx-4 rounded-none border-b border-neutral-100 bg-white/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-3xl sm:border sm:px-5 sm:py-4">
    <!-- 1행: 결과 수 + 정렬 + 필터 토글 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-neutral-600">
        총 <span class="font-display text-neutral-900">{{ total.toLocaleString("ko-KR") }}</span>개 상품
        <span v-if="activeFilterCount > 0" class="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700">
          필터 {{ activeFilterCount }}개 적용 중
        </span>
      </div>
      <div class="flex items-center gap-2">
        <!-- 모바일 필터 토글 -->
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50 sm:hidden"
          @click="filterOpen = !filterOpen"
        >
          ⚙ 필터
          <span v-if="activeFilterCount > 0" class="grid h-4 min-w-4 place-items-center rounded-full bg-indigo-600 px-1 text-[9px] text-white">{{ activeFilterCount }}</span>
        </button>
        <select
          :value="sort"
          class="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none sm:text-sm"
          @change="emit('update:sort', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="o in SORT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <!-- 2행: 필터 (sm+ 항상 표시 / 모바일은 토글) -->
    <div
      :class="[
        'flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-100 pt-3 sm:mt-3 sm:flex',
        filterOpen ? 'mt-3 flex' : 'hidden',
      ]"
    >
      <span class="shrink-0 text-xs text-neutral-500">뱃지</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="b in BADGE_OPTIONS"
          :key="b.value"
          type="button"
          :class="[
            'rounded-full border px-2.5 py-1 text-[11px] transition whitespace-nowrap sm:px-3 sm:text-xs',
            badge === b.value
              ? `${b.color} border-current font-semibold`
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
            'rounded-full border px-2.5 py-1 text-[11px] transition whitespace-nowrap sm:px-3 sm:text-xs',
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
