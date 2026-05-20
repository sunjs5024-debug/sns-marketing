import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { include: { category: true } },
      option: true,
    },
    orderBy: { createdAt: "desc" },
  });
});
