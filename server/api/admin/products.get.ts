import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return prisma.product.findMany({
    include: { category: true, options: true },
    orderBy: { createdAt: "desc" },
  });
});
