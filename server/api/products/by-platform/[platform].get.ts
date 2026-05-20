import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const platform = getRouterParam(event, "platform");
  if (!platform) throw createError({ statusCode: 400, statusMessage: "platform 필수" });

  return prisma.product.findMany({
    where: {
      isActive: true,
      category: { slug: { startsWith: `${platform}-` } },
    },
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
  });
});
