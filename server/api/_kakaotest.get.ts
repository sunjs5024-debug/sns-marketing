// [임시·테스트 전용] Cloudflare 엣지 → 카카오 고정 터널(https) 도달 검증. 확인 후 삭제.
export default defineEventHandler(async () => {
  const url = "https://kakao-api.xn--sns-yg9lh0pw9l.kr/health";
  const started = Date.now();
  try {
    const res = await fetch(url);
    const text = await res.text();
    return { ok: true, reached: true, status: res.status, ms: Date.now() - started, body: text.slice(0, 200) };
  } catch (e) {
    return { ok: false, reached: false, ms: Date.now() - started, error: e instanceof Error ? e.message : String(e) };
  }
});
