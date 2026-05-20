import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const section = q.section === "RANK" ? "RANK" : "SNS";
  return prisma.product.findMany({
    where: { isActive: true, category: { platform: section } },
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
    take: 12,
  });
});
