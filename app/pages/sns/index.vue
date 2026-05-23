<script setup lang="ts">
import { PLATFORMS, SNS_PLATFORMS, platformKeyFor } from "#shared/catalog";

useSeoMeta({
  title: "SNS 마케팅 — 인스타그램·유튜브·틱톡·카카오톡·텔레그램·X",
  description:
    "인스타그램 팔로워·좋아요, 유튜브 구독자·조회수, 틱톡 팔로워, 카카오톡 채널친구, 텔레그램, X(트위터)까지 — 한국인 실계정 기반 SNS 마케팅을 한 곳에서.",
  ogTitle: "SNS 마케팅 — 인스타·유튜브·틱톡·카카오톡·텔레그램·X | SNS소셜팩토리",
  ogDescription:
    "SNS 채널 성장을 위한 모든 마케팅 상품. 한국인 실계정 기반 안전 부스팅, 결과보고서 보장.",
  ogType: "website",
  ogLocale: "ko_KR",
});

// 브레드크럼 + 카테고리 페이지 구조화 데이터
useSchemaOrg([
  defineWebPage({
    name: "SNS 마케팅",
    description: "인스타·유튜브·틱톡·카카오톡·텔레그램·X SNS 마케팅 상품 전체 카테고리",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "SNS 마케팅", item: "https://xn--sns-yg9lh0pw9l.kr/sns" },
    ],
  },
]);

const { data: products } = await useFetch("/api/products/by-section", {
  query: { section: "SNS" },
});
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div class="pointer-events-none absolute -left-10 top-0 h-80 w-80 bg-pink-300/30 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute right-0 bottom-0 h-72 w-72 bg-indigo-300/30 blur-3xl anim-blob" style="animation-delay: -6s" />
      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p class="text-xs uppercase tracking-widest text-pink-600">SNS MARKETING</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-tight">
          팔로워부터 조회수까지, <br class="sm:hidden" />
          <span
            class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent anim-gradient-flow"
            style="background-size: 200% 200%"
          >SNS 채널 성장의 모든 것</span>
        </h1>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle title="플랫폼 선택" />
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlatformCard v-for="slug in SNS_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="sns" />
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="HOT" title="SNS 인기 상품" more-href="/sns" />
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
