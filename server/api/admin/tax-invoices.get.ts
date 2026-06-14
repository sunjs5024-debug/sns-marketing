// 어드민 — 세금계산서 신청 목록 (필터 가능)
import { requireAdmin } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const status = getQuery(event).status as string | undefined;
  const where: Record<string, unknown> = {};
  if (status === "REQUESTED" || status === "ISSUED" || status === "REJECTED") {
    where.status = status;
  }

  const [items, counts] = await Promise.all([
    prisma.taxInvoiceRequest.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        order: {
          select: {
            orderNumber: true,
            finalAmount: true,
            paidAt: true,
            items: { select: { productName: true }, take: 1 },
            _count: { select: { items: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
      take: 200,
    }),
    prisma.taxInvoiceRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const summary = { requested: 0, issued: 0, rejected: 0 };
  for (const c of counts) {
    if (c.status === "REQUESTED") summary.requested = c._count._all;
    if (c.status === "ISSUED") summary.issued = c._count._all;
    if (c.status === "REJECTED") summary.rejected = c._count._all;
  }

  return { items, summary };
});
