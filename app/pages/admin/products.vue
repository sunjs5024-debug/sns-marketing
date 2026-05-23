<script setup lang="ts">
import { formatPrice } from "#shared/catalog";

definePageMeta({ middleware: ["admin"] });

type Option = {
  id?: string;
  label: string;
  quantity: number;
  price: number;
  sortOrder?: number;
};
type Category = { id: string; slug: string; name: string; platform: "SNS" | "RANK" };
type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  basePrice: number;
  badge: "HOT" | "BEST" | "SALE" | "NEW" | null;
  deliveryInfo: string | null;
  guaranteeInfo: string | null;
  isActive: boolean;
  isFeatured: boolean;
  salesCount: number;
  rating: number;
  options: Option[];
};

const { data: products, refresh } = await useFetch<Product[]>("/api/admin/products");
const { data: categories } = await useFetch<Category[]>("/api/admin/categories");

const q = ref("");
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return products.value ?? [];
  return (products.value ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.slug.toLowerCase().includes(s) ||
      p.category.name.toLowerCase().includes(s),
  );
});

// 편집/생성 모달 상태
type FormState = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  categoryId: string;
  basePrice: number;
  badge: "" | "HOT" | "BEST" | "SALE" | "NEW";
  deliveryInfo: string;
  guaranteeInfo: string;
  isActive: boolean;
  isFeatured: boolean;
  options: Option[];
};

function emptyForm(): FormState {
  return {
    slug: "",
    name: "",
    description: "",
    longDescription: "",
    categoryId: "",
    basePrice: 0,
    badge: "",
    deliveryInfo: "",
    guaranteeInfo: "",
    isActive: true,
    isFeatured: false,
    options: [],
  };
}

const editing = ref<FormState | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);

function startCreate() {
  editing.value = emptyForm();
  formError.value = null;
}
function startEdit(p: Product) {
  editing.value = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    longDescription: p.longDescription ?? "",
    categoryId: p.categoryId,
    basePrice: p.basePrice,
    badge: p.badge ?? "",
    deliveryInfo: p.deliveryInfo ?? "",
    guaranteeInfo: p.guaranteeInfo ?? "",
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    options: p.options.map((o) => ({ ...o })),
  };
  formError.value = null;
}
function cancelEdit() {
  editing.value = null;
}
function addOption() {
  if (!editing.value) return;
  editing.value.options.push({ label: "", quantity: 100, price: 0, sortOrder: editing.value.options.length });
}
function removeOption(i: number) {
  if (!editing.value) return;
  editing.value.options.splice(i, 1);
}

async function saveForm() {
  if (!editing.value) return;
  formError.value = null;
  saving.value = true;
  try {
    const f = editing.value;
    const body = {
      slug: f.slug,
      name: f.name,
      description: f.description || null,
      longDescription: f.longDescription || null,
      categoryId: f.categoryId,
      basePrice: Number(f.basePrice),
      badge: f.badge || null,
      deliveryInfo: f.deliveryInfo || null,
      guaranteeInfo: f.guaranteeInfo || null,
      isActive: f.isActive,
      isFeatured: f.isFeatured,
      options: f.options.map((o, i) => ({
        ...(o.id ? { id: o.id } : {}),
        label: o.label,
        quantity: Number(o.quantity),
        price: Number(o.price),
        sortOrder: i,
      })),
    };
    if (f.id) {
      // 수정: slug 변경 불가 → 빼고
      const { slug: _slug, ...rest } = body;
      await $fetch(`/api/admin/products/${f.id}`, { method: "PATCH", body: rest });
    } else {
      await $fetch("/api/admin/products", { method: "POST", body });
    }
    editing.value = null;
    await refresh();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    formError.value = err.data?.statusMessage ?? err.statusMessage ?? "저장 실패";
  } finally {
    saving.value = false;
  }
}

async function toggleActive(p: Product) {
  await $fetch(`/api/admin/products/${p.id}`, {
    method: "PATCH",
    body: { isActive: !p.isActive },
  });
  await refresh();
}

