<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
  moreHref?: string;
  moreLabel?: string;
}>();
</script>

<template>
  <div class="flex items-end justify-between gap-4">
    <div>
      <p v-if="eyebrow" class="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
        {{ eyebrow }}
      </p>
      <h2 class="text-2xl sm:text-3xl text-neutral-900">
        {{ title }}
      </h2>
      <p v-if="description" class="mt-2 text-sm text-neutral-600 max-w-xl">
        {{ description }}
      </p>
    </div>
    <NuxtLink
      v-if="moreHref"
      :to="moreHref"
      class="hidden sm:inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
    >
      {{ moreLabel ?? "전체보기" }}
      <span aria-hidden>→</span>
    </NuxtLink>
  </div>
</template>
