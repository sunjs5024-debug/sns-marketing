// [임시·테스트 전용] Cloudflare 엣지에서 카카오 API(:8091 http)에 실제로 닿는지 검증. 확인 후 삭제.
export default defineEventHandler(async () => {
  const url = "http://1.234.5.11:8091/health";
  const started = Date.now();
  try {
    const res = await fetch(url);
    const text = await res.text();
    return { ok: true, reached: true, status: res.status, ms: Date.now() - started, body: text.slice(0, 200) };
  } catch (e) {
    return {
      ok: false,
      reached: false,
      ms: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
      note: "Cloudflare Worker fetch 가 :8091 로 연결 못 하면 여기로 떨어짐",
    };
  }
});
