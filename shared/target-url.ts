// 작업 대상 URL 정리 — 클라이언트·서버 공용.
//
// SMM 패널(urpanel 등)은 링크에 붙은 추적 파라미터("?utm_source=...&igsh=...")를
// 게시물 주소의 일부로 오인해 "해당 게시물 없음" 상태로 발주가 멈추는 경우가 많다.
// (실제로 인스타 좋아요·댓글 주문이 이 때문에 24시간 이상 멈춘 사례 있음)
// → 주문 저장·발주 전에 항상 이 함수로 꼬리표를 제거한다.

export function cleanTargetUrl(raw: string | null | undefined): string {
  let u = (raw ?? "").trim();
  if (!u) return "";
  // 쿼리스트링(?)·프래그먼트(#) 제거
  u = u.split("#")[0]!.split("?")[0]!.trim();
  return u;
}

// 최소 유효성 — 비어있지 않은지 (계정 아이디만 넣는 경우도 허용하므로 형식은 느슨하게)
export function isValidTargetUrl(raw: string | null | undefined): boolean {
  return cleanTargetUrl(raw).length >= 3;
}
