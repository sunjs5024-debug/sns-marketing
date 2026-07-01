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
      tagline: PLATFORMS[slug].tagline,
      gradient: PLATFORMS[slug].bgGradient,
      base: MARKETING_PLATFORMS.includes(slug) ? "marketing" : "sns",
      items: (all.value ?? [])
        .filter((p) => platformKeyFor(p.categorySlug) === slug)
        .sort((a, b) => a.basePrice - b.basePrice),
    }))
    .filter((g) => g.items.length > 0);
});

const totalCount = computed(() => (all.value ?? []).length);
const platformCount = computed(() => groups.value.length);
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
  <div class="pb-16">
    <!-- 히어로 -->
    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div class="pointer-events-none absolute -left-16 -top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl anim-blob" style="animation-delay: -6s" />
      <div class="relative mx-auto max-w-5xl px-4 py-12 text-center text-white sm:px-6 sm:py-16 lg:px-8">
        <p class="text-xs uppercase tracking-[0.2em] text-white/80">PRICE LIST</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">전체 가격표</h1>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85">
          모든 상품 가격을 한눈에. 표시 가격은 최저가 기준이며, 수량 옵션에 따라 달라집니다.
        </p>
        <!-- 요약 스탯 -->
        <div class="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-2 sm:gap-3">
          <div class="rounded-2xl bg-white/15 px-3 py-3 backdrop-blur-sm">
            <p class="font-display text-xl sm:text-2xl">{{ totalCount }}</p>
            <p class="text-[11px] text-white/75">전체 상품</p>
          </div>
          <div class="rounded-2xl bg-white/15 px-3 py-3 backdrop-blur-sm">
            <p class="font-display text-xl sm:text-2xl">{{ platformCount }}</p>
            <p class="text-[11px] text-white/75">플랫폼</p>
          </div>
          <div class="rounded-2xl bg-white/15 px-3 py-3 backdrop-blur-sm">
            <p class="font-display text-xl sm:text-2xl">{{ formatPrice(minPrice) }}~</p>
            <p class="text-[11px] text-white/75">최저가</p>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <!-- 플랫폼 점프 -->
      <div class="sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-neutral-100 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-b-2xl sm:px-4">
        <a
          v-for="g in groups"
          :key="g.slug"
          :href="`#${g.slug}`"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <BrandIcon :kind="g.slug" :size="16" />
          {{ g.label }}
        </a>
      </div>

      <!-- 플랫폼별 가격 카드 -->
      <div class="mt-8 space-y-8">
        <section v-for="g in groups" :key="g.slug" :id="g.slug" class="scroll-mt-32">
          <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <!-- 카드 헤더 -->
            <div :class="['flex items-center gap-3 bg-gradient-to-r px-5 py-4', g.gradient]">
              <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70 shadow-sm backdrop-blur-sm">
                <BrandIcon :kind="g.slug" :size="26" />
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="font-display text-lg text-neutral-900">{{ g.label }}</h2>
                <p class="truncate text-xs text-neutral-600">{{ g.tagline }}</p>
              </div>
              <NuxtLink :to="`/${g.base}/${g.slug}`" class="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-xs text-neutral-800 hover:bg-white">
                전체 보기 →
              </NuxtLink>
            </div>

            <!-- 상품 행 -->
            <NuxtLink
              v-for="(p, i) in g.items"
              :key="p.slug"
              :to="`/products/${p.slug}`"
              :class="[
                'group flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3.5 text-sm transition hover:bg-indigo-50/40',
                i % 2 === 1 ? 'bg-neutral-50/40' : '',
              ]"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span class="min-w-0 truncate text-neutral-800 group-hover:text-neutral-900">{{ p.name }}</span>
                <span v-if="p.featured" class="shrink-0 rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-medium text-rose-600">인기</span>
              </span>
              <span class="flex shrink-0 items-center gap-2.5">
                <span class="rounded-lg bg-indigo-50 px-2.5 py-1 font-display text-sm text-indigo-700">{{ formatPrice(p.basePrice) }}<span class="text-[10px] text-indigo-400">~</span></span>
                <span class="grid h-6 w-6 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-900 group-hover:text-white">→</span>
              </span>
            </NuxtLink>
          </div>
        </section>
      </div>

      <!-- CTA -->
      <div class="mt-12 rounded-3xl bg-gradient-to-br from-neutral-900 via-indigo-950 to-purple-950 px-6 py-8 text-center text-white sm:px-10">
        <p class="font-display text-xl">원하는 상품을 찾으셨나요?</p>
        <p class="mt-2 text-sm text-neutral-300">궁금한 점은 텔레그램으로 1:1 상담 받으실 수 있어요. 평균 응답 30분 이내.</p>
        <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
          <NuxtLink to="/sns" class="rounded-full bg-white px-5 py-3 text-sm text-neutral-900 hover:bg-neutral-100">상품 둘러보기</NuxtLink>
          <NuxtLink to="/support" class="rounded-full border border-white/40 px-5 py-3 text-sm text-white hover:bg-white/10">고객센터</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
