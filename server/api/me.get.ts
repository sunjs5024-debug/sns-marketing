// 마이페이지 종합 정보 — 회원정보 + 주문 통계 + 최근 주문
import { prisma } from "../utils/prisma";
import { requireUserId } from "../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  const [user, statusCounts, recentOrders, totalRevenue] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        points: true,
        createdAt: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        paidAt: true,
        items: {
          select: { productName: true, optionLabel: true, quantity: true },
          take: 3,
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        userId,
        status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
      },
    }),
  ]);

  if (!user) throw createError({ statusCode: 404, statusMessage: "사용자를 찾을 수 없습니다." });

  // 상태별 카운트 평탄화
  const counts = {
    total: 0,
    pending: 0,
    paid: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  };
  for (const row of statusCounts) {
    counts.total += row._count._all;
    if (row.status === "PENDING") counts.pending = row._count._all;
    if (row.status === "PAID") counts.paid = row._count._all;
    if (row.status === "PROCESSING") counts.processing = row._count._all;
    if (row.status === "COMPLETED") counts.completed = row._count._all;
    if (row.status === "CANCELLED") counts.cancelled = row._count._all;
    if (row.status === "REFUNDED") counts.refunded = row._count._all;
  }

  return {
    user,
    orderCounts: counts,
    totalSpent: totalRevenue._sum.totalAmount ?? 0,
    recentOrders,
  };
});
