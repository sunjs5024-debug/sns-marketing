// 어드민이 특정 Order를 수동으로 urpanel 발주 시도/재시도
//   - URL 파라미터는 orderNumber (사용자 표시용) 또는 orderId 둘 다 허용
//   - 시도 카운트는 dispatchOrderToProviders 가 알아서 +1
//   - resetAttempts=true 면 실패 카운트 리셋 후 재시도
import { requireAdmin } from "../../../../utils/session";
import { prisma } from "../../../../utils/prisma";
import { dispatchOrderToProviders } from "../../../../utils/smm-dispatch";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const key = getRouterParam(event, "orderId");
  if (!key) throw createError({ statusCode: 400 });

  // orderNumber 또는 cuid 모두 허용
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: key }, { orderNumber: key }] },
    select: { id: true },
  });
  if (!order) throw createError({ statusCode: 404, statusMessage: "주문 없음" });

  const body = await readBody(event).catch(() => ({}));
  const resetAttempts = body?.resetAttempts === true;

  if (resetAttempts) {
    await prisma.orderItem.updateMany({
      where: { orderId: order.id, externalOrderId: null },
      data: { dispatchedAttempts: 0, dispatchError: null },
    });
  }

  const result = await dispatchOrderToProviders(order.id);
  return { ok: true, ...result };
});
