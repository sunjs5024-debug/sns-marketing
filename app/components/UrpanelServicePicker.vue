<script setup lang="ts">
// urpanel 서비스 검색/선택 모달
//   - 모달 열림 시 첫 검색 자동
//   - 카테고리 필터 + 키워드 검색
//   - 선택 시 emit('select', { id, name, rate, category })
type Service = {
  service: number | string;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
};

const props = defineProps<{
  modelValue: boolean;
  // 검색 기본 키워드 (옵션) — 모달 열릴 때 자동 적용
  initialQuery?: string;
  // 수량 기반 추천 필터 (옵션) — min/max 범위 안에 들어가는 서비스만
  filterByQuantity?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [v: boolean];
  select: [svc: { id: number | string; name: string; rate: string; category: string }];
}>();

const USD_TO_KRW = 1400;

const search = ref("");
const platform = ref("");

const PLATFORMS = [
  { v: "", label: "전체" },
  { v: "instagram", label: "Instagram" },
  { v: "youtube", label: "YouTube" },
  { v: "tiktok", label: "TikTok" },
  { v: "facebook", label: "Facebook" },
  { v: "twitter", label: "X" },
  { v: "telegram", label: "Telegram" },
  { v: "threads", label: "Threads" },
  { v: "spotify", label: "Spotify" },
];

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      // 모달 열림 — 초기 검색어 적용
      search.value = props.initialQuery ?? "";
      platform.value = "";
      fetch();
    }
  },
);

const services = ref<Service[]>([]);
const loading = ref(false);
const total = ref(0);

async function fetch() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set("q", search.value.trim());
    if (platform.value) params.set("platform", platform.value);
    const res = await $fetch<{ ok: boolean; total: number; services: Service[] }>(
      `/api/admin/urpanel/services?${params.toString()}`,
    );
    services.value = res.services ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

// 수량 범위 필터링 (옵션이 있다면)
const filtered = computed(() => {
  if (!props.filterByQuantity) return services.value;
  const q = props.filterByQuantity;
  return services.value.filter((s) => {
    const min = Number(s.min);
    const max = Number(s.max);
    return q >= min && q <= max;
  });
});

function pick(s: Service) {
  emit("select", {
    id: s.service,
    name: s.name,
    rate: s.rate,
    category: s.category,
  });
  emit("update:modelValue", false);
}

function close() {
  emit("update:modelValue", false);
}

function usdToKrw(usd: string): number {
  return Math.round(parseFloat(usd) * USD_TO_KRW);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 grid place-items-center bg-neutral-900/60 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <!-- 헤더 -->
          <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
            <div>
              <h3 class="font-display text-lg text-neutral-900">urpanel 서비스 선택</h3>
              <p class="text-[11px] text-neutral-500">
                {{ loading ? "검색 중…" : `${filtered.length}건${total ? ` (전체 ${total.toLocaleString('ko-KR')}건)` : ''}` }}
                <span v-if="filterByQuantity">· 수량 {{ filterByQuantity.toLocaleString('ko-KR') }}개 가능 서비스만</span>
              </p>
            </div>
            <button type="button" class="text-2xl text-neutral-400 hover:text-neutral-900" @click="close">×</button>
          </div>

          <!-- 검색 -->
          <div class="border-b border-neutral-100 px-5 py-3">
            <div class="flex flex-wrap gap-2">
              <input
                v-model="search"
                type="text"
                placeholder="서비스명 / 카테고리 검색 (예: Korean, Followers, Real)"
                class="flex-1 min-w-[200px] rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                @keydown.enter="fetch()"
              />
              <select
                v-model="platform"
                class="rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                @change="fetch()"
              >
                <option v-for="p in PLATFORMS" :key="p.v" :value="p.v">{{ p.label }}</option>
              </select>
              <button
                type="button"
                class="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700"
                @click="fetch()"
              >검색</button>
            </div>
          </div>

          <!-- 결과 -->
          <div class="flex-1 overflow-y-auto px-2 py-2">
            <div v-if="loading" class="p-12 text-center text-sm text-neutral-500">불러오는 중…</div>
            <div v-else-if="filtered.length === 0" class="p-12 text-center text-sm text-neutral-500">
              결과 없음 — 검색어/필터 바꿔보세요
            </div>
            <ul v-else class="space-y-1">
              <li
                v-for="s in filtered.slice(0, 100)"
                :key="s.service"
                class="group cursor-pointer rounded-lg border border-transparent p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                @click="pick(s)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 text-[10px]">
                      <span class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-600">#{{ s.service }}</span>
                      <span class="text-neutral-500">{{ s.category }}</span>
                    </div>
                    <p class="mt-1 text-sm text-neutral-900">{{ s.name }}</p>
                    <p class="mt-0.5 text-[11px] text-neutral-400">
                      범위 {{ Number(s.min).toLocaleString('ko-KR') }} ~ {{ Number(s.max).toLocaleString('ko-KR') }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-mono text-sm text-neutral-900">${{ s.rate }}</p>
                    <p class="text-[11px] text-neutral-500">≈ {{ usdToKrw(s.rate).toLocaleString('ko-KR') }}원/1k</p>
                  </div>
                </div>
              </li>
              <li v-if="filtered.length > 100" class="px-3 py-2 text-center text-[11px] text-neutral-400">
                상위 100건만 표시. 검색어로 좁혀주세요.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
