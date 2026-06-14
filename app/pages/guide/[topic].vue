<script setup lang="ts">
import { getGuide } from "#shared/guides";

const route = useRoute();
const topic = computed(() => String(route.params.topic));

const guide = getGuide(topic.value);
if (!guide) throw createError({ statusCode: 404, statusMessage: "가이드를 찾을 수 없습니다." });

// SEO 메타 — 키워드 페이지 최우선
useSeoMeta({
  title: guide.title,
  description: guide.metaDescription,
  keywords: guide.keywords,
  ogTitle: guide.title,
  ogDescription: guide.metaDescription,
  ogType: "article",
  ogLocale: "ko_KR",
  twitterCard: "summary_large_image",
});

// 관련 카테고리 상품 (해당 플랫폼의 인기 상품 6개)
type Product = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  badge: "HOT" | "BEST" | "SALE" | "NEW" | null;
  rating: number;
  salesCount: number;
  category: { name: string; slug: string };
  _count: { options: number };
};
const { data: products } = await useFetch<Product[]>(
  () => `/api/products/by-platform/${guide!.primaryCategorySlug}`,
  { default: () => [] },
);
const relatedProducts = computed(() => (products.value ?? []).slice(0, 6));

// JSON-LD — Article + FAQPage + BreadcrumbList
useSchemaOrg([
  defineWebPage({
    name: guide.title,
    description: guide.metaDescription,
  }),
  {
    "@type": "Article",
    headline: guide.h1,
    description: guide.metaDescription,
    inLanguage: "ko-KR",
    author: { "@type": "Organization", name: "SNS소셜팩토리" },
    publisher: {
      "@type": "Organization",
      name: "SNS소셜팩토리",
      logo: { "@type": "ImageObject", url: "https://xn--sns-yg9lh0pw9l.kr/logo.png" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://xn--sns-yg9lh0pw9l.kr/guide/${guide.slug}`,
    },
  },
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "가이드", item: "https://xn--sns-yg9lh0pw9l.kr/guide" },
      { "@type": "ListItem", position: 3, name: guide.breadcrumbLabel, item: `https://xn--sns-yg9lh0pw9l.kr/guide/${guide.slug}` },
    ],
  },
  {
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
]);
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-12 lg:px-8">
    <!-- breadcrumb -->
    <nav class="text-xs text-neutral-500">
      <NuxtLink to="/" class="hover:text-neutral-900">홈</NuxtLink>
      <span class="mx-1">/</span>
      <NuxtLink to="/guide" class="hover:text-neutral-900">가이드</NuxtLink>
      <span class="mx-1">/</span>
      <span class="text-neutral-900">{{ guide.breadcrumbLabel }}</span>
    </nav>

    <!-- header -->
    <header class="mt-4">
      <p class="text-xs uppercase tracking-widest text-indigo-700">GUIDE · SEO</p>
      <h1 class="mt-2 font-display text-3xl tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.5rem] text-balance leading-[1.25]">
        {{ guide.h1 }}
      </h1>
      <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">{{ guide.intro }}</p>
      <div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 sm:text-xs">
        <span>📅 2026.06.01</span>
        <span>·</span>
        <span>📖 {{ guide.sections.length }}분 읽기</span>
        <span>·</span>
        <span>✓ 검증된 SNS 마케팅 가이드</span>
      </div>
    </header>

    <!-- 목차 -->
    <section class="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5">
      <p class="text-xs uppercase tracking-widest text-indigo-700">목차</p>
      <ol class="mt-3 space-y-1.5 text-sm">
        <li v-for="(s, i) in guide.sections" :key="i">
          <a :href="`#sec-${i}`" class="text-neutral-700 hover:text-indigo-600 hover:underline">{{ s.heading }}</a>
        </li>
        <li>
          <a href="#faq" class="text-neutral-700 hover:text-indigo-600 hover:underline">자주 묻는 질문 (FAQ)</a>
        </li>
      </ol>
    </section>

    <!-- 본문 -->
    <div class="mt-10 space-y-10">
      <section v-for="(s, i) in guide.sections" :key="i" :id="`sec-${i}`" class="scroll-mt-20">
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">{{ s.heading }}</h2>
        <p class="mt-3 text-sm leading-7 text-neutral-700 sm:text-base">{{ s.body }}</p>
      </section>
    </div>

    <!-- 관련 상품 CTA -->
    <section v-if="relatedProducts.length > 0" class="mt-14">
      <div class="rounded-3xl bg-gradient-to-br from-neutral-900 via-indigo-950 to-purple-950 p-6 text-white sm:p-8">
        <p class="text-xs uppercase tracking-widest text-indigo-300">START NOW</p>
        <h2 class="mt-2 font-display text-2xl">
          글로 읽지만 말고 — 바로 시작하기
        </h2>
        <p class="mt-2 text-sm text-neutral-300">
          위 가이드대로 실천 + SNS소셜팩토리 부스팅을 결합하면 효과가 가장 빠릅니다.
        </p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="p in relatedProducts"
            :key="p.id"
            :to="`/products/${p.slug}`"
            class="group rounded-2xl bg-white p-4 text-left text-neutral-900 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <p class="text-[10px] text-indigo-600">{{ p.category.name }}</p>
            <p class="mt-1 line-clamp-2 text-sm font-medium">{{ p.name }}</p>
            <p class="mt-3 font-display text-base text-neutral-900">{{ p.basePrice.toLocaleString("ko-KR") }}원~</p>
            <p class="mt-1 text-[10px] text-neutral-500">★ {{ p.rating.toFixed(1) }} · 판매 {{ p.salesCount.toLocaleString("ko-KR") }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="mt-14 scroll-mt-20">
      <h2 class="font-display text-2xl text-neutral-900">자주 묻는 질문 (FAQ)</h2>
      <div class="mt-6 divide-y divide-neutral-100 rounded-3xl border border-neutral-100">
        <details v-for="(f, i) in guide.faqs" :key="i" class="group p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm text-neutral-800 sm:text-base">
            <span>{{ f.q }}</span>
            <span class="ml-2 shrink-0 text-neutral-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <!-- 관련 다른 가이드 -->
    <section class="mt-14">
      <h2 class="font-display text-xl text-neutral-900">다른 가이드도 둘러보세요</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <NuxtLink to="/guide" class="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:bg-neutral-50">
          <p class="text-xs text-indigo-600">→ 전체 가이드</p>
          <p class="mt-1 text-sm text-neutral-900">SNS 마케팅 가이드 모음</p>
        </NuxtLink>
        <NuxtLink to="/reviews" class="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:bg-neutral-50">
          <p class="text-xs text-amber-600">★ 실제 후기</p>
          <p class="mt-1 text-sm text-neutral-900">고객 후기 — 진짜 효과 확인</p>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>
