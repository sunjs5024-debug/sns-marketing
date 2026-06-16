<script setup lang="ts">
import { PLATFORMS, MARKETING_PLATFORMS, platformKeyFor } from "#shared/catalog";

useSeoMeta({
  title: "플랫폼 마케팅 — 티스토리 블로그·에이블리 마켓",
  description:
    "티스토리 블로그 조회수·공감·구독자, 에이블리 마켓 찜·구매·리뷰까지 — SNS 너머 블로그·쇼핑몰 플랫폼 마케팅을 한 곳에서. 실사용 기반 안전 부스팅.",
  ogTitle: "플랫폼 마케팅 — 티스토리·에이블리 | SNS소셜팩토리",
  ogDescription:
    "블로그·쇼핑몰 플랫폼 성장을 위한 마케팅 상품. 티스토리 조회수·공감, 에이블리 찜·리뷰 등 안전 부스팅과 빠른 처리.",
  ogType: "website",
  ogLocale: "ko_KR",
});

// 브레드크럼 + 카테고리 페이지 구조화 데이터
useSchemaOrg([
  defineWebPage({
    name: "플랫폼 마케팅",
    description: "티스토리 블로그·에이블리 마켓 등 블로그·쇼핑몰 플랫폼 마케팅 상품 전체 카테고리",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "플랫폼 마케팅", item: "https://xn--sns-yg9lh0pw9l.kr/marketing" },
    ],
  },
]);

const { data: products } = await useFetch("/api/products/by-section", {
  query: { section: "MARKETING" },
});
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
      <div class="pointer-events-none absolute -left-10 top-0 h-80 w-80 bg-orange-300/30 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute right-0 bottom-0 h-72 w-72 bg-pink-300/30 blur-3xl anim-blob" style="animation-delay: -6s" />
      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p class="text-xs uppercase tracking-widest text-orange-600">PLATFORM MARKETING</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-tight">
          블로그부터 쇼핑몰까지, <br class="sm:hidden" />
          <span
            class="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent anim-gradient-flow"
            style="background-size: 200% 200%"
          >플랫폼 성장의 모든 것</span>
        </h1>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle title="플랫폼 선택" />
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlatformCard v-for="slug in MARKETING_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="marketing" />
      </div>
    </section>

    <section v-if="(products ?? []).length > 0" class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="HOT" title="플랫폼 마케팅 인기 상품" more-href="/marketing" />
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
