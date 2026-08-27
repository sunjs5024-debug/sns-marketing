// 카카오톡 상품 생성/갱신 (기본 티어 100/300/500/1000) — 멱등.
//   카테고리(kakaotalk-*) + 상품 + 옵션(kakao command 매핑)을 운영 Neon DB에 upsert.
//   ★ 사전조건: ProductOption.externalCommand 컬럼 존재 (scripts/kakao-setup.ts apply 로 먼저 추가)
//
//   실행:  npx tsx scripts/setup-kakao-products.ts          # dry-run (계획만 출력, DB 변경 X)
//          npx tsx scripts/setup-kakao-products.ts apply     # 실제 생성/갱신
//
//   gift(선물)·shopping(톡딜) 은 api_119 명령어 목록에 없어 isActive=false 로 생성 (담당자 확인 후 활성).
//   ★ 신규 생성 시 isSoldOut=true(품절)로 만든다 — 탭/상품은 노출되되 구매는 막힘.
//     카카오 서버 주소(KAKAO_API_BASE) 세팅+연결확인 후 품절 해제하면 진짜 오픈.
//     (ON CONFLICT 재실행은 isSoldOut 을 건드리지 않음 → 오픈 후 재실행해도 다시 품절 안 됨)
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const TIERS = [100, 300, 500, 1000];

type Service = {
  key: string;
  name: string;
  command: string;
  unit: number;      // 1개당 소매가(원)
  noun: string;      // 수량 단위 (명/개)
  delivery: string;
  max: number;
  active: boolean;
  targetHint: string;
  note?: string;
};

const SERVICES: Service[] = [
  { key: "channel-add", name: "카카오톡 채널 친구추가", command: "channel_add", unit: 150, noun: "명", delivery: "평균 약 6분 내 시작", max: 30000, active: true, targetHint: "카카오톡 채널 링크(pf.kakao.com/_xxxx) 또는 채널 ID" },
  { key: "open-join", name: "카카오톡 오픈방 인원", command: "join", unit: 800, noun: "명", delivery: "평균 약 1분 내 시작", max: 1500, active: true, targetHint: "오픈채팅 링크(open.kakao.com/o/gXXXX)" },
  { key: "open-like", name: "카카오 오픈방 좋아요", command: "like", unit: 200, noun: "개", delivery: "평균 약 4분 내 시작", max: 5000, active: true, targetHint: "오픈채팅 링크(open.kakao.com/o/gXXXX)" },
  { key: "post-like", name: "카카오톡 채널 게시글 좋아요", command: "post_like", unit: 150, noun: "개", delivery: "평균 약 2분 내 시작", max: 10000, active: true, targetHint: "채널 게시글 링크(pf.kakao.com/_xxxx/게시글ID)" },
  { key: "gift-like", name: "카카오톡 선물하기 상품 좋아요", command: "gift", unit: 200, noun: "개", delivery: "2분 이내 시작", max: 10000, active: false, targetHint: "선물하기 상품 링크(gift.kakao.com)", note: "gift 명령어 = 담당자 활성화 확인 필요" },
  { key: "shopping-like", name: "카카오톡 톡딜 상품 좋아요", command: "shopping", unit: 200, noun: "개", delivery: "2분 이내 시작", max: 10000, active: false, targetHint: "톡딜/쇼핑 상품 링크(store.kakao.com)", note: "shopping 명령어 = 담당자 활성화 확인 필요" },
];

function shortName(s: Service) {
  return s.name.replace(/^카카오톡?\s*/, "");
}
function longDescription(s: Service) {
  return `## ${s.name}
실제 카카오톡 계정으로 ${shortName(s)} 수치를 자연스럽게 올려드립니다.

## 진행 방식
- 주문 시 **${s.targetHint}**를 입력해 주세요
- 결제 확인 후 ${s.delivery}, 목표 수량까지 여러 계정으로 분산 처리
- 실패한 계정은 자동으로 다른 계정으로 재시도해 목표 수량을 채웁니다

## 안심 안내
- 공개 링크만 필요 — **비밀번호는 절대 묻지 않습니다**
- 계정이 모자라 못 채운 부족분은 자동 환불됩니다`;
}
function faqs(s: Service) {
  return [
    { q: "무엇이 필요한가요?", a: `${s.targetHint} 만 있으면 됩니다. 비밀번호는 필요 없어요.` },
    { q: "얼마나 걸리나요?", a: `${s.delivery} 후 순차 진행되며, 수량이 많으면 시간이 더 걸릴 수 있습니다.` },
    { q: "수량을 다 못 채우면요?", a: "계정 상황에 따라 목표 미달 시, 부족분은 자동으로 환불됩니다." },
  ];
}

