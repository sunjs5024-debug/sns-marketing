// 소셜 로그인 시작 — provider authorize 페이지로 리다이렉트.
// state 는 HMAC 서명된 무상태 토큰(쿠키 불필요). 콜백은 /api/auth/callback/[provider] 에서 처리.
import { PROVIDERS, redirectUri, signState, type ProviderId } from "../../utils/oauth";

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, "provider") as ProviderId;
  const p = PROVIDERS[provider];
  if (!p) throw createError({ statusCode: 404, statusMessage: "알 수 없는 provider" });
  if (!p.clientId() || !p.clientSecret()) {
    throw createError({ statusCode: 500, statusMessage: `${provider} OAuth 키 미설정` });
  }

  const cbRaw = getQuery(event).callbackUrl;
  const callbackUrl = typeof cbRaw === "string" && cbRaw.startsWith("/") ? cbRaw : "/";
  const state = await signState(callbackUrl);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: p.clientId()!,
    redirect_uri: redirectUri(provider),
    state,
  });
  if (p.scope) params.set("scope", p.scope);

  return sendRedirect(event, `${p.authorizeUrl}?${params.toString()}`, 302);
});
