// 어드민이 수동으로 동기화 한번 트리거 (cron 기다리지 않고)
import { requireAdmin } from "../../../utils/session";
import { syncUrpanelStatuses } from "../../../utils/smm-dispatch";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const result = await syncUrpanelStatuses();
  return { ok: true, ...result };
});
