<script setup lang="ts">
import { CONTACT } from "#shared/catalog";

useSeoMeta({
  title: "카카오톡 채널 친구 늘리기 · 플러스친구 늘리는법",
  description:
    "카카오톡 채널 친구 늘리기·친구추가·늘리는법 총정리. 옛 플러스친구·비즈니스 친구도 지금은 카카오톡 채널 친구입니다. 실계정 유입, 비밀번호 요구 없이 공개 채널 URL만, 결과보고서 제공, 부족분 자동 환불.",
  keywords:
    "카카오톡 채널 친구 늘리기, 카카오톡 채널 친구 늘리는법, 카카오톡 플러스친구 늘리기, 카카오톡 비즈니스 친구 늘리기, 카카오 채널 친구추가, 카카오톡채널 친구늘리기, 카카오톡 비지니스 친구",
  ogTitle: "카카오톡 채널 친구 늘리기 · 플러스친구 늘리는법 | SNS소셜팩토리",
  ogDescription: "카카오톡 채널 친구(옛 플러스친구) 늘리기·친구추가. 실계정 유입·비번불요·결과보고서·부족분 자동 환불.",
  ogType: "website",
  ogLocale: "ko_KR",
});

useSchemaOrg([
  defineWebPage({
    name: "카카오톡 채널 친구 늘리기 · 친구추가",
    description: "카카오톡 채널 친구 수 늘리기·친구추가 서비스 안내",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "카카오톡 채널 친구 늘리기", item: "https://xn--sns-yg9lh0pw9l.kr/kakao" },
    ],
  },
]);

// 업종별 유스케이스
const useCases = [
  { emoji: "🏪", tag: "자영업 · 소상공인", title: "매장·가게 공식채널", desc: "옆 가게 채널은 이미 네 자릿수. 단골 예약·재방문 쿠폰은 결국 채널 친구 수에서 벌어집니다." },
  { emoji: "🏢", tag: "스타트업 · 기업", title: "브랜드 공식채널 신뢰도", desc: "고객이 처음 보는 건 친구 수입니다. 공식 채널인데 친구가 적으면 신뢰가 거기서 깎입니다." },
  { emoji: "💛", tag: "예약 · 서비스업", title: "카톡 예약·상담 유입", desc: "예약 문의가 카톡으로 오는 업종은 친구 수가 곧 예약률. 경쟁 매장이 먼저 늘리기 전에." },
];

// 진행 4단계
const steps = [
  { n: 1, title: "신청하기", desc: "원하는 수량을 고르고 공개 카카오톡 채널 URL(pf.kakao.com/…)만 붙여넣으세요. 비밀번호는 필요 없습니다." },
  { n: 2, title: "결제 확인", desc: "계좌이체로 결제하면 입금 확인 후 작업이 시작됩니다." },
  { n: 3, title: "작업 진행", desc: "실계정 유입으로 채널 친구 수가 자연스러운 속도로 올라갑니다. 진행 상황을 안내드립니다." },
  { n: 4, title: "결과 확인", desc: "완료 시 결과보고서를 보내드립니다. 부족분이 생기면 자동 환불로 처리합니다." },
];

// 카카오 상품 (내부링크 — 키워드 앵커)
const products = [
  { slug: "kko-channel-add", label: "카카오톡 채널 친구추가", price: "15,000원~", hot: true },
  { slug: "kko-post-like", label: "카카오톡 채널 게시글 좋아요", price: "15,000원~" },
  { slug: "kko-open-join", label: "카카오톡 오픈방 인원 늘리기", price: "80,000원~" },
  { slug: "kko-open-like", label: "카카오 오픈방 좋아요", price: "20,000원~" },
];

const faqs = [
  { q: "카카오톡 채널 친구 늘리기가 효과가 있나요?", a: "친구 수는 카카오톡 채널의 첫인상이자 신뢰 지표입니다. 방문자는 친구 50명 채널과 1,000명 채널을 다르게 봅니다. 특히 매장·브랜드 공식채널은 친구 수가 적으면 신뢰가 깎여, 초기 볼륨을 채우는 것이 마케팅의 출발점입니다. 다만 친구 수가 매출·전환을 보장하지는 않으며, 콘텐츠·운영이 뒷받침돼야 합니다." },
  { q: "비밀번호를 알려줘야 하나요?", a: "아니요. 공개 카카오톡 채널 URL(pf.kakao.com/…)만 입력하면 되고, 카카오 계정 비밀번호나 관리자 권한은 절대 요구하지 않습니다. 계정 정보가 넘어갈 일이 없습니다." },
  { q: "실제 유입인가요?", a: "실계정 기반으로 한 번에 몰아넣지 않고 자연스러운 속도로 유입합니다. 다만 '실계정'이 실명 인증이나 실제 활동 100%를 단정하는 뜻은 아니며, 프로필·활동 흔적이 있는 계정 위주라는 의미입니다." },
  { q: "친구가 빠지면 어떻게 되나요?", a: "카카오 정책이나 계정 상태에 따라 일부 자연 감소가 생길 수 있습니다. 부족분이 발생하면 자동 환불로 처리해 드립니다. 진행 후 결과보고서에서 확인하실 수 있습니다." },
  { q: "안전한가요? 채널이 불이익을 받나요?", a: "공개 URL만으로 진행해 계정 접근 위험이 없습니다. 다만 인위적으로 친구를 늘리는 방식은 카카오 정책상 권장되는 방식은 아니므로, 채널 상태에 민감하다면 소량부터 시작하시길 권합니다." },
];

