<script setup lang="ts">
useSeoMeta({ title: "회원가입", robots: "noindex, nofollow" });

const route = useRoute();

const email = ref("");
const name = ref("");
const password = ref("");
const phone = ref("");
const agreeTerms = ref(false);
const agreePrivacy = ref(false);
const agreeMarketing = ref(false);
const error = ref<string | null>(null);
const pending = ref(false);

const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl;
  return typeof cb === "string" && cb.startsWith("/") ? cb : "/?welcome=1";
});

// 비밀번호 강도 (간단)
const pwStrength = computed(() => {
  const v = password.value;
  if (v.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) score++;
  if (score <= 1) return { level: 1, label: "약함", color: "bg-rose-500 text-rose-700" };
  if (score === 2) return { level: 2, label: "보통", color: "bg-amber-500 text-amber-700" };
  if (score === 3) return { level: 3, label: "강함", color: "bg-emerald-500 text-emerald-700" };
  return { level: 4, label: "매우 강함", color: "bg-indigo-500 text-indigo-700" };
});

const allAgreeRequired = computed(() => agreeTerms.value && agreePrivacy.value);
const canSubmit = computed(() => allAgreeRequired.value && password.value.length >= 8 && !pending.value);

// 전체 동의 토글
const allAgreed = computed({
  get: () => agreeTerms.value && agreePrivacy.value && agreeMarketing.value,
  set: (v) => {
    agreeTerms.value = v;
    agreePrivacy.value = v;
    agreeMarketing.value = v;
  },
});

async function onSubmit() {
  error.value = null;
  if (!allAgreeRequired.value) {
    error.value = "필수 약관에 동의해주세요.";
    return;
  }
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
    // 자동 로그인 — sidebase useAuth().signIn 은 엣지에서 provider 경로(/providers)를
    // 잘못 찾아 404 가 나므로 next-auth credentials 콜백을 직접 호출 (signin.vue 와 동일).
    const csrf = await $fetch<{ csrfToken: string }>("/api/auth/csrf", { credentials: "include" });
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
    const url = result?.url ?? "";
    if (url.includes("error=") || url.includes("csrf=true") || url.includes("/api/auth/signin")) {
      error.value = "가입은 완료됐지만 자동 로그인에 실패했어요.";
      return;
    }
    window.location.href = callbackUrl.value;
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    error.value = err.data?.statusMessage ?? err.statusMessage ?? "회원가입 실패";
  } finally {
    pending.value = false;
  }
}

