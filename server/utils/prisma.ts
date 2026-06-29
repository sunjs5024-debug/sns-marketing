import { useEvent } from "nitropack/runtime";
import { PrismaClient } from "~~/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다.");
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// ⚠️ Cloudflare Workers 는 요청마다 I/O 컨텍스트가 격리된다.
// 모듈 스코프에서 한 번 만든 DB 연결을 다른 요청에서 재사용하면
// "Cannot perform I/O on behalf of a different request" 로 죽는다.
// → 요청별로 PrismaClient 를 만들어 event.context 에 캐싱한다.
// (nitro.experimental.asyncContext 가 켜져 있어야 useEvent() 가 동작)
// 호출부는 그대로 `prisma.user.findMany()` 처럼 쓰면 됨.
function getPrisma(): PrismaClient {
  const event = useEvent();
  const ctx = event.context as { __prisma?: PrismaClient };
  if (!ctx.__prisma) {
    ctx.__prisma = create();
  }
  return ctx.__prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
