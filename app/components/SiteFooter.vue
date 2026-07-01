<script setup lang="ts">
import { SNS_PLATFORMS, RANK_PLATFORMS, MARKETING_PLATFORMS, PLATFORMS, CONTACT } from "#shared/catalog";

const snsCol = SNS_PLATFORMS.map((s) => ({ href: `/sns/${s}`, label: PLATFORMS[s].shortName }));
const marketingCol = MARKETING_PLATFORMS.map((s) => ({ href: `/marketing/${s}`, label: PLATFORMS[s].shortName }));
const rankCol = RANK_PLATFORMS.map((s) => ({ href: `/rank/${s}`, label: PLATFORMS[s].shortName }));
const helpCol = [
  { href: "/support", label: "고객센터" },
  { href: "/notice", label: "공지사항" },
  { href: "/guide", label: "이용안내" },
  { href: "/faq", label: "자주묻는질문" },
  { href: "/reviews", label: "고객후기" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-16 border-t border-neutral-100 bg-neutral-50 sm:mt-24">
    <div class="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
      <!-- 상단: 그리드 (모바일 1열, 태블릿 2열, 데스크탑 4~5열) -->
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <!-- 회사 정보 + 텔레그램 -->
        <div class="sm:col-span-2 lg:col-span-2">
          <div class="flex items-center gap-2 font-display text-lg">
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">S</span>
            SNS소셜팩토리
          </div>
          <p class="mt-3 max-w-sm text-sm leading-6 text-neutral-600">
            SNS 마케팅이 가장 빠르게 시작되는 곳. 실계정 · 안전결제 · 결과보고서로 신뢰를 드립니다.
          </p>
          <a
            :href="CONTACT.telegram.url"
            target="_blank"
            rel="noopener"
            class="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-2 text-xs text-sky-900 hover:bg-sky-200"
          >
            <TelegramIcon :size="16" />
            {{ CONTACT.telegram.label }}
          </a>
        </div>

        <!-- SNS 마케팅 -->
        <div>
          <h4 class="mb-3 text-sm text-neutral-900">SNS 마케팅</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in snsCol" :key="i.href">
              <NuxtLink :to="i.href" class="inline-block py-0.5 hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 플랫폼 마케팅 (있을 때만) -->
        <div v-if="marketingCol.length > 0">
          <h4 class="mb-3 text-sm text-neutral-900">플랫폼 마케팅</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in marketingCol" :key="i.href">
              <NuxtLink :to="i.href" class="inline-block py-0.5 hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 상위노출 (있을 때만) -->
        <div v-if="rankCol.length > 0">
          <h4 class="mb-3 text-sm text-neutral-900">상위노출</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in rankCol" :key="i.href">
              <NuxtLink :to="i.href" class="inline-block py-0.5 hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 고객센터 -->
        <div>
          <h4 class="mb-3 text-sm text-neutral-900">고객센터</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li v-for="i in helpCol" :key="i.href">
              <NuxtLink :to="i.href" class="inline-block py-0.5 hover:text-neutral-900">{{ i.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 사업자 정보: 모바일에서는 줄바꿈 자연스럽게 -->
      <div class="mt-10 border-t border-neutral-200 pt-6 text-[11px] text-neutral-500 leading-6 sm:text-xs">
        <p class="break-keep">
          <span class="inline-block">상호: 주식회사 영천기획</span>
          <span class="mx-1.5 hidden sm:inline">·</span>
          <br class="sm:hidden" />
          <span class="inline-block">대표: 김선민</span>
          <span class="mx-1.5 hidden sm:inline">·</span>
          <br class="sm:hidden" />
          <span class="inline-block">사업자등록번호: 447-81-03597</span>
        </p>
        <p class="mt-1 break-keep">통신판매업 신고번호: 제 2026-경남진주-0298 호</p>
        <p class="mt-1 break-keep">주소: 경상남도 진주시 에나로77번길 4, 502호</p>
        <p class="mt-1 break-all">이메일: dkssudgktka53@gmail.com</p>
        <p class="mt-3 text-neutral-400">© {{ year }} SNS소셜팩토리. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
