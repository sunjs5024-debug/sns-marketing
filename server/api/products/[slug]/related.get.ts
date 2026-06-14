// 관련 상품 추천
//   - sameCategory: 같은 카테고리 내 다른 활성 상품 (인기순)
//   - samePlatform: 같은 플랫폼 다른 카테고리 활성 상품 (인기순)
// 플랫폼은 카테고리 slug의 첫 번째 하이픈 전 부분 (예: instagram-followers → instagram)
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400, statusMessage: "slug 필수" });

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) throw createError({ statusCode: 404 });

  // 플랫폼 prefix 추출
  const platformPrefix = product.category.slug.split("-")[0];

  // 같은 카테고리 (자기 자신 제외)
  const sameCategory = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      category: true,
      _count: { select: { options: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }, { rating: "desc" }],
    take: 4,
  });

  // 같은 플랫폼 (현재 카테고리 + 자기 자신 제외)
  const samePlatform = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: { not: product.categoryId },
      category: { slug: { startsWith: `${platformPrefix}-` } },
      id: { not: product.id },
    },
    include: {
      category: true,
      _count: { select: { options: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }, { rating: "desc" }],
    take: 4,
  });

  return { sameCategory, samePlatform };
});
