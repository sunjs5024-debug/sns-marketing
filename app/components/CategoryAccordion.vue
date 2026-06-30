<script setup lang="ts">
// 왼쪽 세로 카테고리 사이드바 — 플랫폼(카테고리) 클릭 시 그 아래로 세부상품 펼침(아코디언).
// 세부상품은 펼칠 때 해당 플랫폼 상품을 lazy 로딩.
import { SNS_PLATFORMS, MARKETING_PLATFORMS, PLATFORMS, formatPrice, type PlatformSlug } from "#shared/catalog";

type Prod = { id: string; slug: string; name: string; basePrice: number };

const groups = [
  { label: "SNS 마케팅", base: "sns", slugs: SNS_PLATFORMS },
  { label: "플랫폼 마케팅", base: "marketing", slugs: MARKETING_PLATFORMS },
].filter((g) => g.slugs.length > 0);

const open = ref<PlatformSlug | null>(null);
const cache = ref<Record<string, Prod[]>>({});
const loading = ref<PlatformSlug | null>(null);

function baseFor(slug: PlatformSlug): string {
  return MARKETING_PLATFORMS.includes(slug) ? "marketing" : "sns";
}

async function toggle(slug: PlatformSlug) {
  if (open.value === slug) {
    open.value = null;
    return;
  }
  open.value = slug;
  if (!cache.value[slug]) {
    loading.value = slug;
    try {
      cache.value[slug] = await $fetch<Prod[]>(`/api/products/by-platform/${slug}`);
    } catch {
      cache.value[slug] = [];
    } finally {
      loading.value = null;
    }
  }
}
</script>

<template>
  <nav class="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
    <template v-for="(g, gi) in groups" :key="g.label">
      <p
        class="bg-neutral-50/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
        :class="gi > 0 ? 'border-t border-neutral-100' : ''"
      >
        {{ g.label }}
      </p>

      <div v-for="slug in g.slugs" :key="slug" class="border-t border-neutral-100">
        <!-- 카테고리(플랫폼) 행 -->
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-50"
          :class="open === slug ? 'bg-indigo-50/60' : ''"
          @click="toggle(slug)"
        >
          <BrandIcon :kind="slug" :size="28" />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium text-neutral-900">{{ PLATFORMS[slug].shortName }}</span>
            <span class="block truncate text-xs text-neutral-500">{{ PLATFORMS[slug].tagline }}</span>
          </span>
          <svg
            class="h-4 w-4 shrink-0 text-neutral-400 transition-transform"
            :class="open === slug ? 'rotate-180 text-indigo-600' : ''"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <!-- 세부상품 (펼침) -->
        <div v-show="open === slug" class="bg-neutral-50/40 px-3 pb-3">
          <div v-if="loading === slug" class="px-3 py-3 text-xs text-neutral-400">불러오는 중…</div>
          <template v-else>
            <NuxtLink
              v-for="p in cache[slug] ?? []"
              :key="p.id"
              :to="`/products/${p.slug}`"
              class="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white"
            >
              <span class="min-w-0 flex-1 truncate text-neutral-700">{{ p.name }}</span>
              <span class="shrink-0 font-display text-xs text-indigo-600">{{ formatPrice(p.basePrice) }}~</span>
            </NuxtLink>
            <p v-if="(cache[slug] ?? []).length === 0" class="px-3 py-2 text-xs text-neutral-400">준비 중인 상품입니다.</p>
            <NuxtLink
              :to="`/${baseFor(slug)}/${slug}`"
              class="mt-1 block rounded-xl px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-white"
            >
              {{ PLATFORMS[slug].shortName }} 전체 상품 보기 →
            </NuxtLink>
          </template>
        </div>
      </div>
    </template>
  </nav>
</template>
