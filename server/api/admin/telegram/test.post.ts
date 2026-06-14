// 어드민 — 텔레그램 봇 테스트 메시지 발송
import { requireAdmin } from "../../../utils/session";
import { sendTelegramMessage } from "../../../utils/telegram";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const ok = await sendTelegramMessage(
    `🧪 <b>SNS소셜팩토리 운영봇 테스트</b>\n\n알림이 정상적으로 도착했다면 셋업 완료입니다 ✓\n\n시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
  );
  return { ok };
});
