<script setup lang="ts">
import { formatPrice, platformKeyFor, laneForCategorySlug, LANE_META, CONTACT } from "#shared/catalog";
import { cleanTargetUrl } from "#shared/target-url";

const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data: product, error } = await useFetch(`/api/products/${slug.value}`);
// API가 진짜 404(없음/판매중지)일 때만 404. DB 오류 등 5xx는 상태를 보존해야
// 일시 장애가 soft-404로 검색엔진에 잘못 색인 제거되는 것을 막는다.
if (error.value) {
  const code = error.value.statusCode ?? 500;
  throw createError({ statusCode: code, statusMessage: error.value.statusMessage ?? "오류" });
}
if (!product.value) throw createError({ statusCode: 404, statusMessage: "Not found" });

// 관련 상품 (같은 카테고리 + 같은 플랫폼 다른 카테고리)
type RelatedProduct = {
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
type Related = { sameCategory: RelatedProduct[]; samePlatform: RelatedProduct[] };
// 관련 상품은 페이지 진입을 막지 않도록 lazy 로 뒤이어 로드 (체감 속도 개선)
const { data: related } = useFetch<Related>(`/api/products/${slug.value}/related`, { lazy: true });

// 이 상품의 실제 승인된 리뷰
type ProductReview = {
  id: string;
  rating: number;
  content: string;
  date: string;
  author: string;
};
// 후기도 lazy — 상품 본문이 먼저 뜨고 후기는 뒤이어 채워짐 (별점 aggregateRating 은 상품 데이터로 유지)
const { data: reviewsData } = useFetch<{ reviews: ProductReview[]; avgRating: number; totalCount: number }>(
  () => `/api/reviews?productId=${product.value!.id}&limit=8`,
  { lazy: true, default: () => ({ reviews: [], avgRating: 5.0, totalCount: 0 }) },
);
const productReviews = computed(() => reviewsData.value?.reviews ?? []);
const productRating = computed(() =>
  (reviewsData.value?.totalCount ?? 0) > 0 ? reviewsData.value!.avgRating : product.value!.rating,
);
const productReviewCount = computed(() =>
  (reviewsData.value?.totalCount ?? 0) > 0 ? reviewsData.value!.totalCount : Math.max(product.value!.salesCount, 1),
);

// SEO 메타 — 상품명 + 설명 + 키워드 + OG
const metaDesc = computed(() => {
  const base = product.value?.description ?? `${product.value?.name} | ${product.value?.category.name}`;
  // 너무 짧으면 카테고리·brand 보강
  return base.length < 80
    ? `${base} | 한국인 실계정 · 빠른 처리 · 30일 보장 | SNS소셜팩토리`
    : base;
});

// ★SEO 타이틀 = 구매 검색어 정조준. keywords 첫 항목(정확 핵심키워드) + "구매·늘리기".
//   기존 title=제품명("텔레그램 채널 구독자 (HQ…)")은 실검색어 "텔레그램 구독자 구매/늘리기"를
//   놓쳐 2페이지에 묶였음. 경쟁 상위는 전부 풀키워드를 타이틀에 박음 → 온페이지 즉시 갭 해소.
const seoKeyword = (product.value.keywords ?? "").split(",")[0]?.trim() || product.value.name;
// 보통 "구매·늘리기"(구매+늘리기 두 검색의도 동시 조준). 단 키워드에 이미 "구매"가 있으면 중복 방지.
const seoTitle = seoKeyword.includes("구매") ? `${seoKeyword} 늘리기` : `${seoKeyword} 구매·늘리기`;

useSeoMeta({
  // 전역 titleTemplate(seo-utils)가 " | SNS소셜팩토리"를 자동으로 덧붙임 → 본문엔 브랜드 제외(중복 방지)
  title: seoTitle,
  description: metaDesc.value,
  keywords: product.value.keywords ?? undefined,
  ogTitle: `${seoTitle} | SNS소셜팩토리`,
  ogDescription: metaDesc.value,
  ogType: "product",
  ogLocale: "ko_KR",
});

// 구조화 데이터 — Product + AggregateRating + Offer + BreadcrumbList
// → 구글 검색 결과에 별점·가격 리치 스니펫 노출 유도
// 레인(SNS/플랫폼 마케팅/상위노출)은 카테고리 슬러그 기준 — DB enum 보다 catalog 가 우선
const lane = laneForCategorySlug(product.value.category.slug);
const sectionLabel = LANE_META[lane].label;
const sectionPath = LANE_META[lane].path;
// 브레드크럼 카테고리 링크 = 플랫폼 목록 페이지(예: /sns/telegram). "전체 보기" 링크(하단)와 동일 규칙.
const categoryUrl = `${sectionPath}/${product.value.category.slug.split("-")[0]}`;

// FAQ 파싱 — DB Json 필드
type Faq = { q: string; a: string };
const faqs = computed<Faq[]>(() => {
  const raw = product.value?.faqs as unknown;
  if (Array.isArray(raw)) return raw.filter((f) => f?.q && f?.a) as Faq[];
  return [];
});

// Product JSON-LD — review 배열은 실제 DB 리뷰가 있으면 6개 노출 (구글 리치 결과 별점)
const productSchema: Record<string, unknown> = {
  "@type": "Product",
  name: product.value.name,
  description: product.value.description ?? "",
  category: product.value.category.name,
  // GSC 리치결과 검사: image=필수, brand=권장 (누락 경고 해소)
  image: "https://xn--sns-yg9lh0pw9l.kr/og-cover-v2.png",
  brand: { "@type": "Brand", name: "SNS소셜팩토리" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: productRating.value,
    bestRating: 5,
    reviewCount: productReviewCount.value,
  },
  offers: {
    "@type": "Offer",
    url: `https://xn--sns-yg9lh0pw9l.kr/products/${product.value.slug}`,
    priceCurrency: "KRW",
    price: product.value.basePrice,
    availability: product.value.isActive
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    seller: { "@type": "Organization", name: "SNS소셜팩토리" },
  },
};
if (productReviews.value.length > 0) {
  productSchema.review = productReviews.value.slice(0, 6).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.author },
    datePublished: r.date.replace(/\./g, "-"),
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.content,
  }));
}

