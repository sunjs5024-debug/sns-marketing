import { prisma } from "../../utils/prisma";
import { maskDbError } from "../../utils/db";

// DB 헬스체크 — 민감정보(DATABASE_URL·호스트·비밀번호·스택트레이스) 일절 미노출.
// 정상: 200 { ok:true, database:"reachable" }
// 장애: 503 { ok:false, database:"unavailable" } + Retry-After
export default defineEventHandler(async (event) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, database: "reachable" };
  } catch (e) {
    console.error("[health/db] unreachable:", maskDbError(e));
    setResponseStatus(event, 503);
    setResponseHeader(event, "Retry-After", "120");
    return { ok: false, database: "unavailable" };
  }
});
