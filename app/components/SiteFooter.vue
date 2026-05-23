<script setup lang="ts">
import { SNS_PLATFORMS, RANK_PLATFORMS, PLATFORMS } from "#shared/catalog";

const snsCol = SNS_PLATFORMS.map((s) => ({ href: `/sns/${s}`, label: PLATFORMS[s].shortName }));
const rankCol = RANK_PLATFORMS.map((s) => ({ href: `/rank/${s}`, label: PLATFORMS[s].shortName }));
const helpCol = [
  { href: "/guide", label: "이용안내" },
  { href: "/faq", label: "자주묻는질문" },
  { href: "/reviews", label: "고객후기" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-24 border-t border-neutral-100 bg-neutral-50">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-8 md:grid-cols-5">
        <div class="col-span-2">
          <div class="flex items-center gap-2 font-display text-lg">
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">S</span>
            SNS소셜팩토리
          </div>
          <p class="mt-3 text-sm leading-6 text-neutral-600">
            SNS 마케팅과 상위노출이 가장 빠르게 시작되는 곳.<br />
            실계정 · 안전결제 · 결과보고서로 신뢰를 드립니다.
          </p>
          <div class="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-3 py-1.5 text-xs text-neutral-900">
            💬 카카오톡 채널 상담하기
          </div>
        </div>

        <div>
          <h4 class="mb-3 text-sm text-neutral-900">SNS 마케팅</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in snsCol" :key="i.href">
              <NuxtLink :to="i.href" class="hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-3 text-sm text-neutral-900">상위노출</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in rankCol" :key="i.href">
              <NuxtLink :to="i.href" class="hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-3 text-sm text-neutral-900">고객센터</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in helpCol" :key="i.href">
              <NuxtLink :to="i.href" class="hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-neutral-200 pt-6 text-xs text-neutral-500 leading-6">
        상호: SNS소셜팩토리 · 대표: 홍길동 · 사업자등록번호: 000-00-00000 · 통신판매업: 0000-서울-0000<br />
        주소: 서울특별시 강남구 테헤란로 000, 00층 · 고객센터: 1588-0000 (평일 10:00 ~ 18:00)<br />
        © {{ year }} SNS소셜팩토리. All rights reserved.
      </div>
    </div>
  </footer>
</template>
