<script setup lang="ts">
useSeoMeta({ title: "로그인", robots: "noindex, nofollow" });

// ⚠️ useAuth().signIn() 은 sidebase 의 AUTH_NO_ORIGIN 이슈로 클라이언트에서 fetch 가
//    트리거 안 되는 경우가 있어 직접 next-auth credentials 콜백을 호출함
const route = useRoute();

const email = ref("");
const password = ref("");
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
    // 1) CSRF 토큰 — credentials: include 로 쿠키 받기
    const csrf = await $fetch<{ csrfToken: string }>("/api/auth/csrf", {
      credentials: "include",
    });
    // 2) Credentials 콜백 (json=true 로 redirect 대신 JSON 응답 받음)
    //    credentials: include 로 set-cookie (세션 토큰) 가 브라우저 쿠키 jar 에 저장
    const result = await $fetch<{ url: string }>(
      "/api/auth/callback/credentials?json=true",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          csrfToken: csrf.csrfToken,
          email: email.value,
          password: password.value,
          callbackUrl: callbackUrl.value,
          json: "true",
        }).toString(),
      },
    );
    // 실패 시 next-auth 가 ?csrf=true 또는 /signin?error= 로 응답 url 만들어줌
    const url = result?.url ?? "";
    if (
      url.includes("csrf=true") ||
      url.includes("error=") ||
      url.includes("/api/auth/signin")
    ) {
      error.value = "이메일 또는 비밀번호가 올바르지 않습니다.";
      return;
    }
    // 성공 — 세션 쿠키 반영 위해 페이지 자체 이동
    window.location.href = callbackUrl.value;
  } catch (e: unknown) {
    console.error("[signin]", e);
    error.value = "로그인 중 오류가 발생했습니다.";
  } finally {
    pending.value = false;
  }
}

function social(provider: "kakao" | "naver" | "google") {
  // 엣지용 수동 OAuth 시작 라우트로 이동 (server/api/oauth/[provider].get.ts).
  // next-auth 의 OAuth(openid-client)는 Cloudflare 엣지에서 동작하지 않아 직접 처리.
  pending.value = true;
  const cb = encodeURIComponent(callbackUrl.value);
  window.location.href = `/api/oauth/${provider}?callbackUrl=${cb}`;
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-16">
    <h1 class="font-display text-3xl text-neutral-900">로그인</h1>
    <p class="mt-2 text-sm text-neutral-500">SNS소셜팩토리에 오신 걸 환영해요</p>

    <p v-if="error" class="mt-4 w-full rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

    <div class="mt-8 w-full space-y-2">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FAE100] py-3 text-sm text-[#3C1E1E] transition hover:brightness-95"
        @click="social('kakao')"
      >
        <KakaoIcon :size="18" />
        카카오로 시작하기
      </button>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#03C75A] py-3 text-sm text-white transition hover:brightness-95"
        @click="social('naver')"
      >
        <NaverIcon :size="16" />
        네이버로 시작하기
      </button>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
        @click="social('google')"
      >
        <GoogleIcon :size="18" />
        Google로 시작하기
      </button>
    </div>

    <div class="my-6 flex w-full items-center gap-3 text-xs text-neutral-400">
      <hr class="flex-1 border-neutral-200" />
      <span>또는 이메일로</span>
      <hr class="flex-1 border-neutral-200" />
    </div>

    <!-- form 태그 제거 — hydrate 안 됐을 때 브라우저 기본 submit 으로 페이지 reload 되는 걸 차단.
         button 은 type="button" 으로 명시, Enter 키도 별도 keydown 으로 처리 -->
    <div class="w-full space-y-3">
      <label class="block">
        <span class="text-sm text-neutral-700">이메일</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          placeholder="you@example.com"
          @keydown.enter="onSubmit"
        />
      </label>
      <label class="block">
        <span class="text-sm text-neutral-700">비밀번호</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          placeholder="8자 이상"
          @keydown.enter="onSubmit"
        />
      </label>
      <button
        type="button"
        :disabled="pending"
        class="mt-2 w-full rounded-full bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-700 disabled:opacity-60"
        @click="onSubmit"
      >
        {{ pending ? "로그인 중…" : "로그인" }}
      </button>
    </div>

    <p class="mt-6 text-sm text-neutral-600">
      아직 계정이 없으신가요?
      <NuxtLink :to="`/auth/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`" class="text-indigo-600 hover:underline">
        회원가입
      </NuxtLink>
    </p>
  </div>
</template>
