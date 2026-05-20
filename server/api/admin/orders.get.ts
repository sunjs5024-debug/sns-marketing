import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true, productName: true, targetUrl: true, optionLabel: true, quantity: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
});
