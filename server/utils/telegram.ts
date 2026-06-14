// 어드민 텔레그램 봇 — 운영 알림 발송
//   - 환경변수: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
//   - 모든 알림은 fail-silent (텔레그램 장애가 본 서비스 영향 X)
//   - HTML 파싱 사용 (이모지 + <b>볼드</b> 지원)

const API = "https://api.telegram.org/bot";

function getConfig(): { token: string; chatId: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

/**
 * 텔레그램 채팅에 메시지 발송.
 * - 실패해도 throw 안 함 (운영 알림 실패가 본 서비스 영향 주면 안 됨)
 * - HTML 모드: <b>, <i>, <code>, <a> 허용 / 특수문자(< > &)는 escape 필요
 */
export async function sendTelegramMessage(text: string, options?: { silent?: boolean }): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미설정 — 알림 스킵");
    return false;
  }
  try {
    const res = await fetch(`${API}${cfg.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        disable_notification: options?.silent ?? false,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[telegram] 전송 실패", res.status, body.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[telegram] 전송 예외", e);
    return false;
  }
}

/** HTML 특수문자 escape */
export function tgEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 금액 포맷 (1234567 → 1,234,567원) */
export function fmtKRW(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

// ────────────────────────────────────────────────────────────────
// 알림 템플릿
// ────────────────────────────────────────────────────────────────

/** 신규 주문 (결제 대기 PENDING) */
export function notifyNewOrder(o: {
  orderNumber: string;
  buyerName: string;
  finalAmount: number;
  depositorName: string | null;
  itemCount: number;
  firstProductName: string;
}) {
  const msg = [
    "🆕 <b>신규 주문</b>",
    "",
    `📦 ${tgEscape(o.firstProductName)}${o.itemCount > 1 ? ` 외 ${o.itemCount - 1}건` : ""}`,
    `💰 ${fmtKRW(o.finalAmount)}`,
    `👤 ${tgEscape(o.buyerName)}${o.depositorName ? ` (입금자: ${tgEscape(o.depositorName)})` : ""}`,
    `🔢 <code>${o.orderNumber}</code>`,
    "",
    "⏳ <i>입금 대기 중</i>",
  ].join("\n");
  return sendTelegramMessage(msg);
}

/** 충전 자동 승인 */
export function notifyChargeApproved(c: {
  chargeNumber: string;
  amount: number;
  depositorName: string;
  userName: string;
}) {
  const msg = [
    "💰 <b>충전 자동 승인</b>",
    "",
    `💵 +${fmtKRW(c.amount)} → ${tgEscape(c.userName)}`,
    `📝 입금자: ${tgEscape(c.depositorName)}`,
    `🔢 <code>${c.chargeNumber}</code>`,
  ].join("\n");
  return sendTelegramMessage(msg, { silent: true });
}

/** 주문 자동 결제 완료 (SMS 매칭) */
export function notifyOrderPaid(o: {
  orderNumber: string;
  amount: number;
  depositorName: string;
  buyerName: string;
  itemCount: number;
}) {
  const msg = [
    "✅ <b>주문 결제 완료</b>",
    "",
    `💵 ${fmtKRW(o.amount)} 입금 매칭 OK`,
    `👤 ${tgEscape(o.buyerName)} (입금: ${tgEscape(o.depositorName)})`,
    `📦 ${o.itemCount}건 상품`,
    `🔢 <code>${o.orderNumber}</code>`,
    "",
    "🚀 <i>urpanel 자동 발주 진행</i>",
  ].join("\n");
  return sendTelegramMessage(msg);
}

/** SMS 받았는데 매칭 안 됨 (수동 확인 필요) */
export function notifySmsUnmatched(s: {
  bank: string | null;
  amount: number | null;
  depositor: string | null;
  raw: string;
}) {
  const msg = [
    "⚠️ <b>입금 SMS 미매칭</b>",
    "",
    `🏦 ${tgEscape(s.bank ?? "?")} | ${s.amount ? fmtKRW(s.amount) : "?"} | ${tgEscape(s.depositor ?? "?")}`,
    "",
    "<i>해당 금액·입금자명으로 대기 중인 충전/주문이 없습니다. 관리자 확인 필요.</i>",
    "",
    `<code>${tgEscape(s.raw.slice(0, 200))}</code>`,
  ].join("\n");
  return sendTelegramMessage(msg);
}

/** urpanel 발주 실패 (재시도 한계 도달 등) */
export function notifyDispatchFailed(d: {
  orderNumber: string;
  failed: number;
  errors: string[];
}) {
  const errs = d.errors.slice(0, 3).map((e) => `• ${tgEscape(e.slice(0, 100))}`).join("\n");
  const msg = [
    "🔴 <b>urpanel 발주 실패</b>",
    "",
    `📦 주문 <code>${d.orderNumber}</code>`,
    `❌ ${d.failed}건 실패`,
    "",
    "<b>에러:</b>",
    errs || "(없음)",
    "",
    "<i>어드민 → 발주현황에서 재시도 가능</i>",
  ].join("\n");
  return sendTelegramMessage(msg);
}

/** 발주 부분 성공/모두 성공 */
export function notifyDispatchOK(d: {
  orderNumber: string;
  dispatched: number;
  failed: number;
  skipped: number;
}) {
  if (d.dispatched === 0) return Promise.resolve(false); // 발주 0건이면 알림 X
  const msg = [
    "🚀 <b>urpanel 자동 발주 완료</b>",
    "",
    `📦 주문 <code>${d.orderNumber}</code>`,
    `✅ ${d.dispatched}건 발주 성공${d.failed > 0 ? ` · ❌ ${d.failed}건 실패` : ""}${d.skipped > 0 ? ` · ⏭ ${d.skipped}건 스킵` : ""}`,
  ].join("\n");
  return sendTelegramMessage(msg, { silent: true });
}

/** 일일 매출 요약 (cron으로 호출) */
export function notifyDailySummary(s: {
  date: string;
  orderCount: number;
  revenue: number;
  newUsers: number;
  completedCount: number;
}) {
  const msg = [
    "📊 <b>일일 매출 요약</b>",
    "",
    `📅 ${s.date}`,
    "",
    `🛒 신규 주문: ${s.orderCount}건`,
    `💰 매출: ${fmtKRW(s.revenue)}`,
    `✅ 완료 주문: ${s.completedCount}건`,
    `👤 신규 가입: ${s.newUsers}명`,
  ].join("\n");
  return sendTelegramMessage(msg);
}
