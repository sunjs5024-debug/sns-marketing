// 어드민 발주현황 — 최근 발주된 OrderItem 목록 + 실패 큐
import { requireAdmin } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const filter = (getQuery(event).filter as string | undefined) ?? "all";

  // 발주 시도된 모든 항목 (성공/실패 모두)
  let where: Record<string, unknown> = {
    OR: [
      { externalOrderId: { not: null } },
      { dispatchedAttempts: { gt: 0 } },
    ],
  };
  if (filter === "failed") {
    where = { externalOrderId: null, dispatchedAttempts: { gt: 0 } };
  } else if (filter === "pending") {
    where = {
      externalOrderId: { not: null },
      externalStatus: { notIn: ["Completed", "Cancelled"] },
    };
  } else if (filter === "completed") {
    where = { externalStatus: "Completed" };
  }

  const items = await prisma.orderItem.findMany({
    where,
    take: 200,
    orderBy: { dispatchedAt: "desc" },
    include: {
      order: { select: { orderNumber: true, status: true, depositorName: true, createdAt: true } },
    },
  });

  // 카운트 요약
  const [pendingCount, failedCount, completedCount] = await Promise.all([
    prisma.orderItem.count({
      where: { externalOrderId: { not: null }, externalStatus: { notIn: ["Completed", "Cancelled"] } },
    }),
    prisma.orderItem.count({
      where: { externalOrderId: null, dispatchedAttempts: { gt: 0 } },
    }),
    prisma.orderItem.count({ where: { externalStatus: "Completed" } }),
  ]);

  return { items, counts: { pending: pendingCount, failed: failedCount, completed: completedCount } };
});
