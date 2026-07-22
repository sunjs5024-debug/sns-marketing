import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

// 관리자 — 전체 안읽음 쪽지 수(고객→관리자) — 네비 배지용
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const count = await prisma.message.count({ where: { fromAdmin: false, readAt: null } });
  return { count };
});
