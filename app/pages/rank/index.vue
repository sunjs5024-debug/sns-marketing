<script setup lang="ts">
import { PLATFORMS, RANK_PLATFORMS, platformKeyFor } from "#shared/catalog";

useHead({ title: "상위노출 — 스마트스토어·블로그·카페" });

const { data: products } = await useFetch("/api/products/by-section", {
  query: { section: "RANK" },
});
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      <div class="pointer-events-none absolute -left-10 top-0 h-80 w-80 bg-emerald-300/30 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute right-0 bottom-0 h-72 w-72 bg-lime-300/30 blur-3xl anim-blob" style="animation-delay: -6s" />
      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p class="text-xs uppercase tracking-widest text-emerald-700">SEARCH RANKING</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-tight">
          검색 키워드 상위노출, <br class="sm:hidden" />
          <span
            class="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent anim-gradient-flow"
            style="background-size: 200% 200%"
          >매출과 방문이 함께 오르는 마케팅</span>
        </h1>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle title="플랫폼 선택" />
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlatformCard v-for="slug in RANK_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="rank" />
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="HOT" title="상위노출 인기 상품" more-href="/rank" />
      <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
