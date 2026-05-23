<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";

type Tick = { kind: PlatformSlug; who: string; what: string; time: string };

// 페이지 새로고침마다 새 데이터. SSR 응답이라 처음부터 다양한 닉네임 노출
const { data } = await useFetch<{ activeUsers: number; recentOrders: Tick[] }>(
  "/api/live",
  { key: "live", default: () => ({ activeUsers: 158, recentOrders: [] }) },
);
// marquee 연속 효과용으로 2번 복제
const list = computed<Tick[]>(() => [...(data.value?.recentOrders ?? []), ...(data.value?.recentOrders ?? [])]);
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
