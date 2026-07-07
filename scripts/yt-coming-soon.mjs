// 유튜브 상품 전체를 "오픈 예정(주문 불가)"으로 전환.
// 방식: 옵션의 externalServiceId 를 NULL 로 → 상품페이지 isComingSoon 이 켜져 구매 버튼이 막힘.
// 되돌리기용으로 기존 매핑을 backups/ 에 JSON 저장 (backups/ 는 gitignore 됨).
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const url = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
const sql = neon(url);

// 1) 백업
const backup = await sql`
  SELECT p.slug, o.id AS option_id, o.label, o."externalProvider", o."externalServiceId"
  FROM "ProductOption" o
  JOIN "Product" p ON p.id = o."productId"
  JOIN "Category" c ON c.id = p."categoryId"
  WHERE c.slug LIKE 'youtube%' AND o."externalServiceId" IS NOT NULL
`;
mkdirSync(new URL("../backups", import.meta.url), { recursive: true });
const file = new URL("../backups/yt-external-ids-backup.json", import.meta.url);
writeFileSync(file, JSON.stringify(backup, null, 2), "utf8");
console.log(`백업: ${backup.length}개 옵션 매핑 → backups/yt-external-ids-backup.json`);

// 2) 매핑 해제 → 오픈예정 전환
const res = await sql`
  UPDATE "ProductOption" o
  SET "externalServiceId" = NULL
  FROM "Product" p, "Category" c
  WHERE o."productId" = p.id AND p."categoryId" = c.id AND c.slug LIKE 'youtube%'
  RETURNING o.id
`;
console.log(`전환 완료: 옵션 ${res.length}개 매핑 해제 (유튜브 전 상품 오픈예정 처리)`);
