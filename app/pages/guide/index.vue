<script setup lang="ts">
import { CONTACT } from "#shared/catalog";
import { GUIDES } from "#shared/guides";

// 키워드 SEO 가이드 카드 (메인 키워드)
const KEYWORD_GUIDES = Object.values(GUIDES).map((g) => ({
  slug: g.slug,
  title: g.breadcrumbLabel,
  intro: g.metaDescription.split(" — ")[0]?.replace(/늘리는 법|총정리|\.$/g, "").trim() ?? "",
  emoji: g.slug.startsWith("instagram") ? "📷" : g.slug.startsWith("youtube") ? "🎥" : g.slug.startsWith("tiktok") ? "🎵" : "📊",
  color: g.slug.startsWith("instagram") ? "from-pink-500 to-rose-500" : g.slug.startsWith("youtube") ? "from-rose-500 to-red-600" : "from-cyan-500 to-teal-500",
}));

useSeoMeta({
  title: "이용안내 — SNS 마케팅 주문 방법과 절차",
  description:
    "상품 선택부터 결제·작업 시작·결과보고서 수신까지 — SNS소셜팩토리 이용 절차와 자주 묻는 질문을 한눈에 확인하세요.",
  ogTitle: "이용안내 — SNS 마케팅 주문 방법 | SNS소셜팩토리",
  ogDescription: "상품 주문, 결제, 작업 시작, 결과보고서까지 5단계 안내와 자주묻는질문.",
  ogType: "article",
  ogLocale: "ko_KR",
});

const STEPS = [
  { n: 1, title: "원하는 상품 선택", desc: "인스타·유튜브·틱톡·X·텔레그램 카테고리에서 원하는 플랫폼과 상품을 고르세요." },
  { n: 2, title: "수량 옵션 + 타겟 URL 입력", desc: "필요한 수량(팔로워 수, 리뷰 개수 등)을 선택하고 작업 대상 URL을 입력합니다." },
  { n: 3, title: "결제", desc: "안내된 계좌로 입금하시면 결제가 완료됩니다." },
  { n: 4, title: "10분 내 작업 시작", desc: "결제 완료 후 평균 10분 안에 자동으로 작업이 시작됩니다." },
  { n: 5, title: "결과 보고서 수신", desc: "작업 완료 시 결과보고서가 이메일과 마이페이지에 자동 발송됩니다." },
];

const WHY = [
  { emoji: "🔒", title: "비밀번호 불필요", desc: "공개 URL과 닉네임만으로 처리됩니다. SNS 계정의 비밀번호는 절대 묻지 않습니다." },
  { emoji: "👥", title: "실계정 기반", desc: "어뷰징 봇이 아닌 실제 사용자 계정으로 작업합니다." },
  { emoji: "📊", title: "투명한 결과보고서", desc: "주문 진행률과 완료 시점을 실시간으로 확인할 수 있습니다." },
  { emoji: "💳", title: "안전결제", desc: "PG사를 통한 안전한 결제 시스템. 작업 시작 전엔 100% 환불 가능합니다." },
];

const FAQS = [
  { q: "정말 계정이 안전한가요?", a: "네, 비밀번호를 요구하지 않습니다. 공개 프로필 URL과 닉네임만으로 처리되어 SNS 약관상 문제될 일이 없습니다." },
  { q: "작업은 얼마나 빨리 시작되나요?", a: "결제 완료 후 평균 10분 내 시작됩니다. 일부 대량 주문은 1:1 상담 후 진행되며 영업일 기준 1~3일 안에 시작됩니다." },
  { q: "유지 기간이 있나요?", a: "상품별로 다릅니다. 일반적으로 7일 / 30일 / 60일 / 평생 보장 옵션을 제공하며, 유지 보장 기간 내 이탈 발생 시 자동으로 리필됩니다." },
  { q: "결제는 어떻게 하나요?", a: "현재는 계좌이체로만 결제 가능합니다. 주문 시 안내되는 계좌번호로 입금하시면 결제가 완료됩니다." },
  { q: "환불은 가능한가요?", a: "작업 시작 전엔 100% 환불 가능합니다. 작업 진행 중에는 진행률에 따라 부분 환불, 완료 후에는 결과보고서를 토대로 협의 환불이 적용됩니다." },
  { q: "결과 보고서는 어떤 내용이 담기나요?", a: "주문 상품 / 작업 시작·완료 시점 / 처리 수량 / 캡처 등 증빙 자료가 포함됩니다. 이메일과 마이페이지에서 동시에 확인할 수 있습니다." },
  { q: "기업·대량 주문도 가능한가요?", a: "네, 텔레그램(@snssocialfactory)으로 문의 주시면 견적과 일정 제안을 드립니다." },
];

