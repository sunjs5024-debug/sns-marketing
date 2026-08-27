// 카카오 연동 준비 스크립트
//   1) 운영 Neon DB에 ProductOption.externalCommand 컬럼 추가 (안전한 additive·멱등)
//   2) (env 설정 시) 카카오 API 연결 확인 — /health · /api/v1/quota · /api/v1/costs
//
//   실행:  npx tsx scripts/kakao-setup.ts          # dry-run (컬럼 상태 확인 + 연결 테스트만)
//          npx tsx scripts/kakao-setup.ts apply     # 컬럼 실제 추가
//
//   연결 테스트는 .env 에 아래가 있어야 동작:
//     KAKAO_API_BASE=https://<카카오서버 공개주소>
//     KAKAO_API_KEY=kak_live_...
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function ensureColumn(apply: boolean) {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("❌ DATABASE_URL 없음 (.env 확인)"); process.exit(1); }
  const sql = neon(url);
  const col = (await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ProductOption' AND column_name = 'externalCommand'
  `) as unknown[];
  const has = col.length > 0;
  console.log(`• ProductOption.externalCommand 컬럼: ${has ? "이미 있음" : "없음 → 추가 필요"}`);
  if (!has && apply) {
    await sql`ALTER TABLE "ProductOption" ADD COLUMN "externalCommand" TEXT`;
    console.log('✓ 컬럼 추가 완료: "externalCommand" TEXT');
  } else if (!has) {
    console.log('  (apply 붙이면 추가: ALTER TABLE "ProductOption" ADD COLUMN "externalCommand" TEXT)');
  }
}

async function testConnection() {
  const base = (process.env.KAKAO_API_BASE ?? "").replace(/\/+$/, "");
  const key = process.env.KAKAO_API_KEY;
  if (!base || !key) {
    console.log("\n• 카카오 연결 테스트 건너뜀 (KAKAO_API_BASE / KAKAO_API_KEY 미설정)");
    return;
  }
  console.log(`\n• 카카오 API 연결 테스트 → ${base}`);
  const headers = { "X-Api-Key": key, "Content-Type": "application/json" };
  for (const path of ["/health", "/api/v1/quota", "/api/v1/costs"]) {
    try {
      const res = await fetch(`${base}${path}`, { headers });
      const text = await res.text();
      console.log(`   [${res.status}] ${path} → ${text.slice(0, 160)}`);
    } catch (e) {
      console.log(`   [ERR] ${path} → ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

async function main() {
  const apply = process.argv[2] === "apply";
  console.log(apply ? "=== 실제 적용(apply) ===\n" : "=== dry-run (DB 변경 없음) ===\n");
  await ensureColumn(apply);
  await testConnection();
  console.log("\n완료.");
}
main().catch((e) => { console.error(e); process.exit(1); });
