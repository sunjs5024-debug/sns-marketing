import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const orderNumber = getRouterParam(event, "orderNumber");
  if (!orderNumber) throw createError({ statusCode: 400 });

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  if (!order || order.userId !== userId) throw createError({ statusCode: 404 });
  return order;
});
