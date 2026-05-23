import { prisma } from "../../utils/prisma";
import { SNS_PLATFORMS, RANK_PLATFORMS } from "#shared/catalog";

// @nuxtjs/sitemap 의 sources 로 호출되는 동적 URL 제공 엔드포인트
// — 플랫폼 카테고리 페이지 9개 + DB에 등록된 활성 상품 페이지 전체
export default defineSitemapEventHandler(async () => {
  // 1) 플랫폼 카테고리 (정적으로 알려진 9개)
  const platformUrls = [
    ...SNS_PLATFORMS.map((slug) => ({
      loc: `/sns/${slug}`,
      changefreq: "weekly" as const,
      priority: 0.8,
    })),
    ...RANK_PLATFORMS.map((slug) => ({
      loc: `/rank/${slug}`,
      changefreq: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // 2) 활성 상품 (DB)
  let productUrls: Array<{ loc: string; changefreq: "weekly"; priority: number; lastmod?: string }> = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    productUrls = products.map((p) => ({
      loc: `/products/${p.slug}`,
      changefreq: "weekly" as const,
      priority: 0.7,
      lastmod: p.updatedAt.toISOString(),
    }));
  } catch (e) {
    // DB 접근 실패 시 상품 URL은 빼고 진행 (sitemap 자체는 살려둠)
    console.error("[sitemap] product fetch failed:", e);
  }

  return [...platformUrls, ...productUrls];
});
