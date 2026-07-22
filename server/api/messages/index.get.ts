import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

// 내 쪽지함 — 관리자와의 대화 전체. 조회 시 관리자가 보낸 안읽음은 읽음 처리.
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, fromAdmin: true, body: true, readAt: true, createdAt: true },
  });

  // 관리자→나 메시지 중 안읽음 → 읽음 처리
  await prisma.message.updateMany({
    where: { userId, fromAdmin: true, readAt: null },
    data: { readAt: new Date() },
  });

  return messages;
});
