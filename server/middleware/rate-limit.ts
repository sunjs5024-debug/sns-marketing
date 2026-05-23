// IP 기반 in-memory rate limiter (single instance node-server)
// — 경로별로 다른 limit 적용 (auth 엄격, 일반 API 느슨, 정적 자원 면제)
// — 1분 슬라이딩 윈도우, 메모리만 사용 (재시작 시 초기화 OK — 어뷰징은 보통 burst 형태)

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// 주기적으로 만료된 bucket 청소 (메모리 누수 방지)
const CLEANUP_INTERVAL = 5 * 60_000; // 5분
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

type Rule = { pattern: RegExp; limit: number; windowMs: number; label: string };

const RULES: Rule[] = [
  // 인증 — 무차별 대입 방지
  { pattern: /^\/api\/auth\/callback\/credentials/, limit: 10, windowMs: 60_000, label: "auth-login" },
  { pattern: /^\/api\/auth\/signup/, limit: 5, windowMs: 60_000, label: "auth-signup" },
  { pattern: /^\/api\/auth\//, limit: 30, windowMs: 60_000, label: "auth-other" },
  // 주문 / 결제 — 비정상 폭주 차단
  { pattern: /^\/api\/orders\/.+\/pay/, limit: 10, windowMs: 60_000, label: "pay" },
  { pattern: /^\/api\/orders\/create/, limit: 20, windowMs: 60_000, label: "order-create" },
  { pattern: /^\/api\/cart\//, limit: 60, windowMs: 60_000, label: "cart" },
  // 관리자 API — 일반 트래픽 아니라 한도 높게
  { pattern: /^\/api\/admin\//, limit: 120, windowMs: 60_000, label: "admin" },
  // 그 외 API
  { pattern: /^\/api\//, limit: 120, windowMs: 60_000, label: "api-default" },
];

function getClientIp(event: ReturnType<typeof useEvent>): string {
  const h = getRequestHeaders(event);
  // Cloudflare → Apache → Nitro 순으로 헤더 우선순위
  return (
    (h["cf-connecting-ip"] as string | undefined) ||
    (h["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    (h["x-real-ip"] as string | undefined) ||
    event.node.req.socket.remoteAddress ||
    "unknown"
  );
}

function useEvent() {
  // dummy for type — 실제 event 는 defineEventHandler 안에서 받음
  return null as unknown as Parameters<Parameters<typeof defineEventHandler>[0]>[0];
}

export default defineEventHandler((event) => {
  const url = event.path ?? "";

  // 정적 자원·sitemap·robots·favicon 등은 면제
  if (!url.startsWith("/api/")) return;

  // 적용할 룰 찾기 (첫 매치만)
  const rule = RULES.find((r) => r.pattern.test(url));
  if (!rule) return;

  const ip = (() => {
    const h = getRequestHeaders(event);
    return (
      (h["cf-connecting-ip"] as string | undefined) ||
      (h["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      (h["x-real-ip"] as string | undefined) ||
      event.node.req.socket.remoteAddress ||
      "unknown"
    );
  })();

  const now = Date.now();
  cleanup(now);

  const key = `${rule.label}:${ip}`;
  const b = buckets.get(key);

  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    setHeader(event, "X-RateLimit-Limit", rule.limit);
    setHeader(event, "X-RateLimit-Remaining", rule.limit - 1);
    return;
  }

  b.count++;
  const remaining = Math.max(0, rule.limit - b.count);
  setHeader(event, "X-RateLimit-Limit", rule.limit);
  setHeader(event, "X-RateLimit-Remaining", remaining);
  setHeader(event, "X-RateLimit-Reset", Math.ceil(b.resetAt / 1000));

  if (b.count > rule.limit) {
    const retryAfter = Math.ceil((b.resetAt - now) / 1000);
    setHeader(event, "Retry-After", retryAfter);
    throw createError({
      statusCode: 429,
      statusMessage: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    });
  }
});
