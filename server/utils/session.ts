import type { H3Event } from "h3";
import { parseCookies } from "h3";
import { decode } from "next-auth/jwt";

// HTTPS production: __Secure-next-auth.session-token / HTTP dev: next-auth.session-token
const COOKIE_NAMES = ["__Secure-next-auth.session-token", "next-auth.session-token"];

// next-auth/jwt decode 로 직접 토큰 검증 (getToken / getServerSession 둘 다 호환 이슈)
export async function readToken(event: H3Event) {
  const cookies = parseCookies(event);
  let raw: string | undefined;
  let salt = "";
  for (const name of COOKIE_NAMES) {
    if (cookies[name]) {
      raw = cookies[name];
      salt = name; // next-auth v4 의 salt 는 cookieName 과 동일
      break;
    }
  }
  if (!raw) return null;
  try {
    const decoded = await decode({
      token: raw,
      secret: useRuntimeConfig().authSecret,
      salt,
    });
    return decoded;
  } catch {
    return null;
  }
}

export async function requireUserId(event: H3Event): Promise<string> {
  const token = await readToken(event);
  const userId = token?.id as string | undefined;
  if (!userId) throw createError({ statusCode: 401, statusMessage: "로그인이 필요합니다." });
  return userId;
}

export async function requireAdmin(event: H3Event): Promise<string> {
  const token = await readToken(event);
  const userId = token?.id as string | undefined;
  const role = token?.role as string | undefined;
  if (!userId) throw createError({ statusCode: 401, statusMessage: "로그인이 필요합니다." });
  if (role !== "ADMIN") throw createError({ statusCode: 403, statusMessage: "권한이 없습니다." });
  return userId;
}
