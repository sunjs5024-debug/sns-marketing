// 본인 충전 내역 (최근 30건)
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  // 만료 처리 — PENDING 인데 expiresAt 지났으면 EXPIRED 로 변경
  await prisma.charge.updateMany({
    where: { userId, status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  return prisma.charge.findMany({
    where: { userId },
    select: {
      id: true,
      chargeNumber: true,
      amount: true,
      depositorName: true,
      status: true,
      bankReceivedAt: true,
      approvedAt: true,
      rejectedAt: true,
      rejectReason: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
});
