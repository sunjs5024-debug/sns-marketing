import type { H3Event } from "h3";
import { getToken } from "next-auth/jwt";

export async function readToken(event: H3Event) {
  return getToken({
    req: event.node.req,
    secret: useRuntimeConfig().authSecret,
  });
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
