<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";
import { getPlatformContent } from "#shared/platform-content";
import { getGuide } from "#shared/guides";

const props = defineProps<{ platformKey: PlatformSlug | null }>();

const content = computed(() => getPlatformContent(props.platformKey));

// 관련 가이드 — 내부링크 (슬러그 → 라벨/경로)
const relatedGuides = computed(() =>
  (content.value?.relatedGuideSlugs ?? [])
    .map((slug) => {
      const g = getGuide(slug);
      return g ? { slug: g.slug, label: g.breadcrumbLabel } : null;
    })
    .filter((g): g is { slug: string; label: string } => g !== null),
);
</script>

<template>
  <section v-if="content" class="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8">
      <p class="text-sm leading-7 text-neutral-700">{{ content.category.lead }}</p>

      <div class="mt-8 space-y-8">
        <section v-for="(s, i) in content.category.sections" :key="i">
          <h2 class="font-display text-lg text-neutral-900 sm:text-xl">{{ s.heading }}</h2>
          <p class="mt-2 text-sm leading-7 text-neutral-700">{{ s.body }}</p>
        </section>
      </div>

      <!-- 관련 가이드 내부링크 -->
      <div v-if="relatedGuides.length > 0" class="mt-8 border-t border-neutral-100 pt-6">
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
    </div>
  </section>
</template>
