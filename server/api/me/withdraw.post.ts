// 회원 탈퇴 (soft delete + PII 익명화)
//   - 전자상거래법: 거래기록 5년 보관 의무 → User 자체 삭제 X, PII만 익명화
//   - 진행 중 주문이 있으면 거부 (완료 후 탈퇴)
//   - 이메일 가입 사용자는 비밀번호 확인 필수
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

const schema = z.object({
  reason: z.string().max(500).nullable().optional(),
  password: z.string().optional(), // 이메일 가입자만 필요
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, passwordHash: true, isDeleted: true },
  });
  if (!user) throw createError({ statusCode: 404 });
  if (user.isDeleted) throw createError({ statusCode: 400, statusMessage: "이미 탈퇴 처리된 계정입니다." });

  // 이메일 가입 사용자 → 비밀번호 확인
  if (user.passwordHash) {
    if (!parsed.data.password) {
      throw createError({ statusCode: 400, statusMessage: "비밀번호를 입력해주세요." });
    }
    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) throw createError({ statusCode: 400, statusMessage: "비밀번호가 일치하지 않습니다." });
  }

  // 진행 중 주문 체크 — PENDING/PAID/PROCESSING 있으면 막기
  const activeOrderCount = await prisma.order.count({
    where: { userId, status: { in: ["PENDING", "PAID", "PROCESSING"] } },
  });
  if (activeOrderCount > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `진행 중인 주문 ${activeOrderCount}건이 있습니다. 주문 완료 또는 취소 후 다시 시도해주세요.`,
    });
  }

  // 진행 중 충전 신청 체크
  const activeChargeCount = await prisma.charge.count({
    where: { userId, status: "PENDING" },
  });
  if (activeChargeCount > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `대기 중인 충전 신청 ${activeChargeCount}건이 있습니다. 완료 후 다시 시도해주세요.`,
    });
  }

  // PII 익명화 + soft delete
  const anonEmail = `deleted_${user.id}@deleted.local`;
  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deleteReason: parsed.data.reason ?? null,
      email: anonEmail,
      name: "(탈퇴회원)",
      phone: null,
      passwordHash: null,
    },
  });

  // 장바구니도 비우기
  await prisma.cartItem.deleteMany({ where: { userId } });

  return { ok: true };
});
