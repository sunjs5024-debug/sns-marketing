import { prisma } from "../../utils/prisma";
import { SNS_PLATFORMS, RANK_PLATFORMS } from "#shared/catalog";
import { listGuideSlugs } from "#shared/guides";

// @nuxtjs/sitemap 의 sources 로 호출되는 동적 URL 제공 엔드포인트
// — 플랫폼 카테고리 9개 + 활성 상품 + SEO 키워드 가이드 5개
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

  // 2) SEO 키워드 가이드 페이지 — 콘텐츠 마케팅 핵심
  const guideUrls = listGuideSlugs().map((slug) => ({
    loc: `/guide/${slug}`,
    changefreq: "monthly" as const,
    priority: 0.9, // 검색 유입 메인 페이지라 최고 우선순위
  }));

  // 3) 활성 상품 (DB)
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

  return [...platformUrls, ...guideUrls, ...productUrls];
});
