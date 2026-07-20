import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";
import { syncOrderStatusIfStale } from "../../utils/smm-dispatch";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const orderNumber = getRouterParam(event, "orderNumber");
  if (!orderNumber) throw createError({ statusCode: 400 });

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  if (!order || order.userId !== userId) throw createError({ statusCode: 404 });

  // 진행중 주문은 조회 시점에 외부 패널 상태를 즉시 반영 (cron 지연 보완)
  if (order.status === "PAID") {
    const changed = await syncOrderStatusIfStale(order.id);
    if (changed) {
      const fresh = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: { include: { category: true } } } } },
      });
      if (fresh) return fresh;
    }
  }

  return order;
});
