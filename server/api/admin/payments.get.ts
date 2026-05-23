import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

// 결제 완료 이상 (PAID / PROCESSING / COMPLETED / REFUNDED) 주문을 결제 정보 중심으로 반환
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return prisma.order.findMany({
    where: { status: { in: ["PAID", "PROCESSING", "COMPLETED", "REFUNDED"] } },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      paymentMethod: true,
      paymentKey: true,
      buyerName: true,
      buyerPhone: true,
      buyerEmail: true,
      paidAt: true,
      completedAt: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { paidAt: "desc" },
    take: 200,
  });
});
