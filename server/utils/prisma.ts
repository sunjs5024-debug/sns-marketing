import { PrismaClient } from "~~/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

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

export const prisma = globalThis.__prisma ?? create();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
