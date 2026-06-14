<script setup lang="ts">
// 네이버 공식 N 글리프 — 초록 버튼 위에 흰색으로 사용
withDefaults(defineProps<{ size?: number }>(), { size: 18 });
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Naver"
    role="img"
  >
    <path
      d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"
      fill="currentColor"
    />
  </svg>
</template>
