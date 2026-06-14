// 이미 매핑된 옵션 + 매핑 추천된 옵션을 모두 보여주면서 가격 최적화 진단
//   - 매핑 O: urpanel 단가 알 수 있음 → 현재가 vs 추천가 비교
//   - 매핑 X but 추천 있음: 추천 서비스 단가로 계산
//   - 매핑 X and 추천 X: 제외
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";
import { getUrpanelServices } from "../../../utils/urpanel";
import { findBestMatch, type CandidateService } from "../../../utils/urpanel-matcher";

const USD_TO_KRW = 1400;

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  // urpanel 서비스 한번만 조회
  let services: CandidateService[] = [];
  const rateMap = new Map<number, { name: string; rate: number; category: string }>();
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
      for (const s of services) {
        rateMap.set(Number(s.service), {
          name: s.name,
          rate: parseFloat(s.rate),
          category: s.category,
        });
      }
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), items: [] };
  }

  // 모든 옵션 (매핑/미매핑 둘 다)
  const opts = await prisma.productOption.findMany({
    include: { product: { include: { category: true } } },
    orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
  });

  const items = opts.map((o) => {
    let serviceId: number | null = o.externalServiceId;
    let serviceName: string | null = null;
    let rate: number | null = null;
    let source: "mapped" | "suggested" | "none" = o.externalServiceId ? "mapped" : "none";

    if (serviceId) {
      const meta = rateMap.get(serviceId);
      if (meta) {
        serviceName = meta.name;
        rate = meta.rate;
      }
    } else {
      // 매핑 안 됨 — 추천 시도
      const match = findBestMatch(o.product.name, o.label, o.quantity, services);
      if (match.service && match.score >= 40) {
        serviceId = Number(match.service.service);
        serviceName = match.service.name;
        rate = parseFloat(match.service.rate);
        source = "suggested";
      }
    }

    const costUsd = rate !== null ? (rate * o.quantity) / 1000 : null;
    const costKrw = costUsd !== null ? costUsd * USD_TO_KRW : null;
    const marginPct = costKrw && o.price > 0 ? Math.round(((o.price - costKrw) / o.price) * 100) : null;

    return {
      optionId: o.id,
      productId: o.productId,
      productName: o.product.name,
      categoryName: o.product.category.name,
      platform: o.product.category.platform,
      optionLabel: o.label,
      quantity: o.quantity,
      currentPrice: o.price,
      source,
      serviceId,
      serviceName,
      rate,
      costUsd,
      costKrw,
      marginPct,
    };
  })
  .filter((item) => item.source !== "none");

  // 카운트
  const counts = {
    total: items.length,
    mapped: items.filter((i) => i.source === "mapped").length,
    suggested: items.filter((i) => i.source === "suggested").length,
    unprofitable: items.filter((i) => i.marginPct !== null && i.marginPct < 30).length,
  };

  return { ok: true, items, counts };
});
