<script setup lang="ts">
import { PLATFORMS, SNS_PLATFORMS, MARKETING_PLATFORMS, RANK_PLATFORMS, platformKeyFor, CONTACT } from "#shared/catalog";

const { data: featured } = await useFetch("/api/products/featured");
const { data: live } = await useFetch("/api/live");

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
    color: "from-sky-400 to-blue-500",
    title: "텔레그램 빠른 상담",
    desc: "주문 전·후 언제든 텔레그램(@snssocialfactory)으로 문의 가능. 평균 응답 30분 이내 · 글로벌·국내 모두 부담 없이.",
  },
] as const;

const REVIEWS = [
  { author: "@de****_yj", tag: "인스타 크리에이터", text: "릴스 조회수랑 같이 팔로워가 늘어서 진짜 자연스러웠어요. 알고리즘이 푸쉬해주는 게 체감됩니다." },
  { author: "@k_b***ty_lab", tag: "인스타 / 한국인", text: "한국 타겟 팔로워 80% 여성으로 받았는데 진짜 정확하게 들어와서 한국인 협찬 문의가 늘었어요." },
  { author: "@wt***_creator", tag: "유튜브 / 시청시간", text: "수익화 4,000시간 막막했는데 시청시간 옵션으로 한 달 만에 통과했어요. 비현실적이게 빨랐음." },
  { author: "@da***_jiwon", tag: "유튜브 / 쇼츠", text: "쇼츠 조회수만 살짝 올렸는데 알고리즘이 노출을 늘려줘서 구독자가 따라 늘었어요." },
  { author: "tg_re***_official", tag: "텔레그램 / 리액션", text: "이모지 리액션 5,000개 옵션 단가 진짜 저렴. 채널 게시물 활성도가 시각적으로 확 살아나요." },
  { author: "@k_t****er", tag: "틱톡 크리에이터", text: "글로벌 라이브스트림 옵션이 활성도 있는 시청자라 라이브 입장률이 확 늘었어요." },
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
  // 검색 핵심 키워드(인스타 팔로워 구매·좋아요)를 앞에 배치 — SERP 클릭·노출 유리
  title: "인스타 팔로워 구매·좋아요 늘리기 — SNS마케팅 1번지",
  description:
    "인스타 팔로워·좋아요·스토리, 유튜브 구독자·시청시간·쇼츠, 틱톡 팔로워·공유, X 리트윗, 텔레그램 리액션까지. 한국인 실계정·글로벌 가성비 옵션, 10분 내 빠른 시작, 결과보고서 보장.",
  ogTitle: "SNS 마케팅 1번지 | SNS소셜팩토리",
  ogDescription:
    "인스타·유튜브·틱톡·X·텔레그램 SNS 마케팅을 한 곳에서. 한국인 실계정·글로벌 가성비·안전결제·결과보고서로 신뢰를 드립니다.",
  ogType: "website",
  ogLocale: "ko_KR",
  ogSiteName: "SNS소셜팩토리",
  ogImage: "/og-cover-v2.png",
  twitterCard: "summary_large_image",
  twitterTitle: "SNS 마케팅 1번지 | SNS소셜팩토리",
  twitterDescription:
    "인스타·유튜브·틱톡·X·텔레그램 SNS 마케팅. 한국인 실계정·글로벌 가성비·안전결제·결과보고서.",
  twitterImage: "/og-cover-v2.png",
});

