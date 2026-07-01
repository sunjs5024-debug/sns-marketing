<script setup lang="ts">
import { SNS_PLATFORMS, RANK_PLATFORMS, MARKETING_PLATFORMS, PLATFORMS, type PlatformSlug } from "#shared/catalog";

// sidebase의 useAuth() 는 SSR 중 재귀 이슈가 있어 자체 API로 우회
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
    // 페이지 이동 시 모바일 드로어 자동 닫기
    drawerOpen.value = false;
  },
);

// 모바일 드로어 상태
const drawerOpen = ref(false);
// 드로어 열린 상태에서 body 스크롤 잠금
watch(drawerOpen, (v) => {
  if (import.meta.client) {
    document.body.style.overflow = v ? "hidden" : "";
  }
});

async function onSignOut() {
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
const marketingItems: DropItem[] = MARKETING_PLATFORMS.map((s) => ({
  href: `/marketing/${s}`,
  label: PLATFORMS[s].shortName,
  slug: s,
  desc: PLATFORMS[s].tagline,
}));
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/85 backdrop-blur-md">
    <div class="flex h-16 flex-nowrap items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
      <!-- 좌측: 로고 (사이드바 폭에 맞춰 정렬) -->
      <div class="flex shrink-0 items-center gap-3 lg:w-60">
        <!-- 모바일: 햄버거 -->
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 lg:hidden"
          aria-label="메뉴 열기"
          @click="drawerOpen = true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <NuxtLink to="/" class="flex shrink-0 items-center gap-2 font-display text-base sm:text-xl tracking-tight whitespace-nowrap">
          <span
            class="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md anim-gradient-flow"
            style="background-size: 200% 200%"
          >S</span>
          <span>SNS소셜팩토리</span>
        </NuxtLink>

      </div>

      <!-- 중앙: 보조 메뉴 -->
      <nav class="hidden lg:flex flex-1 items-center justify-center gap-1 text-sm font-medium text-neutral-700 whitespace-nowrap">
        <NuxtLink to="/sns" class="rounded-md px-3 py-2 transition hover:bg-neutral-100 hover:text-indigo-600">전체 상품</NuxtLink>
        <NuxtLink to="/price" class="rounded-md px-3 py-2 transition hover:bg-neutral-100 hover:text-indigo-600">가격표</NuxtLink>
        <NuxtLink to="/reviews" class="rounded-md px-3 py-2 transition hover:bg-neutral-100 hover:text-indigo-600">후기</NuxtLink>
        <NuxtLink to="/guide" class="rounded-md px-3 py-2 transition hover:bg-neutral-100 hover:text-indigo-600">이용안내</NuxtLink>
        <NuxtLink to="/support" class="rounded-md px-3 py-2 transition hover:bg-neutral-100 hover:text-indigo-600">고객센터</NuxtLink>
      </nav>

      <!-- 우측: 검색 + 사용자 + 카트 -->
      <div class="flex shrink-0 items-center gap-1 sm:gap-2 text-sm whitespace-nowrap">
        <!-- 검색 — 모든 사이즈 -->
        <NuxtLink
          to="/search"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100"
          aria-label="검색"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </NuxtLink>

        <!-- 로그인/유저: 데스크탑은 좌측 사이드바로 이동 → 헤더에선 모바일만 표시 -->
        <div class="contents lg:hidden">
        <template v-if="header?.isAuthed">
          <NuxtLink to="/orders" class="hidden lg:inline-flex rounded-full px-3 py-2 text-neutral-700 hover:bg-neutral-100 whitespace-nowrap">내 주문</NuxtLink>
          <!-- 모바일에서도 사용자 뱃지 표시 (간소화) -->
          <NuxtLink
            to="/mypage"
            class="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 sm:px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-200"
          >
            <span class="max-w-[5rem] sm:max-w-[7rem] truncate">{{ header?.name }}</span>
            <span class="hidden sm:inline text-neutral-400">·</span>
            <span class="hidden sm:inline text-indigo-600">{{ (header?.points ?? 0).toLocaleString("ko-KR") }}원</span>
          </NuxtLink>
          <NuxtLink v-if="header?.role === 'ADMIN'" to="/admin" class="hidden sm:inline-flex rounded-full bg-amber-100 px-3 py-2 text-xs text-amber-800 hover:bg-amber-200 whitespace-nowrap">관리자</NuxtLink>
          <button type="button" class="hidden sm:inline-flex rounded-full px-3 py-2 text-neutral-500 hover:bg-neutral-100 whitespace-nowrap" @click="onSignOut">로그아웃</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/signin" class="inline-flex items-center rounded-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-neutral-700 hover:bg-neutral-100 whitespace-nowrap">로그인</NuxtLink>
          <NuxtLink to="/auth/signup" class="hidden sm:inline-flex rounded-full bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700 whitespace-nowrap">회원가입</NuxtLink>
        </template>
        </div>
        <NuxtLink to="/cart" class="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100" aria-label="장바구니">
          🛒
          <span v-if="(header?.cartCount ?? 0) > 0" class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
            {{ header?.cartCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- 모바일 사이드 드로어 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="drawerOpen" class="fixed inset-0 z-50 lg:hidden">
          <!-- 백드롭 -->
          <div class="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" @click="drawerOpen = false" />
          <!-- 드로어 -->
          <Transition name="slide">
            <aside
              v-if="drawerOpen"
              class="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl"
            >
              <!-- 헤더 -->
              <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                <NuxtLink to="/" class="flex items-center gap-2 font-display text-lg">
                  <span class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">S</span>
                  SNS소셜팩토리
                </NuxtLink>
                <button type="button" class="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="메뉴 닫기" @click="drawerOpen = false">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <!-- 사용자 정보 (로그인 시) -->
              <div v-if="header?.isAuthed" class="border-b border-neutral-100 bg-gradient-to-br from-indigo-50 to-pink-50 px-5 py-4">
                <p class="font-display text-base text-neutral-900">{{ header?.name }}</p>
                <p class="mt-0.5 text-xs text-indigo-700">보유 잔액 {{ (header?.points ?? 0).toLocaleString("ko-KR") }}원</p>
              </div>

              <!-- 메뉴 -->
              <nav class="flex-1 overflow-y-auto px-3 py-4">
                <!-- SNS 마케팅 섹션 -->
                <p class="px-3 pb-2 text-[11px] uppercase tracking-widest text-neutral-400">SNS 마케팅</p>
                <NuxtLink
                  v-for="item in snsItems"
                  :key="item.href"
                  :to="item.href"
                  class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50"
                >
                  <BrandIcon :kind="item.slug" :size="28" />
                  <span class="text-sm text-neutral-900">{{ item.label }}</span>
                </NuxtLink>

                <!-- 플랫폼 마케팅 섹션 -->
                <template v-if="marketingItems.length > 0">
                  <p class="mt-4 px-3 pb-2 text-[11px] uppercase tracking-widest text-neutral-400">플랫폼 마케팅</p>
                  <NuxtLink
                    v-for="item in marketingItems"
                    :key="item.href"
                    :to="item.href"
                    class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50"
                  >
                    <BrandIcon :kind="item.slug" :size="28" />
                    <span class="text-sm text-neutral-900">{{ item.label }}</span>
                  </NuxtLink>
                </template>

                <!-- 일반 메뉴 -->
                <p class="mt-4 px-3 pb-2 text-[11px] uppercase tracking-widest text-neutral-400">정보</p>
                <NuxtLink to="/reviews" class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50">
                  <span class="text-xl">⭐</span>
                  <span class="text-sm text-neutral-900">고객 후기</span>
                </NuxtLink>
                <NuxtLink to="/guide" class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50">
                  <span class="text-xl">📖</span>
                  <span class="text-sm text-neutral-900">이용안내</span>
                </NuxtLink>
                <NuxtLink to="/faq" class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50">
                  <span class="text-xl">💬</span>
                  <span class="text-sm text-neutral-900">자주묻는질문</span>
                </NuxtLink>

                <!-- 로그인 시 마이페이지/주문 -->
                <template v-if="header?.isAuthed">
                  <p class="mt-4 px-3 pb-2 text-[11px] uppercase tracking-widest text-neutral-400">내 정보</p>
                  <NuxtLink to="/mypage" class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50">
                    <span class="text-xl">👤</span>
                    <span class="text-sm text-neutral-900">마이페이지</span>
                  </NuxtLink>
                  <NuxtLink to="/orders" class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50">
                    <span class="text-xl">📦</span>
                    <span class="text-sm text-neutral-900">내 주문</span>
                  </NuxtLink>
                  <!-- 포인트 충전 비활성화 (2026-06-14) — 계좌이체 전용 운영. 되살리려면 아래 블록 복원 -->
                  <NuxtLink to="/mypage/settings" class="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-50">
                    <span class="text-xl">⚙️</span>
                    <span class="text-sm text-neutral-900">회원 정보 관리</span>
                  </NuxtLink>
                  <NuxtLink v-if="header?.role === 'ADMIN'" to="/admin" class="flex items-center gap-3 rounded-xl bg-amber-50 p-3 hover:bg-amber-100">
                    <span class="text-xl">🛠</span>
                    <span class="text-sm text-amber-900">관리자 콘솔</span>
                  </NuxtLink>
                </template>
              </nav>

              <!-- 하단 액션 -->
              <div class="border-t border-neutral-100 p-4">
                <template v-if="header?.isAuthed">
                  <button
                    type="button"
                    class="w-full rounded-xl border border-neutral-200 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
                    @click="onSignOut"
                  >로그아웃</button>
                </template>
                <template v-else>
                  <div class="grid grid-cols-2 gap-2">
                    <NuxtLink to="/auth/signin" class="rounded-xl border border-neutral-200 py-3 text-center text-sm text-neutral-700 hover:bg-neutral-50">로그인</NuxtLink>
                    <NuxtLink to="/auth/signup" class="rounded-xl bg-neutral-900 py-3 text-center text-sm text-white hover:bg-neutral-700">회원가입</NuxtLink>
                  </div>
                </template>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