// 구조화 데이터 — 이용 절차(HowTo) + FAQ + 브레드크럼
useSchemaOrg([
  defineWebPage({
    name: "이용안내",
    description: "SNS소셜팩토리 이용 절차와 자주묻는질문",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "이용안내", item: "https://xn--sns-yg9lh0pw9l.kr/guide" },
    ],
  },
  {
    "@type": "HowTo",
    name: "SNS소셜팩토리 이용 방법",
    description: "원하는 상품 선택부터 결과보고서 수신까지 5단계",
    step: STEPS.map((s) => ({
      "@type": "HowToStep",
      position: s.n,
      name: s.title,
      text: s.desc,
    })),
  },
  {
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
]);
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-8 py-10 sm:px-12 sm:py-14">
      <div class="pointer-events-none absolute -right-10 -top-10 h-60 w-60 bg-emerald-300/30 blur-3xl anim-blob" />
      <div class="relative">
        <p class="text-xs uppercase tracking-widest text-emerald-700">HOW IT WORKS</p>
        <h1 class="mt-2 font-display text-3xl text-neutral-900 sm:text-4xl">이용안내</h1>
        <p class="mt-3 text-sm text-neutral-700">결제부터 작업 완료까지 — SNS소셜팩토리 이용 방법을 한눈에 확인하세요.</p>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="font-display text-2xl text-neutral-900">진행 절차</h2>
      <ol class="mt-6 space-y-3">
        <li
          v-for="s in STEPS"
          :key="s.n"
          class="flex items-start gap-4 rounded-3xl border border-neutral-100 bg-white p-5"
        >
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 font-display text-white">
            {{ s.n }}
          </div>
          <div>
            <h3 class="font-display text-base text-neutral-900">{{ s.title }}</h3>
            <p class="mt-1 text-sm leading-6 text-neutral-600">{{ s.desc }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="mt-12">
      <h2 class="font-display text-2xl text-neutral-900">SNS소셜팩토리가 안전한 이유</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div
          v-for="w in WHY"
          :key="w.title"
          class="rounded-3xl border border-neutral-100 bg-white p-6"
        >
          <div class="text-3xl">{{ w.emoji }}</div>
          <h3 class="mt-3 font-display text-base text-neutral-900">{{ w.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-neutral-600">{{ w.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 키워드 가이드 (SEO 콘텐츠 마케팅) -->
    <section class="mt-12">
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs uppercase tracking-widest text-indigo-700">KEYWORD GUIDES</p>
          <h2 class="mt-1 font-display text-2xl text-neutral-900">SNS 마케팅 실전 가이드</h2>
        </div>
        <span class="text-xs text-neutral-500">{{ KEYWORD_GUIDES.length }}편</span>
      </div>
      <p class="mt-2 text-sm text-neutral-600">실제로 효과 있는 SNS 성장 전략을 가이드로 정리했습니다. 알고리즘 원리부터 부스팅 활용까지 한 번에.</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <NuxtLink
          v-for="g in KEYWORD_GUIDES"
          :key="g.slug"
          :to="`/guide/${g.slug}`"
          class="group block rounded-3xl border border-neutral-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="flex items-start gap-3">
            <div :class="['grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-lg text-white shadow', g.color]">
              {{ g.emoji }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-display text-sm text-neutral-900 sm:text-base">{{ g.title }}</h3>
              <p class="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600">{{ g.intro }}</p>
              <p class="mt-2 text-[11px] text-indigo-600 group-hover:underline">가이드 읽기 →</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="font-display text-2xl text-neutral-900">자주 묻는 질문</h2>
      <div class="mt-6 divide-y divide-neutral-100 rounded-3xl border border-neutral-100">
        <details v-for="f in FAQS" :key="f.q" class="group p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm text-neutral-800">
            {{ f.q }}
            <span class="text-neutral-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-sm leading-6 text-neutral-600">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <section class="mt-12 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-500 px-6 py-8 text-center text-white">
      <p class="font-display text-xl">아직 결정이 어려우신가요?</p>
      <p class="mt-2 text-sm text-sky-50">상품 추천부터 견적 상담까지 — 텔레그램으로 부담 없이 문의하세요.</p>
      <a
        :href="CONTACT.telegram.url"
        target="_blank"
        rel="noopener"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm text-blue-700 hover:bg-sky-50"
      >
        <TelegramIcon :size="20" />
        {{ CONTACT.telegram.handle }} 텔레그램 상담
      </a>
    </section>
  </div>
</template>
