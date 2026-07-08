<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";
import { getPlatformContent } from "#shared/platform-content";

const props = defineProps<{ platformKey: PlatformSlug | null }>();

const content = computed(() => getPlatformContent(props.platformKey));
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

      <!-- 관련 가이드 내부링크 (RelatedGuideLinks 공용 컴포넌트) -->
      <RelatedGuideLinks :platform-key="platformKey" bordered />
    </div>
  </section>
</template>
