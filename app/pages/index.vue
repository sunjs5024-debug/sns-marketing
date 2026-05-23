<script setup lang="ts">
import { PLATFORMS, SNS_PLATFORMS, RANK_PLATFORMS, platformKeyFor } from "#shared/catalog";

const { data: featured } = await useFetch("/api/products/featured");

// 각 항목별 카드 — 아이콘 SVG path + 그라데이션 컬러
const WHY_ITEMS = [
  {
    icon: "shield",
    color: "from-blue-500 to-cyan-500",
    title: "비밀번호 없이 안전하게",
    desc: "주문 시 비밀번호를 요구하지 않습니다. 공개된 URL과 닉네임만으로 처리되어 계정이 안전합니다.",
  },
  {
    icon: "users",
    color: "from-pink-500 to-rose-500",
    title: "실제 사용자 기반",
    desc: "어뷰징 봇이 아닌 실계정 기반으로 처리합니다. 알고리즘에 자연스럽게 녹아드는 부스팅입니다.",
  },
  {
    icon: "chart",
    color: "from-emerald-500 to-teal-500",
    title: "투명한 결과보고서",
    desc: "주문 진행률과 완료 시점을 실시간으로 확인할 수 있고, 완료 시 결과보고서가 자동 발송됩니다.",
  },
  {
    icon: "bolt",
    color: "from-amber-500 to-orange-500",
    title: "10분 내 빠른 시작",
    desc: "결제 후 평균 10분 안에 작업이 시작됩니다. 긴급 상황엔 우선 처리도 가능합니다.",
  },
  {
    icon: "wallet",
    color: "from-indigo-500 to-violet-500",
    title: "안전한 계좌이체",
    desc: "주문 시 안내되는 안전한 계좌로 입금만 하시면 즉시 작업이 시작됩니다.",
  },
  {
    icon: "chat",
    color: "from-yellow-400 to-amber-500",
    title: "24시간 카톡 상담",
    desc: "주문 전·후 언제든 카카오톡 채널로 문의 가능. 평일 영업시간 외에도 봇 + 인간 하이브리드로 응대합니다.",
  },
] as const;

const REVIEWS = [
  { author: "@de****_yj", tag: "인스타 크리에이터", text: "릴스 조회수랑 같이 팔로워가 늘어서 진짜 자연스러웠어요. 알고리즘이 푸쉬해주는 게 체감됩니다." },
  { author: "광교**사장님", tag: "네이버카페", text: "타겟 지역 카페에 가입자랑 후기글 같이 올렸더니 매장 검색 노출까지 같이 올라갔어요. 방문 손님이 30% 늘었습니다." },
  { author: "@vi***_seoul", tag: "스마트스토어 셀러", text: "상품 구매평이 20개 넘어가니까 그 다음부터는 자연 유입이 알아서 늘더라고요. 초기 부스팅용으로 추천!" },
  { author: "@da***_jiwon", tag: "유튜브", text: "쇼츠 조회수만 살짝 올렸는데 알고리즘이 노출을 늘려줘서 구독자가 따라 늘었어요." },
  { author: "감성카**오너", tag: "블로그 체험단", text: "체험단 5명 매칭으로 양질의 후기 글이 빠르게 쌓였습니다. 광고 같지 않고 자연스러워요." },
  { author: "@k_t****er", tag: "틱톡 크리에이터", text: "한국 타겟으로 부탁드렸는데 진짜 한국인 계정이 들어와서 댓글까지 달리더라고요. 만족!" },
];

const FAQS = [
  { q: "정말 계정이 안전한가요?", a: "네, 비밀번호를 요구하지 않습니다. 공개 프로필 URL과 닉네임만으로 처리되어 SNS 약관상 문제될 일이 없습니다." },
  { q: "작업은 얼마나 빨리 시작되나요?", a: "결제 완료 후 평균 10분 내 시작됩니다. 일부 대형 상품은 30분~수 시간 내 진행됩니다." },
  { q: "유지 기간이 있나요?", a: "상품별로 다릅니다. 일반적으로 30일 ~ 평생 보장 옵션을 제공하며, 유지 보장 기간 내 이탈 시 자동 리필됩니다." },
  { q: "결제는 어떻게 하나요?", a: "현재는 계좌이체로만 결제 가능합니다. 주문 완료 후 안내되는 계좌번호로 입금해주세요." },
  { q: "환불은 가능한가요?", a: "작업 시작 전엔 100% 환불 가능합니다. 작업 진행 중 / 완료 후엔 진행률에 따라 부분 환불이 적용됩니다." },
  { q: "결과 보고서를 받을 수 있나요?", a: "네, 모든 주문은 완료 시 자동으로 결과보고서가 이메일로 발송됩니다. 마이페이지에서도 확인 가능합니다." },
];

