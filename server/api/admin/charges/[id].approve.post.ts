// 관리자 수동 승인 (SMS 자동 매칭 실패한 경우 fallback)
//   ⚠ Race condition 방지 — updateMany 의 조건절(status=PENDING)로 원자적 처리
//   동시 승인 요청이 와도 한 번만 성공함 (포인트 중복 적립 방지)
import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  const charge = await prisma.charge.findUnique({ where: { id } });
  if (!charge) throw createError({ statusCode: 404, statusMessage: "충전 신청을 찾을 수 없습니다." });
  if (charge.status !== "PENDING") {
    throw createError({
      statusCode: 409,
      statusMessage: `이미 처리된 신청입니다 (현재 상태: ${charge.status})`,
    });
  }

  // 원자적 승인 — 조건절(status=PENDING) 매칭되어야만 update 됨
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.charge.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "APPROVED",
        bankReceivedAt: charge.bankReceivedAt ?? new Date(),
        approvedAt: new Date(),
      },
    });
    if (updated.count === 0) {
      // 다른 요청이 먼저 처리함
      throw createError({ statusCode: 409, statusMessage: "이미 처리되었습니다." });
    }
    // 포인트 적립은 charge update 가 성공했을 때만
    await tx.user.update({
      where: { id: charge.userId },
      data: { points: { increment: charge.amount } },
    });
    return { ok: true };
  });

  return result;
});
