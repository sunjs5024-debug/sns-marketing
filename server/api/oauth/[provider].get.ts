// 소셜 로그인 시작 — provider authorize 페이지로 리다이렉트.
// (next-auth 의 signin 대신 사용. 콜백은 /api/auth/callback/[provider] 에서 직접 처리)
import { PROVIDERS, redirectUri, type ProviderId } from "../../utils/oauth";

export default defineEventHandler((event) => {
  const provider = getRouterParam(event, "provider") as ProviderId;
  const p = PROVIDERS[provider];
  if (!p) throw createError({ statusCode: 404, statusMessage: "알 수 없는 provider" });
  if (!p.clientId() || !p.clientSecret()) {
    throw createError({ statusCode: 500, statusMessage: `${provider} OAuth 키 미설정` });
  }

  // CSRF 방지용 state + 로그인 후 돌아갈 경로 보관
  const cbRaw = getQuery(event).callbackUrl;
  const callbackUrl = typeof cbRaw === "string" && cbRaw.startsWith("/") ? cbRaw : "/";
  const state = crypto.randomUUID();

  setCookie(event, "sf_oauth", `${state}|${callbackUrl}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10분
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: p.clientId()!,
    redirect_uri: redirectUri(provider),
    state,
  });
  if (p.scope) params.set("scope", p.scope);

  return sendRedirect(event, `${p.authorizeUrl}?${params.toString()}`, 302);
});
