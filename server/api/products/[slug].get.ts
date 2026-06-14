import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400 });
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, options: { orderBy: { sortOrder: "asc" } } },
  });
  // 판매중지(isActive=false) 상품은 직접 링크로도 접근/구매 불가
  if (!product || !product.isActive) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return product;
});