// FAQPage 구조화 데이터
useSchemaOrg([
  {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
]);
</script>

<template>
  <div>
    <!-- HERO — 카카오 옐로 테마 -->
    <section class="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div class="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />
      <div class="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
      <div class="relative mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        <span class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-amber-700 backdrop-blur-sm">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500" /> 카카오톡 채널 친구 수 늘리기 · 친구추가 전문
        </span>
        <h1 class="mt-5 font-display text-4xl tracking-tight text-neutral-900 break-keep sm:text-5xl lg:text-[3.4rem] leading-[1.15]">
          카카오톡 채널 친구 수,<br />
          <span class="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">오늘부터 확실하게 늘리기</span>
        </h1>
        <p class="mt-5 max-w-xl break-keep text-base leading-7 text-neutral-700 sm:text-lg">
          실계정 유입으로 카카오톡 채널 친구를 채워, 매장·브랜드 공식채널의 첫인상과 신뢰를 만들어 드립니다.
          <b>비밀번호 요구 없이</b> 공개 채널 URL만, 완료 시 <b>결과보고서</b>, 부족분은 <b>자동 환불</b>.
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-3">
          <NuxtLink to="/products/kko-channel-add" class="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800">
            카카오톡 채널 친구추가 시작하기 <span aria-hidden="true">→</span>
          </NuxtLink>
          <a :href="CONTACT.kakao.url" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3.5 text-sm font-semibold text-[#3c1e1e] shadow-sm transition hover:bg-yellow-300">
            💬 카카오톡으로 무료 상담
          </a>
        </div>
        <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">
          <span class="inline-flex items-center gap-1.5">✓ 실계정 유입</span>
          <span class="inline-flex items-center gap-1.5">✓ 비밀번호 요구 없음</span>
          <span class="inline-flex items-center gap-1.5">✓ 결과보고서 제공</span>
          <span class="inline-flex items-center gap-1.5">✓ 부족분 자동 환불</span>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 space-y-20">

      <!-- 왜 필요한가 -->
      <section>
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">WHY</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">친구 수가 곧 신뢰, 신뢰가 곧 매출</h2>
        <p class="mt-4 max-w-2xl break-keep text-sm leading-7 text-neutral-700 sm:text-base">
          고객은 친구 수가 많은 카카오톡 채널을 먼저 믿습니다. 같은 업종이라도 친구가 45명인 채널과 2,800명인 채널은
          같은 글을 올려도 반응이 다릅니다. 개설 직후의 빈 채널은 '검증되지 않은 곳'으로 보이기 쉽고, 초기 친구 수 공백이
          첫 방문자의 이탈 요인이 됩니다. 그래서 채널을 열었다면, 초기 친구 볼륨을 먼저 채워 두는 것이 출발점입니다.
        </p>
      </section>

      <!-- 플러스친구·비즈니스 친구 = 채널 (키워드 정리 + 정보성) -->
      <section>
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">한 가지만 정리</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">플러스친구·비즈니스 친구 = 지금의 카카오톡 채널 친구</h2>
        <p class="mt-4 max-w-2xl break-keep text-sm leading-7 text-neutral-700 sm:text-base">
          이름이 여러 개라 헷갈리기 쉽습니다. <b>카카오톡 플러스친구</b>는 2019년부터 <b>카카오톡 채널</b>로 이름이 바뀌었고,
          기업·매장이 쓰는 <b>비즈니스 친구</b>도 결국 같은 카카오톡 채널의 친구입니다. 즉
          <b>"카카오톡 채널 친구 늘리기", "카카오톡 플러스친구 늘리기", "카카오톡 비즈니스 친구 늘리기"는 모두 같은 작업</b>
          — 공개 채널(pf.kakao.com/…)의 친구 수를 늘리는 일입니다. 어떤 이름으로 알고 계셨든, 여기서 한 번에 해결됩니다.
        </p>
      </section>

      <!-- 업종별 유스케이스 -->
      <section>
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">USE CASES</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">이런 채널에 특히 필요해요</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <div v-for="u in useCases" :key="u.title" class="rounded-3xl border border-neutral-100 bg-white p-6">
            <div class="text-2xl">{{ u.emoji }}</div>
            <p class="mt-3 text-[11px] font-medium uppercase tracking-wider text-amber-600">{{ u.tag }}</p>
            <p class="mt-1 font-display text-lg text-neutral-900 break-keep">{{ u.title }}</p>
            <p class="mt-2 break-keep text-sm leading-6 text-neutral-600">{{ u.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 진행 방식 -->
      <section>
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">HOW IT WORKS</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">신청부터 결과까지, 이렇게 진행돼요</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="s in steps" :key="s.n" class="rounded-3xl border border-neutral-100 bg-white p-5">
            <div class="grid h-9 w-9 place-items-center rounded-full bg-amber-400 font-display text-sm text-[#3c1e1e]">{{ s.n }}</div>
            <p class="mt-3 font-display text-base text-neutral-900">{{ s.title }}</p>
            <p class="mt-1.5 break-keep text-[13px] leading-6 text-neutral-600">{{ s.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 정직한 차별점 -->
      <section class="rounded-3xl border border-amber-100 bg-amber-50/50 p-6 sm:p-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">WHY US</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">과장 대신, 정직한 기준</h2>
        <ul class="mt-5 grid gap-3 sm:grid-cols-2">
          <li class="flex gap-2 break-keep text-sm leading-6 text-neutral-700"><span class="text-amber-600">🔒</span><span><b>비밀번호를 묻지 않습니다.</b> 공개 채널 URL만으로 진행해 계정이 안전합니다.</span></li>
          <li class="flex gap-2 break-keep text-sm leading-6 text-neutral-700"><span class="text-amber-600">👥</span><span><b>실계정 유입</b> — 한 번에 몰지 않고 자연스러운 속도로. (실명 인증·활동 100% 단정 아님)</span></li>
          <li class="flex gap-2 break-keep text-sm leading-6 text-neutral-700"><span class="text-amber-600">📄</span><span><b>결과보고서</b>를 보내드리고, 세금계산서 발행이 가능합니다.</span></li>
          <li class="flex gap-2 break-keep text-sm leading-6 text-neutral-700"><span class="text-amber-600">↩️</span><span><b>부족분 자동 환불</b> — 감소가 생기면 환불로 처리합니다.</span></li>
          <li class="flex gap-2 break-keep text-sm leading-6 text-neutral-700"><span class="text-amber-600">🏢</span><span><b>정식 등록 사업자</b>(주식회사 영천기획 · 사업자 447-81-03597 · 통신판매업 신고).</span></li>
          <li class="flex gap-2 break-keep text-sm leading-6 text-neutral-700"><span class="text-amber-600">⚖️</span><span><b>정직한 한계</b> — 인위적 부스팅은 카카오 정책 권장 방식이 아니며, 매출을 보장하지 않습니다.</span></li>
        </ul>
      </section>

      <!-- 카카오 상품 -->
      <section>
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">PRODUCTS</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">카카오톡 채널 상품 한눈에</h2>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="p in products"
            :key="p.slug"
            :to="`/products/${p.slug}`"
            class="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
          >
            <span class="flex items-center gap-2 break-keep">
              <span class="text-sm font-medium text-neutral-900 group-hover:text-amber-700">{{ p.label }}</span>
              <span v-if="p.hot" class="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-medium text-rose-600">인기</span>
            </span>
            <span class="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 font-display text-sm text-amber-700">{{ p.price }}</span>
          </NuxtLink>
        </div>
        <div class="mt-4 flex flex-wrap gap-3 text-sm">
          <NuxtLink to="/sns/kakaotalk" class="text-amber-700 hover:underline">카카오톡 마케팅 전체 →</NuxtLink>
          <NuxtLink to="/guide/kakaotalk-channel" class="text-amber-700 hover:underline">카카오톡 채널 늘리는 법 가이드 →</NuxtLink>
          <NuxtLink to="/guide/kakaotalk-openchat" class="text-amber-700 hover:underline">카카오톡 오픈방 늘리는 법 가이드 →</NuxtLink>
        </div>
      </section>

      <!-- FAQ -->
      <section>
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">FAQ</p>
        <h2 class="mt-2 font-display text-2xl text-neutral-900 break-keep sm:text-3xl">자주 묻는 질문</h2>
        <div class="mt-5 divide-y divide-neutral-100 rounded-3xl border border-neutral-100 bg-white">
          <details v-for="(f, i) in faqs" :key="i" class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-neutral-900">
              <span class="break-keep">{{ f.q }}</span>
              <span class="shrink-0 text-neutral-400 transition group-open:rotate-180">▾</span>
            </summary>
            <p class="mt-3 break-keep text-sm leading-7 text-neutral-600">{{ f.a }}</p>
          </details>
        </div>
      </section>

      <!-- 최종 CTA -->
      <section class="rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-400 px-6 py-10 text-center sm:px-10">
        <h2 class="font-display text-2xl text-[#3c1e1e] break-keep sm:text-3xl">경쟁 채널의 친구 수는 지금도 늘고 있어요</h2>
        <p class="mt-2 break-keep text-sm text-[#5a3a1e]">먼저 시작하는 채널이 먼저 선택받습니다. 카카오톡 채널 친구 늘리기, 지금 시작하세요.</p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink to="/products/kko-channel-add" class="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
            친구추가 시작하기 →
          </NuxtLink>
          <a :href="CONTACT.kakao.url" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50">
            💬 카카오톡 상담
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
