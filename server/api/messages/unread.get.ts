import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

// 내 안읽음 쪽지 수 (관리자→나 중 안읽음) — 배지용
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const count = await prisma.message.count({
    where: { userId, fromAdmin: true, readAt: null },
  });
  return { count };
});
