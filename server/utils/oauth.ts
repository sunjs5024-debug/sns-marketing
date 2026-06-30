// 엣지(Cloudflare Workers)용 수동 OAuth 구현.
// next-auth v4 의 OAuth 콜백은 openid-client(Node 전용)에 의존해 엣지에서 동작하지 않으므로
// 카카오·네이버·구글 OAuth 를 fetch 기반으로 직접 처리하고, 세션은 next-auth 와 호환되는
// JWT(__Secure-next-auth.session-token)로 발급해 기존 세션 로직(server/utils/session.ts,
// next-auth /api/auth/session)이 그대로 읽도록 한다.

import type { H3Event } from "h3";
import { encode } from "next-auth/jwt";
import { prisma } from "./prisma";

// 운영 도메인 (OAuth redirect_uri 는 각 콘솔에 등록된 값과 정확히 일치해야 함)
export const SITE_ORIGIN = "https://xn--sns-yg9lh0pw9l.kr";

export type ProviderId = "kakao" | "naver" | "google";

type ProviderConfig = {
  id: ProviderId;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope?: string;
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  // userinfo 응답 → { providerAccountId, email, name }
  parseProfile: (json: any) => { providerAccountId: string; email?: string; name?: string };
};

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  kakao: {
    id: "kakao",
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    userInfoUrl: "https://kapi.kakao.com/v2/user/me",
    clientId: () => process.env.KAKAO_CLIENT_ID,
    clientSecret: () => process.env.KAKAO_CLIENT_SECRET,
    parseProfile: (j) => ({
      providerAccountId: String(j.id),
      email: j.kakao_account?.email,
      name: j.kakao_account?.profile?.nickname ?? j.properties?.nickname,
    }),
  },
  naver: {
    id: "naver",
    authorizeUrl: "https://nid.naver.com/oauth2.0/authorize",
    tokenUrl: "https://nid.naver.com/oauth2.0/token",
    userInfoUrl: "https://openapi.naver.com/v1/nid/me",
    clientId: () => process.env.NAVER_CLIENT_ID,
    clientSecret: () => process.env.NAVER_CLIENT_SECRET,
    parseProfile: (j) => ({
      providerAccountId: String(j.response?.id),
      email: j.response?.email,
      name: j.response?.name ?? j.response?.nickname,
    }),
  },
  google: {
    id: "google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    parseProfile: (j) => ({
      providerAccountId: String(j.id ?? j.sub),
      email: j.email,
      name: j.name,
    }),
  },
};

export function redirectUri(provider: ProviderId): string {
  return `${SITE_ORIGIN}/api/auth/callback/${provider}`;
}

// 세션 쿠키 이름 — 운영은 항상 HTTPS 라 next-auth 와 동일하게 __Secure- 접두사 고정.
// (런타임 process.env.NODE_ENV 가 비어있을 수 있어 그에 의존하지 않음)
export function sessionCookieName(): string {
  return "__Secure-next-auth.session-token";
}

// ── 무상태(stateless) OAuth state ──────────────────────────────────────────
// 쿠키가 크로스사이트 리다이렉트에서 유실되는 문제를 피하려고 state 자체를 HMAC 서명한다.
// state = base64url(payload) + "." + base64url(HMAC-SHA256(payload, authSecret))
// payload = `${nonce}|${callbackUrl}|${exp(ms)}`
function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b + "=".repeat((4 - (b.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmacSign(data: string): Promise<string> {
  const secret = useRuntimeConfig().authSecret as string;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

export async function signState(callbackUrl: string): Promise<string> {
  const nonce = crypto.randomUUID();
  const exp = Date.now() + 10 * 60 * 1000; // 10분
  const payload = `${nonce}|${callbackUrl}|${exp}`;
  const sig = await hmacSign(payload);
  return `${b64urlFromBytes(new TextEncoder().encode(payload))}.${sig}`;
}

export async function verifyState(state: string): Promise<{ ok: boolean; callbackUrl: string }> {
  try {
    const [payloadB64, sig] = state.split(".");
    if (!payloadB64 || !sig) return { ok: false, callbackUrl: "/" };
    const payload = new TextDecoder().decode(b64urlToBytes(payloadB64));
    const expected = await hmacSign(payload);
    if (sig !== expected) return { ok: false, callbackUrl: "/" };
    const [, callbackUrl, expStr] = payload.split("|");
    if (Number(expStr) < Date.now()) return { ok: false, callbackUrl: "/" };
    const cb = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
    return { ok: true, callbackUrl: cb };
  } catch {
    return { ok: false, callbackUrl: "/" };
  }
}

// 토큰 교환 (authorization_code → access_token)
export async function exchangeCodeForToken(
  p: ProviderConfig,
  code: string,
  state: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: p.clientId()!,
    client_secret: p.clientSecret()!,
    redirect_uri: redirectUri(p.id),
    code,
  });
  // naver 는 token 요청에 state 도 필요
  if (p.id === "naver") body.set("state", state);

  const res = await fetch(p.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`token exchange failed (${p.id}): ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json.access_token as string;
}

export async function fetchProfile(p: ProviderConfig, accessToken: string) {
  const res = await fetch(p.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`userinfo failed (${p.id}): ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return p.parseProfile(json);
}

// next-auth 호환 세션 JWT 발급
// OAuth 콜백 공용 처리 — provider 별 파일(callback/kakao.get.ts 등)에서 호출.
// ⚠️ next-auth catch-all 의 credentials 콜백과 충돌하지 않도록 [provider] 와일드카드 대신
//    provider 명시 파일에서만 호출한다.
export async function handleOAuthCallback(event: H3Event, provider: ProviderId) {
  const p = PROVIDERS[provider];
  const q = getQuery(event);
  const code = typeof q.code === "string" ? q.code : "";
  const stateParam = typeof q.state === "string" ? q.state : "";

  const { ok, callbackUrl } = await verifyState(stateParam);
  if (!code || !ok) {
    return sendRedirect(event, "/auth/signin?error=OAuthState", 302);
  }

  try {
    const accessToken = await exchangeCodeForToken(p, code, stateParam);
    const profile = await fetchProfile(p, accessToken);

    const email = profile.email || `${provider}_${profile.providerAccountId}@${provider}.local`;
    const name = profile.name || `${provider}_user`;

    let user = await prisma.user.findUnique({ where: { email } });
    if (user?.isDeleted) {
      return sendRedirect(event, "/auth/signin?error=AccountDeleted", 302);
    }
    if (!user) {
      user = await prisma.user.create({ data: { email, name, role: "USER" } });
    }

    const token = await encodeSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      points: user.points,
    });

    setCookie(event, sessionCookieName(), token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return sendRedirect(event, callbackUrl, 302);
  } catch (e: unknown) {
    console.error(`[oauth callback ${provider}]`, e instanceof Error ? e.message : e);
    return sendRedirect(event, "/auth/signin?error=OAuthCallback", 302);
  }
}

export async function encodeSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  role: string;
  points: number;
}): Promise<string> {
  const secret = useRuntimeConfig().authSecret as string;
  const maxAge = 30 * 24 * 60 * 60; // 30일 (next-auth 설정과 동일)
  const name = sessionCookieName();
  return await encode({
    token: {
      sub: payload.id,
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      points: payload.points,
    },
    secret,
    salt: name, // next-auth v4: salt = 쿠키 이름
    maxAge,
  });
}
