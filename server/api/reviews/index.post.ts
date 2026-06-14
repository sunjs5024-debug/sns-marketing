// 사용자 리뷰 작성 — 본인 완료된 주문에 대해 별점 + 본문 작성
// 1주문 1리뷰 강제 (Review.orderId @unique). 작성 직후엔 isVerified=false (관리자 승인 대기)
import { z } from "zod";
import { requireUserId } from "../../utils/session";
import { prisma } from "../../utils/prisma";

const schema = z.object({
  orderNumber: z.string().min(4),
  productId: z.string().min(4),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(20, "후기는 20자 이상 작성해주세요").max(1000),
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? "잘못된 요청" });
  }

  // 1) 주문 검증 — 본인 주문 + COMPLETED 상태 + 해당 productId 포함
  const order = await prisma.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber },
    select: {
      id: true,
      userId: true,
      status: true,
      items: { select: { productId: true } },
      review: { select: { id: true } },
    },
  });
  if (!order) throw createError({ statusCode: 404, statusMessage: "주문을 찾을 수 없습니다." });
  if (order.userId !== userId) throw createError({ statusCode: 403, statusMessage: "본인 주문만 후기를 작성할 수 있습니다." });
  if (order.status !== "COMPLETED") {
    throw createError({ statusCode: 400, statusMessage: "작업이 완료된 주문에만 후기를 작성할 수 있습니다." });
  }
  if (order.review) throw createError({ statusCode: 409, statusMessage: "이미 후기를 작성한 주문입니다." });
  const hasProduct = order.items.some((it) => it.productId === parsed.data.productId);
  if (!hasProduct) {
    throw createError({ statusCode: 400, statusMessage: "주문에 포함되지 않은 상품입니다." });
  }

  // 2) 생성 — 승인 대기 상태
  const review = await prisma.review.create({
    data: {
      userId,
      orderId: order.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      content: parsed.data.content.trim(),
      isVerified: false,
    },
    select: { id: true, createdAt: true },
  });

  return { ok: true, id: review.id, message: "후기가 접수되었습니다. 관리자 승인 후 공개됩니다." };
});
