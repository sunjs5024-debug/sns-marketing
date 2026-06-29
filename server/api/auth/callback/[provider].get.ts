// 소셜 로그인 콜백 — provider 가 code 를 들고 리다이렉트해 옴.
// 토큰 교환 → 프로필 조회 → 유저 upsert → next-auth 호환 세션 쿠키 발급.
// ⚠️ 이 라우트는 next-auth catch-all(/api/auth/[...]) 보다 우선해야 한다 (더 구체적인 경로라 Nitro 가 우선 매칭).
import {
  PROVIDERS,
  exchangeCodeForToken,
  fetchProfile,
  encodeSessionToken,
  sessionCookieName,
  type ProviderId,
} from "../../../utils/oauth";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, "provider") as ProviderId;
  const p = PROVIDERS[provider];
  if (!p) throw createError({ statusCode: 404, statusMessage: "알 수 없는 provider" });

  const q = getQuery(event);
  const code = typeof q.code === "string" ? q.code : "";
  const returnedState = typeof q.state === "string" ? q.state : "";

  // state 검증
  const cookie = getCookie(event, "sf_oauth") ?? "";
  const [savedState, savedCb] = cookie.split("|");
  const callbackUrl = savedCb && savedCb.startsWith("/") ? savedCb : "/";
  deleteCookie(event, "sf_oauth", { path: "/" });

  if (!code || !returnedState || returnedState !== savedState) {
    return sendRedirect(event, "/auth/signin?error=OAuthState", 302);
  }

  try {
    const accessToken = await exchangeCodeForToken(p, code, returnedState);
    const profile = await fetchProfile(p, accessToken);

    // 이메일 없으면(예: 카카오 미동의) provider 기반 가짜 이메일로 식별 — 기존 로직과 동일
    const email = profile.email || `${provider}_${profile.providerAccountId}@${provider}.local`;
    const name = profile.name || `${provider}_user`;

    let user = await prisma.user.findUnique({ where: { email } });
    if (user?.isDeleted) {
      return sendRedirect(event, "/auth/signin?error=AccountDeleted", 302);
    }
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, role: "USER" },
      });
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return sendRedirect(event, callbackUrl, 302);
  } catch (e: unknown) {
    console.error(`[oauth callback ${provider}]`, e instanceof Error ? e.message : e);
    return sendRedirect(event, "/auth/signin?error=OAuthCallback", 302);
  }
});
