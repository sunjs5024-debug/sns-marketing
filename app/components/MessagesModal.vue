<script setup lang="ts">
// 고객 쪽지함 모달 — 전역 상태(messagesModalOpen)로 열림. 페이지 이동 없이 대화.
type Msg = { id: string; fromAdmin: boolean; body: string; readAt: string | null; createdAt: string };

const open = useState<boolean>("messagesModalOpen", () => false);
const messages = ref<Msg[]>([]);
const loading = ref(false);
const draft = ref("");
const sending = ref(false);
const error = ref<string | null>(null);
const boxRef = ref<HTMLElement | null>(null);

function fmt(d: string) {
  return new Date(d).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function scrollToBottom() {
  nextTick(() => { if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight; });
}

async function load() {
  loading.value = true;
  try {
    messages.value = await $fetch<Msg[]>("/api/messages");
    scrollToBottom();
    refreshNuxtData("header"); // 안읽음 배지 갱신
  } catch {
    // 미로그인 등 — 조용히 닫기
    open.value = false;
  } finally {
    loading.value = false;
  }
}

async function send() {
  const body = draft.value.trim();
  if (!body || sending.value) return;
  sending.value = true;
  error.value = null;
  try {
    const msg = await $fetch<Msg>("/api/messages", { method: "POST", body: { body } });
    messages.value.push(msg);
    draft.value = "";
    scrollToBottom();
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? "전송에 실패했어요.";
  } finally {
    sending.value = false;
  }
}

function close() { open.value = false; }

// 열릴 때 로드 + 배경 스크롤 잠금
watch(open, (v) => {
  if (v) load();
  if (import.meta.client) document.body.style.overflow = v ? "hidden" : "";
});
function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(); }
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => { window.removeEventListener("keydown", onKey); if (import.meta.client) document.body.style.overflow = ""; });
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" @click.self="close">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
          <!-- 헤더 -->
          <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <div>
              <p class="font-display text-base text-neutral-900">쪽지함</p>
              <p class="text-[11px] text-neutral-500">운영팀과 1:1 문의</p>
            </div>
            <button type="button" class="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700" @click="close" aria-label="닫기">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <!-- 대화 -->
          <div ref="boxRef" class="min-h-[240px] flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
            <p v-if="loading" class="py-10 text-center text-sm text-neutral-400">불러오는 중…</p>
            <p v-else-if="messages.length === 0" class="py-10 text-center text-sm text-neutral-400">
              아직 주고받은 쪽지가 없어요.<br />아래에 문의를 남겨보세요.
            </p>
            <div v-for="m in messages" :key="m.id" class="flex" :class="m.fromAdmin ? 'justify-start' : 'justify-end'">
              <div class="max-w-[80%]">
                <div
                  class="rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words"
                  :class="m.fromAdmin ? 'border border-neutral-200 bg-white text-neutral-800' : 'bg-indigo-600 text-white'"
                >{{ m.body }}</div>
                <p class="mt-1 text-[11px] text-neutral-400" :class="m.fromAdmin ? 'text-left' : 'text-right'">
                  {{ m.fromAdmin ? '운영팀' : '나' }} · {{ fmt(m.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- 입력 -->
          <div class="border-t border-neutral-100 p-3">
            <textarea
              v-model="draft"
              rows="2"
              placeholder="메시지를 입력하세요…"
              class="block w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              @keydown.enter.exact.prevent="send"
            />
            <p v-if="error" class="mt-1 text-xs text-rose-600">{{ error }}</p>
            <div class="mt-2 flex justify-end">
              <button
                type="button"
                :disabled="sending || !draft.trim()"
                class="rounded-full bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="send"
              >{{ sending ? '전송 중…' : '보내기' }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
