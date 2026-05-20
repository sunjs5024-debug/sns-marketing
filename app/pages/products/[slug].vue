<script setup lang="ts">
import { formatPrice, platformKeyFor } from "#shared/catalog";

const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data: product } = await useFetch(`/api/products/${slug.value}`);
if (!product.value) throw createError({ statusCode: 404 });

useHead({ title: product.value.name, meta: [{ name: "description", content: product.value.description ?? "" }] });

const iconKey = computed(() => (product.value ? platformKeyFor(product.value.category.slug) : null));
const selectedOption = ref(product.value.options[0] ?? null);
const targetUrl = ref("");
const memo = ref("");
const feedback = ref<string | null>(null);
const pending = ref(false);

const unitPrice = computed(() => selectedOption.value?.price ?? product.value?.basePrice ?? 0);

const router = useRouter();

async function handleAdd(mode: "cart" | "buy") {
  feedback.value = null;
  pending.value = true;
  try {
    await $fetch("/api/cart/add", {
      method: "POST",
      body: {
        productId: product.value!.id,
        optionId: selectedOption.value?.id ?? null,
        quantity: 1,
        targetUrl: targetUrl.value || undefined,
        memo: memo.value || undefined,
      },
    });
    if (mode === "buy") {
      router.push("/checkout");
    } else {
      feedback.value = "장바구니에 담았습니다.";
      await refreshNuxtData();
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; statusCode?: number };
    // 401 미인증 → 로그인 페이지로 유도
    if (err.statusCode === 401) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/products/${slug.value}`)}`);
      return;
    }
    feedback.value = err.data?.statusMessage ?? err.statusMessage ?? "오류가 발생했습니다.";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div v-if="product" class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <nav class="mb-6 text-xs text-neutral-500">
      <span>홈</span> <span class="mx-1">/</span>
      <span>{{ product.category.platform === "SNS" ? "SNS 마케팅" : "상위노출" }}</span>
      <span class="mx-1">/</span>
      <span class="text-neutral-900">{{ product.category.name }}</span>
    </nav>

    <div class="grid gap-10 lg:grid-cols-2">
      <div class="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div class="pointer-events-none absolute -right-10 -top-10 h-60 w-60 bg-indigo-200/40 blur-3xl anim-blob" />
        <div class="pointer-events-none absolute -left-10 -bottom-10 h-60 w-60 bg-pink-200/40 blur-3xl anim-blob" style="animation-delay: -7s" />
        <div class="absolute inset-0 grid place-items-center">
          <div class="anim-float-up">
            <BrandIcon v-if="iconKey" :kind="iconKey" :size="220" class="drop-shadow-2xl" />
            <span v-else class="text-9xl">📦</span>
          </div>
        </div>
        <div v-if="product.badge" class="absolute left-5 top-5 z-10">
          <BadgePill :badge="product.badge" />
        </div>
      </div>

      <div>
        <p class="text-xs text-indigo-600">{{ product.category.name }}</p>
        <h1 class="mt-2 font-display text-2xl tracking-tight text-neutral-900 sm:text-3xl text-balance leading-tight">{{ product.name }}</h1>
        <div class="mt-3 flex items-center gap-3 text-sm text-neutral-600">
          <span class="text-amber-500">★ {{ product.rating.toFixed(1) }}</span>
          <span>·</span>
          <span>판매 {{ product.salesCount.toLocaleString("ko-KR") }}</span>
        </div>
        <p v-if="product.description" class="mt-5 text-sm leading-7 text-neutral-700">{{ product.description }}</p>

        <div class="mt-6 rounded-3xl border border-neutral-100 bg-neutral-50 p-5">
          <div class="flex items-baseline justify-between">
            <span class="text-xs text-neutral-500">최저가</span>
            <span class="font-display text-3xl text-neutral-900">{{ formatPrice(unitPrice) }}</span>
          </div>
          <p v-if="product.guaranteeInfo" class="mt-2 text-xs text-emerald-700">✓ {{ product.guaranteeInfo }}</p>
          <p v-if="product.deliveryInfo" class="mt-1 text-xs text-neutral-600">⏱ {{ product.deliveryInfo }}</p>
        </div>

        <div v-if="product.options.length > 0" class="mt-6">
          <h3 class="font-display text-sm text-neutral-900">수량 옵션 선택</h3>
          <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              v-for="opt in product.options"
              :key="opt.id"
              type="button"
              :class="[
                'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition',
                selectedOption?.id === opt.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white hover:border-neutral-400',
              ]"
              @click="selectedOption = opt"
            >
              <span>{{ opt.label }}</span>
              <span :class="selectedOption?.id === opt.id ? 'font-display' : 'font-display text-indigo-600'">
                {{ formatPrice(opt.price) }}
              </span>
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <label class="block">
            <span class="text-sm text-neutral-700">타겟 URL</span>
            <input
              v-model="targetUrl"
              type="url"
              placeholder="https://instagram.com/내계정 또는 게시물 링크"
              class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            />
            <span class="mt-1 block text-xs text-neutral-500">공개 URL만 필요해요. 비밀번호는 절대 묻지 않습니다.</span>
          </label>
          <label class="block">
            <span class="text-sm text-neutral-700">요청사항 (선택)</span>
            <textarea
              v-model="memo"
              rows="2"
              placeholder="작업 시점이나 분산 방식 등 원하시는 내용을 적어주세요"
              class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </label>
        </div>

        <p v-if="feedback" class="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ feedback }}</p>

        <div class="mt-8 flex gap-3">
          <button
            type="button"
            :disabled="pending"
            class="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
            @click="handleAdd('cart')"
          >
            장바구니
          </button>
          <button
            type="button"
            :disabled="pending"
            class="flex-[2] rounded-full bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-700 disabled:opacity-60"
            @click="handleAdd('buy')"
          >
            {{ pending ? "처리 중…" : "바로 구매하기" }}
          </button>
        </div>
      </div>
    </div>

    <section v-if="product.longDescription" class="mt-16">
      <h2 class="font-display text-xl text-neutral-900">상품 상세 안내</h2>
      <div class="mt-4 whitespace-pre-line rounded-3xl border border-neutral-100 bg-white p-6 text-sm leading-7 text-neutral-700">
        {{ product.longDescription }}
      </div>
    </section>
  </div>
</template>
