<script setup lang="ts">
import { CONTACT } from "#shared/catalog";

useSeoMeta({
  title: "고객센터",
  description: "SNS소셜팩토리 고객센터 — 텔레그램 1:1 상담, 이메일 문의, 자주 찾는 도움말을 한 곳에서.",
  ogTitle: "고객센터 | SNS소셜팩토리",
  ogDescription: "텔레그램 1:1 상담 · 이메일 문의 · 자주 찾는 도움말.",
  robots: "index, follow",
});

const helpLinks = [
  { href: "/faq", emoji: "💬", title: "자주 묻는 질문", desc: "결제·유지·환불 등 자주 묻는 내용" },
  { href: "/guide", emoji: "📖", title: "이용안내", desc: "주문부터 완료까지 이용 방법" },
  { href: "/orders", emoji: "📦", title: "내 주문 조회", desc: "주문 진행 상황·결과보고서 확인" },
  { href: "/notice", emoji: "📢", title: "공지사항", desc: "서비스·정책 안내와 소식" },
];
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <header class="text-center">
      <p class="text-xs uppercase tracking-widest text-indigo-600">SUPPORT</p>
      <h1 class="mt-2 font-display text-3xl text-neutral-900">고객센터</h1>
      <p class="mt-3 text-sm text-neutral-500">궁금한 점이 있으면 언제든 문의해 주세요. 빠르게 도와드리겠습니다.</p>
    </header>

    <!-- 문의 채널 -->
    <div class="mt-10 grid gap-4 sm:grid-cols-2">
      <!-- 텔레그램 (주 채널) -->
      <a
        :href="CONTACT.telegram.url"
        target="_blank"
        rel="noopener"
        class="group rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <div class="flex items-center gap-3">
          <span class="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
            <TelegramIcon :size="26" />
          </span>
          <div>
            <p class="font-display text-lg">텔레그램 1:1 상담</p>
            <p class="text-xs text-sky-100">평균 응답 30분 이내 · 가장 빠른 문의</p>
          </div>
        </div>
        <p class="mt-4 text-sm text-sky-50">주문 전 상담부터 진행 상황 문의까지, 실시간으로 답변드립니다.</p>
        <span class="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm text-blue-700 group-hover:bg-sky-50">텔레그램으로 문의하기 →</span>
      </a>

      <!-- 이메일 -->
      <a
        :href="`mailto:${CONTACT.email}`"
        class="group rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <div class="flex items-center gap-3">
          <span class="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-2xl">✉️</span>
          <div>
            <p class="font-display text-lg text-neutral-900">이메일 문의</p>
            <p class="text-xs text-neutral-500">세금계산서·제휴 등 서류 문의</p>
          </div>
        </div>
        <p class="mt-4 text-sm text-neutral-600">첨부가 필요한 문의는 이메일로 보내주세요. 순차적으로 답변드립니다.</p>
        <span class="mt-4 inline-block break-all rounded-full bg-neutral-900 px-4 py-2 text-sm text-white group-hover:bg-neutral-700">{{ CONTACT.email }}</span>
      </a>
    </div>

    <!-- 자주 찾는 도움말 -->
    <section class="mt-10">
      <h2 class="font-display text-lg text-neutral-900">자주 찾는 도움말</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="l in helpLinks"
          :key="l.href"
          :to="l.href"
          class="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition hover:border-indigo-200 hover:bg-neutral-50"
        >
          <span class="text-xl">{{ l.emoji }}</span>
          <span>
            <span class="block text-sm font-medium text-neutral-900">{{ l.title }}</span>
            <span class="block text-xs text-neutral-500">{{ l.desc }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- 운영 안내 -->
    <section class="mt-10 rounded-3xl border border-neutral-100 bg-neutral-50 p-6 text-center">
      <p class="text-sm text-neutral-700">
        <b>상담 안내</b> — 텔레그램 문의는 연중 확인하며 평균 30분 이내 답변드립니다.<br />
        결제는 계좌이체로 진행되며, 입금 확인 즉시 작업이 자동으로 시작됩니다.
      </p>
    </section>
  </div>
</template>
