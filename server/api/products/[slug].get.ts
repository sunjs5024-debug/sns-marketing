import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400 });
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, options: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return product;
});
