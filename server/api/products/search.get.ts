// 상품 검색 — 이름·설명·카테고리 매칭 (대소문자 무시)
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);
  const query = typeof q === "string" ? q.trim() : "";

  if (query.length < 1) {
    return { query: "", count: 0, results: [] };
  }
  if (query.length > 50) {
    throw createError({ statusCode: 400, statusMessage: "검색어가 너무 깁니다." });
  }

  const results = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
        { category: { slug: { contains: query, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      basePrice: true,
      badge: true,
      rating: true,
      salesCount: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
    take: 60,
  });

  return {
    query,
    count: results.length,
    results,
  };
});