const schemaList: Array<Record<string, unknown>> = [
  productSchema,
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: sectionLabel, item: `https://xn--sns-yg9lh0pw9l.kr${sectionPath}` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.value.category.name,
        item: `https://xn--sns-yg9lh0pw9l.kr/products/${product.value.slug}`,
      },
    ],
  },
];

// FAQ 가 있으면 FAQPage 마크업 추가 (구글 검색 결과 리치 스니펫)
if (faqs.value.length > 0) {
  schemaList.push({
    "@type": "FAQPage",
    mainEntity: faqs.value.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

useSchemaOrg(schemaList);

const iconKey = computed(() => (product.value ? platformKeyFor(product.value.category.slug) : null));
const selectedOption = ref(product.value.options[0] ?? null);
const targetUrl = ref("");
const memo = ref("");
const feedback = ref<string | null>(null);
const feedbackError = ref(false);
const pending = ref(false);

// 인스타 계열이면 플래그/공개계정 주의사항 노출
const isInstagram = computed(() => iconKey.value === "instagram");

const unitPrice = computed(() => selectedOption.value?.price ?? product.value?.basePrice ?? 0);

// 발주 매핑(externalServiceId) 없는 상품 = 오픈예정 (아직 주문 불가)
const isComingSoon = computed(() => {
  const opts = (product.value?.options ?? []) as Array<{ externalServiceId?: number | null }>;
  return opts.length > 0 && opts.every((o) => o.externalServiceId == null);
});

const router = useRouter();

async function handleAdd(mode: "cart" | "buy") {
  if (isComingSoon.value) { feedback.value = "곧 오픈 예정인 상품입니다."; feedbackError.value = true; return; }

  // URL 필수 — 비어있으면 주문 진행 막고 안내
  const cleaned = cleanTargetUrl(targetUrl.value);
  if (!cleaned) {
    feedback.value = "작업하실 URL(계정 또는 게시물 주소)을 입력해주세요.";
    feedbackError.value = true;
    return;
  }
  // 추적 파라미터 제거된 깔끔한 주소를 입력칸에도 반영
  targetUrl.value = cleaned;

  feedback.value = null;
  feedbackError.value = false;
  pending.value = true;
  try {
    await $fetch("/api/cart/add", {
      method: "POST",
      body: {
        productId: product.value!.id,
        optionId: selectedOption.value?.id ?? null,
        quantity: 1,
        targetUrl: cleaned,
        memo: memo.value || undefined,
      },
    });
    if (mode === "buy") {
      router.push("/checkout");
    } else {
      feedback.value = "장바구니에 담았습니다.";
      await refreshNuxtData();
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; statusCode?: number };
    // 401 미인증 → 로그인 페이지로 유도
    if (err.statusCode === 401) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/products/${slug.value}`)}`);
      return;
    }
    feedback.value = err.data?.statusMessage ?? err.statusMessage ?? "오류가 발생했습니다.";
    feedbackError.value = true;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div v-if="product" class="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8 lg:pb-10">
    <!-- 브레드크럼 = 실제 내부링크(홈·섹션·카테고리). 크롤러가 상위 계층을 따라 크롤. -->
    <nav class="mb-6 text-xs text-neutral-500">
      <NuxtLink to="/" class="hover:text-neutral-900 hover:underline">홈</NuxtLink>
      <span class="mx-1">/</span>
      <NuxtLink :to="sectionPath" class="hover:text-neutral-900 hover:underline">{{ sectionLabel }}</NuxtLink>
      <span class="mx-1">/</span>
      <NuxtLink :to="categoryUrl" class="text-neutral-900 hover:underline">{{ product.category.name }}</NuxtLink>
    </nav>

    <div class="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <!-- 이미지: 모바일에서는 작게(h-56), lg부터 정사각형 -->
      <div class="relative h-56 sm:h-72 lg:aspect-square lg:h-auto overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div class="pointer-events-none absolute -right-10 -top-10 h-60 w-60 bg-indigo-200/40 blur-3xl anim-blob" />
        <div class="pointer-events-none absolute -left-10 -bottom-10 h-60 w-60 bg-pink-200/40 blur-3xl anim-blob" style="animation-delay: -7s" />
        <div class="absolute inset-0 grid place-items-center">
          <div class="anim-float-up">
            <BrandIcon v-if="iconKey" :kind="iconKey" :size="120" class="drop-shadow-2xl lg:[--size:220px]" />
            <span v-else class="text-7xl lg:text-9xl">📦</span>
          </div>
        </div>
        <div v-if="product.badge" class="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
          <BadgePill :badge="product.badge" />
        </div>
      </div>

      <div>
        <p class="text-xs text-indigo-600">{{ product.category.name }}</p>
        <h1 class="mt-2 font-display text-2xl tracking-tight text-neutral-900 sm:text-3xl text-balance leading-tight">{{ product.name }}</h1>
        <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
          <span class="text-amber-500">★ {{ productRating.toFixed(1) }}</span>
          <span v-if="productReviews.length > 0" class="text-xs text-neutral-500">({{ productReviewCount.toLocaleString("ko-KR") }}건 후기)</span>
          <span>·</span>
          <span>판매 {{ product.salesCount.toLocaleString("ko-KR") }}</span>
          <a v-if="productReviews.length > 0" href="#product-reviews" class="text-xs text-indigo-600 hover:underline">후기 보기 →</a>
        </div>
        <p v-if="product.description" class="mt-5 text-sm leading-7 text-neutral-700">{{ product.description }}</p>

        <div class="mt-6 rounded-3xl border border-neutral-100 bg-neutral-50 p-5">
          <div class="flex items-baseline justify-between">
            <span class="text-xs text-neutral-500">최저가</span>
            <span class="font-display text-3xl text-neutral-900">{{ formatPrice(unitPrice) }}</span>
          </div>
          <p v-if="product.guaranteeInfo" class="mt-2 text-xs text-emerald-700">✓ {{ product.guaranteeInfo }}</p>
          <p v-if="product.deliveryInfo" class="mt-1 text-xs text-neutral-600">⏱ {{ product.deliveryInfo }}</p>
        </div>

        <div v-if="product.options.length > 0" class="mt-6">
          <h3 class="font-display text-sm text-neutral-900">수량 옵션 선택</h3>
          <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              v-for="opt in product.options"
              :key="opt.id"
              type="button"
              :class="[
                'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition',
                selectedOption?.id === opt.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white hover:border-neutral-400',
              ]"
              @click="selectedOption = opt"
            >
              <span>{{ opt.label }}</span>
              <span :class="selectedOption?.id === opt.id ? 'font-display' : 'font-display text-indigo-600'">
                {{ formatPrice(opt.price) }}
              </span>
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <label class="block">
            <span class="text-sm text-neutral-700">작업할 URL <span class="text-rose-500">*</span></span>
            <input
              v-model="targetUrl"
              type="url"
              placeholder="예: https://www.instagram.com/reel/AbC123xyz/"
              class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            />
            <span class="mt-1 block text-xs text-neutral-500">
              작업할 <b>게시물 또는 계정 주소</b>를 붙여넣어 주세요. 물음표(?) 뒤 추적 문구는 자동으로 정리됩니다. 공개 주소만 필요하며 비밀번호는 절대 묻지 않습니다.
            </span>
          </label>

          <!-- 인스타 계열: 반영 지연 방지 안내 (플래그·공개계정) -->
          <div v-if="isInstagram" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p class="flex items-center gap-1.5 text-sm font-semibold">
              <span>⚠️</span><span>주문 전 확인해 주세요</span>
            </p>
            <p class="mt-1 text-[13px] leading-6 text-amber-800">
              아래 설정이 안 돼 있으면 좋아요·댓글·팔로워 반영이 지연되거나 누락될 수 있어요.
            </p>
            <ul class="mt-3 space-y-2 text-[13px] leading-6">
              <li class="flex gap-2">
                <span class="font-semibold text-amber-600">1.</span>
                <span>계정을 <b>공개</b>로 전환</span>
              </li>
              <li class="flex gap-2">
                <span class="font-semibold text-amber-600">2.</span>
                <span>인스타 <b>설정 → 팔로우 및 친구 초대 → '검토를 위한 플래그'</b> 끄기</span>
              </li>
              <li class="flex gap-2">
                <span class="font-semibold text-amber-600">3.</span>
                <span>해당 게시물의 <b>댓글·좋아요 제한</b> 해제</span>
              </li>
            </ul>
          </div>
          <label class="block">
            <span class="text-sm text-neutral-700">요청사항 (선택)</span>
            <textarea
              v-model="memo"
              rows="2"
              placeholder="작업 시점이나 분산 방식 등 원하시는 내용을 적어주세요"
              class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </label>
        </div>

        <p
          v-if="feedback"
          class="mt-4 rounded-xl px-4 py-3 text-sm"
          :class="feedbackError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'"
        >{{ feedback }}</p>

        <!-- 오픈 예정 안내 -->
        <div v-if="isComingSoon" class="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          🔜 <b>오픈 예정 상품</b>입니다. 준비 중이며 곧 만나보실 수 있어요.
        </div>

        <!-- 데스크탑: 인라인 구매 버튼 (모바일에선 sticky bottom bar 사용) -->
        <div class="mt-8 hidden gap-3 lg:flex">
          <button
            type="button"
            :disabled="pending || isComingSoon"
            class="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleAdd('cart')"
          >
            장바구니
          </button>
          <button
            type="button"
            :disabled="pending || isComingSoon"
            class="flex-[2] rounded-full bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleAdd('buy')"
          >
            {{ isComingSoon ? "오픈 예정" : pending ? "처리 중…" : "바로 구매하기" }}
          </button>
        </div>

        <!-- 모바일 sticky 하단 구매 바 -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md">
          <div class="mx-auto flex max-w-7xl items-center gap-2">
            <div class="flex flex-1 flex-col">
              <span class="text-[10px] text-neutral-500">최저가</span>
              <span class="font-display text-lg text-neutral-900">{{ formatPrice(unitPrice) }}</span>
            </div>
            <button
              type="button"
              :disabled="pending || isComingSoon"
              class="rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed"
              @click="handleAdd('cart')"
            >🛒</button>
            <button
              type="button"
              :disabled="pending || isComingSoon"
              class="flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
              @click="handleAdd('buy')"
            >{{ isComingSoon ? "오픈 예정" : pending ? "처리 중…" : "바로 구매" }}</button>
          </div>
        </div>
      </div>
    </div>

    <section v-if="product.longDescription" class="mt-16">
      <h2 class="font-display text-xl text-neutral-900">상품 상세 안내</h2>
      <!-- mdLite: ## 소제목 · **볼드** · - 불릿 렌더(우리 DB 콘텐츠 전용, 이스케이프 후 안전) -->
      <div class="mt-4 rounded-3xl border border-neutral-100 bg-white p-6 text-sm text-neutral-700" v-html="mdLite(product.longDescription)" />
    </section>

    <!-- 이용 안내 — 진행 방식·주의사항·안전 이용 (플랫폼별 공통 본문) -->
    <ProductUsageGuide :platform-key="platformKeyFor(product.category.slug)" />

    <!-- 추천 대상 + 안심 보장 (모든 상품 공통 안내) -->
    <section class="mt-12 grid gap-4 lg:grid-cols-2">
      <div class="rounded-3xl border border-neutral-100 bg-white p-6">
        <h2 class="font-display text-lg text-neutral-900">이런 분께 추천해요</h2>
        <ul class="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
          <li class="flex gap-2"><span class="text-indigo-500">✅</span><span>새 계정·신규 채널을 빠르게 키우고 싶은 분</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">✅</span><span>광고·협찬 전에 계정 신뢰도(팔로워·좋아요·후기)를 올리고 싶은 분</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">✅</span><span>알고리즘 노출·자연 유입의 초기 부스팅이 필요한 분</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">✅</span><span>소상공인·브랜드·크리에이터로 마케팅 효율을 높이고 싶은 분</span></li>
        </ul>
      </div>
      <div class="rounded-3xl border border-neutral-100 bg-white p-6">
        <h2 class="font-display text-lg text-neutral-900">안심하고 이용하세요</h2>
        <ul class="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
          <li class="flex gap-2"><span>🔒</span><span><b>비밀번호 요구 없음</b> — 공개 URL·닉네임만으로 진행돼 계정이 안전해요.</span></li>
          <li class="flex gap-2"><span>👥</span><span><b>실계정 기반</b> 처리로 자연스럽게 녹아드는 부스팅.</span></li>
          <li class="flex gap-2"><span>🛡️</span><span><b>30일 유지 보장</b> — 보장 기간 내 이탈 시 자동 리필.</span></li>
          <li class="flex gap-2"><span>📄</span><span>완료 시 <b>결과보고서 자동 발송</b> · 세금계산서 발행 가능.</span></li>
          <li class="flex gap-2"><span>↩️</span><span>작업 시작 전에는 <b>100% 환불</b> 가능.</span></li>
        </ul>
      </div>
    </section>

    <section v-if="faqs.length > 0" class="mt-12">
      <h2 class="font-display text-xl text-neutral-900">자주 묻는 질문</h2>
      <div class="mt-4 divide-y divide-neutral-100 rounded-3xl border border-neutral-100 bg-white">
        <details v-for="(f, i) in faqs" :key="i" class="group p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm text-neutral-900">
            <span class="pr-3">{{ f.q }}</span>
            <span class="text-neutral-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-sm text-neutral-600" v-html="mdLite(f.a)" />
          <!-- FAQ 답변도 **볼드**/불릿 지원 -->

        </details>
      </div>
    </section>

    <!-- 관련 가이드 내부링크 — 미크롤 가이드에 크롤 경로 제공(색인 유도) + 검색자 정보 연결 -->
    <RelatedGuideLinks :platform-key="iconKey" card />

    <!-- 이 상품 실제 구매자 후기 (DB 승인 리뷰만) -->
    <section
      v-if="productReviews.length > 0"
      id="product-reviews"
      class="mt-12"
    >
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs uppercase tracking-widest text-amber-600">VERIFIED REVIEWS</p>
          <h2 class="mt-1 font-display text-xl text-neutral-900">
            실제 구매자 후기
            <span class="text-amber-500">★ {{ productRating.toFixed(1) }}</span>
            <span class="text-sm text-neutral-500">({{ productReviewCount.toLocaleString("ko-KR") }}건)</span>
          </h2>
        </div>
        <NuxtLink to="/reviews" class="hidden text-xs text-neutral-500 hover:text-neutral-900 sm:inline">전체 후기 보기 →</NuxtLink>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="r in productReviews.slice(0, 6)"
          :key="r.id"
          class="rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <span class="text-amber-500">{{ "★".repeat(r.rating) }}<span class="text-neutral-200">{{ "★".repeat(5 - r.rating) }}</span></span>
            <span class="text-[10px] text-neutral-400">{{ r.date }}</span>
          </div>
          <p class="mt-2 whitespace-pre-line text-[13px] leading-6 text-neutral-700">"{{ r.content }}"</p>
          <p class="mt-3 text-[11px] text-neutral-500">— {{ r.author }} · <span class="rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-700">✓ 구매자</span></p>
        </article>
      </div>
    </section>

    <!-- 같은 카테고리 인기 상품 -->
    <section v-if="(related?.sameCategory ?? []).length > 0" class="mt-12">
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs uppercase tracking-widest text-indigo-600">SAME CATEGORY</p>
          <h2 class="mt-1 font-display text-xl text-neutral-900">같은 카테고리 인기 상품</h2>
        </div>
        <NuxtLink
          v-if="product?.category"
          :to="`${sectionPath}/${product.category.slug.split('-')[0]}`"
          class="hidden text-xs text-neutral-500 hover:text-neutral-900 sm:inline"
        >전체 보기 →</NuxtLink>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        <ProductCard
          v-for="p in related?.sameCategory ?? []"
          :key="p.id"
          :slug="p.slug"
          :name="p.name"
          :base-price="p.basePrice"
          :badge="p.badge"
          :rating="p.rating"
          :sales-count="p.salesCount"
          :category-name="p.category.name"
          :icon-key="platformKeyFor(p.category.slug)"
          :option-count="p._count?.options"
        />
      </div>
    </section>

    <!-- 함께 보면 좋은 상품 (같은 플랫폼 다른 카테고리) -->
    <section v-if="(related?.samePlatform ?? []).length > 0" class="mt-12">
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs uppercase tracking-widest text-pink-600">YOU MAY ALSO LIKE</p>
          <h2 class="mt-1 font-display text-xl text-neutral-900">함께 보면 좋은 상품</h2>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        <ProductCard
          v-for="p in related?.samePlatform ?? []"
          :key="p.id"
          :slug="p.slug"
          :name="p.name"
          :base-price="p.basePrice"
          :badge="p.badge"
          :rating="p.rating"
          :sales-count="p.salesCount"
          :category-name="p.category.name"
          :icon-key="platformKeyFor(p.category.slug)"
          :option-count="p._count?.options"
        />
      </div>
    </section>

    <section class="mt-12 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 px-6 py-8 text-center text-white sm:px-10">
      <p class="font-display text-xl">더 궁금한 점이 있으신가요?</p>
      <p class="mt-2 text-sm text-sky-100">텔레그램으로 1:1 상담 받으실 수 있어요. 평균 응답 30분 이내.</p>
      <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
        <a
          :href="CONTACT.telegram.url"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm text-blue-700 hover:bg-sky-50"
        >
          <TelegramIcon :size="20" />
          텔레그램 상담
        </a>
        <NuxtLink to="/faq" class="inline-block rounded-full border border-white/40 px-5 py-3 text-sm text-white hover:bg-white/10">전체 FAQ 보기 →</NuxtLink>
      </div>
    </section>
  </div>
</template>
