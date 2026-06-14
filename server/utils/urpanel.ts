// urpanel SMM Panel API 클라이언트
//   문서: https://urpanel.com/api
//   요청은 항상 POST + form-encoded (action + key 필수)
//
// 환경변수:
//   URPANEL_API_URL — https://urpanel.com/api/v2
//   URPANEL_API_KEY — 32자 영문/숫자

export type UrpanelService = {
  service: number | string; // service ID
  name: string;
  type: string;             // Default | Custom Comments | Package | ...
  category: string;
  rate: string;             // per 1000 단위 (USD)
  min: string;
  max: string;
  refill?: boolean;
  cancel?: boolean;
};

export type UrpanelAddOrderResponse = {
  order?: number;
  error?: string;
};

export type UrpanelOrderStatus = {
  charge?: string;
  start_count?: string;
  status?: "Pending" | "In progress" | "Processing" | "Completed" | "Partial" | "Cancelled";
  remains?: string;
  currency?: string;
  error?: string;
};

export type UrpanelBalanceResponse = {
  balance?: string;
  currency?: string;
  error?: string;
};

function getConfig() {
  const url = process.env.URPANEL_API_URL ?? "https://urpanel.com/api/v2";
  const key = process.env.URPANEL_API_KEY;
  if (!key) {
    throw new Error("URPANEL_API_KEY 환경변수가 설정되어 있지 않습니다.");
  }
  return { url, key };
}

/**
 * 모든 urpanel API 호출의 공통 처리
 * - POST + application/x-www-form-urlencoded
 * - 응답이 JSON 이고 { error: "..." } 면 throw
 */
async function callApi<T = unknown>(action: string, extra: Record<string, string | number> = {}): Promise<T> {
  const { url, key } = getConfig();
  const body = new URLSearchParams();
  body.set("key", key);
  body.set("action", action);
  for (const [k, v] of Object.entries(extra)) {
    body.set(k, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  // urpanel은 200 OK 안에 { error } 반환하기도 함
  let json: unknown;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`urpanel: invalid JSON response — ${text.slice(0, 200)}`);
  }

  if (json && typeof json === "object" && "error" in json && (json as { error: unknown }).error) {
    throw new Error(`urpanel ${action} error: ${String((json as { error: unknown }).error)}`);
  }

  return json as T;
}

// ────────────────────────────────────────────────────────────────
// 공개 API
// ────────────────────────────────────────────────────────────────

/** 잔액 조회 — { balance, currency } */
export function getUrpanelBalance() {
  return callApi<UrpanelBalanceResponse>("balance");
}

/** 전체 서비스 목록 */
export function getUrpanelServices() {
  return callApi<UrpanelService[]>("services");
}

/** 신규 주문 생성 */
export function addUrpanelOrder(params: {
  service: number | string;
  link: string;
  quantity: number;
}) {
  return callApi<UrpanelAddOrderResponse>("add", params as Record<string, string | number>);
}

/** 단일 주문 상태 */
export function getUrpanelOrderStatus(order: number | string) {
  return callApi<UrpanelOrderStatus>("status", { order });
}

/** 다중 주문 상태 (최대 100개) */
export function getUrpanelOrdersStatus(orders: Array<number | string>) {
  if (orders.length === 0) return Promise.resolve({} as Record<string, UrpanelOrderStatus>);
  return callApi<Record<string, UrpanelOrderStatus>>("status", { orders: orders.join(",") });
}

/** 주문 취소 (최대 100개) */
export function cancelUrpanelOrders(orders: Array<number | string>) {
  return callApi<Array<{ order: number; cancel?: { error?: string } }>>("cancel", { orders: orders.join(",") });
}

/** 환불 요청 (refill) — 손실분 자동 보충 */
export function refillUrpanelOrder(order: number | string) {
  return callApi<{ refill?: number; error?: string }>("refill", { order });
}
