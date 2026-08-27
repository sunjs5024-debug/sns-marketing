// [임시] env(KAKAO_API_BASE/KEY) 로드 + 카카오 quota 도달 확인. 확인 후 삭제.
import { getKakaoQuota } from "../utils/kakao-order";
export default defineEventHandler(async () => {
  const base = process.env.KAKAO_API_BASE ?? null;
  const keySet = !!process.env.KAKAO_API_KEY;
  try {
    const quota = await getKakaoQuota();
    return { ok: true, base, keySet, quota };
  } catch (e) {
    return { ok: false, base, keySet, error: e instanceof Error ? e.message : String(e) };
  }
});
