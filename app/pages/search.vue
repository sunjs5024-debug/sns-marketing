<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";

useSeoMeta({
  title: "상품 검색",
  description: "찾으시는 SNS 마케팅 · 상위노출 상품을 검색해보세요.",
  robots: "noindex, follow",
});

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  badge: "HOT" | "BEST" | "SALE" | "NEW" | null;
  rating: number;
  salesCount: number;
  category: { name: string; slug: string };
};

const route = useRoute();
const router = useRouter();

// URL ?q= 와 동기화
const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const inputBox = ref(query.value);

const { data, refresh, pending } = await useFetch<{
  query: string;
  count: number;
  results: SearchResult[];
}>("/api/products/search", {
  query: { q: query },
  watch: [query],
});

function submitSearch() {
  const q = inputBox.value.trim();
  query.value = q;
  router.replace({ path: "/search", query: q ? { q } : {} });
}

// 인기 키워드 (검색어 비어있을 때 제안) — 활성 카테고리만
const POPULAR_KEYWORDS = [
  "인스타 팔로워",
  "인스타 한국인",
  "유튜브 구독자",
  "유튜브 시청시간",
  "유튜브 쇼츠",
  "틱톡 팔로워",
  "X 트위터",
  "텔레그램 채널",
  "텔레그램 리액션",
  "릴스 조회수",
];
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="font-display text-3xl text-neutral-900">상품 검색</h1>

    <!-- 검색 입력 -->
    <form class="mt-6" @submit.prevent="submitSearch">
      <div class="relative">
        <input
          v-model="inputBox"
          type="search"
          autofocus
          maxlength="50"
          placeholder="예: 인스타 팔로워, 유튜브 시청시간, 텔레그램 리액션…"
          class="w-full rounded-full border border-neutral-200 bg-white py-4 pl-14 pr-14 text-base focus:border-neutral-900 focus:outline-none"
        />
        <svg class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
        <button
          type="submit"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700"
        >검색</button>
      </div>
    </form>

    <!-- 인기 키워드 (검색 안 했을 때) -->
    <div v-if="!query" class="mt-6">
      <p class="text-xs text-neutral-500">인기 검색어</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="k in POPULAR_KEYWORDS"
          :key="k"
          type="button"
          class="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
          @click="inputBox = k; submitSearch()"
        >{{ k }}</button>
      </div>
    </div>

    <!-- 결과 -->
    <section v-if="query" class="mt-8">
      <div class="flex items-baseline justify-between">
        <p class="text-sm text-neutral-600">
          <span class="font-display text-neutral-900">"{{ query }}"</span>
          검색 결과
          <span v-if="data" class="text-neutral-500"> · 총 {{ data.count }}건</span>
        </p>
        <p v-if="pending" class="text-xs text-neutral-400">검색 중…</p>
      </div>

      <div v-if="data && data.results.length > 0" class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard
          v-for="p in data.results"
          :key="p.id"
          :slug="p.slug"
          :name="p.name"
          :base-price="p.basePrice"
          :badge="p.badge"
          :rating="p.rating"
          :sales-count="p.salesCount"
          :category-name="p.category.name"
          :icon-key="platformKeyFor(p.category.slug)"
        />
      </div>

      <div v-else-if="data && !pending" class="mt-12 rounded-3xl border border-neutral-100 bg-neutral-50 p-12 text-center">
        <div class="text-5xl">🔍</div>
        <p class="mt-4 text-sm text-neutral-700">검색 결과가 없습니다.</p>
        <p class="mt-1 text-xs text-neutral-500">다른 키워드로 시도해보시거나, 위 인기 검색어를 참고하세요.</p>
        <NuxtLink to="/sns" class="mt-6 inline-block rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700">
          전체 상품 둘러보기
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
