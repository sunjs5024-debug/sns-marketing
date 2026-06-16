import { prisma } from "../../utils/prisma";
import { isDbUnavailable, throwDbUnavailable } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    return await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true, _count: { select: { options: true } } },
      orderBy: { salesCount: "desc" },
      take: 8,
    });
  } catch (e) {
    if (isDbUnavailable(e)) throwDbUnavailable(event, e);
    throw e;
  }
});
