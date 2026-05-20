import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

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

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId: parsed.data.productId, optionId },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: { increment: quantity },
        targetUrl: parsed.data.targetUrl,
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
        targetUrl: parsed.data.targetUrl,
        memo: parsed.data.memo,
      },
    });
  }

  return { ok: true };
});
