// 회원 목록 조회 (이메일 확인용)
// 사용법: npx tsx --env-file=.env scripts/list-users.ts

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const users = await prisma.user.findMany({
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    isDeleted: true,
    createdAt: true,
  },
});

console.log(`\n전체 ${users.length} 명\n`);
users.forEach((u, i) => {
  const flag = u.role === "ADMIN" ? "👑" : u.isDeleted ? "🚫" : "👤";
  console.log(`${i + 1}. ${flag} ${u.email}`);
  console.log(`     name: ${u.name} | id: ${u.id} | created: ${u.createdAt.toISOString().slice(0, 16)}`);
});

await prisma.$disconnect();
