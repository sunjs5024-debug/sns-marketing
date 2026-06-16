import { prisma } from "../utils/prisma";
import { isDbUnavailable, maskDbError } from "../utils/db";

// 사이트맵 요청에 한해 DB 가용성을 먼저 확인한다.
// @nuxtjs/sitemap 은 sources 핸들러가 throw 해도 그 소스만 건너뛰고 "상품 빠진 사이트맵"을
// 200 으로 내보낸다. 불완전 사이트맵 신규 발행을 막기 위해, DB 장애 시 사이트맵 생성 자체를 503 으로 처리.
export default defineEventHandler(async (event) => {
  const path = event.path || "";
  // /sitemap.xml, /sitemap_index.xml, /__sitemap__/* 만 대상
  if (!/^\/sitemap(_index)?\.xml(\?|$)/.test(path) && !path.startsWith("/__sitemap__")) return;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    if (isDbUnavailable(e)) {
      console.error("[sitemap-guard] DB unavailable — serving 503 instead of partial sitemap:", maskDbError(e));
      setResponseHeader(event, "Retry-After", "300");
      throw createError({
        statusCode: 503,
        statusMessage: "Service Unavailable",
        message: "사이트맵을 일시적으로 생성할 수 없습니다.",
      });
    }
    throw e;
  }
});
