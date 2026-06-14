// 관리자 — 리뷰 전체 목록 (status 필터링 가능)
// ?status=pending  (isVerified=false + rejectedAt=null)
// ?status=approved (isVerified=true)
// ?status=rejected (rejectedAt is not null)
// ?status=all      (전체)
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const status = String(getQuery(event).status ?? "pending");

  const where: Record<string, unknown> = {};
  if (status === "pending") {
    where.isVerified = false;
    where.rejectedAt = null;
  } else if (status === "approved") {
    where.isVerified = true;
  } else if (status === "rejected") {
    where.rejectedAt = { not: null };
  }
  // status=all → 필터 없음

  const [items, allCounts] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        content: true,
        isVerified: true,
        rejectedAt: true,
        adminMemo: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
        product: { select: { name: true, slug: true } },
        order: { select: { orderNumber: true } },
      },
      orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
      take: 200,
    }),
    prisma.review.findMany({
      select: { isVerified: true, rejectedAt: true },
    }),
  ]);

  // 요약 카운트
  const summary = { pending: 0, approved: 0, rejected: 0 };
  for (const r of allCounts) {
    if (r.rejectedAt) summary.rejected++;
    else if (r.isVerified) summary.approved++;
    else summary.pending++;
  }

  return { items, summary };
});
