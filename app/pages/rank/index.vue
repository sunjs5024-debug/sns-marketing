<script setup lang="ts">
// 상위노출 카테고리는 현재 비활성 — SNS 마케팅 페이지로 자동 리다이렉트
// (검색엔진에는 noindex 처리)
useSeoMeta({
  title: "준비 중",
  robots: "noindex, nofollow",
});

if (import.meta.server) {
  // 서버: 301 영구 리다이렉트
  setResponseStatus(useRequestEvent()!, 301);
  setResponseHeader(useRequestEvent()!, "Location", "/sns");
}
if (import.meta.client) {
  navigateTo("/sns", { replace: true, redirectCode: 301 });
}
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
    <p class="text-xs uppercase tracking-widest text-neutral-500">PREPARING</p>
    <h1 class="mt-3 font-display text-3xl text-neutral-900">상위노출 서비스 준비 중</h1>
    <p class="mt-3 text-sm text-neutral-600">곧 SNS 마케팅 페이지로 이동합니다…</p>
    <NuxtLink to="/sns" class="mt-6 rounded-full bg-neutral-900 px-5 py-3 text-sm text-white hover:bg-neutral-700">
      SNS 마케팅 보기 →
    </NuxtLink>
  </div>
</template>
