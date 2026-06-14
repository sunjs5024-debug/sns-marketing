// 공개 리뷰 목록 — 승인된 리뷰만 (isVerified=true)
// 옵션 쿼리:
//   ?productId=xxx  특정 상품 리뷰만
//   ?limit=N        기본 50, 최대 100
import { prisma } from "../../utils/prisma";

// 작성자 이름 자동 마스킹 — 홍길동 → 홍*동, 김민수 → 김*수
function maskName(name: string): string {
  if (name.length <= 1) return name + "*";
  if (name.length === 2) return name[0]! + "*";
  return name.slice(0, 1) + "*".repeat(Math.max(1, name.length - 2)) + name.slice(-1);
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const productId = typeof q.productId === "string" ? q.productId : undefined;
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 50));

  const where: Record<string, unknown> = { isVerified: true };
  if (productId) where.productId = productId;

  const items = await prisma.review.findMany({
    where,
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      user: { select: { name: true } },
      product: { select: { name: true, slug: true, category: { select: { name: true, platform: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const reviews = items.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    date: r.createdAt.toISOString().slice(0, 10).replace(/-/g, "."),
    author: maskName(r.user.name),
    productName: r.product.name,
    productSlug: r.product.slug,
    categoryName: r.product.category.name,
    platform: r.product.category.platform,
  }));

  // 평균 별점 — productId 필터 있으면 그 상품, 없으면 전체
  const agg = await prisma.review.aggregate({
    where,
    _avg: { rating: true },
    _count: { _all: true },
  });

  return {
    reviews,
    avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 5.0,
    totalCount: agg._count._all,
  };
});
