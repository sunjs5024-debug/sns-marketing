<script setup lang="ts">
import { PLATFORMS, RANK_PLATFORMS, isValidPlatformSlug, platformKeyFor } from "#shared/catalog";

const route = useRoute();
const platformParam = computed(() => String(route.params.platform));

if (!isValidPlatformSlug(platformParam.value) || !RANK_PLATFORMS.includes(platformParam.value)) {
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
      { "@type": "ListItem", position: 2, name: "상위노출", item: "https://xn--sns-yg9lh0pw9l.kr/rank" },
      {
        "@type": "ListItem",
        position: 3,
        name: meta.shortName,
        item: `https://xn--sns-yg9lh0pw9l.kr/rank/${meta.slug}`,
      },
    ],
  },
]);

const { data: products } = await useFetch(`/api/products/by-platform/${platformParam.value}`);
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
            <p class="text-xs uppercase tracking-widest text-neutral-600">SEARCH RANKING</p>
            <h1 class="font-display text-3xl text-neutral-900 sm:text-4xl">{{ meta.name }}</h1>
          </div>
        </div>
        <p class="mt-5 max-w-2xl text-sm leading-7 text-neutral-700">{{ meta.description }}</p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle :title="`전체 ${meta.shortName} 상품`" :description="`총 ${(products ?? []).length}개의 상품이 준비되어 있습니다.`" />
      <p v-if="(products ?? []).length === 0" class="mt-12 text-center text-sm text-neutral-500">아직 등록된 상품이 없습니다.</p>
      <div v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
