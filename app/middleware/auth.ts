export default defineNuxtRouteMiddleware(async (to) => {
  // useAuth() 의 재귀 이슈 회피 — 직접 /api/header 로 인증 상태 확인
  // SSR 시에는 브라우저 쿠키를 명시 전달해야 세션 인식됨 ($fetch 가 자동으로 안 가져감)
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
  const data = await $fetch<{ isAuthed: boolean }>("/api/header", { headers }).catch(() => ({ isAuthed: false }));
  if (!data.isAuthed) {
    return navigateTo(`/auth/signin?callbackUrl=${encodeURIComponent(to.fullPath)}`);
  }
});
