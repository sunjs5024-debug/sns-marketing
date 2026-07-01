// 사이드바 네비게이션용 — 활성 상품 전체를 가볍게(slug/name/카테고리) 한 번에 반환.
// 클릭 즉시 세부상품을 보여주기 위해 사이드바가 이 데이터를 미리 로드한다.
import { prisma } from "../../utils/prisma";
import { isDbUnavailable } from "../../utils/db";

export default defineEventHandler(async () => {
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        name: true,
        isFeatured: true,
        basePrice: true,
        category: { select: { slug: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
    });
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      featured: r.isFeatured,
      basePrice: r.basePrice,
      categorySlug: r.category.slug,
    }));
  } catch (e) {
    // 사이드바는 부가 요소이므로 DB 장애 시에도 페이지가 죽지 않게 빈 배열 반환.
    if (isDbUnavailable(e)) return [];
    throw e;
  }
});
