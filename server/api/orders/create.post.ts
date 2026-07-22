import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";
import { notifyNewOrder } from "../../utils/telegram";

// 계좌이체 only — 입금자명으로 SMS 자동 매칭
const schema = z.object({
  buyerName: z.string().min(1),
  buyerPhone: z.string().min(1),
  buyerEmail: z.string().email(),
  memo: z.string().nullable().optional(),
  depositorName: z.string().min(1).max(20).trim(),
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

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true, option: true },
  });
  if (items.length === 0) throw createError({ statusCode: 400, statusMessage: "장바구니가 비어 있어요." });

  // 오픈예정(발주 매핑 없는) 상품 주문 차단
  if (items.some((it) => it.option && it.option.externalServiceId == null)) {
    throw createError({ statusCode: 400, statusMessage: "장바구니에 곧 오픈 예정인 상품이 있습니다. 해당 상품을 제외하고 주문해주세요." });
  }

  // 작업 대상 URL 없는 상품 주문 차단 (빈 URL → 발주 불가 → 결제만 되고 작업 안 나가는 사고 방지)
  const missingUrl = items.find((it) => !it.targetUrl || !it.targetUrl.trim());
  if (missingUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: `'${missingUrl.product.name}'의 작업 URL이 없습니다. 장바구니에서 URL을 입력한 뒤 다시 주문해주세요.`,
    });
  }

  const totalAmount = items.reduce(
    (sum, it) => sum + (it.option?.price ?? it.product.basePrice) * it.quantity,
    0,
  );

  // 동일 입금자명 + 동일 금액으로 PENDING 충전/주문 있으면 매칭 충돌 → 사용자에게 다른 이름 요구
  const [conflictCharge, conflictOrder] = await Promise.all([
    prisma.charge.count({
      where: {
        status: "PENDING",
        amount: totalAmount,
        depositorName: parsed.data.depositorName,
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.order.count({
      where: {
        status: "PENDING",
        finalAmount: totalAmount,
        depositorName: parsed.data.depositorName,
        paymentMethod: "TRANSFER",
        expiresAt: { gt: new Date() },
      },
    }),
  ]);
  if (conflictCharge + conflictOrder > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "동일한 금액·입금자명으로 대기 중인 신청이 있습니다. 입금자명을 조금 다르게 (예: 홍길동1) 입력해주세요.",
    });
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      totalAmount,
      pointsUsed: 0,
      finalAmount: totalAmount,
      paymentMethod: "TRANSFER",
      depositorName: parsed.data.depositorName,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 자동 만료
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

  // 어드민 텔레그램 알림 (fail-silent)
  notifyNewOrder({
    orderNumber: order.orderNumber,
    buyerName: parsed.data.buyerName,
    finalAmount: totalAmount,
    depositorName: parsed.data.depositorName,
    itemCount: items.length,
    firstProductName: items[0]?.product.name ?? "(상품)",
  }).catch(() => {});

  return { orderNumber: order.orderNumber, finalAmount: totalAmount };
});
