import { prisma } from "../../utils/prisma";
import { isDbUnavailable, throwDbUnavailable } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400 });

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, options: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (e) {
    // DB 일시 장애는 404로 둔갑시키지 않는다(잘못된 색인 제거 방지) → 503
    if (isDbUnavailable(e)) throwDbUnavailable(event, e);
    throw e;
  }

  // 진짜 없음 / 판매중지(isActive=false)일 때만 404
  if (!product || !product.isActive) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return product;
});
