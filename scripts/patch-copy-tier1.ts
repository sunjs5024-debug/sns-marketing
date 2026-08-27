// Tier1 카피 최적화 라이브 반영 — 워크플로우(wvc2s0hms) 생성물을 Neon DB에 단발 UPDATE.
//   ★name·가격·옵션·deliveryInfo·guaranteeInfo·isActive·isSoldOut 은 안 건드림.
//    slug 로 지정한 상품의 description·longDescription·keywords·faqs 4필드만 교체.
//
//   실행:  npx tsx scripts/patch-copy-tier1.ts          # dry-run (before/after 요약, DB 변경 없음)
//          npx tsx scripts/patch-copy-tier1.ts apply     # 실제 적용
//          npx tsx scripts/patch-copy-tier1.ts show ig-followers-kr   # 특정 slug 전체 before/after 출력
//   주의:  공개 페이지 엣지 캐시 → 반영 후 CF Purge 하거나 최대 10분 대기.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// ★최종본 = 크리틱 7건 병합 + 리필정책 복원(유저확정: 보장+무료리필 제공, IG/TT/X 30일·YT/TG 60일) 완료본.
//   merge-copy-final.ts 가 생성. _guaranteeInfo·_name 이 있으면 그 필드도 함께 복원 UPDATE.
const OUTPUT =
  "C:/Users/user/AppData/Local/Temp/claude/C--Users-user-Desktop/0e6af9b2-68bb-4d0b-8d22-d2f84af932ba/scratchpad/tier1-final.json";

type Faq = { q: string; a: string };
type P = { slug: string; keywords: string; description: string; longDescription: string; faqs: Faq[]; platform?: string; issuesFixed?: string; _guaranteeInfo?: string; _name?: string };

// 카니발라이제이션 교정 — kr 변형이 주력어를 갖고 global 변형은 '해외'로 차별화(ig-followers 관례 일치).
//   워크플로우가 tt/tg 의 kr·global 둘 다 같은 keyword[0]("틱톡 팔로워"/"텔레그램 구독자")을 줘 타이틀 자기잠식 → global 만 교정.
const KEYWORD0_OVERRIDE: Record<string, string> = {
  "tt-followers-global": "틱톡 해외 팔로워",
  "tg-subscribers-global": "텔레그램 해외 구독자",
};

function loadProducts(): P[] {
  const raw = JSON.parse(readFileSync(OUTPUT, "utf-8"));
  const products: P[] = Array.isArray(raw) ? raw : (raw?.result?.products ?? raw?.products ?? []);
  if (!Array.isArray(products) || products.length === 0) throw new Error("생성물 products 배열 비어있음");
  return products.map((p) => {
    const ov = KEYWORD0_OVERRIDE[p.slug];
    if (!ov) return p;
    const parts = p.keywords.split(",").map((s) => s.trim()).filter(Boolean);
    return { ...p, keywords: [ov, ...parts.filter((k) => k !== ov)].join(", ") };
  });
}

async function main() {
  const mode = process.argv[2]; // undefined(dry) | apply | show
  const showSlug = process.argv[3];
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("❌ DATABASE_URL 없음 (.env 확인)"); process.exit(1); }
  const sql = neon(url);
  const products = loadProducts();
  console.log(`생성물 ${products.length}개 로드`);

  const apply = mode === "apply";
  if (mode === "show" && showSlug) {
    const p = products.find((x) => x.slug === showSlug);
    if (!p) { console.error(`없음: ${showSlug}`); process.exit(1); }
    const cur = (await sql`SELECT description,"longDescription",keywords,faqs FROM "Product" WHERE slug=${showSlug}`) as any[];
    console.log(`\n===== ${showSlug} =====`);
    console.log(`[keywords] BEFORE: ${cur[0]?.keywords}\n           AFTER : ${p.keywords}`);
    console.log(`\n[description] BEFORE: ${cur[0]?.description}\n              AFTER : ${p.description}`);
    console.log(`\n[longDescription] BEFORE:\n${cur[0]?.longDescription}\n\n              AFTER:\n${p.longDescription}`);
    console.log(`\n[faqs] BEFORE ${(cur[0]?.faqs ?? []).length}개 → AFTER ${p.faqs.length}개`);
    console.log(`\n[고친 것] ${p.issuesFixed ?? ""}`);
    return;
  }

  console.log(apply ? "\n=== 실제 적용(apply) ===\n" : "\n=== dry-run (DB 변경 없음) ===\n");
  let done = 0, missing = 0;
  for (const p of products) {
    const cur = (await sql`SELECT name, description, "longDescription", keywords FROM "Product" WHERE slug=${p.slug}`) as Array<{ name: string; description: string; longDescription: string; keywords: string }>;
    if (cur.length === 0) { console.log(`⚠ 없음: ${p.slug}`); missing++; continue; }
    const c = cur[0];
    if (!apply) {
      const kwChanged = (c.keywords ?? "").split(",")[0]?.trim() !== p.keywords.split(",")[0]?.trim();
      console.log(`• ${p.slug}  (${p.platform ?? ""})`);
      console.log(`   keywords[0]: ${(c.keywords ?? "").split(",")[0]?.trim()}  →  ${p.keywords.split(",")[0]?.trim()} ${kwChanged ? "★" : ""}`);
      console.log(`   longDesc: ${String(c.longDescription ?? "").length}자 → ${p.longDescription.length}자 · faqs ${p.faqs.length}개`);
      continue;
    }
    await sql`
      UPDATE "Product" SET
        description = ${p.description},
        "longDescription" = ${p.longDescription},
        keywords = ${p.keywords},
        faqs = ${JSON.stringify(p.faqs)}::jsonb,
        "updatedAt" = now()
      WHERE slug = ${p.slug}
    `;
    // 리필정책 복원(guaranteeInfo) + name 모순 정정 — 있는 상품만
    if (p._guaranteeInfo) await sql`UPDATE "Product" SET "guaranteeInfo" = ${p._guaranteeInfo} WHERE slug = ${p.slug}`;
    if (p._name) await sql`UPDATE "Product" SET name = ${p._name} WHERE slug = ${p.slug}`;
    console.log(`✓ ${p.slug} 반영${p._guaranteeInfo ? " +보장복원" : ""}${p._name ? " +name정정" : ""}`);
    done++;
  }
  console.log(apply
    ? `\n총 ${done}건 적용 완료${missing ? ` (없음 ${missing})` : ""}. CF Purge 또는 최대 10분 후 노출.`
    : `\n미리보기 끝. 특정 상품 전체보기: npx tsx scripts/patch-copy-tier1.ts show <slug> · 적용: apply`);
}
main().catch((e) => { console.error(e); process.exit(1); });
