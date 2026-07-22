import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

// 관리자 — 특정 고객과의 쪽지 스레드 (조회 시 고객→관리자 안읽음 읽음처리)
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const userId = getRouterParam(event, "userId");
  if (!userId) throw createError({ statusCode: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, points: true, createdAt: true },
  });
  if (!user) throw createError({ statusCode: 404, statusMessage: "회원을 찾을 수 없습니다." });

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, fromAdmin: true, body: true, readAt: true, createdAt: true },
  });

  // 고객→관리자 안읽음 → 읽음
  await prisma.message.updateMany({
    where: { userId, fromAdmin: false, readAt: null },
    data: { readAt: new Date() },
  });

  return { user, messages };
});
