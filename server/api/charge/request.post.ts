// 사용자 충전 신청 — DB 에 PENDING 으로 저장, 안내 정보 반환
import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

const schema = z.object({
  amount: z.number().int().min(1).max(100_000_000),
  depositorName: z.string().min(1).max(20).trim(),
});

// 충전번호 — 사용자 표시용
function makeChargeNumber(): string {
  const d = new Date();
  const yymmdd = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CHG-${yymmdd}-${rand}`;
}

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? "잘못된 요청",
    });
  }

  // 동시에 같은 amount+depositorName 으로 PENDING 있으면 사용자에게 경고
  //   (다른 사람이 같은 금액+이름으로 신청한 경우 — 매칭 충돌 가능)
  const conflicting = await prisma.charge.count({
    where: {
      status: "PENDING",
      amount: parsed.data.amount,
      depositorName: parsed.data.depositorName,
      expiresAt: { gt: new Date() },
      userId: { not: userId },
    },
  });
  if (conflicting > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "동일한 금액·입금자명으로 대기 중인 신청이 있습니다. 입금자명을 조금 다르게 (예: 홍길동1) 입력해주세요.",
    });
  }

  const created = await prisma.charge.create({
    data: {
      chargeNumber: makeChargeNumber(),
      userId,
      amount: parsed.data.amount,
      depositorName: parsed.data.depositorName,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
    },
  });

  return {
    charge: {
      id: created.id,
      chargeNumber: created.chargeNumber,
      amount: created.amount,
      depositorName: created.depositorName,
      expiresAt: created.expiresAt,
    },
    // 사용자에게 안내할 입금 계좌
    bankInfo: {
      bank: "KB국민은행",
      accountNumber: "892501-00-080455",
      accountHolder: "주식회사 영천기획",
    },
  };
});
