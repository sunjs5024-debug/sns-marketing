import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";
import { cleanTargetUrl } from "#shared/target-url";

const schema = z.object({
  productId: z.string(),
  optionId: z.string().nullable().optional(),
  quantity: z.number().int().positive().optional(),
  targetUrl: z.string().optional(),
  memo: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "잘못된 입력" });

  const quantity = parsed.data.quantity ?? 1;
  const optionId = parsed.data.optionId ?? null;

  // 오픈예정(발주 매핑 없는) 옵션은 담기 불가
  if (optionId) {
    const opt = await prisma.productOption.findUnique({ where: { id: optionId }, select: { externalServiceId: true } });
    if (opt && opt.externalServiceId == null) {
      throw createError({ statusCode: 400, statusMessage: "곧 오픈 예정인 상품입니다. 조금만 기다려주세요." });
    }
  }

  // 작업 대상 URL 필수 + 추적 파라미터 제거 (빈 URL 주문 → 발주 불가 사고 방지)
  const targetUrl = cleanTargetUrl(parsed.data.targetUrl);
  if (!targetUrl) {
    throw createError({ statusCode: 400, statusMessage: "작업하실 URL(계정 또는 게시물 주소)을 입력해주세요." });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId: parsed.data.productId, optionId },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: { increment: quantity },
        targetUrl,
        memo: parsed.data.memo,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        productId: parsed.data.productId,
        optionId,
        quantity,
        targetUrl,
        memo: parsed.data.memo,
      },
    });
  }

  return { ok: true };
});
