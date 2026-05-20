<script setup lang="ts">
import type { PlatformMeta } from "#shared/catalog";

defineProps<{
  platform: PlatformMeta;
  base: "sns" | "rank";
}>();
</script>

<template>
  <NuxtLink
    :to="`/${base}/${platform.slug}`"
    :class="[
      'group relative overflow-hidden rounded-3xl border border-neutral-100 bg-gradient-to-br p-6 transition hover:-translate-y-1 hover:shadow-xl',
      platform.bgGradient,
    ]"
  >
    <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl anim-blob" />
    <div class="relative flex items-center gap-3">
      <div class="anim-float-up">
        <BrandIcon :kind="platform.slug" :size="56" />
      </div>
      <div>
        <h3 class="font-display text-xl text-neutral-900">{{ platform.shortName }}</h3>
        <p class="text-xs font-medium text-neutral-600">{{ platform.tagline }}</p>
      </div>
    </div>
    <p class="relative mt-4 line-clamp-2 text-sm text-neutral-700">{{ platform.description }}</p>
    <div class="relative mt-4 inline-flex items-center gap-1 text-sm text-neutral-900">
      상품 보기 <span aria-hidden class="transition group-hover:translate-x-1">→</span>
    </div>
  </NuxtLink>
</template>
