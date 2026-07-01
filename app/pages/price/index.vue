<script setup lang="ts">
import { SNS_PLATFORMS, MARKETING_PLATFORMS, PLATFORMS, platformKeyFor, formatPrice, type PlatformSlug } from "#shared/catalog";

type NavProd = { slug: string; name: string; featured: boolean; basePrice: number; categorySlug: string };

const { data: all } = await useFetch<NavProd[]>("/api/products/nav", {
  key: "nav-products",
  default: () => [],
});

const groups = computed(() => {
  const order: PlatformSlug[] = [...SNS_PLATFORMS, ...MARKETING_PLATFORMS];
  return order
    .map((slug) => ({
      slug,
      label: PLATFORMS[slug].shortName,
      base: MARKETING_PLATFORMS.includes(slug) ? "marketing" : "sns",
      items: (all.value ?? [])
        .filter((p) => platformKeyFor(p.categorySlug) === slug)
        .sort((a, b) => a.basePrice - b.basePrice),
    }))
    .filter((g) => g.items.length > 0);
});

const totalCount = computed(() => (all.value ?? []).length);
const minPrice = computed(() => {
  const list = all.value ?? [];
  return list.length ? Math.min(...list.map((p) => p.basePrice)) : 0;
});

useSeoMeta({
  title: "전체 가격표",
  description: "SNS소셜팩토리 전체 상품 가격을 한눈에. 인스타·유튜브·틱톡·텔레그램·X 등 플랫폼별 최저가를 확인하고 바로 주문하세요.",
  ogTitle: "전체 가격표 | SNS소셜팩토리",
  ogDescription: "플랫폼별 SNS 마케팅 상품 가격을 한눈에.",
  robots: "index, follow",
});
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <header class="text-center">
      <p class="text-xs uppercase tracking-widest text-indigo-600">PRICE</p>
      <h1 class="mt-2 font-display text-3xl text-neutral-900">전체 가격표</h1>
      <p class="mt-3 text-sm text-neutral-500">
        전체 {{ totalCount }}개 상품 · 최저 {{ formatPrice(minPrice) }}부터. 표시 가격은 최저가 기준이며, 수량 옵션에 따라 달라집니다.
      </p>
    </header>

    <div class="mt-10 space-y-8">
      <section v-for="g in groups" :key="g.slug">
        <div class="flex items-center gap-2.5">
          <BrandIcon :kind="g.slug" :size="26" />
          <h2 class="font-display text-lg text-neutral-900">{{ g.label }}</h2>
          <span class="text-xs text-neutral-400">{{ g.items.length }}개</span>
        </div>

        <div class="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <NuxtLink
            v-for="p in g.items"
            :key="p.slug"
            :to="`/products/${p.slug}`"
            class="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-sm transition first:border-t-0 hover:bg-neutral-50"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span class="min-w-0 truncate text-neutral-800">{{ p.name }}</span>
              <span v-if="p.featured" class="shrink-0 rounded bg-rose-100 px-1 text-[9px] font-medium text-rose-600">인기</span>
            </span>
            <span class="flex shrink-0 items-center gap-3">
              <span class="font-display text-neutral-900">{{ formatPrice(p.basePrice) }}<span class="text-xs text-neutral-400">~</span></span>
              <span class="grid h-6 w-6 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-900">→</span>
            </span>
          </NuxtLink>
        </div>
      </section>
    </div>

    <div class="mt-10 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-6 text-center">
      <p class="text-sm text-neutral-700">원하는 상품을 찾으셨나요? 궁금한 점은 언제든 문의해 주세요.</p>
      <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
        <NuxtLink to="/sns" class="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-700">상품 둘러보기</NuxtLink>
        <NuxtLink to="/support" class="rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-neutral-800 hover:bg-white">고객센터</NuxtLink>
      </div>
    </div>
  </div>
</template>
