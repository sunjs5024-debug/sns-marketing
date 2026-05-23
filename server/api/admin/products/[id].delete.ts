import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

// 주문 이력이 있으면 hard delete 시 OrderItem 무결성 깨짐 → 안전하게 isActive: false 로 soft delete
// query param ?hard=1 일 때만 hard delete 시도 (참조 없을 때만 성공)
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "id 없음" });
  const { hard } = getQuery(event);

  if (hard === "1") {
    const refs = await prisma.orderItem.count({ where: { productId: id } });
    if (refs > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "주문 이력이 있어 완전 삭제 불가. 비활성으로 처리하세요.",
      });
    }
    await prisma.product.delete({ where: { id } });
    return { deleted: true, mode: "hard" };
  }

  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return { deleted: true, mode: "soft" };
});