async function deleteProduct(p: Product) {
  if (!confirm(`"${p.name}" 을(를) 비활성 처리하시겠습니까?\n(주문 이력 보존을 위해 완전 삭제는 안 됩니다)`)) return;
  await $fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
  await refresh();
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-3xl border border-neutral-100 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-5">
        <div>
          <h2 class="font-display text-lg text-neutral-900">상품 관리</h2>
          <p class="mt-1 text-xs text-neutral-500">총 {{ (products ?? []).length }}건 · 활성 {{ (products ?? []).filter(p => p.isActive).length }}건</p>
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model="q"
            type="search"
            placeholder="이름·slug·카테고리"
            class="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="button"
            class="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
            @click="startCreate"
          >+ 상품 추가</button>
        </div>
      </div>

      <ul class="divide-y divide-neutral-100">
        <li v-for="p in filtered" :key="p.id" class="flex items-start gap-4 px-5 py-4">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>{{ p.category.name }}</span>
              <span class="font-mono text-[10px] text-neutral-400">{{ p.slug }}</span>
              <BadgePill v-if="p.badge" :badge="p.badge" />
              <span v-if="!p.isActive" class="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">비활성</span>
              <span v-if="p.isFeatured" class="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">추천</span>
            </div>
            <p class="mt-1 text-sm text-neutral-900">{{ p.name }}</p>
            <p class="mt-0.5 text-xs text-neutral-500">
              옵션 {{ p.options.length }}개 · ★ {{ p.rating.toFixed(1) }} · 판매 {{ p.salesCount.toLocaleString("ko-KR") }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="font-display text-base text-neutral-900">{{ formatPrice(p.basePrice) }}~</span>
            <button
              type="button"
              class="rounded-full border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
              @click="startEdit(p)"
            >수정</button>
            <button
              type="button"
              class="rounded-full border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
              @click="toggleActive(p)"
            >{{ p.isActive ? "비활성" : "활성" }}</button>
            <button
              type="button"
              class="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100"
              @click="deleteProduct(p)"
            >삭제</button>
          </div>
        </li>
        <li v-if="filtered.length === 0" class="px-5 py-12 text-center text-sm text-neutral-500">
          상품이 없습니다.
        </li>
      </ul>
    </div>

    <!-- 편집/생성 모달 -->
    <div
      v-if="editing"
      class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      @click.self="cancelEdit"
    >
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-xl text-neutral-900">
            {{ editing.id ? "상품 수정" : "상품 추가" }}
          </h3>
          <button type="button" class="text-2xl text-neutral-400 hover:text-neutral-700" @click="cancelEdit">×</button>
        </div>

        <p v-if="formError" class="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ formError }}</p>

        <div class="mt-6 grid gap-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs text-neutral-500">상품명 *</span>
              <input v-model="editing.name" required class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
            <label class="block">
              <span class="text-xs text-neutral-500">Slug * (영문/숫자/하이픈)</span>
              <input
                v-model="editing.slug"
                :disabled="!!editing.id"
                required
                placeholder="ig-followers-kr"
                class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
              />
              <span v-if="editing.id" class="mt-1 block text-[10px] text-neutral-400">수정 시 변경 불가</span>
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">카테고리 *</span>
              <select
                v-model="editing.categoryId"
                required
                class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              >
                <option value="">선택…</option>
                <option v-for="c in categories ?? []" :key="c.id" :value="c.id">
                  [{{ c.platform }}] {{ c.name }}
                </option>
              </select>
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">기본가 (원) *</span>
              <input v-model.number="editing.basePrice" type="number" min="0" required class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">뱃지</span>
              <select v-model="editing.badge" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
                <option value="">없음</option>
                <option value="HOT">HOT</option>
                <option value="BEST">BEST</option>
                <option value="SALE">SALE</option>
                <option value="NEW">NEW</option>
              </select>
            </label>

            <div class="flex items-center gap-4 pt-5">
              <label class="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input v-model="editing.isActive" type="checkbox" class="rounded border-neutral-300" />
                활성
              </label>
              <label class="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input v-model="editing.isFeatured" type="checkbox" class="rounded border-neutral-300" />
                추천 (메인 노출)
              </label>
            </div>
          </div>

          <label class="block">
            <span class="text-xs text-neutral-500">짧은 설명</span>
            <input v-model="editing.description" maxlength="500" class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
          </label>

          <label class="block">
            <span class="text-xs text-neutral-500">상세 설명</span>
            <textarea v-model="editing.longDescription" rows="4" maxlength="5000" class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
          </label>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs text-neutral-500">배송 안내 (예: 결제 후 평균 10분 시작)</span>
              <input v-model="editing.deliveryInfo" class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
            <label class="block">
              <span class="text-xs text-neutral-500">보장 안내 (예: 30일 자동 리필)</span>
              <input v-model="editing.guaranteeInfo" class="mt-1 block w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
            </label>
          </div>

          <div class="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm text-neutral-900">옵션 (수량 × 가격)</h4>
              <button type="button" class="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-100" @click="addOption">
                + 옵션 추가
              </button>
            </div>
            <div class="mt-3 space-y-2">
              <div
                v-for="(opt, i) in editing.options"
                :key="i"
                class="grid grid-cols-[1fr_100px_120px_auto] items-center gap-2 rounded-xl bg-white p-2"
              >
                <input v-model="opt.label" placeholder="라벨 (예: 500개)" class="rounded border border-neutral-200 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none" />
                <input v-model.number="opt.quantity" type="number" min="1" placeholder="수량" class="rounded border border-neutral-200 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none" />
                <input v-model.number="opt.price" type="number" min="0" placeholder="가격" class="rounded border border-neutral-200 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none" />
                <button type="button" class="rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs text-rose-700 hover:bg-rose-100" @click="removeOption(i)">제거</button>
              </div>
              <p v-if="editing.options.length === 0" class="text-center text-xs text-neutral-400">
                옵션을 추가하지 않으면 기본가만 사용됩니다.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50" @click="cancelEdit">취소</button>
          <button
            type="button"
            :disabled="saving"
            class="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-60"
            @click="saveForm"
          >{{ saving ? "저장 중…" : "저장" }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
