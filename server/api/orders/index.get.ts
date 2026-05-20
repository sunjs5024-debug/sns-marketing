import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
});
