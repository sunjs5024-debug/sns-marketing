// 안드로이드 SMS Forwarder → 우리 서버로 입금 SMS 전달 받기
//   인증: X-SMS-Token 헤더에 .env 의 SMS_WEBHOOK_SECRET 일치해야 함
//   바디 형식 (자유):
//     { from: "1577-1234", text: "[국민] 100,000원 입금 홍길동님 잔액 ..." }
//     또는 form-urlencoded 도 처리
import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { dispatchOrderToProviders } from "../../../utils/smm-dispatch";
import {
  notifyChargeApproved,
  notifyOrderPaid,
  notifySmsUnmatched,
  notifyDispatchOK,
  notifyDispatchFailed,
} from "../../../utils/telegram";

const schema = z.object({
  from: z.string().optional(),
  text: z.string().min(1).max(2000),
});

// ────────────────────────────────────────────────────────────────
// 한국 주요 은행 SMS 파서 — 금액 + 입금자명 추출
// ────────────────────────────────────────────────────────────────
function parseBankSms(raw: string): { bank: string | null; amount: number | null; depositor: string | null } {
  // 은행명 감지 (선택)
  const bankMatch = raw.match(/\[([가-힣A-Z]{1,8}(?:은행|뱅크)?)\]/);
  const bank = bankMatch?.[1] ?? null;

  // 금액 — 1순위 "N원"(예: "100,000원"), 2순위 "입금" 직후 숫자(KB 압축형: "입금\n2\n잔액3")
  let amount: number | null = null;
  const amountWon = raw.match(/([\d,]{1,15})\s*원/);
  if (amountWon) {
    amount = parseInt(amountWon[1]!.replace(/,/g, ""), 10);
  } else {
    // "입금" 뒤(공백/줄바꿈 몇 개 건너) 처음 나오는 숫자 = 금액. 계좌번호는 "입금" 앞이라 안 잡힘.
    const amountAfter = raw.match(/입금[^\d]{0,5}([\d,]{1,15})/);
    if (amountAfter) amount = parseInt(amountAfter[1]!.replace(/,/g, ""), 10);
  }

  // 입금자명 — 한국 주요 은행 SMS 패턴 (여러 시도)
  //   "김선민\n입금"(KB 압축형), "입금 홍길동", "홍길동님", "[홍길동]", "홍길동 잔액"
  //   ⚠️ 영문 입금자명("Next" 등)도 있어 한글 전용으로 두면 매칭 실패 → 영문·숫자 혼합 허용
  const patterns: RegExp[] = [
    /([가-힣A-Za-z0-9]{2,12})\s*[\r\n]+\s*입금/, // 이름이 "입금" 윗줄 (KB 압축형) — 영문·숫자 포함
    /(?:입금|이체|타행이체)\s+([가-힣A-Za-z]{2,10})/,
    /([가-힣A-Za-z]{2,10})\s*님/,
    /([가-힣A-Za-z0-9]{2,12})\s+잔액/,
    /\(([가-힣A-Za-z0-9]{2,12})\)/,
    /\[([가-힣A-Za-z0-9]{2,12})\]\s+(?:입금|이체)/,
  ];
  const BANNED = ["입금", "이체", "출금", "잔액", "예금", "통장", "Web발신"];
  let depositor: string | null = null;
  for (const p of patterns) {
    const m = raw.match(p);
    if (m?.[1]) {
      const candidate = m[1].trim();
      // 은행명·의미 없는 단어 제외 + 숫자/기호 뿐인 조각(계좌번호·금액) 배제
      if (BANNED.includes(candidate)) continue;
      if (/^[\d,.\-*]+$/.test(candidate)) continue;
      depositor = candidate;
      break;
    }
  }

  // 후처리 — 일관된 매칭을 위해 호칭(님/씨) 제거
  if (depositor) {
    depositor = depositor.replace(/(님|씨)$/, "").trim();
  }

  return { bank, amount, depositor };
}

