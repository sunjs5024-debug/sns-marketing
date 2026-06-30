// 네이버 OAuth 콜백 (엣지용 수동 처리).
import { handleOAuthCallback } from "../../../utils/oauth";

export default defineEventHandler((event) => handleOAuthCallback(event, "naver"));
