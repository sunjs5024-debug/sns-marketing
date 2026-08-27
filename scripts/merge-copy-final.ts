// Tier1 카피 최종 병합 — v1 생성물 + 크리틱 corrected 7건 + 리필정책 복원(실제 guaranteeInfo 기준).
//   유저 확정: 유지보장+자연감소 무료리필 "제공"이 실제 정책 → 재작성본의 보수적 "자동 리필 미제공"을
//   각 상품의 라이브 guaranteeInfo(있는 경우)로 되돌려 name·deliveryInfo·guaranteeInfo·본문 4곳 일치.
//   guaranteeInfo 비어있는 상품(카카오 등)은 보수 문구 유지(부족분 자동환불이 정책).
//
//   실행: npx tsx scripts/merge-copy-final.ts   → scratchpad/tier1-final.json 생성 + 요약 출력
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync } from "node:fs";

const GEN = "C:/Users/user/AppData/Local/Temp/claude/C--Users-user-Desktop/0e6af9b2-68bb-4d0b-8d22-d2f84af932ba/scratchpad/tier1-generated.json";
const CRIT = "C:/Users/user/AppData/Local/Temp/claude/C--Users-user-Desktop/0e6af9b2-68bb-4d0b-8d22-d2f84af932ba/tasks/wx7jozlkk.output";
const OUT = "C:/Users/user/AppData/Local/Temp/claude/C--Users-user-Desktop/0e6af9b2-68bb-4d0b-8d22-d2f84af932ba/scratchpad/tier1-final.json";

type Faq = { q: string; a: string };
type P = { slug: string; platform?: string; keywords: string; description: string; longDescription: string; faqs: Faq[] };

// 본문/FAQ의 "자동 리필 미제공" 계열 문구 → 실제 보장 문구로 치환
function restoreRefill(text: string, g: string): string {
  const guar = `${g} — 자연 감소분은 보장 기간 내 무료로 리필해 드립니다`;
  return text
    .replace(/\*\*자동 리필(?:은|이)? ?(?:제공되지 않|미제공)[^\n]*?\*\*[^\n]*?(?=\n|$)/g, `**${guar}**`)
    .replace(/자동 리필(?:은|이)? ?제공되지 않(?:습니다|으며)[^\n]*?(?=\n|$)/g, `${guar}. 감소 폭이 크면 고객센터로 문의해 주세요.`)
    .replace(/자동 리필 미제공[^\n]*?(?=\n|$)/g, `${guar}.`);
}
function restoreFaqAnswer(a: string, g: string): string {
  if (!/자동 리필/.test(a) || !/(제공되지 않|미제공)/.test(a)) return a;
  return `${g} 기간 내 자연 감소분은 무료로 리필해 드립니다. 감소 폭이 크거나 기간이 지난 경우 고객센터로 문의해 주세요.`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("❌ DATABASE_URL 없음"); process.exit(1); }
  const sql = neon(url);

  // 1) v1 생성물 로드
  const products: P[] = JSON.parse(readFileSync(GEN, "utf-8"));
  console.log(`v1 생성물 ${products.length}개 로드`);

  // 2) 크리틱 corrected 병합 (7건 — 콘텐츠 직접수정)
  const crit = JSON.parse(readFileSync(CRIT, "utf-8"));
  const critiques: Array<{ slug: string; corrected?: Partial<P> }> = crit?.result?.contentCritiques ?? [];
  let merged = 0;
  for (const c of critiques) {
    if (!c.corrected || Object.keys(c.corrected).length === 0) continue;
    const p = products.find((x) => x.slug === c.slug);
    if (!p) continue;
    Object.assign(p, c.corrected);
    merged++;
    console.log(`  ✚ 크리틱 수정 병합: ${c.slug} [${Object.keys(c.corrected).join(",")}]`);
  }

  // 3) 리필정책 복원 — 유저 확정: 보장+자연감소 무료리필 "제공"이 실제 정책.
  //    (라이브 guaranteeInfo는 7월 스크럽으로 "미제공"이 돼 있어 기준으로 못 씀 → 과거 확정값 기반 플랫폼 맵)
  //    근거: 사장확인 유튜브·텔레그램=60일(2026-07-08 메모), 인스타·틱톡 30일(patch-live-copy 이력). 카카오·티스토리·에이블리·크몽=보수 유지(부족분 자동환불).
  const DAYS: Record<string, number> = { "인스타그램": 30, "틱톡": 30, "X(트위터)": 30, "유튜브": 60, "텔레그램": 60, "telegram": 60 };
  const guaranteeFor = (p: P): string | null => {
    const d = DAYS[p.platform ?? ""];
    return d ? `${d}일 유지 보장` : null;
  };
  // guaranteeInfo 필드도 함께 복원 (patch 스크립트가 같이 UPDATE)
  const guaranteeUpdates: Record<string, string> = {};

  let restored = 0, conservative = 0;
  for (const p of products) {
    const g = guaranteeFor(p);
    if (g) {
      p.longDescription = restoreRefill(p.longDescription, g);
      p.faqs = p.faqs.map((f) => ({ q: f.q, a: restoreFaqAnswer(f.a, g) }));
      guaranteeUpdates[p.slug] = `${g} · 자연 감소 시 무료 리필`;
      restored++;
    } else {
      conservative++;
    }
  }
  // 크리틱 지적: ig-comments-kr name "(한국)" vs 본문 "글로벌" 모순 → name 정정
  const nameUpdates: Record<string, string> = { "ig-comments-kr": "인스타그램 실계정 댓글 (커스텀 문구)" };
  (products as Array<P & { _guaranteeInfo?: string; _name?: string }>).forEach((p) => {
    if (guaranteeUpdates[p.slug]) p._guaranteeInfo = guaranteeUpdates[p.slug];
    if (nameUpdates[p.slug]) p._name = nameUpdates[p.slug];
  });
  void sql; // (DB 조회 불필요해짐)

  writeFileSync(OUT, JSON.stringify(products, null, 1), "utf-8");
  console.log(`\n크리틱 병합 ${merged}건 · 리필복원 대상 ${restored}개 · 보수유지(보장정보 없음) ${conservative}개`);
  console.log(`최종본 → ${OUT}`);

  // 4) 검증: 보장 대상인데 "미제공" 잔존하면 치환 누락 = 문제
  console.log("\n== 치환 검증 ==");
  let bad = 0;
  for (const p of products) {
    const shouldGuar = !!guaranteeFor(p);
    const stillNo = /(자동 리필(은|이)? ?(제공되지 않|미제공))/.test(p.longDescription + JSON.stringify(p.faqs));
    if (shouldGuar && stillNo) { bad++; console.log(`  ⚠️ 치환누락  ${p.slug}`); }
  }
  console.log(bad ? `  → ${bad}건 수동 확인 필요` : "  전부 정상 ✅ (보장 대상 상품에 '미제공' 잔존 없음)");
}
main().catch((e) => { console.error(e); process.exit(1); });
