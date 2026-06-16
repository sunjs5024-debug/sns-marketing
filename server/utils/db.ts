import type { H3Event } from "h3";

// DB 일시 장애(쿼터 초과·연결 실패·타임아웃)를 "진짜 데이터 없음"과 구분하기 위한 판별기.
// Neon 쿼터 초과는 HTTP 402, 어댑터는 DriverAdapterError 로 표면화된다.
export function isDbUnavailable(e: unknown): boolean {
  const err = e as { name?: string; code?: string; message?: string } | undefined;
  if (!err) return false;
  if (err.name === "DriverAdapterError") return true;
  // Prisma 초기화/연결 계열 코드
  if (err.code && /^P10\d\d$/.test(err.code)) return true; // P1000~P1099 (인증·연결·타임아웃)
  const msg = String(err.message ?? "");
  return /compute time quota|exceeded|HTTP status 402|Payment Required|Can't reach database|can't reach|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|connection (terminated|refused|closed)|too many connections|timed? ?out/i.test(
    msg,
  );
}

// 에러 메시지에서 접속 URL/자격증명 흔적을 제거(로그·응답 어디에도 노출 금지).
export function maskDbError(e: unknown): string {
  const msg = String((e as { message?: string })?.message ?? e ?? "unknown");
  return msg
    .replace(/postgres(?:ql)?:\/\/[^\s"']*/gi, "postgres://***")
    .replace(/\/\/[^@\s]*@/g, "//***@")
    .slice(0, 200);
}

// 일시 DB 장애 → 503 + Retry-After. 검색엔진엔 "나중에 다시 와라" 신호.
// 로그엔 마스킹된 사유만 남긴다(접속정보 미노출).
export function throwDbUnavailable(event: H3Event, e: unknown): never {
  console.error("[db] unavailable:", maskDbError(e));
  setResponseHeader(event, "Retry-After", "120");
  throw createError({
    statusCode: 503,
    statusMessage: "Service Unavailable",
    message: "데이터베이스가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.",
  });
}
