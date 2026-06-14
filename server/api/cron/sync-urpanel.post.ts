// 5분 주기 cron — urpanel 발주된 주문의 진행 상태 동기화
//   인증: X-CRON-SECRET 헤더 = .env 의 CRON_SECRET 와 일치해야 함
//   호출: GitHub Actions 또는 외부 cron 서비스
import { syncUrpanelStatuses } from "../../utils/smm-dispatch";

export default defineEventHandler(async (event) => {
  const expected = process.env.CRON_SECRET;
  if (!expected) throw createError({ statusCode: 500, statusMessage: "CRON_SECRET 미설정" });
  const provided = getHeader(event, "x-cron-secret");
  if (provided !== expected) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  try {
    const result = await syncUrpanelStatuses();
    return { ok: true, ...result, at: new Date().toISOString() };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
});
