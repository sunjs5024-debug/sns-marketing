// 라이브 DB 상품 멘트 전수 덤프 — 100% 읽기 전용(SELECT만). 감사용.
//   활성 상품의 name·description·longDescription·faqs·keywords 실제값을 md로 저장.
//   실행: npx tsx scripts/dump-live-copy.ts  → scripts/live-copy-dump.md
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL 없음"); process.exit(1); }
  const sql = neon(url);

  const rows = (await sql`
    SELECT p.slug, p.name, p.description, p."longDescription",
           p."deliveryInfo", p."guaranteeInfo", p.faqs, p.keywords,
           p."isActive", c.name AS category
    FROM "Product" p
    JOIN "Category" c ON c.id = p."categoryId"
    WHERE p."isActive" = true
    ORDER BY c."sortOrder", p.slug
  `) as Array<Record<string, unknown>>;

  const md: string[] = [`# 라이브 DB 상품 멘트 덤프 (${new Date().toISOString().slice(0, 10)}) — 활성 ${rows.length}개`, ""];
  for (const r of rows) {
    const faqs = Array.isArray(r.faqs) ? (r.faqs as Array<{ q: string; a: string }>) : [];
    md.push(
      `## ${r.slug}  [${r.category}]`,
      `- **name**: ${r.name}`,
      `- **description**: ${r.description ?? "(없음)"}`,
      `- **deliveryInfo**: ${r.deliveryInfo ?? "(없음)"} · **guaranteeInfo**: ${r.guaranteeInfo ?? "(없음)"}`,
      `- **keywords**: ${r.keywords ?? "(없음)"}`,
      `- **longDescription** (${String(r.longDescription ?? "").length}자):`,
      "```",
      String(r.longDescription ?? "(없음)"),
      "```",
      `- **faqs** (${faqs.length}개):`,
      ...faqs.map((f) => `  - Q: ${f.q}\n    A: ${f.a}`),
      "",
    );
  }
  const out = join(process.cwd(), "scripts", "live-copy-dump.md");
  writeFileSync(out, md.join("\n"), "utf-8");
  console.log(`활성 ${rows.length}개 → ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