// ─── SEO ──────────────────────────────────────────────────
// 메인 페이지는 가장 중요한 랜딩. 한국어 검색 핵심 키워드 자연스럽게 포함.
useSeoMeta({
  // seo-utils 가 자동으로 " | SNS소셜팩토리" 를 뒤에 붙여줌 → title 본문엔 브랜드 제외
  title: "SNS 마케팅·상위노출 1번지",
  description:
    "인스타 팔로워·좋아요, 유튜브 구독자, 틱톡, 카카오톡, 스마트스토어·네이버 블로그·카페 상위노출까지. 실계정 기반 안전결제, 10분 내 빠른 시작, 결과보고서 보장.",
  ogTitle: "SNS 마케팅·상위노출 1번지 | SNS소셜팩토리",
  ogDescription:
    "인스타·유튜브·틱톡·카카오톡 SNS 마케팅과 스마트스토어·블로그·카페 상위노출. 실계정·안전결제·결과보고서로 신뢰를 드립니다.",
  ogType: "website",
  ogLocale: "ko_KR",
  ogSiteName: "SNS소셜팩토리",
  ogImage: "/og-cover.png",
  twitterCard: "summary_large_image",
  twitterTitle: "SNS 마케팅·상위노출 1번지 | SNS소셜팩토리",
  twitterDescription:
    "인스타·유튜브·틱톡·카카오톡 SNS 마케팅과 스마트스토어·블로그·카페 상위노출. 실계정·안전결제·결과보고서.",
  twitterImage: "/og-cover.png",
});

// 구조화 데이터 — WebPage + FAQPage (구글 리치 결과 FAQ 아코디언 노출 유도)
useSchemaOrg([
  defineWebPage({
    name: "SNS 마케팅·상위노출 1번지 | SNS소셜팩토리",
    description:
      "인스타·유튜브·틱톡·카카오톡 SNS 마케팅과 스마트스토어·블로그·카페 상위노출 전문 서비스.",
  }),
  // FAQPage 는 nuxt-schema-org 에 헬퍼가 없어 raw JSON-LD 로 직접 정의
  {
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  },
]);
</script>

<template>
  <div>
    <Hero />
    <LiveOrderTicker />

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="CATEGORY" title="어떤 마케팅이 필요하신가요?" description="플랫폼별 전문 상품으로 빠르게 시작하세요. 카테고리 클릭 시 상세 상품을 확인할 수 있습니다." />
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlatformCard v-for="slug in SNS_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="sns" />
        <PlatformCard v-for="slug in RANK_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="rank" />
      </div>
    </section>

    <section class="bg-neutral-50/60 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="BEST" title="시선집중! 가장 많이 찾는 상품" description="이번 주 가장 많이 판매된 BEST 상품을 모았습니다." more-href="/sns" />
        <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard
            v-for="p in featured ?? []"
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
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="WHY US" title="왜 SNS소셜팩토리를 선택할까요?" />
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="w in WHY_ITEMS"
          :key="w.title"
          class="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- hover 시 살짝 비치는 그라데이션 글로우 -->
          <div :class="['pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30 bg-gradient-to-br', w.color]" />

          <!-- 아이콘 박스 -->
          <div :class="['relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', w.color]">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <!-- shield -->
              <path v-if="w.icon === 'shield'" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path v-if="w.icon === 'shield'" d="M9 12l2 2 4-4" />
              <!-- users -->
              <template v-if="w.icon === 'users'">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </template>
              <!-- chart bar -->
              <template v-if="w.icon === 'chart'">
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="3" y1="20" x2="21" y2="20" />
              </template>
              <!-- bolt (lightning) -->
              <polygon v-if="w.icon === 'bolt'" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              <!-- wallet -->
              <template v-if="w.icon === 'wallet'">
                <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H3" />
                <path d="M21 12V9a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h14v4" />
                <circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
              </template>
              <!-- chat -->
              <template v-if="w.icon === 'chat'">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </template>
            </svg>
          </div>

          <h3 class="mt-5 font-display text-lg text-neutral-900">{{ w.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-neutral-600">{{ w.desc }}</p>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
      <div class="pointer-events-none absolute -left-20 top-10 h-72 w-72 bg-indigo-300/30 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 bg-pink-300/30 blur-3xl anim-blob" style="animation-delay: -7s" />
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="REVIEWS" title="실제 고객 후기" description="평균 만족도 4.9/5.0 — 마케터·소상공인·크리에이터의 진짜 후기를 확인하세요." more-href="/reviews" />
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="r in REVIEWS"
            :key="r.author"
            class="rounded-3xl border border-white/60 bg-white/85 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-center gap-2 text-amber-500">★★★★★</div>
            <p class="mt-3 text-sm leading-6 text-neutral-700">"{{ r.text }}"</p>
            <p class="mt-4 text-xs text-neutral-500">— {{ r.author }} · {{ r.tag }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
      <div class="mt-8 divide-y divide-neutral-100 rounded-3xl border border-neutral-100">
        <details v-for="f in FAQS" :key="f.q" class="group p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm text-neutral-800">
            {{ f.q }}
            <span class="text-neutral-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-sm leading-6 text-neutral-600">{{ f.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>
