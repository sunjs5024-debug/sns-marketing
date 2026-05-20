<script setup lang="ts">
useHead({ title: "이용안내" });

const STEPS = [
  { n: 1, title: "원하는 상품 선택", desc: "SNS 마케팅 / 상위노출 카테고리에서 원하는 플랫폼과 상품을 고르세요." },
  { n: 2, title: "수량 옵션 + 타겟 URL 입력", desc: "필요한 수량(팔로워 수, 리뷰 개수 등)을 선택하고 작업 대상 URL을 입력합니다." },
  { n: 3, title: "결제", desc: "카드, 계좌이체, 카카오페이, 네이버페이, 토스 중 편한 방법으로 결제하세요." },
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
  { q: "작업은 얼마나 빨리 시작되나요?", a: "결제 완료 후 평균 10분 내 시작됩니다. 일부 대형 상품(월관리·체험단 등)은 1:1 상담 후 진행되며 영업일 기준 1~3일 안에 시작됩니다." },
  { q: "유지 기간이 있나요?", a: "상품별로 다릅니다. 일반적으로 7일 / 30일 / 60일 / 평생 보장 옵션을 제공하며, 유지 보장 기간 내 이탈 발생 시 자동으로 리필됩니다." },
  { q: "결제는 어떻게 하나요?", a: "신용카드, 계좌이체, 카카오페이, 네이버페이, 토스 결제를 지원합니다. 모든 결제는 안전한 PG사를 통합니다." },
  { q: "환불은 가능한가요?", a: "작업 시작 전엔 100% 환불 가능합니다. 작업 진행 중에는 진행률에 따라 부분 환불, 완료 후에는 결과보고서를 토대로 협의 환불이 적용됩니다." },
  { q: "결과 보고서는 어떤 내용이 담기나요?", a: "주문 상품 / 작업 시작·완료 시점 / 처리 수량 / 캡처 등 증빙 자료가 포함됩니다. 이메일과 마이페이지에서 동시에 확인할 수 있습니다." },
  { q: "포인트는 어디에 쓰이나요?", a: "결제 금액의 2%가 자동 적립되며, 추후 다음 주문 시 사용할 수 있습니다 (사용 기능 곧 오픈 예정)." },
  { q: "기업·대량 주문도 가능한가요?", a: "네, 카카오톡 채널로 문의 주시면 견적과 일정 제안을 드립니다." },
];
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-8 py-10 sm:px-12 sm:py-14">
      <div class="pointer-events-none absolute -right-10 -top-10 h-60 w-60 bg-emerald-300/30 blur-3xl anim-blob" />
      <div class="relative">
        <p class="text-xs uppercase tracking-widest text-emerald-700">HOW IT WORKS</p>
        <h1 class="mt-2 font-display text-3xl text-neutral-900 sm:text-4xl">이용안내</h1>
        <p class="mt-3 text-sm text-neutral-700">결제부터 작업 완료까지 — 부스터마켓 이용 방법을 한눈에 확인하세요.</p>
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
      <h2 class="font-display text-2xl text-neutral-900">부스터마켓이 안전한 이유</h2>
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

    <section class="mt-12 rounded-3xl bg-yellow-300 px-6 py-8 text-center">
      <p class="font-display text-xl text-neutral-900">아직 결정이 어려우신가요?</p>
      <p class="mt-2 text-sm text-neutral-800">상품 추천부터 견적 상담까지 — 카카오톡 채널로 부담 없이 문의하세요.</p>
      <a
        href="#"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm text-white hover:bg-neutral-700"
      >
        💬 카카오톡 상담하기
      </a>
    </section>
  </div>
</template>
