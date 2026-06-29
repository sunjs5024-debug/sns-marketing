// 엣지(Cloudflare Workers)용 수동 OAuth 구현.
// next-auth v4 의 OAuth 콜백은 openid-client(Node 전용)에 의존해 엣지에서 동작하지 않으므로
// 카카오·네이버·구글 OAuth 를 fetch 기반으로 직접 처리하고, 세션은 next-auth 와 호환되는
// JWT(__Secure-next-auth.session-token)로 발급해 기존 세션 로직(server/utils/session.ts,
// next-auth /api/auth/session)이 그대로 읽도록 한다.

import { encode } from "next-auth/jwt";

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

// 세션 쿠키 이름 — 운영(HTTPS)은 __Secure- 접두사 (next-auth 기본과 동일)
export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
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
