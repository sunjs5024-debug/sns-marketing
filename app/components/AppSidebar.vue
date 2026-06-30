<script setup lang="ts">
// 전역 왼쪽 사이드바 (데스크탑) — channelup 스타일.
// 모든 상품을 미리 로드해 카테고리 클릭 시 로딩 없이 즉시 세부상품을 펼친다. 가격 미표시.
import { SNS_PLATFORMS, MARKETING_PLATFORMS, PLATFORMS, platformKeyFor, type PlatformSlug } from "#shared/catalog";

type NavProd = { slug: string; name: string; featured: boolean; categorySlug: string };

// SSR 에서 미리 로드 → 초기 HTML 에 포함 → 펼칠 때 즉시 표시 (로딩 없음)
const { data: navProducts } = await useFetch<NavProd[]>("/api/products/nav", {
  key: "nav-products",
  default: () => [],
});

// 로그인 상태 (SiteHeader 와 동일 key 라 중복 호출 없음)
const { data: header } = await useFetch("/api/header", {
  key: "header",
  default: () => ({ isAuthed: false, role: null, cartCount: 0, name: null, points: 0 }),
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

// 플랫폼별 그룹핑
const byPlatform = computed(() => {
  const m: Record<string, { slug: string; name: string; featured: boolean }[]> = {};
  for (const p of navProducts.value ?? []) {
    const key = platformKeyFor(p.categorySlug);
    if (!key) continue;
    (m[key] ??= []).push({ slug: p.slug, name: p.name, featured: p.featured });
  }
  return m;
});

const groups = [
  { label: "SNS 마케팅", slugs: SNS_PLATFORMS },
  { label: "플랫폼 마케팅", slugs: MARKETING_PLATFORMS },
].filter((g) => g.slugs.length > 0);

function baseFor(slug: PlatformSlug): string {
  return MARKETING_PLATFORMS.includes(slug) ? "marketing" : "sns";
}

// 기본으로 첫 SNS 플랫폼 1개 펼쳐둠 (여러 개 동시 펼침 허용)
const open = ref<Set<string>>(new Set(SNS_PLATFORMS.length ? [SNS_PLATFORMS[0] as string] : []));
function toggle(key: string) {
  const s = new Set(open.value);
  s.has(key) ? s.delete(key) : s.add(key);
  open.value = s;
}

// 준비중(곧 출시) — 아직 상품/API 없음. 시각적 자리만 표시.
const comingSoon = [
  { name: "카카오톡 채널", emoji: "💬", items: ["채널 친구 수 늘리기", "게시글 좋아요 늘리기", "게시글 공유 늘리기"] },
  { name: "카카오맵", emoji: "📍", items: ["리뷰 늘리기", "저장수 늘리기", "검색 트래픽"] },
];
</script>

<template>
  <aside class="hidden lg:flex w-64 shrink-0 flex-col border-r border-neutral-100 bg-white">
    <div class="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
      <!-- 로그인 / 회원가입 (또는 로그인 시 유저 정보) -->
      <div class="mb-4">
        <template v-if="header?.isAuthed">
          <NuxtLink to="/mypage" class="block rounded-2xl bg-gradient-to-br from-indigo-50 to-pink-50 px-4 py-3">
            <p class="truncate text-sm font-medium text-neutral-900">{{ header?.name }}</p>
            <p class="mt-0.5 text-xs text-indigo-700">{{ (header?.points ?? 0).toLocaleString("ko-KR") }}P 보유</p>
          </NuxtLink>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <NuxtLink to="/orders" class="rounded-xl border border-neutral-200 py-2 text-center text-xs text-neutral-700 hover:bg-neutral-50">내 주문</NuxtLink>
            <button type="button" class="rounded-xl border border-neutral-200 py-2 text-center text-xs text-neutral-500 hover:bg-neutral-50" @click="onSignOut">로그아웃</button>
          </div>
          <NuxtLink v-if="header?.role === 'ADMIN'" to="/admin" class="mt-2 block rounded-xl bg-amber-100 py-2 text-center text-xs text-amber-800 hover:bg-amber-200">관리자 콘솔</NuxtLink>
        </template>
        <NuxtLink
          v-else
          to="/auth/signin"
          class="block rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-center text-sm font-medium text-white shadow-md transition hover:brightness-105"
        >
          로그인 / 회원가입
        </NuxtLink>
      </div>

      <template v-for="(g, gi) in groups" :key="g.label">
        <p
          class="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
          :class="gi > 0 ? 'mt-4' : ''"
        >
          {{ g.label }}
        </p>

        <div v-for="slug in g.slugs" :key="slug">
          <!-- 카테고리(플랫폼) -->
          <button
            type="button"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-neutral-50"
            :class="open.has(slug) ? 'bg-indigo-50/60' : ''"
            @click="toggle(slug)"
          >
            <BrandIcon :kind="slug" :size="24" />
            <span class="flex-1 text-sm font-medium text-neutral-900">{{ PLATFORMS[slug].shortName }}</span>
            <svg
              class="h-4 w-4 shrink-0 text-neutral-400 transition-transform"
              :class="open.has(slug) ? 'rotate-180 text-indigo-600' : ''"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <!-- 세부상품 (즉시 표시) -->
          <div v-show="open.has(slug)" class="mb-1 ml-4 border-l border-neutral-100 pl-2">
            <NuxtLink
              v-for="p in byPlatform[slug] ?? []"
              :key="p.slug"
              :to="`/products/${p.slug}`"
              class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-neutral-600 transition hover:bg-neutral-50 hover:text-indigo-600"
            >
              <span class="min-w-0 flex-1 truncate">{{ p.name }}</span>
              <span v-if="p.featured" class="shrink-0 rounded bg-rose-100 px-1 text-[9px] font-medium text-rose-600">인기</span>
            </NuxtLink>
            <p v-if="(byPlatform[slug] ?? []).length === 0" class="px-3 py-1.5 text-xs text-neutral-400">준비 중</p>
            <NuxtLink
              :to="`/${baseFor(slug)}/${slug}`"
              class="block rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-neutral-50"
            >
              전체 보기 →
            </NuxtLink>
          </div>
        </div>
      </template>

      <!-- 곧 출시 (준비중) -->
      <p class="mt-4 px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">곧 출시</p>
      <div v-for="c in comingSoon" :key="c.name">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-neutral-50"
          @click="toggle(c.name)"
        >
          <span class="grid h-6 w-6 place-items-center text-base">{{ c.emoji }}</span>
          <span class="flex-1 text-sm font-medium text-neutral-500">{{ c.name }}</span>
          <span class="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-400">준비중</span>
          <svg
            class="h-4 w-4 shrink-0 text-neutral-300 transition-transform"
            :class="open.has(c.name) ? 'rotate-180' : ''"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div v-show="open.has(c.name)" class="mb-1 ml-4 border-l border-neutral-100 pl-2">
          <div
            v-for="it in c.items"
            :key="it"
            class="flex items-center justify-between gap-2 px-3 py-2 text-[13px] text-neutral-400"
          >
            <span class="min-w-0 flex-1 truncate">{{ it }}</span>
            <span class="shrink-0 rounded bg-neutral-100 px-1 text-[9px]">준비중</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
