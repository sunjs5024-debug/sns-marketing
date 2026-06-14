export default defineNuxtRouteMiddleware(async (to) => {
  // SSR 시에는 브라우저 쿠키를 명시 전달해야 세션 인식됨
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
  const data = await $fetch<{ isAuthed: boolean; role: string | null }>("/api/header", { headers }).catch(() => ({ isAuthed: false, role: null }));
  if (!data.isAuthed) {
    return navigateTo(`/auth/signin?callbackUrl=${encodeURIComponent(to.fullPath)}`);
  }
  if (data.role !== "ADMIN") {
    return navigateTo("/");
  }
});
