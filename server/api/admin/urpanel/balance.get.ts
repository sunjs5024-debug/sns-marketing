// urpanel 잔액 조회 (관리자 전용)
import { requireAdmin } from "../../../utils/session";
import { getUrpanelBalance } from "../../../utils/urpanel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  try {
    const data = await getUrpanelBalance();
    return { ok: true, balance: data.balance ?? "0", currency: data.currency ?? "USD" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
});
