<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "후기 작성", robots: "noindex, nofollow" });

const route = useRoute();
const router = useRouter();
const orderNumber = computed(() => String(route.params.orderNumber));

type OrderItem = { id: string; productId: string; productName: string; optionLabel: string | null };
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
};

const { data: order, error: loadError } = await useFetch<Order>(`/api/orders/${orderNumber.value}`);
if (!order.value) throw createError({ statusCode: 404, statusMessage: "주문을 찾을 수 없습니다." });

const selectedProductId = ref(order.value.items[0]?.productId ?? "");
const rating = ref(5);
const content = ref("");
const pending = ref(false);
const error = ref<string | null>(null);
const done = ref(false);

const contentLen = computed(() => content.value.trim().length);
const canSubmit = computed(() => contentLen.value >= 20 && rating.value >= 1 && selectedProductId.value && !pending.value);

const RATING_LABELS = ["", "매우 불만족", "불만족", "보통", "만족", "매우 만족"];

async function submit() {
  if (!canSubmit.value) return;
  error.value = null;
  pending.value = true;
  try {
    await $fetch("/api/reviews", {
      method: "POST",
      body: {
        orderNumber: orderNumber.value,
        productId: selectedProductId.value,
        rating: rating.value,
        content: content.value.trim(),
      },
    });
    done.value = true;
    setTimeout(() => router.push(`/orders/${orderNumber.value}`), 2200);
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    error.value = err.data?.statusMessage ?? err.statusMessage ?? "후기 등록 실패";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <NuxtLink :to="`/orders/${orderNumber}`" class="text-sm text-neutral-500 hover:text-neutral-900">← 주문으로 돌아가기</NuxtLink>
    <h1 class="mt-3 font-display text-2xl text-neutral-900 sm:text-3xl">후기 작성</h1>
    <p class="mt-2 text-sm text-neutral-500">주문번호 <span class="font-mono">{{ orderNumber }}</span></p>

    <!-- 완료 안내 -->
    <div v-if="done" class="mt-6 rounded-2xl bg-emerald-50 p-6 text-center">
      <p class="text-3xl">🎉</p>
      <p class="mt-2 font-display text-lg text-emerald-900">후기가 접수되었습니다!</p>
      <p class="mt-1 text-xs text-emerald-700">관리자 승인 후 공개됩니다. 잠시 후 주문 페이지로 이동합니다…</p>
    </div>

    <form v-else class="mt-6 space-y-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6" @submit.prevent="submit">
      <!-- 1. 상품 선택 (여러 개일 때) -->
      <div v-if="order && order.items.length > 1">
        <label class="block text-sm font-medium text-neutral-900">어떤 상품에 대한 후기인가요?</label>
        <div class="mt-2 space-y-2">
          <label
            v-for="it in order.items"
            :key="it.id"
            :class="[
              'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition',
              selectedProductId === it.productId ? 'border-indigo-500 bg-indigo-50/60' : 'border-neutral-200 hover:bg-neutral-50',
            ]"
          >
            <input v-model="selectedProductId" type="radio" :value="it.productId" class="h-4 w-4 cursor-pointer accent-indigo-600" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm text-neutral-900">{{ it.productName }}</p>
              <p class="truncate text-xs text-neutral-500">{{ it.optionLabel ?? "기본" }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- 1-alt. 상품 1개일 때 (라벨만) -->
      <div v-else-if="order && order.items.length === 1" class="rounded-2xl bg-neutral-50 px-4 py-3">
        <p class="text-xs text-neutral-500">상품</p>
        <p class="mt-1 text-sm font-medium text-neutral-900">{{ order.items[0].productName }}</p>
      </div>

      <!-- 2. 별점 -->
      <div>
        <label class="block text-sm font-medium text-neutral-900">평점</label>
        <div class="mt-2 flex items-center gap-2">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="text-3xl transition hover:scale-110"
            :class="n <= rating ? 'text-amber-400' : 'text-neutral-300'"
            :aria-label="`${n}점`"
            @click="rating = n"
          >★</button>
          <span class="ml-2 text-sm text-neutral-600">{{ RATING_LABELS[rating] }} ({{ rating }}/5)</span>
        </div>
      </div>

      <!-- 3. 본문 -->
      <div>
        <label class="block text-sm font-medium text-neutral-900">후기 본문</label>
        <p class="mt-1 text-xs text-neutral-500">최소 20자 이상 — 작업 결과·만족도·다음 분들에게 도움될 팁을 자유롭게.</p>
        <textarea
          v-model="content"
          rows="6"
          maxlength="1000"
          placeholder="예시) 인스타 팔로워 1,000명 옵션 결제했는데 진짜 1시간 안에 다 들어왔어요. 한국 타겟이라 그런지 자연 도달도 같이 늘었습니다…"
          class="mt-2 block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 focus:border-neutral-900 focus:outline-none"
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span :class="contentLen >= 20 ? 'text-emerald-600' : 'text-neutral-400'">
            {{ contentLen >= 20 ? "✓ 작성 가능" : `${contentLen}/20자 (${Math.max(0, 20 - contentLen)}자 더 필요)` }}
          </span>
          <span class="text-neutral-400">{{ contentLen }}/1000</span>
        </div>
      </div>

      <!-- 안내 -->
      <div class="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">
        <p>📝 작성하신 후기는 관리자 확인 후 공개됩니다 (보통 1영업일 내).</p>
        <p class="mt-1">⚠️ 욕설·광고·허위 내용은 거절될 수 있습니다.</p>
      </div>

      <!-- 에러 -->
      <p v-if="error" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

      <button
        type="submit"
        :disabled="!canSubmit"
        class="w-full rounded-full bg-neutral-900 py-3 text-sm text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {{ pending ? "등록 중…" : "후기 등록하기" }}
      </button>
    </form>
  </div>
</template>
