<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });

type User = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  points: number;
  createdAt: string;
  _count: { orders: number };
};

const { data: users, refresh } = await useFetch<User[]>("/api/admin/users");

const q = ref("");
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return users.value ?? [];
  return (users.value ?? []).filter(
    (u) =>
      u.email.toLowerCase().includes(s) ||
      u.name.toLowerCase().includes(s) ||
      (u.phone ?? "").toLowerCase().includes(s),
  );
});

// 인라인 편집 상태
const editingId = ref<string | null>(null);
const editPoints = ref<number>(0);
const saving = ref(false);

function startEdit(u: User) {
  editingId.value = u.id;
  editPoints.value = u.points;
}
function cancelEdit() {
  editingId.value = null;
}
async function saveEdit(u: User) {
  if (editingId.value !== u.id) return;
  saving.value = true;
  try {
    await $fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      body: { points: editPoints.value },
    });
    editingId.value = null;
    await refresh();
  } finally {
    saving.value = false;
  }
}

async function toggleRole(u: User) {
  const nextRole = u.role === "ADMIN" ? "USER" : "ADMIN";
  if (!confirm(`${u.email} 의 역할을 ${nextRole} 로 변경하시겠습니까?`)) return;
  await $fetch(`/api/admin/users/${u.id}`, {
    method: "PATCH",
    body: { role: nextRole },
  });
  await refresh();
}
</script>

<template>
  <div class="rounded-3xl border border-neutral-100 bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-5">
      <div>
        <h2 class="font-display text-lg text-neutral-900">회원 관리</h2>
        <p class="mt-1 text-xs text-neutral-500">총 {{ (users ?? []).length }}명</p>
      </div>
      <input
        v-model="q"
        type="search"
        placeholder="이름·이메일·전화 검색"
        class="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-neutral-900 focus:outline-none"
      />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-sm">
        <thead class="bg-neutral-50 text-xs text-neutral-500">
          <tr>
            <th class="px-4 py-3 text-left">가입일</th>
            <th class="px-4 py-3 text-left">이름</th>
            <th class="px-4 py-3 text-left">이메일</th>
            <th class="px-4 py-3 text-left">전화</th>
            <th class="px-4 py-3 text-left">주문</th>
            <th class="px-4 py-3 text-left">포인트</th>
            <th class="px-4 py-3 text-left">역할</th>
            <th class="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="u in filtered" :key="u.id" class="hover:bg-neutral-50">
            <td class="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
              {{ new Date(u.createdAt).toLocaleDateString("ko-KR") }}
            </td>
            <td class="px-4 py-3 text-neutral-900">{{ u.name }}</td>
            <td class="px-4 py-3 text-neutral-700">{{ u.email }}</td>
            <td class="px-4 py-3 text-neutral-500">{{ u.phone ?? "—" }}</td>
            <td class="px-4 py-3 text-neutral-700">{{ u._count.orders }}건</td>
            <td class="px-4 py-3">
              <template v-if="editingId === u.id">
                <input
                  v-model.number="editPoints"
                  type="number"
                  min="0"
                  class="w-24 rounded border border-neutral-300 px-2 py-1 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </template>
              <template v-else>
                <span class="text-indigo-600">{{ u.points.toLocaleString("ko-KR") }}P</span>
              </template>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'rounded-full px-2.5 py-1 text-[11px]',
                  u.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-neutral-100 text-neutral-700',
                ]"
              >{{ u.role }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-1">
                <template v-if="editingId === u.id">
                  <button
                    type="button"
                    :disabled="saving"
                    class="rounded-full bg-neutral-900 px-3 py-1 text-xs text-white hover:bg-neutral-700 disabled:opacity-60"
                    @click="saveEdit(u)"
                  >저장</button>
                  <button
                    type="button"
                    class="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50"
                    @click="cancelEdit"
                  >취소</button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50"
                    @click="startEdit(u)"
                  >포인트</button>
                  <button
                    type="button"
                    class="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50"
                    @click="toggleRole(u)"
                  >{{ u.role === "ADMIN" ? "→ USER" : "→ ADMIN" }}</button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="8" class="px-4 py-12 text-center text-sm text-neutral-500">
              결과가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
