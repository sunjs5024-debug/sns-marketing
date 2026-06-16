import { prisma } from "../../utils/prisma";
import { isDbUnavailable, maskDbError } from "../../utils/db";
import { SNS_PLATFORMS, RANK_PLATFORMS, MARKETING_PLATFORMS } from "#shared/catalog";
import { listGuideSlugs } from "#shared/guides";

// @nuxtjs/sitemap 의 sources 로 호출되는 동적 URL 제공 엔드포인트
// — 플랫폼 카테고리 + 활성 상품 + SEO 키워드 가이드
export default defineSitemapEventHandler(async (event) => {
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
    ...MARKETING_PLATFORMS.map((slug) => ({
      loc: `/marketing/${slug}`,
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

  // 3) 활성 상품 (DB) — lastmod 는 실제 수정일(updatedAt) 기반
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
    // DB 일시 장애 시 상품이 통째로 빠진 "불완전한 사이트맵"을 200으로 새로 만들지 않는다.
    // → 503으로 생성을 거부해 크롤러가 기존(정상) 사이트맵을 유지하도록 유도.
    if (isDbUnavailable(e)) {
      console.error("[sitemap] DB unavailable — refusing partial sitemap:", maskDbError(e));
      setResponseHeader(event, "Retry-After", "120");
      throw createError({
        statusCode: 503,
        statusMessage: "Service Unavailable",
        message: "사이트맵을 일시적으로 생성할 수 없습니다.",
      });
    }
    throw e;
  }

  return [...platformUrls, ...guideUrls, ...productUrls];
});
