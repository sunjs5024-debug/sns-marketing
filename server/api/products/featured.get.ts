import { prisma } from "../../utils/prisma";
import { isDbUnavailable, throwDbUnavailable } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const all = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true, _count: { select: { options: true } } },
      orderBy: { salesCount: "desc" },
    });
    // 상위 8개(판매량순) + 카카오 대표 1개를 2번째 자리에 보장 노출(신규 카카오 라인 홍보)
    let top = all.slice(0, 8);
    const kko = all.find((p) => p.category.slug.startsWith("kakaotalk"));
    if (kko) {
      top = top.filter((p) => p.id !== kko.id); // 이미 top8에 있으면 중복 제거
      top.splice(1, 0, kko); // 2번째(index 1) 자리에 삽입
      top = top.slice(0, 8); // 8개 유지
    }
    return top;
  } catch (e) {
    if (isDbUnavailable(e)) throwDbUnavailable(event, e);
    throw e;
  }
});
