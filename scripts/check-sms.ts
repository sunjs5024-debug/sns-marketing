import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const recent = await prisma.bankSms.findMany({ orderBy: { receivedAt: "desc" }, take: 5 });
console.log("최근 SMS 로그 (raw 본문 + 파싱 결과):\n");
recent.forEach((s, i) => {
  console.log(`[${i + 1}]`);
  console.log("  raw bytes len:", Buffer.byteLength(s.rawMessage, "utf-8"));
  console.log("  raw:", s.rawMessage);
  console.log("  parsed:", { amount: s.parsedAmount, depositor: s.parsedDepositor, bank: s.parsedBank });
  console.log();
});
await prisma.$disconnect();
