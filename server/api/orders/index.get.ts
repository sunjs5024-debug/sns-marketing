import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";
import { syncOrderStatusIfStale } from "../../utils/smm-dispatch";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  // 진행중(PAID) 주문이 있으면 조회 시점에 외부 패널 상태를 먼저 반영 (cron 지연 보완).
  // 최근 5건까지만 — 목록 로딩이 느려지지 않게 제한.
  const active = await prisma.order.findMany({
    where: { userId, status: "PAID" },
    select: { id: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  for (const o of active) {
    await syncOrderStatusIfStale(o.id);
  }

  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
});
