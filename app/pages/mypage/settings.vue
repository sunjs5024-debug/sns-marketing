<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "회원 정보 관리", robots: "noindex, nofollow" });

type MyData = {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: "USER" | "ADMIN";
    points: number;
    createdAt: string;
  };
};

const { data, refresh } = await useFetch<MyData>("/api/me");
if (!data.value) throw createError({ statusCode: 401 });

const user = computed(() => data.value!.user);
// 이메일 가입 여부 — @kakao.local 등 OAuth fallback 이메일이면 소셜로 간주
const isSocial = computed(() => /@(kakao|naver|google)\.local$/i.test(user.value.email));

// ── 회원 정보 수정 ──
const profileForm = ref({ name: "", phone: "" });
watch(user, (u) => { profileForm.value = { name: u.name, phone: u.phone ?? "" }; }, { immediate: true });
const profileSaving = ref(false);
const profileMsg = ref<{ type: "ok" | "err"; text: string } | null>(null);

async function saveProfile() {
  profileMsg.value = null;
  if (!profileForm.value.name.trim()) {
    profileMsg.value = { type: "err", text: "이름을 입력해주세요." }; return;
  }
  profileSaving.value = true;
  try {
    await $fetch("/api/me", {
      method: "PATCH",
      body: { name: profileForm.value.name.trim(), phone: profileForm.value.phone.trim() || null },
    });
    profileMsg.value = { type: "ok", text: "✓ 저장되었습니다." };
    await refresh();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    profileMsg.value = { type: "err", text: err.data?.statusMessage ?? err.statusMessage ?? "저장 실패" };
  } finally {
    profileSaving.value = false;
  }
}

// ── 비밀번호 변경 ──
const pwForm = ref({ current: "", next: "", confirm: "" });
const pwSaving = ref(false);
const pwMsg = ref<{ type: "ok" | "err"; text: string } | null>(null);

async function changePassword() {
  pwMsg.value = null;
  if (pwForm.value.next.length < 8) { pwMsg.value = { type: "err", text: "새 비밀번호는 8자 이상이어야 합니다." }; return; }
  if (pwForm.value.next !== pwForm.value.confirm) { pwMsg.value = { type: "err", text: "새 비밀번호와 확인이 다릅니다." }; return; }
  pwSaving.value = true;
  try {
    await $fetch("/api/me/change-password", {
      method: "POST",
      body: { currentPassword: pwForm.value.current, newPassword: pwForm.value.next },
    });
    pwMsg.value = { type: "ok", text: "✓ 비밀번호가 변경되었습니다." };
    pwForm.value = { current: "", next: "", confirm: "" };
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    pwMsg.value = { type: "err", text: err.data?.statusMessage ?? err.statusMessage ?? "변경 실패" };
  } finally {
    pwSaving.value = false;
  }
}

// ── 회원 탈퇴 ──
const withdrawOpen = ref(false);
const withdrawForm = ref({ reason: "", password: "", confirmText: "" });
const withdrawing = ref(false);
const withdrawMsg = ref<string | null>(null);

async function submitWithdraw() {
  withdrawMsg.value = null;
  if (withdrawForm.value.confirmText !== "탈퇴합니다") {
    withdrawMsg.value = "확인 문구가 정확히 일치하지 않습니다."; return;
  }
  withdrawing.value = true;
  try {
    await $fetch("/api/me/withdraw", {
      method: "POST",
      body: {
        reason: withdrawForm.value.reason || null,
        password: isSocial.value ? undefined : withdrawForm.value.password,
      },
    });
    // 탈퇴 후 로그아웃 + 메인으로
    const csrf = await $fetch<{ csrfToken: string }>("/api/auth/csrf");
    await $fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl: "/" }).toString(),
    });
    if (import.meta.client) window.location.href = "/?withdrawn=1";
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    withdrawMsg.value = err.data?.statusMessage ?? err.statusMessage ?? "탈퇴 실패";
  } finally {
    withdrawing.value = false;
  }
}
</script>

