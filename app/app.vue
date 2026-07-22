<script setup lang="ts">
// 관리자 콘솔은 자체 네비게이션이 있어 좌측 사이드바를 숨긴다.
const route = useRoute();
const showSidebar = computed(() => !route.path.startsWith("/admin"));
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
