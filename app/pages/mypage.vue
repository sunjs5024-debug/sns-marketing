<script setup lang="ts">
import { formatPrice } from "#shared/catalog";
import { STATUS_LABEL, STATUS_STYLE } from "~~/server/utils/orderStatus";
import type { OrderStatus } from "~~/generated/prisma/enums";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "마이페이지", robots: "noindex, nofollow" });

const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "계좌이체",
  CARD: "신용카드",
  KAKAOPAY: "카카오페이",
  NAVERPAY: "네이버페이",
  TOSS: "토스",
};

type MyData = {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: "USER" | "ADMIN";
    points: number;
    createdAt: string;
  };
  orderCounts: {
    total: number;
    pending: number;
    paid: number;
    processing: number;
    completed: number;
    cancelled: number;
    refunded: number;
  };
  totalSpent: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    paymentMethod: string | null;
    createdAt: string;
    paidAt: string | null;
    items: Array<{ productName: string; optionLabel: string | null; quantity: number }>;
    _count: { items: number };
  }>;
};

const { data } = await useFetch<MyData>("/api/me");
if (!data.value) throw createError({ statusCode: 401, statusMessage: "로그인이 필요합니다." });

async function onSignOut() {
  try {
    const csrf = await $fetch<{ csrfToken: string }>("/api/auth/csrf");
    await $fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl: "/" }).toString(),
    });
  } catch {
    // 무시
  }
  if (import.meta.client) window.location.href = "/";
}
</script>

<template>
  <div v-if="data" class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <!-- 상단 프로필 카드 -->
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
      <div class="rounded-3xl bg-white p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <!-- 이니셜 아바타 -->
            <div class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 font-display text-2xl text-white shadow-lg">
              {{ data.user.name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="font-display text-2xl text-neutral-900">{{ data.user.name }}</h1>
                <span
                  v-if="data.user.role === 'ADMIN'"
                  class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] text-amber-800"
                >관리자</span>
              </div>
              <p class="mt-1 text-sm text-neutral-500">{{ data.user.email }}</p>
              <p class="text-xs text-neutral-400">
                가입일 {{ new Date(data.user.createdAt).toLocaleDateString("ko-KR") }}
                <span v-if="data.user.phone"> · {{ data.user.phone }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-full border border-neutral-300 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
              @click="onSignOut"
            >로그아웃</button>
          </div>
        </div>

        <!-- 포인트 + 누적 결제 -->
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p class="text-xs text-indigo-700">보유 포인트</p>
            <p class="mt-1 font-display text-2xl text-indigo-900">
              {{ data.user.points.toLocaleString("ko-KR") }}<span class="ml-0.5 text-base">P</span>
            </p>
          </div>
          <div class="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <p class="text-xs text-neutral-500">누적 결제 금액</p>
            <p class="mt-1 font-display text-2xl text-neutral-900">{{ formatPrice(data.totalSpent) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 주문 상태 카드 -->
    <section class="mt-8">
      <h2 class="font-display text-lg text-neutral-900">주문 현황</h2>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NuxtLink
          to="/orders"
          class="group rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p class="text-xs text-neutral-500">전체</p>
          <p class="mt-1 font-display text-xl text-neutral-900">{{ data.orderCounts.total }}</p>
        </NuxtLink>
        <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p class="text-xs text-amber-700">결제 대기</p>
          <p class="mt-1 font-display text-xl text-amber-900">{{ data.orderCounts.pending }}</p>
        </div>
        <div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p class="text-xs text-blue-700">진행 중</p>
          <p class="mt-1 font-display text-xl text-blue-900">{{ data.orderCounts.paid + data.orderCounts.processing }}</p>
        </div>
        <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p class="text-xs text-emerald-700">완료</p>
          <p class="mt-1 font-display text-xl text-emerald-900">{{ data.orderCounts.completed }}</p>
        </div>
      </div>
    </section>

    <!-- 최근 주문 -->
    <section class="mt-8">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-lg text-neutral-900">최근 주문</h2>
        <NuxtLink to="/orders" class="text-sm text-indigo-600 hover:underline">전체 보기 →</NuxtLink>
      </div>
      <div class="mt-4 rounded-3xl border border-neutral-100 bg-white">
        <ul class="divide-y divide-neutral-100">
          <li v-if="data.recentOrders.length === 0" class="p-12 text-center text-sm text-neutral-500">
            아직 주문이 없습니다. <NuxtLink to="/sns" class="text-indigo-600 hover:underline">상품 둘러보기 →</NuxtLink>
          </li>
          <li
            v-for="o in data.recentOrders"
            :key="o.id"
            class="px-5 py-4"
          >
            <NuxtLink :to="`/orders/${o.orderNumber}`" class="block hover:opacity-80">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{{ new Date(o.createdAt).toLocaleDateString("ko-KR") }}</span>
                    <span>·</span>
                    <span class="font-mono">{{ o.orderNumber }}</span>
                    <span>·</span>
                    <span>{{ o.paymentMethod ? (PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod) : "—" }}</span>
                  </div>
                  <p class="mt-1 truncate text-sm text-neutral-900">
                    {{ o.items[0]?.productName ?? "—" }}
                    <span v-if="o._count.items > 1" class="text-neutral-500">
                      외 {{ o._count.items - 1 }}건
                    </span>
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <span class="font-display text-sm text-neutral-900">{{ formatPrice(o.totalAmount) }}</span>
                  <span :class="['rounded-full px-2.5 py-1 text-[11px]', STATUS_STYLE[o.status]]">
                    {{ STATUS_LABEL[o.status] }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- 빠른 액션 -->
    <section class="mt-8">
      <h2 class="font-display text-lg text-neutral-900">바로가기</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          to="/cart"
          class="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span class="text-2xl">🛒</span>
          <span class="text-sm text-neutral-900">장바구니</span>
        </NuxtLink>
        <NuxtLink
          to="/orders"
          class="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span class="text-2xl">📦</span>
          <span class="text-sm text-neutral-900">주문 내역</span>
        </NuxtLink>
        <NuxtLink
          to="/sns"
          class="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span class="text-2xl">📸</span>
          <span class="text-sm text-neutral-900">SNS 마케팅</span>
        </NuxtLink>
        <NuxtLink
          v-if="data.user.role === 'ADMIN'"
          to="/admin"
          class="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span class="text-2xl">⚙️</span>
          <span class="text-sm text-amber-900">관리자 콘솔</span>
        </NuxtLink>
        <NuxtLink
          v-else
          to="/faq"
          class="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span class="text-2xl">💬</span>
          <span class="text-sm text-neutral-900">자주묻는질문</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
