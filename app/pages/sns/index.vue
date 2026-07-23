<script setup lang="ts">
import { PLATFORMS, SNS_PLATFORMS, platformKeyFor } from "#shared/catalog";

useSeoMeta({
  title: "SNS 마케팅 — 인스타그램·유튜브·틱톡·X·텔레그램",
  description:
    "인스타그램 팔로워·좋아요, 유튜브 조회수·쇼츠, 틱톡 팔로워·좋아요·조회수, X(트위터), 텔레그램까지 — 글로벌 실계정 기반 SNS 마케팅을 한 곳에서.",
  ogTitle: "SNS 마케팅 — 인스타·유튜브·틱톡·X·텔레그램 | SNS소셜팩토리",
  ogDescription:
    "SNS 채널 성장을 위한 모든 마케팅 상품. 실계정 기반 부스팅, 결과보고서 제공, 텔레그램 빠른 상담.",
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
    <PageHero eyebrow="SNS MARKETING" title="전체 상품" subtitle="팔로워·좋아요·조회수·구독자까지 — SNS 채널 성장에 필요한 모든 상품을 한 곳에서." />

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
