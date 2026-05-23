<script setup lang="ts">
import { SNS_PLATFORMS, RANK_PLATFORMS, PLATFORMS, type PlatformSlug } from "#shared/catalog";

// sidebase의 useAuth() 는 SSR 중 재귀 이슈가 있어 자체 API로 우회
// key 명시 → refreshNuxtData("header") 로 외부에서 갱신 가능
const { data: header, refresh: refreshHeader } = await useFetch("/api/header", {
  key: "header",
  default: () => ({ isAuthed: false, role: null, cartCount: 0, name: null, points: 0 }),
});

// 페이지 이동 시 자동 refresh — 포인트/카트 변경 사항 즉시 반영
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    if (import.meta.client) refreshHeader();
  },
);

async function onSignOut() {
  // CSRF 토큰 가져와서 sidebase signout 호출
  try {
    const csrf = await $fetch<{ csrfToken: string }>("/api/auth/csrf");
    await $fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl: "/" }).toString(),
    });
  } catch {
    // 무시
  }
  // 쿠키 갱신을 위해 페이지 새로고침
  if (import.meta.client) window.location.href = "/";
}

type DropItem = { href: string; label: string; slug: PlatformSlug; desc: string };
const snsItems: DropItem[] = SNS_PLATFORMS.map((s) => ({
  href: `/sns/${s}`,
  label: PLATFORMS[s].shortName,
  slug: s,
  desc: PLATFORMS[s].tagline,
}));
const rankItems: DropItem[] = RANK_PLATFORMS.map((s) => ({
  href: `/rank/${s}`,
  label: PLATFORMS[s].shortName,
  slug: s,
  desc: PLATFORMS[s].tagline,
}));
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/85 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl flex-nowrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div class="flex shrink-0 items-center gap-6 lg:gap-8">
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2 font-display text-xl tracking-tight whitespace-nowrap">
          <span
            class="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md anim-gradient-flow"
            style="background-size: 200% 200%"
          >S</span>
          <span>SNS소셜팩토리</span>
        </NuxtLink>

        <nav class="hidden lg:flex items-center gap-1 text-sm font-medium text-neutral-700 whitespace-nowrap">
          <div class="group relative">
            <NuxtLink to="/sns" class="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-neutral-100 whitespace-nowrap">
              SNS 마케팅
              <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
            <div class="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div class="w-80 rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl">
                <NuxtLink
                  v-for="item in snsItems"
                  :key="item.href"
                  :to="item.href"
                  class="flex items-start gap-3 rounded-xl p-3 hover:bg-neutral-50"
                >
                  <BrandIcon :kind="item.slug" :size="32" />
                  <span class="flex flex-col">
                    <span class="text-neutral-900">{{ item.label }}</span>
                    <span class="text-xs text-neutral-500">{{ item.desc }}</span>
                  </span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="group relative">
            <NuxtLink to="/rank" class="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-neutral-100 whitespace-nowrap">
              상위노출
              <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
            <div class="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div class="w-80 rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl">
                <NuxtLink
                  v-for="item in rankItems"
                  :key="item.href"
                  :to="item.href"
                  class="flex items-start gap-3 rounded-xl p-3 hover:bg-neutral-50"
                >
                  <BrandIcon :kind="item.slug" :size="32" />
                  <span class="flex flex-col">
                    <span class="text-neutral-900">{{ item.label }}</span>
                    <span class="text-xs text-neutral-500">{{ item.desc }}</span>
                  </span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <NuxtLink to="/reviews" class="rounded-md px-3 py-2 hover:bg-neutral-100 whitespace-nowrap">후기</NuxtLink>
          <NuxtLink to="/guide" class="rounded-md px-3 py-2 hover:bg-neutral-100 whitespace-nowrap">이용안내</NuxtLink>
        </nav>
      </div>

      <div class="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
        <!-- 검색 (항상 노출, 로그인 무관) -->
        <NuxtLink
          to="/search"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100"
          aria-label="검색"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </NuxtLink>

        <template v-if="header?.isAuthed">
          <NuxtLink to="/orders" class="hidden lg:inline-flex rounded-full px-3 py-2 text-neutral-700 hover:bg-neutral-100 whitespace-nowrap">내 주문</NuxtLink>
          <!-- 사용자 배지 = 마이페이지 진입점 (클릭하면 /mypage) -->
          <NuxtLink
            to="/mypage"
            class="hidden sm:inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 whitespace-nowrap transition hover:bg-neutral-200"
          >
            <span class="max-w-[7rem] truncate">{{ header?.name }}</span>
            <span class="text-neutral-400">·</span>
            <span class="text-indigo-600">{{ (header?.points ?? 0).toLocaleString("ko-KR") }}P</span>
          </NuxtLink>
          <NuxtLink v-if="header?.role === 'ADMIN'" to="/admin" class="hidden sm:inline-flex rounded-full bg-amber-100 px-3 py-2 text-xs text-amber-800 hover:bg-amber-200 whitespace-nowrap">관리자</NuxtLink>
          <button type="button" class="hidden sm:inline-flex rounded-full px-3 py-2 text-neutral-500 hover:bg-neutral-100 whitespace-nowrap" @click="onSignOut">로그아웃</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/signin" class="hidden sm:inline-flex rounded-full px-3 py-2 text-neutral-700 hover:bg-neutral-100 whitespace-nowrap">로그인</NuxtLink>
          <NuxtLink to="/auth/signup" class="hidden sm:inline-flex rounded-full bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700 whitespace-nowrap">회원가입</NuxtLink>
        </template>
        <NuxtLink to="/cart" class="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100" aria-label="장바구니">
          🛒
          <span v-if="(header?.cartCount ?? 0) > 0" class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
            {{ header?.cartCount }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
