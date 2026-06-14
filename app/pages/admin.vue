<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
// 관리자 영역 — 검색엔진 색인 차단 (자식 admin/* 페이지에도 상속됨)
useSeoMeta({
  title: "관리자 콘솔",
  robots: "noindex, nofollow",
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
    <!-- 모바일: 세로 누적 / 데스크탑: 가로 배치 -->
    <div class="mb-5 flex flex-col gap-3 sm:mb-6 lg:flex-row lg:items-center lg:justify-between">
      <h1 class="font-display text-xl text-neutral-900 sm:text-2xl">관리자 콘솔</h1>
      <!-- 모바일에서는 가로 스크롤 nav, 데스크탑에서는 wrap -->
      <nav class="-mx-4 flex gap-1 overflow-x-auto px-4 text-xs sm:mx-0 sm:px-0 sm:text-sm lg:flex-wrap lg:overflow-visible">
        <NuxtLink to="/admin" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" exact-active-class="bg-neutral-900 text-white">대시보드</NuxtLink>
        <NuxtLink to="/admin/orders" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">주문관리</NuxtLink>
        <NuxtLink to="/admin/payments" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">결제내역</NuxtLink>
        <NuxtLink to="/admin/charges" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">충전관리</NuxtLink>
        <NuxtLink to="/admin/users" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">회원관리</NuxtLink>
        <NuxtLink to="/admin/products" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">상품관리</NuxtLink>
        <NuxtLink to="/admin/dispatches" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">발주현황</NuxtLink>
        <NuxtLink to="/admin/tax-invoices" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">세금계산서</NuxtLink>
        <NuxtLink to="/admin/reviews" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">리뷰관리</NuxtLink>
        <NuxtLink to="/admin/urpanel" class="shrink-0 rounded-full px-3 py-1.5 hover:bg-neutral-100 whitespace-nowrap" active-class="bg-neutral-100">urpanel</NuxtLink>
      </nav>
    </div>
    <NuxtPage />
  </div>
</template>
