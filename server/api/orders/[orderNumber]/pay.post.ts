import { prisma } from "../../../utils/prisma";
import { requireUserId } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const orderNumber = getRouterParam(event, "orderNumber");
  if (!orderNumber) throw createError({ statusCode: 400 });

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.userId !== userId) throw createError({ statusCode: 404 });
  if (order.status !== "PENDING") {
    return { ok: false, message: "이미 처리된 주문입니다." };
  }

  const earnedPoints = Math.floor(order.totalAmount * 0.02);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentKey: `MOCK-${Date.now()}`,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: earnedPoints } },
    }),
    prisma.cartItem.deleteMany({ where: { userId } }),
  ]);

  return { ok: true, earnedPoints };
});
