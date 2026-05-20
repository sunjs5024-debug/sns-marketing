export default defineNuxtRouteMiddleware(async (to) => {
  // useAuth() 의 재귀 이슈 회피 — 직접 /api/header 로 인증 상태 확인
  const data = await $fetch<{ isAuthed: boolean }>("/api/header").catch(() => ({ isAuthed: false }));
  if (!data.isAuthed) {
    return navigateTo(`/auth/signin?callbackUrl=${encodeURIComponent(to.fullPath)}`);
  }
});
