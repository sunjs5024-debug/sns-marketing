<script setup lang="ts">
useSeoMeta({ title: "회원가입", robots: "noindex, nofollow" });

const route = useRoute();
const { signIn } = useAuth();

const email = ref("");
const name = ref("");
const password = ref("");
const phone = ref("");
const error = ref<string | null>(null);
const pending = ref(false);

const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl;
  return typeof cb === "string" && cb.startsWith("/") ? cb : "/";
});

async function onSubmit() {
  error.value = null;
  pending.value = true;
  try {
    await $fetch("/api/auth/signup", {
      method: "POST",
      body: {
        email: email.value,
        name: name.value,
        password: password.value,
        phone: phone.value || null,
      },
    });
    const result = await signIn("credentials", {
      email: email.value,
      password: password.value,
      redirect: false,
    });
    const err = (result as { error?: string } | undefined)?.error;
    if (err) {
      error.value = "가입은 완료됐지만 자동 로그인에 실패했어요.";
      return;
    }
    await navigateTo(callbackUrl.value);
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    error.value = err.data?.statusMessage ?? err.statusMessage ?? "회원가입 실패";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-16">
    <h1 class="font-display text-3xl text-neutral-900">회원가입</h1>
    <p class="mt-2 text-sm text-neutral-500">첫 충전 시 20% 보너스 적립</p>

    <p v-if="error" class="mt-4 w-full rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

    <form class="mt-8 w-full space-y-3" @submit.prevent="onSubmit">
      <label class="block">
        <span class="text-sm text-neutral-700">이메일</span>
        <input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-sm text-neutral-700">이름 / 닉네임</span>
        <input v-model="name" type="text" required minlength="2" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-sm text-neutral-700">비밀번호</span>
        <input v-model="password" type="password" required minlength="8" autocomplete="new-password" placeholder="8자 이상" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-sm text-neutral-700">연락처 (선택)</span>
        <input v-model="phone" type="tel" autocomplete="tel" placeholder="010-0000-0000" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
      </label>
      <button type="submit" :disabled="pending" class="mt-2 w-full rounded-full bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-700 disabled:opacity-60">
        {{ pending ? "가입 처리 중…" : "가입하고 시작하기" }}
      </button>
    </form>

    <p class="mt-6 text-sm text-neutral-600">
      이미 계정이 있으신가요?
      <NuxtLink :to="`/auth/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`" class="text-indigo-600 hover:underline">로그인</NuxtLink>
    </p>
  </div>
</template>
