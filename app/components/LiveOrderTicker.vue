<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";

type Tick = { kind: PlatformSlug; who: string; what: string; time: string };

const TICKS: Tick[] = [
  { kind: "instagram", who: "ji****@naver.com", what: "인스타 한국인 팔로워 1,000명 주문", time: "방금 전" },
  { kind: "telegram", who: "tg_c**", what: "텔레그램 채널 구독자 1,000명 주문", time: "1분 전" },
  { kind: "youtube", who: "da****_yt", what: "유튜브 쇼츠 조회수 10,000회 주문", time: "2분 전" },
  { kind: "tiktok", who: "tt**_kr", what: "틱톡 글로벌 팔로워 1,000명 주문", time: "3분 전" },
  { kind: "smartstore", who: "vintage**", what: "스마트스토어 포토 구매평 5건 주문", time: "4분 전" },
  { kind: "naver-blog", who: "감성카**", what: "블로그 체험단 5명 매칭 주문", time: "6분 전" },
  { kind: "instagram", who: "design**", what: "인스타 릴스 조회수 10,000회 주문", time: "7분 전" },
  { kind: "naver-cafe", who: "강남맘**", what: "네이버 카페 가입자 200명 주문", time: "8분 전" },
  { kind: "x", who: "@k_dev**", what: "X(트위터) 한국인 팔로워 500명 주문", time: "9분 전" },
  { kind: "kakaotalk", who: "광교카**", what: "카톡 채널친구 1,000명 주문", time: "10분 전" },
];

const list = [...TICKS, ...TICKS];
</script>

<template>
  <div class="relative overflow-hidden border-y border-neutral-100 bg-white">
    <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
    <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
    <div class="flex items-center gap-3 py-3">
      <div class="flex shrink-0 items-center gap-1.5 pl-4 pr-3 text-xs text-rose-600">
        <span class="relative flex h-2 w-2">
          <span class="absolute inset-0 rounded-full bg-rose-500 anim-pulse" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        실시간 주문
      </div>
      <div class="flex w-full overflow-hidden">
        <div class="flex shrink-0 gap-6 anim-marquee whitespace-nowrap pr-6">
          <span
            v-for="(t, i) in list"
            :key="i"
            class="inline-flex items-center gap-2 text-sm text-neutral-700"
          >
            <BrandIcon :kind="t.kind" :size="20" />
            <span class="text-neutral-900">{{ t.who }}</span>
            <span>· {{ t.what }}</span>
            <span class="text-xs text-neutral-400">· {{ t.time }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
