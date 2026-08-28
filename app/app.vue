<script setup lang="ts">
// 관리자 콘솔은 자체 네비게이션이 있어 좌측 사이드바를 숨긴다.
const route = useRoute();
const showSidebar = computed(() => !route.path.startsWith("/admin"));

// 전역 1회 — WebSite 엔티티. (SearchAction/사이트링크 검색창은 구글이 2024.11 폐지 → 제거)
useSchemaOrg([
  defineWebSite({
    name: "SNS소셜팩토리",
    url: "https://xn--sns-yg9lh0pw9l.kr",
  }),
]);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-neutral-900 antialiased">
    <SiteHeader />
    <div class="flex w-full flex-1">
      <AppSidebar v-if="showSidebar" />
      <main class="min-w-0 flex-1">
        <NuxtPage />
      </main>
    </div>
    <SiteFooter />
    <MessagesModal />
  </div>
</template>
