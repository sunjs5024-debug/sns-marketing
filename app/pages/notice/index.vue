<script setup lang="ts">
useSeoMeta({
  title: "공지사항",
  description: "SNS소셜팩토리 공지사항 — 신규 상품 출시, 서비스 점검 안내, 결제·운영 정책 변경, 이벤트·업데이트 소식을 가장 빠르게 확인하세요.",
  ogTitle: "공지사항 | SNS소셜팩토리",
  ogDescription: "SNS소셜팩토리 서비스 안내와 정책, 업데이트 소식.",
  robots: "index, follow",
});

// 공지 목록 (최신순). 새 공지는 이 배열 맨 위에 추가하면 됩니다.
const notices = [
  {
    date: "2026-07-01",
    tag: "안내",
    title: "SNS소셜팩토리 서비스 안내",
    body: "인스타그램·유튜브·틱톡·텔레그램·X 등 주요 SNS 마케팅 상품을 한 곳에서 이용하실 수 있습니다. 모든 작업은 실계정 기반으로 진행되며, 완료 시 결과보고서가 자동 발송됩니다.",
  },
  {
    date: "2026-07-01",
    tag: "결제",
    title: "결제는 계좌이체(무통장입금)로 진행됩니다",
    body: "현재 모든 주문은 계좌이체로 결제됩니다. 주문 시 안내되는 계좌로 정확한 금액과 입금자명으로 입금해주시면 자동으로 확인되어 작업이 시작됩니다. 세금계산서 발행도 가능합니다.",
  },
  {
    date: "2026-07-01",
    tag: "정책",
    title: "30일 유지 보장 및 자동 리필 안내",
    body: "대부분의 상품에 30일 유지 보장이 적용됩니다. 보장 기간 내 이탈이 발생하면 자동으로 리필해 드립니다. 상품별 보장 기간은 각 상품 상세페이지에서 확인하실 수 있습니다.",
  },
  {
    date: "2026-07-01",
    tag: "상담",
    title: "1:1 텔레그램 상담 안내",
    body: "주문 전·후 궁금한 점은 텔레그램으로 언제든 문의해 주세요. 평균 30분 이내로 빠르게 답변드립니다.",
  },
];

const TAG_COLOR: Record<string, string> = {
  안내: "bg-indigo-50 text-indigo-700",
  결제: "bg-emerald-50 text-emerald-700",
  정책: "bg-amber-50 text-amber-700",
  상담: "bg-sky-50 text-sky-700",
};
</script>

<template>
  <div>
    <PageHero eyebrow="NOTICE" title="공지사항" subtitle="서비스 안내와 정책, 업데이트 소식을 알려드립니다." />
    <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

    <div class="mt-10 divide-y divide-neutral-100 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
      <details v-for="(n, i) in notices" :key="i" class="group p-5 sm:p-6" :open="i === 0">
        <summary class="flex cursor-pointer list-none items-start justify-between gap-3">
          <div class="min-w-0">
            <span :class="['inline-block rounded-full px-2 py-0.5 text-[11px] font-medium', TAG_COLOR[n.tag] ?? 'bg-neutral-100 text-neutral-600']">{{ n.tag }}</span>
            <h2 class="mt-2 text-sm font-medium text-neutral-900 sm:text-base">{{ n.title }}</h2>
            <p class="mt-1 text-xs text-neutral-400">{{ n.date }}</p>
          </div>
          <span class="mt-1 shrink-0 text-neutral-400 transition group-open:rotate-180">▾</span>
        </summary>
        <p class="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-700">{{ n.body }}</p>
      </details>
    </div>

    <div class="mt-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-6 text-center">
      <p class="text-sm text-neutral-700">더 궁금한 점이 있으신가요?</p>
      <NuxtLink to="/support" class="mt-3 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-700">고객센터 바로가기 →</NuxtLink>
    </div>
    </div>
  </div>
</template>
