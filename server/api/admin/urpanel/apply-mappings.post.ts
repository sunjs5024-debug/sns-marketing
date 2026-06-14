// 선택한 매핑 일괄 적용
//   - mappings: optionId + serviceId 매핑 적용
//   - autoPriceMarkup: 옵션 가격도 (원가 × markup) 로 자동 조정
//     예) 1.0 = 변경 안 함, 2.0 = 마진율 100% (원가의 2배)
import { z } from "zod";
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

const USD_TO_KRW = 1400;

const schema = z.object({
  mappings: z.array(
    z.object({
      optionId: z.string().min(1),
      serviceId: z.number().int().min(1),
      // costUsd 는 클라이언트에서 미리 계산된 값 (UI 표시와 동일하게 보장)
      costUsd: z.number().min(0).optional(),
    }),
  ),
  // 가격 자동 조정 마크업 (예: 2.0 = 원가 × 2)
  autoPriceMarkup: z.number().min(0).max(20).optional(),
});

function roundPrice(n: number): number {
  // 100원 단위 반올림, 최소 100원
  return Math.max(100, Math.round(n / 100) * 100);
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }

  const { mappings, autoPriceMarkup } = parsed.data;
  const applyPrice = typeof autoPriceMarkup === "number" && autoPriceMarkup > 0;

  let applied = 0;
  let priceUpdated = 0;
  for (const m of mappings) {
    const data: Record<string, unknown> = {
      externalProvider: "urpanel",
      externalServiceId: m.serviceId,
    };
    if (applyPrice && typeof m.costUsd === "number") {
      const newPriceKrw = roundPrice(m.costUsd * USD_TO_KRW * autoPriceMarkup!);
      data.price = newPriceKrw;
      priceUpdated++;
    }
    await prisma.productOption.update({ where: { id: m.optionId }, data });
    applied++;
  }
  return { ok: true, applied, priceUpdated };
});
