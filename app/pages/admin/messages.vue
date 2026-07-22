<script setup lang="ts">
definePageMeta({ middleware: ["admin"] });
useSeoMeta({ title: "쪽지 관리", robots: "noindex, nofollow" });

type Convo = {
  userId: string; name: string; email: string; points: number;
  lastBody: string; lastFromAdmin: boolean; lastAt: string | null; unread: number;
};
type Msg = { id: string; fromAdmin: boolean; body: string; readAt: string | null; createdAt: string };
type Thread = {
  user: { id: string; name: string; email: string; phone: string | null; points: number; createdAt: string };
  messages: Msg[];
};

const route = useRoute();
const { data: convos, refresh: refreshList } = await useFetch<Convo[]>("/api/admin/messages", { default: () => [] });

const selectedId = ref<string | null>((route.query.user as string) ?? null);
const thread = ref<Thread | null>(null);
const loadingThread = ref(false);
const draft = ref("");
const sending = ref(false);

function fmt(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function open(userId: string) {
  selectedId.value = userId;
  loadingThread.value = true;
  try {
    thread.value = await $fetch<Thread>(`/api/admin/messages/${userId}`);
    await refreshList(); // 안읽음 갱신
  } finally {
    loadingThread.value = false;
    await nextTick();
    scrollToBottom();
  }
}

async function send() {
  const body = draft.value.trim();
  if (!body || !selectedId.value || sending.value) return;
  sending.value = true;
  try {
    await $fetch(`/api/admin/messages/${selectedId.value}`, { method: "POST", body: { body } });
    draft.value = "";
    await open(selectedId.value);
  } finally {
    sending.value = false;
  }
}

const boxRef = ref<HTMLElement | null>(null);
function scrollToBottom() { if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight; }

onMounted(() => { if (selectedId.value) open(selectedId.value); });
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[320px_1fr]">
    <!-- 대화 목록 -->
    <div class="rounded-2xl border border-neutral-200 bg-white">
      <div class="border-b border-neutral-100 px-4 py-3 text-sm font-medium text-neutral-900">대화 ({{ (convos ?? []).length }})</div>
      <div class="max-h-[70vh] divide-y divide-neutral-100 overflow-y-auto">
        <p v-if="(convos ?? []).length === 0" class="px-4 py-8 text-center text-sm text-neutral-400">아직 쪽지가 없어요.</p>
        <button
          v-for="c in convos"
          :key="c.userId"
          type="button"
          class="block w-full px-4 py-3 text-left hover:bg-neutral-50"
          :class="selectedId === c.userId ? 'bg-indigo-50' : ''"
          @click="open(c.userId)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-medium text-neutral-900">{{ c.name }}</span>
            <span v-if="c.unread > 0" class="shrink-0 rounded-full bg-rose-500 px-1.5 text-[10px] font-medium text-white">{{ c.unread }}</span>
          </div>
          <p class="mt-0.5 truncate text-xs text-neutral-500">
            <span v-if="c.lastFromAdmin" class="text-neutral-400">나: </span>{{ c.lastBody }}
          </p>
          <p class="mt-0.5 text-[11px] text-neutral-400">{{ fmt(c.lastAt) }}</p>
        </button>
      </div>
    </div>

    <!-- 스레드 -->
    <div class="rounded-2xl border border-neutral-200 bg-white">
      <div v-if="!selectedId" class="grid h-full min-h-[300px] place-items-center text-sm text-neutral-400">
        왼쪽에서 대화를 선택하세요.
      </div>
      <template v-else>
        <div v-if="thread" class="flex items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3">
          <div>
            <p class="text-sm font-medium text-neutral-900">{{ thread.user.name }}</p>
            <p class="text-xs text-neutral-500">{{ thread.user.email }} · 잔액 {{ thread.user.points.toLocaleString("ko-KR") }}원</p>
          </div>
          <NuxtLink :to="`/admin/users`" class="text-xs text-neutral-400 hover:text-neutral-700">회원관리 ›</NuxtLink>
        </div>

        <div ref="boxRef" class="max-h-[52vh] min-h-[240px] space-y-3 overflow-y-auto bg-neutral-50 p-4">
          <p v-if="loadingThread" class="py-8 text-center text-sm text-neutral-400">불러오는 중…</p>
          <div v-for="m in thread?.messages ?? []" :key="m.id" class="flex" :class="m.fromAdmin ? 'justify-end' : 'justify-start'">
            <div class="max-w-[80%]">
              <div
                class="rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words"
                :class="m.fromAdmin ? 'bg-indigo-600 text-white' : 'bg-white border border-neutral-200 text-neutral-800'"
              >{{ m.body }}</div>
              <p class="mt-1 text-[11px] text-neutral-400" :class="m.fromAdmin ? 'text-right' : 'text-left'">
                {{ m.fromAdmin ? '나(운영팀)' : thread?.user.name }} · {{ fmt(m.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-neutral-100 p-3">
          <textarea
            v-model="draft"
            rows="2"
            placeholder="답장을 입력하세요…"
            class="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            @keydown.enter.exact.prevent="send"
          />
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              :disabled="sending || !draft.trim()"
              class="rounded-full bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
              @click="send"
            >{{ sending ? '전송 중…' : '보내기' }}</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