async function main() {
  const mode = process.argv[2]; // undefined(dry-run) | "apply" | "open"
  const apply = mode === "apply";
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("❌ DATABASE_URL 없음 (.env 확인)"); process.exit(1); }
  const sql = neon(url);

  // 오픈 스위치 — 활성 카카오 상품의 품절을 해제 (카카오 주소 세팅+연결확인 후 실행)
  if (mode === "open") {
    const activeSlugs = SERVICES.filter((s) => s.active).map((s) => `kko-${s.key}`);
    const rows = (await sql`
      UPDATE "Product" SET "isSoldOut" = false, "updatedAt" = now()
      WHERE slug = ANY(${activeSlugs}) AND "isActive" = true
      RETURNING slug, name
    `) as Array<{ slug: string; name: string }>;
    console.log(`🔓 품절 해제(오픈) ${rows.length}건:`);
    for (const r of rows) console.log(`   ✓ ${r.name} (${r.slug})`);
    console.log("\n(엣지 캐시로 최대 10분 후 구매 가능)");
    return;
  }

  // 사전조건: externalCommand 컬럼
  const col = (await sql`SELECT 1 FROM information_schema.columns WHERE table_name='ProductOption' AND column_name='externalCommand'`) as unknown[];
  if (col.length === 0) {
    console.error("❌ ProductOption.externalCommand 컬럼 없음 → 먼저 `npx tsx scripts/kakao-setup.ts apply` 실행");
    process.exit(1);
  }

  console.log(apply ? "=== 실제 적용(apply) ===\n" : "=== dry-run (DB 변경 없음) ===\n");

  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i]!;
    const catSlug = `kakaotalk-${s.key}`;
    const prodSlug = `kko-${s.key}`;
    const basePrice = s.unit * TIERS[0]!;
    const tiers = TIERS.filter((q) => q <= s.max);

    console.log(`${s.active ? "🟢" : "⚪"} ${s.name}  [${s.command}]  ₩${s.unit}/${s.noun}${s.note ? "  ⚠ " + s.note : ""}`);
    console.log(`   카테고리=${catSlug} · 상품=${prodSlug} · 티어=${tiers.map((q) => `${q}${s.noun}(₩${(s.unit * q).toLocaleString()})`).join(" / ")}`);

    if (!apply) continue;

    // 1) 카테고리 upsert
    const catRows = (await sql`
      INSERT INTO "Category" (id, slug, name, platform, "sortOrder", "iconEmoji", "isActive", "createdAt")
      VALUES (${`ckko_${s.key}`}, ${catSlug}, ${s.name}, ${"SNS"}::"Platform", ${i}, ${"💬"}, ${true}, now())
      ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, "sortOrder"=EXCLUDED."sortOrder", "isActive"=true
      RETURNING id
    `) as Array<{ id: string }>;
    const catId = catRows[0]!.id;

    // 2) 상품 upsert
    const prodRows = (await sql`
      INSERT INTO "Product" (id, slug, name, description, "longDescription", "categoryId", "basePrice",
        badge, "deliveryInfo", "guaranteeInfo", faqs, keywords, "minQty", "isActive", "isSoldOut", "isFeatured",
        "salesCount", rating, "createdAt", "updatedAt")
      VALUES (${`pkko_${s.key}`}, ${prodSlug}, ${s.name},
        ${`${s.name} — 실제 카카오 계정으로 안전하게. ${s.delivery}, 목표 수량까지 자동 처리.`},
        ${longDescription(s)}, ${catId}, ${basePrice},
        ${null}, ${s.delivery}, ${""}, ${JSON.stringify(faqs(s))}::jsonb,
        ${`${s.name}, ${shortName(s)}, 카카오 마케팅`}, ${1}, ${s.active}, ${true}, ${false},
        ${0}, ${5.0}, now(), now())
      ON CONFLICT (slug) DO UPDATE SET
        name=EXCLUDED.name, description=EXCLUDED.description, "longDescription"=EXCLUDED."longDescription",
        "categoryId"=EXCLUDED."categoryId", "basePrice"=EXCLUDED."basePrice",
        "deliveryInfo"=EXCLUDED."deliveryInfo", faqs=EXCLUDED.faqs, keywords=EXCLUDED.keywords,
        "isActive"=EXCLUDED."isActive", "updatedAt"=now()
      RETURNING id
    `) as Array<{ id: string }>;
    const prodId = prodRows[0]!.id;

    // 3) 옵션(티어) upsert — kakao command 매핑
    for (let t = 0; t < tiers.length; t++) {
      const q = tiers[t]!;
      await sql`
        INSERT INTO "ProductOption" (id, "productId", label, quantity, price, "sortOrder",
          "externalProvider", "externalServiceId", "externalCommand")
        VALUES (${`okko_${s.key}_${q}`}, ${prodId}, ${`${q.toLocaleString()}${s.noun}`}, ${q}, ${s.unit * q}, ${t},
          ${"kakao"}, ${null}, ${s.command})
        ON CONFLICT (id) DO UPDATE SET
          "productId"=EXCLUDED."productId", label=EXCLUDED.label, quantity=EXCLUDED.quantity,
          price=EXCLUDED.price, "sortOrder"=EXCLUDED."sortOrder",
          "externalProvider"='kakao', "externalServiceId"=NULL, "externalCommand"=EXCLUDED."externalCommand"
      `;
    }
    console.log(`   ✓ 반영 완료 (활성=${s.active})`);
  }

  console.log(apply
    ? "\n총 6개 카카오 상품 반영 완료 (신규는 품절 상태). 카카오 주소 세팅+연결확인 후 품절 해제하면 오픈. (엣지 캐시 최대 10분)"
    : "\n미리보기 끝(신규는 품절 상태로 생성됨). 실제 생성: 인자 apply 붙여 재실행");
}
main().catch((e) => { console.error(e); process.exit(1); });
