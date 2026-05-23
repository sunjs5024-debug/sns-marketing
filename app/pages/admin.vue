<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
// 관리자 영역 — 검색엔진 색인 차단 (자식 admin/* 페이지에도 상속됨)
useSeoMeta({
  title: "관리자 콘솔",
  robots: "noindex, nofollow",
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl text-neutral-900">관리자 콘솔</h1>
      <nav class="flex flex-wrap gap-1 text-sm">
        <NuxtLink to="/admin" class="rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" exact-active-class="bg-neutral-900 text-white">대시보드</NuxtLink>
        <NuxtLink to="/admin/orders" class="rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">주문관리</NuxtLink>
        <NuxtLink to="/admin/payments" class="rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">결제내역</NuxtLink>
        <NuxtLink to="/admin/users" class="rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">회원관리</NuxtLink>
        <NuxtLink to="/admin/products" class="rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">상품관리</NuxtLink>
      </nav>
    </div>
    <NuxtPage />
  </div>
</template>
