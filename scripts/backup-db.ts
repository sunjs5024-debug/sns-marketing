// DB 백업 — 모든 테이블을 JSON 한 파일로 dump
// 사용: npx tsx scripts/backup-db.ts   (DATABASE_URL 환경변수 필요 — .env 로드 후 실행)
//      또는 scripts/backup-db.ps1 (.env 자동 로드 + 로그)
import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupDir = resolve(__dirname, "..", "backups");
mkdirSync(backupDir, { recursive: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL 환경변수가 없습니다.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const stamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "_");

console.log(`[backup] ${stamp} 시작...`);

const dump = {
  _meta: {
    createdAt: new Date().toISOString(),
    schemaVersion: "1.0",
    source: "sns-marketing-nuxt",
  },
  users: await prisma.user.findMany(),
  categories: await prisma.category.findMany(),
  products: await prisma.product.findMany({ include: { options: true } }),
  cartItems: await prisma.cartItem.findMany(),
  orders: await prisma.order.findMany({ include: { items: true } }),
  reviews: await prisma.review.findMany(),
};

const file = resolve(backupDir, `backup_${stamp}.json`);
writeFileSync(file, JSON.stringify(dump, null, 2));
const size = statSync(file).size;
console.log(
  `✅ ${file}
   users=${dump.users.length} categories=${dump.categories.length} products=${dump.products.length}
   orders=${dump.orders.length} carts=${dump.cartItems.length} reviews=${dump.reviews.length}
   size=${(size / 1024).toFixed(1)} KB`,
);

// 오래된 백업 정리 (30일 초과)
const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
let purged = 0;
for (const f of readdirSync(backupDir)) {
  if (!f.startsWith("backup_") || !f.endsWith(".json")) continue;
  const p = resolve(backupDir, f);
  if (statSync(p).mtimeMs < cutoff) {
    unlinkSync(p);
    purged++;
  }
}
if (purged > 0) console.log(`🗑️  오래된 백업 ${purged}개 정리`);

await prisma.$disconnect();
