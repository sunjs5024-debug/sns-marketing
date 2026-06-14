// 옵션 가격 일괄 변경 (매핑 변경 없음 — 가격만)
//   - source="suggested" 인 옵션의 경우 매핑까지 같이 적용 가능 (옵션)
import { z } from "zod";
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

const schema = z.object({
  updates: z.array(
    z.object({
      optionId: z.string().min(1),
      newPrice: z.number().int().min(1),
      // 가격 적용 시 매핑까지 함께 (suggested 옵션)
      mapServiceId: z.number().int().min(1).optional(),
    }),
  ),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }

  let priceUpdated = 0;
  let mapped = 0;
  for (const u of parsed.data.updates) {
    const data: Record<string, unknown> = { price: u.newPrice };
    if (typeof u.mapServiceId === "number") {
      data.externalProvider = "urpanel";
      data.externalServiceId = u.mapServiceId;
      mapped++;
    }
    await prisma.productOption.update({ where: { id: u.optionId }, data });
    priceUpdated++;
  }
  return { ok: true, priceUpdated, mapped };
});