// 구조화 데이터 — WebPage + FAQPage (구글 리치 결과 FAQ 아코디언 노출 유도)
useSchemaOrg([
  defineWebPage({
    name: "SNS 마케팅 1번지 | SNS소셜팩토리",
    description:
      "인스타·유튜브·틱톡·X·텔레그램 SNS 마케팅 전문 서비스. 한국인 실계정·글로벌 가성비 옵션, 결과보고서 보장.",
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

// 회원가입 후 환영 팝업(모달) — 신규 계정이면 서버가 딱 한 번 welcome:true 반환
// (이메일/구글/네이버/카카오 무관, 어느 버튼에서 가입했든 동작)
const { status } = useAuth();
const showWelcome = ref(false);
onMounted(async () => {
  if (status.value === "unauthenticated") return; // 비로그인 방문자/크롤러는 호출 안 함
  try {
    const r = await $fetch<{ welcome: boolean }>("/api/me/welcome-check", { method: "POST" });
    if (r?.welcome) showWelcome.value = true;
  } catch {
    /* 비로그인/오류 시 무시 */
  }
});
</script>

<template>
  <div>
    <!-- 회원가입 환영 팝업(모달) -->
    <Transition name="welcome">
      <div v-if="showWelcome" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- 어두운 배경 (클릭 시 닫힘) -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showWelcome = false" />
        <!-- 팝업 카드 -->
        <div class="welcome-card relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-3xl shadow-lg">
            🎉
          </div>
          <h2 class="mt-5 font-display text-2xl text-neutral-900">가입을 환영합니다!</h2>
          <p class="mt-3 text-sm leading-relaxed text-neutral-500">
            회원가입이 정상적으로 완료되었습니다.<br />
            지금 바로 SNS소셜팩토리의<br />모든 서비스를 이용하실 수 있어요.
          </p>
          <button
            type="button"
            class="mt-7 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
            @click="showWelcome = false"
          >
            시작하기
          </button>
        </div>
      </div>
    </Transition>

    <Hero />

    <!-- 신뢰 통계 띠 (3분할) -->
    <section class="border-y border-neutral-100 bg-white">
      <div class="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-neutral-100 px-4 sm:px-6 lg:px-8">
        <div class="px-2 py-5 text-center sm:py-6">
          <p class="font-display text-xl text-neutral-900 sm:text-2xl">
            {{ (live?.cumulativeOrders ?? 58200).toLocaleString('ko-KR') }}<span class="text-sm text-indigo-600">+</span>
          </p>
          <p class="mt-0.5 text-[10px] text-neutral-500 sm:text-xs">누적 주문</p>
        </div>
        <div class="px-2 py-5 text-center sm:py-6">
          <p class="font-display text-xl text-amber-500 sm:text-2xl">★ 4.9<span class="text-sm text-neutral-400">/5</span></p>
          <p class="mt-0.5 text-[10px] text-neutral-500 sm:text-xs">평균 만족도</p>
        </div>
        <div class="px-2 py-5 text-center sm:py-6">
          <p class="font-display text-xl text-emerald-600 sm:text-2xl">10<span class="text-sm">분</span></p>
          <p class="mt-0.5 text-[10px] text-neutral-500 sm:text-xs">평균 시작 시간</p>
        </div>
      </div>
    </section>

    <LiveOrderTicker />

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="CATEGORY" title="어떤 마케팅이 필요하신가요?" description="플랫폼별 전문 상품으로 빠르게 시작하세요. 카테고리 클릭 시 상세 상품을 확인할 수 있습니다." />
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlatformCard v-for="slug in SNS_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="sns" />
        <PlatformCard v-for="slug in MARKETING_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="marketing" />
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
            :option-count="p._count?.options"
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
            class="group rounded-3xl border border-white/60 bg-white/85 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="flex items-center justify-between">
              <div class="text-amber-500">★★★★★</div>
              <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">{{ r.tag }}</span>
            </div>
            <p class="mt-3 text-sm leading-6 text-neutral-700">"{{ r.text }}"</p>
            <p class="mt-4 text-xs text-neutral-500">— {{ r.author }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
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

    <!-- 최종 CTA — 강력한 마무리 -->
    <section class="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-indigo-950 to-purple-950 py-16 sm:py-20">
      <div class="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute right-0 bottom-10 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl anim-blob" style="animation-delay: -7s" />

      <div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p class="text-xs uppercase tracking-widest text-indigo-300">START NOW</p>
        <h2 class="mt-3 font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
          지금 가장 빠르게<br />
          <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SNS 마케팅을 시작하세요
          </span>
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
          평균 10분 내 작업 시작 · 한국인 실계정 · 30일 유지 보장 · 결과보고서 자동 발송<br />
          누구나 5분이면 첫 주문이 가능합니다.
        </p>

        <!-- 3가지 행동 -->
        <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <NuxtLink
            to="/sns"
            class="group rounded-2xl bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
              <span class="text-lg">🚀</span>
            </div>
            <p class="mt-3 font-display text-base text-neutral-900">상품 둘러보기</p>
            <p class="mt-1 text-xs text-neutral-500">31개+ SNS 마케팅 상품 카탈로그</p>
            <p class="mt-3 text-xs text-indigo-600 group-hover:underline">바로가기 →</p>
          </NuxtLink>

          <NuxtLink
            to="/auth/signup"
            class="group rounded-2xl bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <span class="text-lg">✨</span>
            </div>
            <p class="mt-3 font-display text-base text-neutral-900">무료 회원가입</p>
            <p class="mt-1 text-xs text-neutral-500">1분 가입 · 카카오/네이버/구글</p>
            <p class="mt-3 text-xs text-emerald-600 group-hover:underline">가입하기 →</p>
          </NuxtLink>

          <a
            :href="CONTACT.telegram.url"
            target="_blank"
            rel="noopener"
            class="group rounded-2xl bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white">
              <TelegramIcon :size="22" />
            </div>
            <p class="mt-3 font-display text-base text-neutral-900">1:1 텔레그램 상담</p>
            <p class="mt-1 text-xs text-neutral-500">평균 응답 30분 이내 · 친절 상담</p>
            <p class="mt-3 text-xs text-blue-600 group-hover:underline">상담 시작 →</p>
          </a>
        </div>

        <!-- 추가 안전 신호 -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-neutral-400 sm:text-xs">
          <span class="inline-flex items-center gap-1.5">
            <span class="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
            비밀번호 0% 요구
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
            계좌이체 안전결제
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
            30일 유지 보장
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
            세금계산서 발행
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 모달 전체 페이드 */
.welcome-enter-active,
.welcome-leave-active {
  transition: opacity 0.25s ease;
}
.welcome-enter-from,
.welcome-leave-to {
  opacity: 0;
}
/* 팝업 카드 등장 (살짝 튀어오르는 느낌) */
.welcome-enter-active .welcome-card {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.welcome-enter-from .welcome-card {
  transform: scale(0.85);
}
</style>
