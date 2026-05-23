<script setup lang="ts">
useSeoMeta({
  title: "자주묻는질문 (FAQ)",
  description:
    "SNS 마케팅·상위노출 주문 전후 자주 묻는 질문을 한눈에. 계정 안전, 작업 속도, 환불, 보장 기간 등 30+ 질문 답변.",
  ogTitle: "자주묻는질문 | SNS소셜팩토리",
  ogDescription: "주문 전후 자주 묻는 질문 — 안전성·속도·환불·결과보고서까지 한 번에 확인.",
  ogType: "article",
  ogLocale: "ko_KR",
});

type FaqItem = { q: string; a: string };
type FaqGroup = { title: string; items: FaqItem[] };

const GROUPS: FaqGroup[] = [
  {
    title: "계정 · 안전",
    items: [
      { q: "정말 계정이 안전한가요?", a: "네. 모든 작업은 공개 프로필 URL과 닉네임만으로 처리됩니다. SNS 비밀번호는 절대 묻지 않습니다." },
      { q: "비공개 계정도 작업 가능한가요?", a: "팔로워 추가 같은 작업은 비공개 계정에는 불가합니다. 게시물 좋아요·조회수는 공개 게시물 기준입니다." },
      { q: "작업 후 정지될 위험은 없나요?", a: "실계정 기반의 자연스러운 패턴으로 분산 처리되어 알고리즘 위반 가능성을 최소화합니다. 다만 SNS 정책은 수시로 바뀌므로 100% 보장은 어렵습니다." },
      { q: "한 계정에 여러 상품 동시 진행 가능한가요?", a: "가능합니다. 다만 같은 종류의 작업(예: 팔로워)은 동시 진행보다 시간차를 두는 것을 권장합니다." },
    ],
  },
  {
    title: "결제 · 환불",
    items: [
      { q: "결제수단은 무엇이 있나요?", a: "현재는 계좌이체로만 결제 가능합니다. 주문 완료 후 안내되는 계좌번호로 입금해주세요." },
      { q: "현금영수증·세금계산서 발행 가능한가요?", a: "사업자 회원은 카카오톡 채널로 사업자등록증 제출 시 세금계산서 발급 가능합니다." },
      { q: "환불 정책이 어떻게 되나요?", a: "작업 시작 전 100% 환불, 진행 중에는 진행률에 비례한 부분 환불, 완료 후에는 결과보고서를 토대로 협의 환불이 적용됩니다." },
      { q: "주문 후 결제 안 하면 어떻게 되나요?", a: "결제 대기 상태로 24시간 유지 후 자동 취소됩니다. 그 안에 입금하시면 정상 진행됩니다." },
    ],
  },
  {
    title: "작업 진행",
    items: [
      { q: "작업은 언제 시작되나요?", a: "결제 확인 후 평균 10분 내 자동 시작됩니다. 대형 상품(월관리·체험단 등)은 영업일 기준 1~3일 내 진행됩니다." },
      { q: "작업 도중에 추가 주문해도 되나요?", a: "네, 가능합니다. 진행 중인 주문과 무관하게 새 주문이 같이 처리됩니다." },
      { q: "특정 시간대에 작업해 달라는 요청 가능한가요?", a: "주문 시 \"요청사항\" 칸에 적어주시면 가능한 범위에서 반영합니다." },
      { q: "결과보고서엔 뭐가 들어있나요?", a: "주문 상품/시작·완료 시각/처리 수량/대표 캡처 등이 포함되며, 이메일과 마이페이지에서 동시에 확인할 수 있습니다." },
    ],
  },
  {
    title: "유지·리필",
    items: [
      { q: "유지 보장 기간이 있나요?", a: "상품별로 다릅니다. 7일/30일/60일/평생 보장 옵션이 있으며, 보장 기간 내 이탈 시 자동 리필됩니다." },
      { q: "리필은 얼마나 빨리 되나요?", a: "이탈 감지 후 보통 24시간 이내 자동 리필됩니다." },
      { q: "보장 기간이 지난 후 이탈이 생기면?", a: "추가 리필은 어렵지만, 리필 옵션 상품을 별도 주문하실 수 있습니다." },
    ],
  },
  {
    title: "회원·포인트",
    items: [
      { q: "회원가입 안 하고 주문할 수 있나요?", a: "아니요, 주문 내역과 결과보고서 관리를 위해 회원가입이 필요합니다." },
      { q: "포인트는 어떻게 적립되나요?", a: "결제 금액의 2%가 자동 적립됩니다. 적립 즉시 다음 주문에 사용 가능합니다 (사용 기능 곧 오픈)." },
      { q: "회원탈퇴는 어떻게 하나요?", a: "카카오톡 채널로 요청해주시면 처리됩니다. 진행 중 주문이 있으면 완료 후 처리됩니다." },
    ],
  },
  {
    title: "기업·대량 주문",
    items: [
      { q: "기업·대행사 견적 받을 수 있나요?", a: "네, 카카오톡 채널로 문의 주시면 견적과 일정 제안을 드립니다. 월 단위 정기 계약도 가능합니다." },
      { q: "API 연동도 되나요?", a: "월 100건 이상 대량 주문 고객에 한해 API 키를 발급해드립니다. 카카오톡 채널로 문의해주세요." },
    ],
  },
];

// JSON-LD FAQPage — 모든 그룹의 질문을 평탄화해서 등록
const ALL_FAQS = GROUPS.flatMap((g) => g.items);

useSchemaOrg([
  defineWebPage({
    name: "자주묻는질문",
    description: "SNS 마케팅·상위노출 자주 묻는 질문 모음",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "자주묻는질문", item: "https://xn--sns-yg9lh0pw9l.kr/faq" },
    ],
  },
  {
    "@type": "FAQPage",
    mainEntity: ALL_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
]);
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-8 py-10 sm:px-12 sm:py-14">
      <div class="pointer-events-none absolute -right-10 -top-10 h-60 w-60 bg-indigo-300/30 blur-3xl anim-blob" />
      <div class="relative">
        <p class="text-xs uppercase tracking-widest text-indigo-700">FAQ</p>
        <h1 class="mt-2 font-display text-3xl text-neutral-900 sm:text-4xl">자주묻는질문</h1>
        <p class="mt-3 text-sm text-neutral-700">
          궁금하신 점을 카테고리별로 정리했습니다. 답이 없는 질문은
          <a href="#contact" class="text-indigo-600 hover:underline">카카오톡 채널</a>로 문의해주세요.
        </p>
      </div>
    </section>

    <section v-for="g in GROUPS" :key="g.title" class="mt-10">
      <h2 class="font-display text-xl text-neutral-900">{{ g.title }}</h2>
      <div class="mt-4 divide-y divide-neutral-100 rounded-3xl border border-neutral-100 bg-white">
        <details v-for="f in g.items" :key="f.q" class="group p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm text-neutral-900">
            <span>{{ f.q }}</span>
            <span class="text-neutral-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-sm leading-7 text-neutral-600">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <section id="contact" class="mt-12 rounded-3xl bg-yellow-300 px-6 py-8 text-center">
      <p class="font-display text-xl text-neutral-900">답을 못 찾으셨나요?</p>
      <p class="mt-2 text-sm text-neutral-800">카카오톡 채널에서 1:1 상담을 받으실 수 있어요.</p>
      <a
        href="#"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm text-white hover:bg-neutral-700"
      >💬 카카오톡 상담하기</a>
    </section>
  </div>
</template>
