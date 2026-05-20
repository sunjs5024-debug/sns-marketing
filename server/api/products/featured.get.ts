import { prisma } from "../../utils/prisma";

export default defineEventHandler(async () => {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    orderBy: { salesCount: "desc" },
    take: 8,
  });
});