<template>
  <div v-if="data" class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
    <!-- 헤더 -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-neutral-900">회원 정보 관리</h1>
        <p class="mt-1 text-sm text-neutral-500">이름·연락처 수정, 비밀번호 변경, 회원 탈퇴</p>
      </div>
      <NuxtLink to="/mypage" class="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">
        ← 마이페이지
      </NuxtLink>
    </header>

    <!-- 회원 정보 수정 -->
    <section class="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">회원 정보</h2>
      <p class="mt-1 text-xs text-neutral-500">
        가입 이메일 <span class="font-mono">{{ user.email }}</span>
        <span v-if="isSocial" class="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">소셜 로그인</span>
      </p>

      <p
        v-if="profileMsg"
        :class="['mt-4 rounded-lg px-3 py-2 text-xs', profileMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700']"
      >{{ profileMsg.text }}</p>

      <div class="mt-4 space-y-3">
        <label class="block">
          <span class="text-xs text-neutral-500">이름</span>
          <input
            v-model="profileForm.name"
            maxlength="30"
            required
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">연락처</span>
          <input
            v-model="profileForm.phone"
            placeholder="010-0000-0000"
            maxlength="20"
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        :disabled="profileSaving"
        class="mt-5 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
        @click="saveProfile"
      >{{ profileSaving ? "저장 중…" : "저장" }}</button>
    </section>

    <!-- 비밀번호 변경 -->
    <section v-if="!isSocial" class="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 class="font-display text-lg text-neutral-900">비밀번호 변경</h2>
      <p class="mt-1 text-xs text-neutral-500">현재 비밀번호 확인 후 새 비밀번호로 변경됩니다.</p>

      <p
        v-if="pwMsg"
        :class="['mt-4 rounded-lg px-3 py-2 text-xs', pwMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700']"
      >{{ pwMsg.text }}</p>

      <div class="mt-4 space-y-3">
        <label class="block">
          <span class="text-xs text-neutral-500">현재 비밀번호</span>
          <input
            v-model="pwForm.current"
            type="password"
            required
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">새 비밀번호 (8자 이상)</span>
          <input
            v-model="pwForm.next"
            type="password"
            minlength="8"
            required
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs text-neutral-500">새 비밀번호 확인</span>
          <input
            v-model="pwForm.confirm"
            type="password"
            required
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        :disabled="pwSaving"
        class="mt-5 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
        @click="changePassword"
      >{{ pwSaving ? "변경 중…" : "비밀번호 변경" }}</button>
    </section>

    <!-- 소셜 로그인 안내 -->
    <section v-else class="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <h2 class="font-display text-lg text-neutral-900">비밀번호 변경</h2>
      <p class="mt-2 text-sm text-neutral-600">
        소셜 로그인(카카오/네이버/구글)으로 가입하신 계정은 해당 소셜 계정에서 비밀번호를 변경하실 수 있습니다.
      </p>
    </section>

    <!-- 회원 탈퇴 -->
    <section class="mt-6 rounded-2xl border border-rose-200 bg-rose-50/40 p-6">
      <h2 class="font-display text-lg text-rose-900">회원 탈퇴</h2>
      <p class="mt-2 text-sm text-rose-800">
        탈퇴 시 개인정보(이름·연락처·이메일)는 즉시 익명화 처리됩니다.
      </p>
      <ul class="mt-3 space-y-1 text-xs text-rose-700">
        <li>• 진행 중 주문/충전 신청이 있으면 탈퇴 불가</li>
        <li>• 거래 기록(주문)은 전자상거래법에 따라 5년간 보관됩니다</li>
        <li>• 보유 포인트는 모두 소멸됩니다 (현재 {{ user.points.toLocaleString('ko-KR') }}P)</li>
        <li>• 동일 이메일로 재가입은 즉시 가능합니다 (신규 계정)</li>
      </ul>

      <button
        v-if="!withdrawOpen"
        type="button"
        class="mt-5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
        @click="withdrawOpen = true"
      >회원 탈퇴 진행</button>

      <div v-else class="mt-5 space-y-3 rounded-xl border border-rose-200 bg-white p-4">
        <p v-if="withdrawMsg" class="rounded-lg bg-rose-100 px-3 py-2 text-xs text-rose-700">{{ withdrawMsg }}</p>

        <label class="block">
          <span class="text-xs text-neutral-500">탈퇴 사유 (선택)</span>
          <textarea
            v-model="withdrawForm.reason"
            rows="2"
            maxlength="500"
            placeholder="서비스 개선에 참고하겠습니다"
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>

        <label v-if="!isSocial" class="block">
          <span class="text-xs text-neutral-500">비밀번호 확인 <span class="text-rose-500">*</span></span>
          <input
            v-model="withdrawForm.password"
            type="password"
            required
            class="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>

        <label class="block">
          <span class="text-xs text-rose-700">확인 문구로 <b>"탈퇴합니다"</b> 정확히 입력 <span>*</span></span>
          <input
            v-model="withdrawForm.confirmText"
            type="text"
            required
            placeholder="탈퇴합니다"
            class="mt-1.5 block w-full rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </label>

        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm hover:bg-neutral-50"
            @click="withdrawOpen = false; withdrawMsg = null"
          >취소</button>
          <button
            type="button"
            :disabled="withdrawing || withdrawForm.confirmText !== '탈퇴합니다' || (!isSocial && !withdrawForm.password)"
            class="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm text-white hover:bg-rose-700 disabled:opacity-40"
            @click="submitWithdraw"
          >{{ withdrawing ? "처리 중…" : "최종 탈퇴" }}</button>
        </div>
      </div>
    </section>
  </div>
</template>
