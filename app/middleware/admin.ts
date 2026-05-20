export default defineNuxtRouteMiddleware(async (to) => {
  const data = await $fetch<{ isAuthed: boolean; role: string | null }>("/api/header").catch(() => ({ isAuthed: false, role: null }));
  if (!data.isAuthed) {
    return navigateTo(`/auth/signin?callbackUrl=${encodeURIComponent(to.fullPath)}`);
  }
  if (data.role !== "ADMIN") {
    return navigateTo("/");
  }
});
