// 관련 상품 추천
//   - sameCategory: 같은 카테고리 내 다른 활성 상품 (인기순)
//   - samePlatform: 같은 플랫폼 다른 카테고리 활성 상품 (인기순)
// 플랫폼은 카테고리 slug의 첫 번째 하이픈 전 부분 (예: instagram-followers → instagram)
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400, statusMessage: "slug 필수" });

  // 클라이언트([slug].vue)가 이미 가진 값을 쿼리로 넘기면 상품 재조회(중복 왕복) 생략.
  const q = getQuery(event);
  let productId = typeof q.productId === "string" ? q.productId : null;
  let categoryId = typeof q.categoryId === "string" ? q.categoryId : null;
  let categorySlug = typeof q.categorySlug === "string" ? q.categorySlug : null;

  if (!productId || !categoryId || !categorySlug) {
    // 직접 호출 등 파라미터 미제공 시에만 DB 조회 (안전 폴백)
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true, category: { select: { slug: true } } },
    });
    if (!product) throw createError({ statusCode: 404 });
    productId = product.id;
    categoryId = product.categoryId;
    categorySlug = product.category.slug;
  }

  // 플랫폼 prefix 추출
  const platformPrefix = categorySlug.split("-")[0];

  const orderBy = [{ isFeatured: "desc" as const }, { salesCount: "desc" as const }, { rating: "desc" as const }];
  const include = { category: true, _count: { select: { options: true } } };

  // 같은 카테고리 / 같은 플랫폼 — 서로 독립이라 병렬 실행 (3 직렬 왕복 → 1 병렬 왕복)
  const [sameCategory, samePlatform] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, categoryId, id: { not: productId } },
      include,
      orderBy,
      take: 4,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: { not: categoryId },
        category: { slug: { startsWith: `${platformPrefix}-` } },
        id: { not: productId },
      },
      include,
      orderBy,
      take: 4,
    }),
  ]);

  return { sameCategory, samePlatform };
});
