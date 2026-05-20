import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

const schema = z.object({
  quantity: z.number().int().positive().optional(),
  targetUrl: z.string().optional(),
  memo: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400 });

  const item = await prisma.cartItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) {
    throw createError({ statusCode: 404 });
  }

  await prisma.cartItem.update({
    where: { id },
    data: {
      ...(parsed.data.quantity !== undefined && { quantity: parsed.data.quantity }),
      ...(parsed.data.targetUrl !== undefined && { targetUrl: parsed.data.targetUrl }),
      ...(parsed.data.memo !== undefined && { memo: parsed.data.memo }),
    },
  });
  return { ok: true };
});
