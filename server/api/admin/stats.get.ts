import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const [totalOrders, pendingOrders, paidOrders, completedOrders, revenueAgg, userCount, productCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } },
    }),
    prisma.user.count(),
    prisma.product.count(),
  ]);
  return {
    totalOrders,
    pendingOrders,
    paidOrders,
    completedOrders,
    revenue: revenueAgg._sum.totalAmount ?? 0,
    userCount,
    productCount,
  };
});
