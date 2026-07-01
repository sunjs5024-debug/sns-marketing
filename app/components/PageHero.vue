<script setup lang="ts">
// 헤더 메뉴 페이지 공통 히어로 — 색·크기·정렬 통일 (풀블리드 그라데이션 + 가운데 정렬).
defineProps<{ eyebrow?: string; title: string; subtitle?: string }>();
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
    <div class="pointer-events-none absolute -left-16 -top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl anim-blob" />
    <div class="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl anim-blob" style="animation-delay: -6s" />
    <div class="relative mx-auto max-w-5xl px-4 py-12 text-center text-white sm:px-6 sm:py-16 lg:px-8">
      <p v-if="eyebrow" class="text-xs uppercase tracking-[0.2em] text-white/80">{{ eyebrow }}</p>
      <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">{{ title }}</h1>
      <p v-if="subtitle" class="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85">{{ subtitle }}</p>
      <div class="mt-6 empty:hidden"><slot /></div>
    </div>
  </section>
</template>
