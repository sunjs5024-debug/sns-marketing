<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";
import { getPlatformContent } from "#shared/platform-content";
import { getGuide } from "#shared/guides";

const props = defineProps<{ platformKey: PlatformSlug | null }>();

const content = computed(() => getPlatformContent(props.platformKey));

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
  <section v-if="content" class="mt-12">
    <h2 class="font-display text-xl text-neutral-900">이용 안내 — 진행 방식과 주의사항</h2>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <!-- 진행 방식 -->
      <div class="rounded-3xl border border-neutral-100 bg-white p-6">
        <h3 class="font-display text-sm text-neutral-900">진행 방식</h3>
        <ol class="mt-3 space-y-2.5">
          <li
            v-for="(step, i) in content.process"
            :key="i"
            class="flex gap-3 text-sm leading-6 text-neutral-700"
          >
            <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-[11px] font-medium text-indigo-700">{{ i + 1 }}</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>

      <!-- 주의사항 -->
      <div class="rounded-3xl border border-amber-100 bg-amber-50/60 p-6">
        <h3 class="font-display text-sm text-amber-900">주의사항</h3>
        <ul class="mt-3 space-y-2.5">
          <li
            v-for="(c, i) in content.cautions"
            :key="i"
            class="flex gap-2 text-sm leading-6 text-amber-900/90"
          >
            <span class="shrink-0 text-amber-500">⚠</span>
            <span>{{ c }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 안전 이용 + 관련 가이드 내부링크 -->
    <div class="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6">
      <h3 class="font-display text-sm text-emerald-900">안전하게 이용하는 방법</h3>
      <p class="mt-2 text-sm leading-7 text-emerald-900/90">{{ content.safety }}</p>

      <div v-if="relatedGuides.length > 0" class="mt-4 flex flex-wrap items-center gap-2">
        <span class="text-xs text-neutral-500">더 알아보기:</span>
        <NuxtLink
          v-for="g in relatedGuides"
          :key="g.slug"
          :to="`/guide/${g.slug}`"
          class="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 hover:border-indigo-300 hover:text-indigo-600"
        >
          📖 {{ g.label }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
