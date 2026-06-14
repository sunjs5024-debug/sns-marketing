// 내 주문 중 후기 작성 가능한 것 — COMPLETED 상태 + 아직 리뷰 안 쓴 것
import { requireUserId } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: "COMPLETED",
      review: null, // 아직 후기 미작성
    },
    select: {
      id: true,
      orderNumber: true,
      completedAt: true,
      items: {
        select: {
          productId: true,
          productName: true,
          product: { select: { slug: true, category: { select: { name: true, platform: true } } } },
        },
        take: 1, // 첫 번째 상품만 (대표)
      },
    },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  return orders.map((o) => ({
    orderId: o.id,
    orderNumber: o.orderNumber,
    completedAt: o.completedAt,
    productId: o.items[0]?.productId ?? "",
    productName: o.items[0]?.productName ?? "",
    productSlug: o.items[0]?.product?.slug ?? "",
    categoryName: o.items[0]?.product?.category?.name ?? "",
    platform: o.items[0]?.product?.category?.platform ?? null,
  }));
});
