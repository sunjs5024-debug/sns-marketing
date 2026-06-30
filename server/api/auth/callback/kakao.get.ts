// 카카오 OAuth 콜백 (엣지용 수동 처리). credentials 콜백과 경로 충돌 방지를 위해 명시 파일로 분리.
import { handleOAuthCallback } from "../../../utils/oauth";

export default defineEventHandler((event) => handleOAuthCallback(event, "kakao"));
