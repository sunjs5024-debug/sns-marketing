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
</script>

<template>
  <div>
    <section :class="['relative overflow-hidden bg-gradient-to-br', meta.bgGradient]">
      <div class="pointer-events-none absolute -left-10 top-0 h-72 w-72 bg-white/40 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute right-0 bottom-0 h-72 w-72 bg-white/40 blur-3xl anim-blob" style="animation-delay: -5s" />
      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <div class="anim-float-up">
            <BrandIcon :kind="meta.slug" :size="72" class="drop-shadow-xl" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-widest text-neutral-600">SNS MARKETING</p>
            <h1 class="font-display text-3xl text-neutral-900 sm:text-4xl">{{ meta.name }}</h1>
          </div>
        </div>
        <p class="mt-5 max-w-2xl text-sm leading-7 text-neutral-700">{{ meta.description }}</p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 class="font-display text-2xl text-neutral-900">전체 {{ meta.shortName }} 상품</h2>

      <CategoryToolbar
        class="mt-5"
        :total="(products ?? []).length"
        :sort="sort"
        :badge="badge"
        :price="price"
        @update:sort="(v) => sort = v"
        @update:badge="(v) => badge = v"
        @update:price="(v) => price = v"
        @reset="resetFilters"
      />

      <p v-if="(products ?? []).length === 0" class="mt-12 rounded-3xl border border-neutral-100 bg-neutral-50 p-12 text-center text-sm text-neutral-500">
        조건에 맞는 상품이 없습니다. 필터를 조정해보세요.
      </p>
      <div v-else class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
        />
      </div>
    </section>
  </div>
</template>
