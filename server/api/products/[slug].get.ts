import { prisma } from "../../utils/prisma";
import { isDbUnavailable, throwDbUnavailable } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400 });

  let product;
  let reviewAgg;
  try {
    // 상품 + 승인 리뷰 집계를 병렬 조회 (집계값을 SSR payload 에 실어 JSON-LD 별점이 lazy fetch/판매수 폴백에 의존하지 않게 함)
    [product, reviewAgg] = await Promise.all([
      prisma.product.findUnique({
        where: { slug },
        include: { category: true, options: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.review.aggregate({
        where: { product: { slug }, isVerified: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);
  } catch (e) {
    // DB 일시 장애는 404로 둔갑시키지 않는다(잘못된 색인 제거 방지) → 503
    if (isDbUnavailable(e)) throwDbUnavailable(event, e);
    throw e;
  }

  // 진짜 없음 / 판매중지(isActive=false)일 때만 404
  if (!product || !product.isActive) throw createError({ statusCode: 404, statusMessage: "Not found" });

  // 실제 승인 리뷰 개수·평균 — JSON-LD aggregateRating 은 이 값이 >0 일 때만 방출한다(가짜 별점 금지).
  return {
    ...product,
    reviewCount: reviewAgg._count._all,
    avgRating: reviewAgg._avg.rating, // 리뷰 없으면 null
  };
});
