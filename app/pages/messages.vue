<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "쪽지함", robots: "noindex, nofollow" });

type Msg = { id: string; fromAdmin: boolean; body: string; readAt: string | null; createdAt: string };

const { data: messages, refresh } = await useFetch<Msg[]>("/api/messages", { default: () => [] });

const draft = ref("");
const sending = ref(false);
const error = ref<string | null>(null);

function fmt(d: string) {
  return new Date(d).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function send() {
  const body = draft.value.trim();
  if (!body || sending.value) return;
  sending.value = true;
  error.value = null;
  try {
    await $fetch("/api/messages", { method: "POST", body: { body } });
    draft.value = "";
    await refresh();
    await nextTick();
    scrollToBottom();
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? "전송에 실패했어요.";
  } finally {
    sending.value = false;
  }
}

const boxRef = ref<HTMLElement | null>(null);
function scrollToBottom() {
  if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight;
}
onMounted(() => {
  scrollToBottom();
  // 헤더 배지 갱신
  refreshNuxtData("header");
});
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="font-display text-xl text-neutral-900 sm:text-2xl">쪽지함</h1>
      <NuxtLink to="/mypage" class="text-xs text-neutral-500 hover:text-neutral-900">마이페이지 ›</NuxtLink>
    </div>
    <p class="mb-4 text-sm text-neutral-500">운영팀과 1:1로 대화할 수 있어요. 주문·환불 관련 문의를 남겨주세요.</p>

    <div ref="boxRef" class="max-h-[60vh] space-y-3 overflow-y-auto rounded-3xl border border-neutral-100 bg-neutral-50 p-4">
      <p v-if="(messages ?? []).length === 0" class="py-10 text-center text-sm text-neutral-400">
        아직 주고받은 쪽지가 없어요. 아래에 문의를 남겨보세요.
      </p>
      <div
        v-for="m in messages"
        :key="m.id"
        class="flex"
        :class="m.fromAdmin ? 'justify-start' : 'justify-end'"
      >
        <div class="max-w-[80%]">
          <div
            class="rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words"
            :class="m.fromAdmin ? 'bg-white border border-neutral-200 text-neutral-800' : 'bg-indigo-600 text-white'"
          >{{ m.body }}</div>
          <p class="mt-1 text-[11px] text-neutral-400" :class="m.fromAdmin ? 'text-left' : 'text-right'">
            {{ m.fromAdmin ? '운영팀' : '나' }} · {{ fmt(m.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <textarea
        v-model="draft"
        rows="3"
        placeholder="메시지를 입력하세요…"
        class="block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
        @keydown.enter.exact.prevent="send"
      />
      <p v-if="error" class="mt-1 text-xs text-rose-600">{{ error }}</p>
      <div class="mt-2 flex justify-end">
        <button
          type="button"
          :disabled="sending || !draft.trim()"
          class="rounded-full bg-neutral-900 px-6 py-2.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="send"
        >{{ sending ? '전송 중…' : '보내기' }}</button>
      </div>
    </div>
  </div>
</template>