export default defineEventHandler(async (event) => {
  // 인증
  const expectedToken = process.env.SMS_WEBHOOK_SECRET;
  if (!expectedToken) {
    throw createError({ statusCode: 500, statusMessage: "서버 SMS_WEBHOOK_SECRET 미설정" });
  }
  const provided = getHeader(event, "x-sms-token") || getQuery(event).token;
  if (provided !== expectedToken) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  // 바디 파싱 — JSON 또는 form-urlencoded 모두 지원
  let body: { from?: string; text?: string } = {};
  try {
    body = (await readBody(event)) as typeof body;
  } catch {
    // form-urlencoded fallback (일부 SMS 앱)
    const raw = await readRawBody(event);
    if (typeof raw === "string") {
      const params = new URLSearchParams(raw);
      body = { from: params.get("from") ?? undefined, text: params.get("text") ?? undefined };
    }
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "잘못된 SMS 형식" });
  }

  const { bank, amount, depositor } = parseBankSms(parsed.data.text);

  // 1) SMS 로그 저장 (매칭 여부 무관)
  const sms = await prisma.bankSms.create({
    data: {
      sender: parsed.data.from ?? null,
      rawMessage: parsed.data.text,
      parsedBank: bank,
      parsedAmount: amount,
      parsedDepositor: depositor,
    },
  });

  // 2) 매칭 시도 — 금액 + 입금자명 둘 다 파싱돼야 시도
  if (amount && depositor) {
    // 2-A) Charge 매칭 (포인트 충전)
    const chargeCandidate = await prisma.charge.findFirst({
      where: {
        status: "PENDING",
        amount,
        // 영문 입금자명 대비 대소문자 무시 매칭 (Next / NEXT / next 동일 처리)
        depositorName: { equals: depositor, mode: "insensitive" },
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "asc" },
    });

    if (chargeCandidate) {
      await prisma.$transaction([
        prisma.charge.update({
          where: { id: chargeCandidate.id },
          data: {
            status: "APPROVED",
            bankReceivedAt: new Date(),
            approvedAt: new Date(),
            matchedSmsId: sms.id,
          },
        }),
        prisma.user.update({
          where: { id: chargeCandidate.userId },
          data: { points: { increment: chargeCandidate.amount } },
        }),
        prisma.bankSms.update({
          where: { id: sms.id },
          data: { matchedChargeId: chargeCandidate.id },
        }),
      ]);

      // 어드민 알림 (사용자명 fetch 후)
      const user = await prisma.user.findUnique({ where: { id: chargeCandidate.userId }, select: { name: true } });
      notifyChargeApproved({
        chargeNumber: chargeCandidate.chargeNumber,
        amount: chargeCandidate.amount,
        depositorName: chargeCandidate.depositorName,
        userName: user?.name ?? "(알 수 없음)",
      }).catch(() => {});

      return { ok: true, matched: true, type: "charge", chargeId: chargeCandidate.id, chargeNumber: chargeCandidate.chargeNumber };
    }

    // 2-B) Order 매칭 (주문 직접 결제)
    const orderCandidate = await prisma.order.findFirst({
      where: {
        status: "PENDING",
        paymentMethod: "TRANSFER",
        finalAmount: amount,
        // 영문 입금자명 대비 대소문자 무시 매칭
        depositorName: { equals: depositor, mode: "insensitive" },
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "asc" },
    });

    if (orderCandidate) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderCandidate.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            matchedSmsId: sms.id,
          },
        }),
        // 주문 결제 완료 시 장바구니 비우기
        prisma.cartItem.deleteMany({ where: { userId: orderCandidate.userId } }),
        prisma.bankSms.update({
          where: { id: sms.id },
          data: { matchedChargeId: `order:${orderCandidate.id}` }, // 감사용
        }),
      ]);

      // 어드민 알림 — 결제 완료
      const itemCount = await prisma.orderItem.count({ where: { orderId: orderCandidate.id } });
      notifyOrderPaid({
        orderNumber: orderCandidate.orderNumber,
        amount: orderCandidate.finalAmount,
        depositorName: orderCandidate.depositorName ?? "(?)",
        buyerName: orderCandidate.buyerName,
        itemCount,
      }).catch(() => {});

      // 결제 완료 직후 외부 SMM 패널로 자동 발주
      let dispatch: Awaited<ReturnType<typeof dispatchOrderToProviders>> | null = null;
      try {
        dispatch = await dispatchOrderToProviders(orderCandidate.id);
      } catch (e) {
        console.error("[sms-webhook] dispatch 실패", e);
      }

      // 발주 결과 알림
      if (dispatch) {
        if (dispatch.failed > 0) {
          notifyDispatchFailed({
            orderNumber: orderCandidate.orderNumber,
            failed: dispatch.failed,
            errors: dispatch.errors,
          }).catch(() => {});
        } else if (dispatch.dispatched > 0) {
          notifyDispatchOK({
            orderNumber: orderCandidate.orderNumber,
            dispatched: dispatch.dispatched,
            failed: dispatch.failed,
            skipped: dispatch.skipped,
          }).catch(() => {});
        }
      }

      return {
        ok: true,
        matched: true,
        type: "order",
        orderId: orderCandidate.id,
        orderNumber: orderCandidate.orderNumber,
        dispatch,
      };
    }
  }

  // 매칭 안 됨 + 파싱은 됐는데 매칭 후보 없음 → 어드민 알림
  if (amount && depositor) {
    notifySmsUnmatched({
      bank,
      amount,
      depositor,
      raw: parsed.data.text,
    }).catch(() => {});
  }

  // 매칭 안 됨 — SMS 만 로그됨 (관리자가 수동 처리 가능)
  return { ok: true, matched: false, parsed: { bank, amount, depositor } };
});
