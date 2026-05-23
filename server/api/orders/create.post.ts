import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";
import type { PaymentMethod } from "~~/generated/prisma/enums";

// 포인트 사용 정책 (server-side 강제 — 클라이언트 우회 방지)
export const POINTS_MAX_RATIO = 0.3; // 결제 금액의 30%까지

const schema = z.object({
  buyerName: z.string().min(1),
  buyerPhone: z.string().min(1),
  buyerEmail: z.string().email(),
  memo: z.string().nullable().optional(),
  paymentMethod: z.enum(["CARD", "TRANSFER", "KAKAOPAY", "NAVERPAY", "TOSS"]).default("TRANSFER"),
  pointsToUse: z.number().int().min(0).optional().default(0),
});

function generateOrderNumber() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BM${ymd}-${rand}`;
}

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }

  const [items, user] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, option: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
  ]);
  if (items.length === 0) throw createError({ statusCode: 400, statusMessage: "장바구니가 비어 있어요." });
  if (!user) throw createError({ statusCode: 404, statusMessage: "사용자 없음" });

  const totalAmount = items.reduce(
    (sum, it) => sum + (it.option?.price ?? it.product.basePrice) * it.quantity,
    0,
  );

  // 포인트 사용 검증 — 클라이언트 값 신뢰하지 않음
  const maxByPolicy = Math.floor(totalAmount * POINTS_MAX_RATIO);
  const requestedPoints = Math.max(0, Math.min(parsed.data.pointsToUse, user.points, maxByPolicy));
  const finalAmount = totalAmount - requestedPoints;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      totalAmount,
      pointsUsed: requestedPoints,
      finalAmount,
      paymentMethod: parsed.data.paymentMethod as PaymentMethod,
      buyerName: parsed.data.buyerName,
      buyerPhone: parsed.data.buyerPhone,
      buyerEmail: parsed.data.buyerEmail,
      memo: parsed.data.memo ?? null,
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          productName: it.product.name,
          optionId: it.optionId ?? null,
          optionLabel: it.option?.label ?? null,
          unitPrice: it.option?.price ?? it.product.basePrice,
          quantity: it.quantity,
          totalPrice: (it.option?.price ?? it.product.basePrice) * it.quantity,
          targetUrl: it.targetUrl,
          memo: it.memo,
        })),
      },
    },
  });

  return { orderNumber: order.orderNumber, pointsUsed: requestedPoints, finalAmount };
});
