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

  // 결제 시점에 사용자 포인트 재검증 (주문 생성 후 사용된 포인트 변동 대비)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
  if (!user || user.points < order.pointsUsed) {
    throw createError({
      statusCode: 400,
      statusMessage: "포인트가 부족합니다. 주문을 다시 생성해주세요.",
    });
  }

  // 적립은 실 결제 금액(finalAmount) 기준 2% — 포인트로 결제한 부분은 적립 제외
  const earnedPoints = Math.floor(order.finalAmount * 0.02);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentKey: `MOCK-${Date.now()}`,
      },
    }),
    // 사용 포인트 차감 + 적립 포인트 가산
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: earnedPoints - order.pointsUsed } },
    }),
    prisma.cartItem.deleteMany({ where: { userId } }),
  ]);

  return { ok: true, earnedPoints, pointsUsed: order.pointsUsed };
});
