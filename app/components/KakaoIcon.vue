<script setup lang="ts">
// 카카오톡 공식 말풍선 로고 (단순화) — 노란 버튼 위에 #3C1E1E 톤으로 사용
withDefaults(defineProps<{ size?: number }>(), { size: 18 });
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Kakao"
    role="img"
  >
    <path
      d="M16 6.5C9.65 6.5 4.5 10.48 4.5 15.4c0 3.13 2.07 5.87 5.2 7.41l-1.21 4.41c-.11.4.34.72.69.49l5.42-3.58c.46.04.93.07 1.4.07 6.35 0 11.5-3.98 11.5-8.8S22.35 6.5 16 6.5z"
      fill="currentColor"
    />
  </svg>
</template>
