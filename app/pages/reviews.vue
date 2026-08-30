<script setup lang="ts">
useSeoMeta({
  title: "고객 후기",
  description:
    "SNS소셜팩토리 이용 후기. 실제 구매 후 작성된 후기를 모읍니다. 모든 작업은 실계정 기반으로 처리하고 완료 시 결과보고서를 보내드립니다.",
  ogTitle: "고객 후기 — SNS소셜팩토리",
  ogDescription: "SNS 마케팅 이용 후기. 실계정 기반 처리 · 결과보고서 제공.",
  ogType: "website",
  ogLocale: "ko_KR",
});

type Review = {
  author: string;
  tag: string;
  text: string;
  rating: number;
  date: string;
};

// DB 의 검증된 실제 리뷰 (관리자 승인된 것) — 유일한 후기 소스. 창작/더미 후기 금지(정직성 대원칙).
type DbReview = {
  id: string;
  rating: number;
  content: string;
  date: string;
  author: string;
  productName: string;
  categoryName: string;
};
const { data: liveData } = await useFetch<{ reviews: DbReview[]; avgRating: number; totalCount: number }>("/api/reviews", {
  default: () => ({ reviews: [], avgRating: 0, totalCount: 0 }),
});
const reviews = computed<Review[]>(() =>
  (liveData.value?.reviews ?? []).map((r) => ({
    author: r.author,
    tag: r.categoryName,
    text: r.content,
    rating: r.rating,
    date: r.date,
  })),
);
const totalCount = computed(() => liveData.value?.totalCount ?? 0);
const avgRating = computed(() => liveData.value?.avgRating ?? 0);

// 구조화 데이터 — aggregateRating·review 는 "실제 승인된 DB 리뷰가 있을 때만" 방출(가짜리뷰 정책 위반 방지).
//   @id 를 nuxt.config identity Organization 과 동일하게 줘 중복 엔티티 병합.
const reviewSchema: Record<string, unknown>[] = [
  defineWebPage({
    name: "고객 후기",
    description: "SNS 마케팅 이용 후기",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "고객 후기", item: "https://xn--sns-yg9lh0pw9l.kr/reviews" },
    ],
  },
];
if (totalCount.value > 0) {
  reviewSchema.push({
    "@type": "Organization",
    "@id": "https://xn--sns-yg9lh0pw9l.kr/#identity",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number((avgRating.value || 5).toFixed(2)),
      bestRating: 5,
      worstRating: 1,
      reviewCount: totalCount.value,
    },
    review: reviews.value.slice(0, 6).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.date.replace(/\./g, "-"),
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      reviewBody: r.text,
    })),
  });
}
useSchemaOrg(reviewSchema);
</script>

<template>
  <div>
    <PageHero
      eyebrow="CUSTOMER REVIEWS"
      title="고객 후기"
      subtitle="실제 구매 후 작성된 이용 후기를 모읍니다. 모든 작업은 실계정 기반으로 처리하고, 완료 시 결과보고서를 보내드려요."
    >
      <div v-if="totalCount > 0" class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        <span class="font-display text-2xl text-amber-500">★ {{ avgRating.toFixed(1) }}</span>
        <span class="text-neutral-600">전체 평점 · 총 {{ totalCount }}건</span>
      </div>
    </PageHero>
    <div class="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:px-8">

      <section v-if="reviews.length > 0" class="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <article
          v-for="r in reviews"
          :key="r.author + r.date"
          class="rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl sm:p-6"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-amber-500 sm:text-base">{{ "★".repeat(r.rating) }}<span class="text-neutral-200">{{ "★".repeat(5 - r.rating) }}</span></span>
            <span class="text-[10px] text-neutral-400 sm:text-xs">{{ r.date }}</span>
          </div>
          <p class="mt-2 text-[13px] leading-6 text-neutral-700 sm:mt-3 sm:text-sm">"{{ r.text }}"</p>
          <div class="mt-3 flex items-center justify-between gap-2 text-[11px] sm:mt-4 sm:text-xs">
            <span class="truncate text-neutral-900">{{ r.author }}</span>
            <span class="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 sm:px-2.5 sm:py-1">{{ r.tag }}</span>
          </div>
        </article>
      </section>

      <!-- 실제 승인 후기 0건 — 정직한 빈 상태(창작 후기 금지) -->
      <div v-else class="mt-10 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
        <p class="text-sm text-neutral-700">아직 등록된 구매 후기가 없습니다.</p>
        <p class="mt-2 text-[13px] leading-6 text-neutral-500">구매 후 결과보고서와 함께 후기를 남겨주시면, 검증된 실제 후기만 이곳에 반영됩니다.</p>
        <NuxtLink to="/sns" class="mt-5 inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">상품 둘러보기 →</NuxtLink>
      </div>
    </div>
  </div>
</template>
