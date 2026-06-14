// 관리자 — 전체 충전 신청 목록 (최근 200건)
import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  // 만료 처리 일괄
  await prisma.charge.updateMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  return prisma.charge.findMany({
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
      user: { select: { id: true, name: true, email: true, points: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
});
