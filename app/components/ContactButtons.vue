<script setup lang="ts">
// 상담 채널 버튼 묶음 — 텔레그램 + 카카오톡 채널 + 이메일. 텔레그램만 있던 CTA 표준화.
import { CONTACT } from "#shared/catalog";

withDefaults(defineProps<{ dark?: boolean; center?: boolean }>(), { dark: false, center: false });
</script>

<template>
  <div :class="['flex flex-wrap gap-2.5', center ? 'justify-center' : '']">
    <a
      :href="CONTACT.telegram.url"
      target="_blank"
      rel="noopener"
      class="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
    >
      <span aria-hidden="true">✈</span> 텔레그램 상담
    </a>
    <a
      :href="CONTACT.kakao.url"
      target="_blank"
      rel="noopener"
      class="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-medium text-[#3c1e1e] shadow-sm transition hover:bg-yellow-300"
    >
      <span aria-hidden="true">💬</span> 카카오톡 상담
    </a>
    <a
      :href="`mailto:${CONTACT.email}`"
      :class="[
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition',
        dark ? 'border border-white/40 text-white hover:bg-white/10' : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50',
      ]"
    >
      <span aria-hidden="true">✉</span> 이메일 문의
    </a>
  </div>
</template>
