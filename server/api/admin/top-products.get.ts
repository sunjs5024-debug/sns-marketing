// 어드민 — 상품별 매출/주문 TOP 10
import { requireAdmin } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  // 최근 30일 PAID/PROCESSING/COMPLETED 주문 기준
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 상품별 매출 집계
  const rows = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: {
      order: {
        status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
        paidAt: { gte: since },
      },
    },
    _sum: { totalPrice: true, quantity: true },
    _count: { _all: true },
    orderBy: { _sum: { totalPrice: "desc" } },
    take: 10,
  });

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    orderCount: r._count._all,
    quantitySum: r._sum.quantity ?? 0,
    revenue: r._sum.totalPrice ?? 0,
  }));
});
