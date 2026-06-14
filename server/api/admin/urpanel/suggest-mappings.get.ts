// 매핑 안 된 모든 옵션에 대해 urpanel 자동 추천
//   - 어드민이 화면에서 검토 → bulk-apply 로 일괄 저장
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";
import { getUrpanelServices } from "../../../utils/urpanel";
import { findBestMatch, type CandidateService } from "../../../utils/urpanel-matcher";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  // 매핑 안 된 옵션만
  const options = await prisma.productOption.findMany({
    where: { externalServiceId: null },
    include: { product: { include: { category: true } } },
    orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
  });

  // urpanel 서비스 목록 한번만 조회
  let services: CandidateService[] = [];
  try {
    const raw = await getUrpanelServices();
    if (Array.isArray(raw)) {
      services = raw.map((s) => ({
        service: s.service,
        name: s.name,
        category: s.category,
        rate: s.rate,
        min: s.min,
        max: s.max,
      }));
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), suggestions: [] };
  }

  // 각 옵션마다 best match
  const suggestions = options.map((opt) => {
    const match = findBestMatch(
      opt.product.name,
      opt.label,
      opt.quantity,
      services,
    );
    return {
      optionId: opt.id,
      productId: opt.productId,
      productName: opt.product.name,
      categoryName: opt.product.category.name,
      platform: opt.product.category.platform,
      optionLabel: opt.label,
      quantity: opt.quantity,
      sellPrice: opt.price,
      suggested: match.service
        ? {
            serviceId: Number(match.service.service),
            serviceName: match.service.name,
            rate: match.service.rate, // USD per 1000
            category: match.service.category,
            score: match.score,
            reasons: match.reasons,
            // 원가 계산 (옵션 수량 기준)
            costUsd: (parseFloat(match.service.rate) * opt.quantity) / 1000,
          }
        : null,
      reasons: match.reasons,
    };
  });

  // 카운트 요약
  const matched = suggestions.filter((s) => s.suggested).length;
  const unmatched = suggestions.length - matched;

  return {
    ok: true,
    total: options.length,
    matched,
    unmatched,
    suggestions,
  };
});
