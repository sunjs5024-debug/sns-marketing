// 품절 기능 — 운영 Neon DB에 isSoldOut 컬럼 추가(안전한 additive) + 대상 상품 품절 처리.
//   ★가격·다른 상품·다른 컬럼은 절대 안 건드림. 컬럼 추가는 IF NOT EXISTS 성격으로 멱등.
//
//   실행:  npx tsx scripts/add-soldout.ts          # dry-run (현재 상태만 확인, DB 변경 없음)
//          npx tsx scripts/add-soldout.ts apply     # 실제 적용
//   주의:  공개 페이지 엣지 캐시 10분 → 반영 최대 10분 지연. 화면 '품절'은 프론트 배포 후 노출.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const SLUG = "ig-followers-kr"; // 인스타 한국인 팔로워

async function main() {
  const apply = process.argv[2] === "apply";
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("❌ DATABASE_URL 없음 (.env 확인)"); process.exit(1); }
  const sql = neon(url);

  // 1) isSoldOut 컬럼 존재 여부
  const col = (await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'isSoldOut'
  `) as unknown[];
  const hasCol = col.length > 0;
  console.log(`• isSoldOut 컬럼: ${hasCol ? "이미 있음" : "없음 → 추가 예정"}`);

  // 2) 대상 상품 확인
  const prod = (await sql`SELECT slug, name, "isActive" FROM "Product" WHERE slug = ${SLUG}`) as Array<{
    slug: string; name: string; isActive: boolean;
  }>;
  if (prod.length === 0) { console.error(`❌ 상품 없음: ${SLUG}`); process.exit(1); }
  console.log(`• 대상 상품: "${prod[0].name}" (slug=${SLUG}, isActive=${prod[0].isActive})`);

  if (!apply) {
    console.log("\n=== dry-run (DB 변경 없음) ===");
    if (!hasCol) console.log(`  1) ALTER TABLE "Product" ADD COLUMN "isSoldOut" BOOLEAN NOT NULL DEFAULT false`);
    console.log(`  ${hasCol ? "1" : "2"}) UPDATE "Product" SET "isSoldOut" = true WHERE slug = '${SLUG}'`);
    console.log("\n실제 적용: 인자 apply 붙여 재실행 (npx tsx scripts/add-soldout.ts apply)");
    return;
  }

  console.log("\n=== 실제 적용(apply) ===");
  if (!hasCol) {
    await sql`ALTER TABLE "Product" ADD COLUMN "isSoldOut" BOOLEAN NOT NULL DEFAULT false`;
    console.log('✓ 컬럼 추가 완료: "isSoldOut" BOOLEAN NOT NULL DEFAULT false');
  }
  await sql`UPDATE "Product" SET "isSoldOut" = true WHERE slug = ${SLUG}`;
  const after = (await sql`SELECT name, "isSoldOut" FROM "Product" WHERE slug = ${SLUG}`) as Array<{
    name: string; isSoldOut: boolean;
  }>;
  console.log(`✓ 품절 처리: "${after[0].name}" · isSoldOut = ${after[0].isSoldOut}`);
  console.log("\n(엣지 캐시로 최대 10분 지연 · 화면 '품절' 표시는 프론트 배포 후)");
}

main().catch((e) => { console.error(e); process.exit(1); });
