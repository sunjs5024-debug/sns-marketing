// urpanel 전체 서비스 목록 (관리자 전용)
//   - query 로 검색·플랫폼·카테고리 필터링
//   - rate 는 per 1000 단위 USD
import { requireAdmin } from "../../../utils/session";
import { getUrpanelServices, type UrpanelService } from "../../../utils/urpanel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const q = (getQuery(event).q as string | undefined)?.trim().toLowerCase();
  const platform = (getQuery(event).platform as string | undefined)?.trim().toLowerCase();

  try {
    const all = await getUrpanelServices();
    if (!Array.isArray(all)) {
      return { ok: false, error: "예상치 못한 응답 형식", services: [] as UrpanelService[] };
    }

    let filtered = all;
    if (q) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
      );
    }
    if (platform) {
      filtered = filtered.filter((s) => s.category.toLowerCase().includes(platform));
    }

    return { ok: true, total: all.length, count: filtered.length, services: filtered.slice(0, 500) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg, services: [] };
  }
});
