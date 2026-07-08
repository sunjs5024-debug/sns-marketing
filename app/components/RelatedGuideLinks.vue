<script setup lang="ts">
// 관련 가이드 내부링크 — 상품/카테고리 페이지 공용.
//   플랫폼 → relatedGuideSlugs → 가이드 링크. 미크롤 가이드에 크롤 경로를 심어줌(색인 유도).
//   변형: card=상품 페이지용 독립 카드(h2) · bordered=카테고리 카드 안 상단 구분선 · 기본=inline.
import type { PlatformSlug } from "#shared/catalog";
import { getPlatformContent } from "#shared/platform-content";
import { getGuide } from "#shared/guides";

const props = defineProps<{ platformKey: PlatformSlug | null; bordered?: boolean; card?: boolean }>();

const relatedGuides = computed(() =>
  (getPlatformContent(props.platformKey)?.relatedGuideSlugs ?? [])
    .map((slug) => {
      const g = getGuide(slug);
      return g ? { slug: g.slug, label: g.breadcrumbLabel } : null;
    })
    .filter((g): g is { slug: string; label: string } => g !== null),
);
</script>

<template>
  <template v-if="relatedGuides.length > 0">
    <!-- card: 상품 페이지용 독립 카드 -->
    <section v-if="card" class="mt-12 rounded-3xl border border-neutral-100 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">함께 보면 좋은 가이드</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="g in relatedGuides" :key="g.slug">
          <NuxtLink
            :to="`/guide/${g.slug}`"
            class="inline-flex items-center gap-1.5 text-sm text-neutral-800 hover:text-indigo-600 hover:underline"
          >
            <span class="text-indigo-500">→</span> {{ g.label }}
          </NuxtLink>
        </li>
      </ul>
    </section>
    <!-- inline: 카테고리 카드 안 (bordered=상단 구분선) -->
    <div v-else :class="bordered ? 'mt-8 border-t border-neutral-100 pt-6' : ''">
      <p class="text-xs uppercase tracking-widest text-indigo-700">관련 가이드</p>
      <ul class="mt-3 space-y-2">
        <li v-for="g in relatedGuides" :key="g.slug">
          <NuxtLink
            :to="`/guide/${g.slug}`"
            class="inline-flex items-center gap-1.5 text-sm text-neutral-800 hover:text-indigo-600 hover:underline"
          >
            <span class="text-indigo-500">→</span> {{ g.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </template>
</template>
