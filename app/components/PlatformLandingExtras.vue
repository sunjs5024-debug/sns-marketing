<script setup lang="ts">
// 플랫폼 랜딩 하단 공통 마케팅 블록 — 이용안내 + 추천대상/안심보장 + 상담 CTA.
// 상품 상세페이지와 톤을 맞춰 플랫폼 랜딩도 꽉 차 보이게 한다.
import type { PlatformSlug } from "#shared/catalog";
import { CONTACT } from "#shared/catalog";

defineProps<{ platformKey: PlatformSlug | null }>();
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
    <!-- 진행 방식·주의사항·안전 이용 (플랫폼별) -->
    <ProductUsageGuide :platform-key="platformKey" />

    <!-- 추천 대상 + 안심 보장 -->
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

    <!-- 상담 CTA -->
    <section class="mt-12 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 px-6 py-8 text-center text-white sm:px-10">
      <p class="font-display text-xl">어떤 상품이 맞을지 고민되시나요?</p>
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