function onOAuthSignIn(provider: "kakao" | "naver" | "google") {
  // 엣지용 수동 OAuth 시작 라우트로 이동 (signin.vue 와 동일)
  pending.value = true;
  window.location.href = `/api/oauth/${provider}?callbackUrl=${encodeURIComponent(callbackUrl.value)}`;
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-10 sm:py-16">
    <h1 class="font-display text-2xl text-neutral-900 sm:text-3xl">회원가입</h1>
    <p class="mt-2 text-sm text-neutral-500">1분 가입 · 무료 · 환영 혜택 즉시 적용</p>

    <!-- 가입 혜택 카드 -->
    <div class="mt-6 w-full rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <p class="text-xs uppercase tracking-widest text-indigo-700">SIGNUP BONUS</p>
      <ul class="mt-2 space-y-1 text-xs text-neutral-700">
        <li class="flex items-center gap-1.5"><span class="text-emerald-600">✓</span> SNS 비밀번호 요구 없이 안전하게 진행</li>
        <li class="flex items-center gap-1.5"><span class="text-emerald-600">✓</span> 가입 즉시 전 상품 주문 가능 (오픈 기념가)</li>
        <li class="flex items-center gap-1.5"><span class="text-emerald-600">✓</span> 30일 유지 보장 + 결과보고서 자동 발송</li>
      </ul>
    </div>

    <!-- 소셜 로그인 (signin 페이지와 일관성 유지 — 공식 브랜드 컬러 + 로고) -->
    <div class="mt-6 w-full space-y-2">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FAE100] py-3 text-sm text-[#3C1E1E] transition hover:brightness-95"
        @click="onOAuthSignIn('kakao')"
      >
        <KakaoIcon :size="18" />
        카카오로 시작하기
      </button>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#03C75A] py-3 text-sm text-white transition hover:brightness-95"
        @click="onOAuthSignIn('naver')"
      >
        <NaverIcon :size="16" />
        네이버로 시작하기
      </button>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
        @click="onOAuthSignIn('google')"
      >
        <GoogleIcon :size="18" />
        Google로 시작하기
      </button>
    </div>

    <div class="my-6 flex w-full items-center gap-3 text-xs text-neutral-400">
      <span class="h-px flex-1 bg-neutral-200" />
      또는 이메일로
      <span class="h-px flex-1 bg-neutral-200" />
    </div>

    <p v-if="error" class="mb-3 w-full rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

    <form class="w-full space-y-3" @submit.prevent="onSubmit">
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
        <!-- 비밀번호 강도 표시 -->
        <div v-if="password.length > 0" class="mt-1.5 flex items-center gap-2">
          <div class="flex flex-1 gap-1">
            <div v-for="i in 4" :key="i" :class="['h-1 flex-1 rounded-full transition', i <= pwStrength.level ? pwStrength.color.split(' ')[0] : 'bg-neutral-200']" />
          </div>
          <span :class="['shrink-0 text-[10px]', pwStrength.color.split(' ')[1] || 'text-neutral-400']">{{ pwStrength.label }}</span>
        </div>
      </label>
      <label class="block">
        <span class="text-sm text-neutral-700">연락처 (선택)</span>
        <input v-model="phone" type="tel" autocomplete="tel" placeholder="010-0000-0000" class="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
      </label>

      <!-- 약관 동의 -->
      <div class="mt-4 space-y-2 rounded-xl bg-neutral-50 p-3">
        <label class="flex cursor-pointer items-center gap-2 border-b border-neutral-200 pb-2">
          <input v-model="allAgreed" type="checkbox" class="h-4 w-4 cursor-pointer accent-neutral-900" />
          <span class="text-sm font-medium text-neutral-900">전체 동의</span>
        </label>
        <label class="flex cursor-pointer items-center justify-between text-xs text-neutral-700">
          <span class="flex items-center gap-2">
            <input v-model="agreeTerms" type="checkbox" class="h-4 w-4 cursor-pointer accent-neutral-900" />
            <span><b class="text-rose-500">필수</b> 이용약관 동의</span>
          </span>
          <NuxtLink to="/terms" target="_blank" class="text-[11px] text-indigo-600 hover:underline">보기 →</NuxtLink>
        </label>
        <label class="flex cursor-pointer items-center justify-between text-xs text-neutral-700">
          <span class="flex items-center gap-2">
            <input v-model="agreePrivacy" type="checkbox" class="h-4 w-4 cursor-pointer accent-neutral-900" />
            <span><b class="text-rose-500">필수</b> 개인정보처리방침 동의</span>
          </span>
          <NuxtLink to="/privacy" target="_blank" class="text-[11px] text-indigo-600 hover:underline">보기 →</NuxtLink>
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-xs text-neutral-700">
          <input v-model="agreeMarketing" type="checkbox" class="h-4 w-4 cursor-pointer accent-neutral-900" />
          <span><b class="text-neutral-400">선택</b> 마케팅 정보 수신 (이벤트·할인 알림)</span>
        </label>
      </div>

      <button type="submit" :disabled="!canSubmit" class="mt-3 w-full rounded-xl bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40">
        {{ pending ? "가입 처리 중…" : "가입하고 시작하기" }}
      </button>
    </form>

    <p class="mt-6 text-sm text-neutral-600">
      이미 계정이 있으신가요?
      <NuxtLink :to="`/auth/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`" class="text-indigo-600 hover:underline">로그인</NuxtLink>
    </p>
  </div>
</template>
