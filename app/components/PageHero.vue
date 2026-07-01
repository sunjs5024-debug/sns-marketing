<script setup lang="ts">
// 헤더 메뉴 페이지 공통 히어로 — 연한 파스텔 그라데이션 + 진한 글씨로 통일.
defineProps<{ eyebrow?: string; title: string; subtitle?: string }>();
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="pointer-events-none absolute -left-16 -top-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl anim-blob" />
    <div class="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl anim-blob" style="animation-delay: -6s" />
    <div class="relative mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
      <p v-if="eyebrow" class="text-xs uppercase tracking-[0.2em] text-indigo-600">{{ eyebrow }}</p>
      <h1 class="mt-2 font-display text-3xl tracking-tight text-neutral-900 sm:text-4xl">{{ title }}</h1>
      <p v-if="subtitle" class="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">{{ subtitle }}</p>
      <div class="mt-6 empty:hidden"><slot /></div>
    </div>
  </section>
</template>
