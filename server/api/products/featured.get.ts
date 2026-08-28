import { prisma } from "../../utils/prisma";
import { isDbUnavailable, throwDbUnavailable } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const all = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true, _count: { select: { options: true } } },
      orderBy: { salesCount: "desc" },
    });
    // 상위 8개(판매량순) + 카카오 대표 1개 보장(신규 카카오 라인 노출 — 판매량 낮아 top8에서 밀리므로)
    let top = all.slice(0, 8);
    if (!top.some((p) => p.category.slug.startsWith("kakaotalk"))) {
      const kko = all.find((p) => p.category.slug.startsWith("kakaotalk"));
      if (kko) top = [...top.slice(0, 7), kko];
    }
    return top;
  } catch (e) {
    if (isDbUnavailable(e)) throwDbUnavailable(event, e);
    throw e;
  }
});
