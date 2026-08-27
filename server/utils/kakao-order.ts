// 카카오 주문 API 클라이언트 (외부 카카오 관제탑 — 블랙박스로 소비만)
//   문서: 새로운 8.txt / api_119.md
//   요청/응답 = JSON, 인증 = 헤더 X-Api-Key
//
// 환경변수:
//   KAKAO_API_BASE — 카카오 서버 공개 주소 (예: https://xxxx.trycloudflare.com 또는 고정도메인)
//   KAKAO_API_KEY  — kak_live_...
//
// urpanel.ts 와 대칭 구조. dispatchOrderToProviders 가 externalProvider==="kakao" 일 때 호출.

export type KakaoCommand =
  | "like"           // 오픈채팅 좋아요
  | "join"           // 오픈방 입장 (+nickname/nicknames)
  | "channel_add"    // 채널 친구추가
  | "channel_fav"    // 채널 즐겨찾기
  | "post_like"      // 채널 게시글 좋아요
  | "post_share"     // 채널 게시글 공유
  | "short_like"     // 숏폼 좋아요
  | "short_comment"  // 숏폼 댓글 (+comment/comments)
  | "short_bookmark" // 숏폼 북마크
  | "short_share"    // 숏폼 공유
  | "shopping"       // 쇼핑 찜 (전체 레퍼런스에만 존재)
  | "gift";          // 선물 찜

export const KAKAO_COMMANDS: KakaoCommand[] = [
  "like", "join", "channel_add", "channel_fav",
  "post_like", "post_share",
  "short_like", "short_comment", "short_bookmark", "short_share",
  "shopping", "gift",
];

export type KakaoAddOrderResponse = {
  order_id: string;
  state?: string; // queued
  links?: { self?: string; logs?: string; events?: string };
  error?: string;
};

export type KakaoOrderProgress = {
  total: number;    // 실제 확보한 계정 수 (requested 보다 작을 수 있음)
  success: number;
  fail: number;
  banned?: number;
  pending: number;
};

export type KakaoOrderStatus = {
  id: string;
  kind?: string;    // command
  state: string;    // queued | running | done | cancelled | ...
  requested?: number;
  progress?: KakaoOrderProgress;
  created?: number;
  updated?: number;
  finished?: number | null;
  error?: string | null;
};

export type KakaoQuota = { balance?: number; unlimited?: boolean; used?: number; error?: string };

function getConfig() {
  const base = (process.env.KAKAO_API_BASE ?? "").replace(/\/+$/, "");
  const key = process.env.KAKAO_API_KEY;
  if (!base) throw new Error("KAKAO_API_BASE 환경변수가 설정되어 있지 않습니다.");
  if (!key) throw new Error("KAKAO_API_KEY 환경변수가 설정되어 있지 않습니다.");
  return { base, key };
}

async function callApi<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const { base, key } = getConfig();
  const res = await fetch(`${base}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "X-Api-Key": key,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`kakao: invalid JSON response (${res.status}) — ${text.slice(0, 200)}`);
    }
  }

  // 4xx/5xx → 에러 (문서: 400 invalid_request / 401 invalid_api_key / 404 / 409 / 429 insufficient_credits·rate_limited)
  if (!res.ok) {
    const errCode =
      json && typeof json === "object" && "error" in json
        ? String((json as { error: unknown }).error)
        : `http_${res.status}`;
    const detail = json && typeof json === "object" ? JSON.stringify(json).slice(0, 200) : "";
    throw new Error(`kakao ${path} ${res.status} ${errCode} ${detail}`);
  }

  return json as T;
}

// ────────────────────────────────────────────────────────────────
// 공개 API
// ────────────────────────────────────────────────────────────────

/** 연결 확인 */
export function kakaoHealth() {
  return callApi<{ ok?: boolean } | string>("/health");
}

/** 내 크레딧 잔액·사용량 */
export function getKakaoQuota() {
  return callApi<KakaoQuota>("/api/v1/quota");
}

/** 현재 액션 비용표 */
export function getKakaoCosts() {
  return callApi<Record<string, number> | unknown>("/api/v1/costs");
}

/** 오픈챗 링크 조회 (무료·크레딧 미차감) */
export function kakaoLinkcheck(link: string) {
  return callApi<{
    ok: boolean; valid: boolean; member?: number; member_max?: number;
    like?: number; title?: string; locked?: boolean; type?: string; detail?: string;
  }>("/api/v1/linkcheck", { method: "POST", body: { link } });
}

/** 신규 주문 생성 → { order_id } (크레딧 선차감, 부족분은 종료 시 자동 환불) */
export function addKakaoOrder(params: {
  command: KakaoCommand | string;
  count: number;
  target: string;
  nickname?: string;
  nicknames?: string[];
  comment?: string;
  comments?: string[];
  idempotencyKey?: string;
}) {
  const { idempotencyKey, ...body } = params;
  return callApi<KakaoAddOrderResponse>("/api/v1/orders", {
    method: "POST",
    body,
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  });
}

/** 단일 주문 상태 */
export function getKakaoOrderStatus(orderId: string) {
  return callApi<KakaoOrderStatus>(`/api/v1/orders/${encodeURIComponent(orderId)}`);
}

/** 주문 취소 — 성공한 만큼만 차감, 나머지 환불 (best-effort) */
export function cancelKakaoOrder(orderId: string) {
  return callApi<unknown>(`/api/v1/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
}

// ────────────────────────────────────────────────────────────────
// 상태 매핑 — 카카오 state/progress → 사이트 공통 externalStatus 어휘
//   (urpanel 과 통일: "Pending" | "In progress" | "Completed" | "Cancelled" | "Partial")
//   → 기존 완료판정(markCompletedOrders: externalStatus==="Completed") 로직 재사용
// ────────────────────────────────────────────────────────────────
export function mapKakaoStatus(st: KakaoOrderStatus): {
  status: "Pending" | "In progress" | "Completed" | "Cancelled" | "Partial";
  remains: number | null;
  startCount: number | null;
} {
  const s = (st.state ?? "").toLowerCase();
  const p = st.progress;
  const pending = p?.pending ?? null;
  const success = p?.success ?? 0;
  const requested = st.requested ?? p?.total ?? 0;

  let status: "Pending" | "In progress" | "Completed" | "Cancelled" | "Partial";
  if (s === "cancelled" || s === "canceled") {
    status = "Cancelled";
  } else if (st.finished || s === "done" || s === "completed" || s === "finished" || s === "success") {
    // 종료됨 — 목표 다 채웠으면 Completed, 못 채우고 끝났으면 Partial(계정부족 등, 나머지는 환불됨)
    status = requested > 0 && success < requested ? "Partial" : "Completed";
  } else if (s === "queued" || s === "pending") {
    status = "Pending";
  } else {
    status = "In progress";
  }

  return {
    status,
    remains: pending,
    startCount: null,
  };
}

/** 종료(더 이상 동기화 불필요) 상태인가 */
export function isKakaoTerminal(status: string): boolean {
  return status === "Completed" || status === "Cancelled" || status === "Partial";
}
