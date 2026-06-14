<script setup lang="ts">
import type { PlatformSlug } from "#shared/catalog";

const props = withDefaults(
  defineProps<{
    kind: PlatformSlug;
    size?: number;
  }>(),
  { size: 32 },
);

const uid = computed(() => `${props.kind}-${props.size}-${Math.random().toString(36).slice(2, 7)}`);
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <template v-if="kind === 'instagram'">
      <defs>
        <linearGradient :id="`igGrad-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEDA75" />
          <stop offset="25%" stop-color="#FA7E1E" />
          <stop offset="55%" stop-color="#D62976" />
          <stop offset="85%" stop-color="#962FBF" />
          <stop offset="100%" stop-color="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" :fill="`url(#igGrad-${uid})`" />
      <rect x="7" y="7" width="18" height="18" rx="5.5" fill="none" stroke="white" stroke-width="2.2" />
      <circle cx="16" cy="16" r="4.6" fill="none" stroke="white" stroke-width="2.2" />
      <circle cx="22" cy="10" r="1.4" fill="white" />
    </template>

    <template v-else-if="kind === 'youtube'">
      <rect x="2" y="7.5" width="28" height="17" rx="5" fill="#FF0000" />
      <polygon points="13.5,12 13.5,20 21,16" fill="white" />
    </template>

    <template v-else-if="kind === 'tiktok'">
      <rect width="32" height="32" rx="9" fill="#010101" />
      <path
        d="M21.7 7.5c.3 2.6 2.1 4.3 4.5 4.5v3.5a8.4 8.4 0 0 1-4.3-1v6.6a6.7 6.7 0 1 1-6.7-6.7v3.6a3.1 3.1 0 1 0 3.1 3.1V7.5h3.4z"
        fill="#25F4EE"
        transform="translate(-1.2 0.6)"
      />
      <path
        d="M21.7 7.5c.3 2.6 2.1 4.3 4.5 4.5v3.5a8.4 8.4 0 0 1-4.3-1v6.6a6.7 6.7 0 1 1-6.7-6.7v3.6a3.1 3.1 0 1 0 3.1 3.1V7.5h3.4z"
        fill="#FE2C55"
        transform="translate(1.2 -0.4)"
      />
      <path
        d="M21.7 7.5c.3 2.6 2.1 4.3 4.5 4.5v3.5a8.4 8.4 0 0 1-4.3-1v6.6a6.7 6.7 0 1 1-6.7-6.7v3.6a3.1 3.1 0 1 0 3.1 3.1V7.5h3.4z"
        fill="white"
      />
    </template>

    <template v-else-if="kind === 'kakaotalk'">
      <rect width="32" height="32" rx="9" fill="#FAE100" />
      <path
        d="M16 7c-5.4 0-9.8 3.4-9.8 7.6 0 2.7 1.9 5.1 4.7 6.4l-1 3.6c-.1.4.4.7.7.5l4.2-2.5c.4 0 .8.1 1.2.1 5.4 0 9.8-3.4 9.8-7.6S21.4 7 16 7z"
        fill="#3C1E1E"
      />
    </template>

    <template v-else-if="kind === 'x'">
      <rect width="32" height="32" rx="9" fill="#000000" />
      <path
        transform="translate(4 4)"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="white"
      />
    </template>

    <template v-else-if="kind === 'telegram'">
      <defs>
        <linearGradient :id="`tgGrad-${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#37BBFE" />
          <stop offset="100%" stop-color="#007DBB" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" :fill="`url(#tgGrad-${uid})`" />
      <path
        d="M22.8 9.4 20 23c-.2 1-.8 1.2-1.6.7l-4.4-3.3-2.1 2.1c-.2.2-.5.5-1 .5l.3-4.4 7.9-7.1c.3-.3-.1-.5-.5-.2L8.8 16.9l-4.2-1.3c-.9-.3-1-.9.2-1.3l16.4-6.3c.8-.3 1.5.2 1.6 1.4z"
        fill="white"
      />
    </template>

    <template v-else-if="kind === 'ably'">
      <rect width="32" height="32" rx="9" fill="white" stroke="#E8E8E8" stroke-width="1" />
      <text x="16" y="24" font-size="23" font-weight="800" text-anchor="middle" fill="#111111" font-family="Arial, Helvetica, sans-serif">A</text>
    </template>

    <template v-else-if="kind === 'tistory'">
      <image href="/img/tistory-logo.svg" x="0" y="0" width="32" height="32" />
    </template>

    <template v-else-if="kind === 'smartstore'">
      <path
        d="M7 11h18l-1.6 15a2.4 2.4 0 0 1-2.4 2.2H11a2.4 2.4 0 0 1-2.4-2.2L7 11z"
        fill="#03C75A"
      />
      <path d="M11 11V8.5a5 5 0 0 1 10 0V11" fill="none" stroke="#03C75A" stroke-width="2.4" stroke-linecap="round" />
      <path d="M13.2 17h2l2.4 4.5V17h2v7.5h-2l-2.4-4.5v4.5h-2z" fill="white" />
    </template>

    <template v-else-if="kind === 'naver-blog'">
      <rect width="32" height="32" rx="9" fill="#03C75A" />
      <path d="M9 9h3.2l4 7V9h3.2v14h-3.2l-4-7v7H9z" fill="white" />
      <circle cx="23.5" cy="22" r="2.2" fill="white" />
    </template>

    <template v-else-if="kind === 'naver-cafe'">
      <rect width="32" height="32" rx="9" fill="#03C75A" />
      <path
        d="M16 7.5c-5 0-9 3.1-9 7 0 2.4 1.5 4.5 3.8 5.7l-.9 3.3c-.1.4.3.7.7.5l3.7-2.1c.6.1 1.1.1 1.7.1 5 0 9-3.1 9-7s-4-7.5-9-7.5z"
        fill="white"
      />
      <circle cx="13" cy="15" r="1.2" fill="#03C75A" />
      <circle cx="16" cy="15" r="1.2" fill="#03C75A" />
      <circle cx="19" cy="15" r="1.2" fill="#03C75A" />
    </template>
  </svg>
</template>
