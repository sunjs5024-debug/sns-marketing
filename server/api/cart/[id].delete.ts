import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  const item = await prisma.cartItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) throw createError({ statusCode: 404 });

  await prisma.cartItem.delete({ where: { id } });
  return { ok: true };
});
