import { prisma } from "../../utils/prisma";
import { isDbUnavailable, throwDbUnavailable } from "../../utils/db";
import { SNS_PLATFORMS, RANK_PLATFORMS, MARKETING_PLATFORMS } from "#shared/catalog";

// 레인(상단 카테고리) → 해당 레인에 속한 플랫폼 슬러그 목록
// 레인 구분은 DB enum 이 아닌 catalog 의 플랫폼 배열을 단일 출처로 사용
const LANE_SLUGS: Record<string, string[]> = {
  SNS: SNS_PLATFORMS,
  RANK: RANK_PLATFORMS,
  MARKETING: MARKETING_PLATFORMS,
};

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const key = typeof q.section === "string" && q.section in LANE_SLUGS ? q.section : "SNS";
  const slugs = LANE_SLUGS[key]!;
  if (slugs.length === 0) return [];

  try {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        // 카테고리 슬러그 prefix(예: "tistory-")로 레인 소속 판정
        OR: slugs.map((s) => ({ category: { slug: { startsWith: `${s}-` } } })),
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
      take: 12,
    });
  } catch (e) {
    if (isDbUnavailable(e)) throwDbUnavailable(event, e);
    throw e;
  }
});
