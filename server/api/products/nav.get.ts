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
    // 사이드바·가격표용 부가 데이터이므로 어떤 에러에도 페이지를 죽이지 않는다(빈 배열 반환).
    //   DB 일시장애든 예기치 못한 에러든, 이 엔드포인트가 SSR 워커 예외(1101)/500의 원인이 되지 않게 한다.
    //   대신 에러는 로그로 남겨 워커 로그에서 관측 가능하게(silent 실패 방지).
    if (!isDbUnavailable(e)) console.error("[api/products/nav] 예기치 못한 에러 — 빈 배열 반환:", e);
    return [];
  }
});
