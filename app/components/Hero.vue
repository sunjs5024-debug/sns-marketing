<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";

// 실시간 인원 — /api/live 와 같은 key 공유 → Ticker 와 같은 요청 1번으로 둘 다 채움
const { data: live } = await useFetch<{ activeUsers: number }>("/api/live", {
  key: "live",
  default: () => ({ activeUsers: 158 }),
});

type FloatCardData = {
  topPx: number;
  side: "left" | "right";
  rotate: number;
  delay: number;
  kind: PlatformSlug;
  label: string;
  sub: string;
  price: string;
  anim: "anim-float-up" | "anim-float-down";
};

const cards: FloatCardData[] = [
  { topPx: 0, side: "left", rotate: -5, delay: 0, kind: "instagram", label: "인스타 팔로워", sub: "+1,000 / 한국인", price: "89,000원~", anim: "anim-float-up" },
  { topPx: 130, side: "right", rotate: 4, delay: 1, kind: "kakaotalk", label: "카톡 채널친구", sub: "+1,000 / 한국인", price: "110,000원~", anim: "anim-float-down" },
  { topPx: 260, side: "left", rotate: -3, delay: 2, kind: "x", label: "X(트위터) 팔로워", sub: "+1,000 / 한국인", price: "75,000원~", anim: "anim-float-up" },
  { topPx: 390, side: "right", rotate: 3, delay: 3, kind: "naver-cafe", label: "네이버 카페 가입자", sub: "+50명 / 실계정", price: "39,000원~", anim: "anim-float-down" },
  { topPx: 520, side: "left", rotate: -2, delay: 4, kind: "tiktok", label: "틱톡 팔로워", sub: "+1,000 / 한국인", price: "99,000원~", anim: "anim-float-up" },
];
</script>

<template>
  <section class="relative overflow-hidden">
    <div
      class="absolute inset-0 anim-gradient-flow"
      style="background: linear-gradient(120deg, #eef2ff 0%, #fce7f3 25%, #ede9fe 50%, #fef3c7 75%, #eef2ff 100%);"
    />
    <div class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 bg-purple-300/40 blur-3xl anim-blob" />
    <div class="pointer-events-none absolute -right-20 top-20 h-80 w-80 bg-pink-300/40 blur-3xl anim-blob" style="animation-delay: -4s" />
    <div class="pointer-events-none absolute left-1/3 bottom-0 h-72 w-72 bg-indigo-300/40 blur-3xl anim-blob" style="animation-delay: -9s" />

    <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-indigo-700 backdrop-blur">
            <span class="relative flex h-2 w-2">
              <span class="absolute inset-0 rounded-full bg-emerald-500 anim-pulse" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            지금 {{ (live?.activeUsers ?? 158).toLocaleString("ko-KR") }}명이 마케팅을 진행 중
          </div>

          <h1 class="mt-5 font-display text-4xl tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.5rem] leading-[1.2] text-balance">
            SNS 성장과 상위노출
            <br />
            <span
              class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent anim-gradient-flow"
              style="background-size: 200% 200%"
            >숫자로 증명되는 마케팅</span>
          </h1>

          <p class="mt-5 text-lg leading-7 text-neutral-700 max-w-xl text-pretty">
            인스타·유튜브·틱톡·텔레그램·카카오톡 SNS 마케팅부터 스마트스토어·블로그·카페 상위노출까지.
            실제 사용자 기반으로 안전하게, 결과보고서로 투명하게 진행합니다.
          </p>

          <div class="mt-7 flex flex-wrap gap-3">
            <NuxtLink to="/sns" class="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-700">
              SNS 마케팅 시작하기 <span aria-hidden>→</span>
            </NuxtLink>
            <NuxtLink to="/rank" class="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm text-neutral-900 hover:bg-neutral-50">
              상위노출 보기
            </NuxtLink>
          </div>

          <dl class="mt-10 grid grid-cols-3 gap-6 border-t border-neutral-200/70 pt-6">
            <div>
              <dd class="font-display text-2xl text-neutral-900">58,200+</dd>
              <dt class="mt-1 text-xs text-neutral-500">누적 주문</dt>
            </div>
            <div>
              <dd class="font-display text-2xl text-neutral-900">4.9 / 5</dd>
              <dt class="mt-1 text-xs text-neutral-500">평균 만족도</dt>
            </div>
            <div>
              <dd class="font-display text-2xl text-neutral-900">10분 내</dd>
              <dt class="mt-1 text-xs text-neutral-500">평균 시작</dt>
            </div>
          </dl>
        </div>

        <div class="relative hidden lg:block">
          <div class="relative mx-auto h-[640px] w-full max-w-md">
            <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span class="absolute inset-0 block h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/40 anim-pulse" />
            </div>
            <div
              v-for="c in cards"
              :key="c.kind"
              :class="[
                'absolute w-64 rounded-2xl border border-white bg-white/95 p-4 shadow-xl shadow-neutral-900/10 backdrop-blur',
                c.anim,
                c.side === 'left' ? 'left-0' : 'right-0',
              ]"
              :style="{
                top: `${c.topPx}px`,
                '--r': `${c.rotate}deg`,
                transform: `rotate(${c.rotate}deg)`,
                animationDelay: `-${c.delay}s`,
              }"
            >
              <div class="flex items-center gap-3">
                <BrandIcon :kind="c.kind" :size="48" class="shrink-0 drop-shadow-md" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-base text-neutral-900">{{ c.label }}</p>
                  <p class="truncate text-xs text-neutral-500">{{ c.sub }}</p>
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                <span class="text-xs text-neutral-500">최저가</span>
                <span class="font-display whitespace-nowrap text-base text-neutral-900">{{ c.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
