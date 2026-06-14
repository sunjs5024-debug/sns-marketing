<script setup lang="ts">
import { PLATFORMS, SNS_PLATFORMS, isValidPlatformSlug, platformKeyFor } from "#shared/catalog";

const route = useRoute();
const platformParam = computed(() => String(route.params.platform));

if (!isValidPlatformSlug(platformParam.value) || !SNS_PLATFORMS.includes(platformParam.value)) {
  throw createError({ statusCode: 404, statusMessage: "Not Found" });
}

const meta = PLATFORMS[platformParam.value];

useSeoMeta({
  title: meta.name,
  description: meta.description,
  ogTitle: `${meta.name} | SNS소셜팩토리`,
  ogDescription: meta.description,
  ogType: "website",
  ogLocale: "ko_KR",
});

useSchemaOrg([
  defineWebPage({
    name: meta.name,
    description: meta.description,
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "SNS 마케팅", item: "https://xn--sns-yg9lh0pw9l.kr/sns" },
      {
        "@type": "ListItem",
        position: 3,
        name: meta.shortName,
        item: `https://xn--sns-yg9lh0pw9l.kr/sns/${meta.slug}`,
      },
    ],
  },
]);

// 필터/정렬 — URL 쿼리와 양방향 동기화
const router = useRouter();
const sort = computed({
  get: () => (typeof route.query.sort === "string" ? route.query.sort : "popular"),
  set: (v) => updateQuery({ sort: v === "popular" ? undefined : v }),
});
const badge = computed({
  get: () => (typeof route.query.badge === "string" ? route.query.badge : null),
  set: (v) => updateQuery({ badge: v ?? undefined }),
});
const price = computed({
  get: () => (typeof route.query.price === "string" ? route.query.price : null),
  set: (v) => updateQuery({ price: v ?? undefined }),
});

function updateQuery(patch: Record<string, string | undefined>) {
  router.replace({ query: { ...route.query, ...patch } });
}
function resetFilters() {
  router.replace({ path: route.path });
}

const { data: products } = await useFetch(
  `/api/products/by-platform/${platformParam.value}`,
  { query: { sort, badge, price }, watch: [sort, badge, price] },
);

// 카테고리 통계 (필터 영향 없음 - 전체 활성 상품 기준)
const { data: allProducts } = await useFetch(
  `/api/products/by-platform/${platformParam.value}`,
);
const stats = computed(() => {
  const list = allProducts.value ?? [];
  if (list.length === 0) return null;
  const avgRating = list.reduce((s, p) => s + (p.rating ?? 0), 0) / list.length;
  const totalSales = list.reduce((s, p) => s + (p.salesCount ?? 0), 0);
  const minPrice = Math.min(...list.map((p) => p.basePrice));
  return { count: list.length, avgRating, totalSales, minPrice };
});
</script>

<template>
  <div>
    <section :class="['relative overflow-hidden bg-gradient-to-br', meta.bgGradient]">
      <div class="pointer-events-none absolute -left-10 top-0 h-72 w-72 bg-white/40 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute right-0 bottom-0 h-72 w-72 bg-white/40 blur-3xl anim-blob" style="animation-delay: -5s" />
      <div class="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="anim-float-up shrink-0">
            <BrandIcon :kind="meta.slug" :size="56" class="drop-shadow-xl sm:[--size:72px]" />
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-widest text-neutral-600 sm:text-xs">SNS MARKETING</p>
            <h1 class="font-display text-2xl text-neutral-900 sm:text-4xl">{{ meta.name }}</h1>
          </div>
        </div>
        <p class="mt-4 max-w-2xl text-xs leading-6 text-neutral-700 sm:mt-5 sm:text-sm sm:leading-7">{{ meta.description }}</p>

        <!-- 통계 위젯 (4개 카드) -->
        <div v-if="stats" class="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:max-w-2xl sm:grid-cols-4 sm:gap-3">
          <div class="rounded-xl bg-white/70 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
            <p class="text-[10px] text-neutral-500 sm:text-xs">상품 수</p>
            <p class="mt-0.5 font-display text-base text-neutral-900 sm:text-lg">{{ stats.count }}개</p>
          </div>
          <div class="rounded-xl bg-white/70 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
            <p class="text-[10px] text-neutral-500 sm:text-xs">평균 평점</p>
            <p class="mt-0.5 font-display text-base text-amber-600 sm:text-lg">★ {{ stats.avgRating.toFixed(1) }}</p>
          </div>
          <div class="rounded-xl bg-white/70 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
            <p class="text-[10px] text-neutral-500 sm:text-xs">누적 판매</p>
            <p class="mt-0.5 font-display text-base text-neutral-900 sm:text-lg">{{ stats.totalSales.toLocaleString('ko-KR') }}</p>
          </div>
          <div class="rounded-xl bg-white/70 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
            <p class="text-[10px] text-neutral-500 sm:text-xs">최저가</p>
            <p class="mt-0.5 font-display text-base text-indigo-700 sm:text-lg">{{ stats.minPrice.toLocaleString('ko-KR') }}원~</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">전체 {{ meta.shortName }} 상품</h2>

      <CategoryToolbar
        class="mt-4 sm:mt-5"
        :total="(products ?? []).length"
        :sort="sort"
        :badge="badge"
        :price="price"
        @update:sort="(v) => sort = v"
        @update:badge="(v) => badge = v"
        @update:price="(v) => price = v"
        @reset="resetFilters"
      />

      <!-- 빈 상태 -->
      <div v-if="(products ?? []).length === 0" class="mt-8 flex flex-col items-center rounded-3xl border border-neutral-100 bg-neutral-50 px-6 py-16 text-center">
        <div class="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-pink-100 text-3xl">
          🔍
        </div>
        <p class="mt-4 text-sm text-neutral-700">조건에 맞는 상품이 없습니다.</p>
        <p class="mt-1 text-xs text-neutral-500">필터를 조정하거나 초기화해보세요.</p>
        <button
          type="button"
          class="mt-5 rounded-full bg-neutral-900 px-5 py-2.5 text-xs text-white hover:bg-neutral-700"
          @click="resetFilters"
        >필터 초기화</button>
      </div>

      <div v-else class="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        <ProductCard
          v-for="p in products ?? []"
          :key="p.id"
          :slug="p.slug"
          :name="p.name"
          :base-price="p.basePrice"
          :badge="p.badge"
          :rating="p.rating"
          :sales-count="p.salesCount"
          :category-name="p.category.name"
          :icon-key="platformKeyFor(p.category.slug)"
          :option-count="p._count?.options"
        />
      </div>
    </section>
  </div>
</template>
