// 라이브 DB 멘트 단발 패치 — 대상 상품의 '콘텐츠 필드'만 UPDATE.
//   ★가격(basePrice)·옵션·카테고리·다른 상품은 절대 안 건드림. WHERE slug 로 지정한 것만.
//   시드 재실행 아님(그건 금지). @neondatabase/serverless 로 직접 UPDATE.
//
//   실행:  npx tsx scripts/patch-live-copy.ts          # dry-run(현재값 vs 새값 미리보기, DB 변경 없음)
//          npx tsx scripts/patch-live-copy.ts apply     # 실제 적용
//   주의:  공개 페이지 엣지 캐시 10분 → 반영 최대 10분 지연.
//
//   이번 배치: 정체성 충돌 3종 교정 (urpanel 실제 배달 기준)
//     - ig-likes-kr    : 실제 '한국' → 멘트 한국으로 통일
//     - ig-comments-kr : 실제 '글로벌' → 이름의 '한국인' 제거, 정직하게 글로벌
//     - tt-followers-kr: 실제 '글로벌' → 이름의 '한국인' 제거, 라이브 활성으로 차별화
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

type Faq = { q: string; a: string };
type Patch = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  deliveryInfo: string;
  guaranteeInfo: string;
  faqs: Faq[];
  keywords: string;
};

const PATCHES: Patch[] = [
  {
    slug: "ig-likes-kr",
    name: "인스타 게시물 좋아요 (한국인)",
    description: "인스타 게시물에 한국 실계정 좋아요. 게시 직후 인기 신호로 추천 노출을 노려요.",
    longDescription: `게시물(피드·릴스)에 **한국 실계정 좋아요**를 더해, 인스타 추천 알고리즘에 초기 인기 신호를 만듭니다.

## 왜 게시 직후가 중요한가요
- 인스타는 '최근 게시물의 인기'를 보고 추천 노출을 결정해요
- 첫 1~2시간의 좋아요 누적 속도가 탐색 탭 노출과 직결됩니다
- 그래서 새 게시물은 올리자마자 부스팅하는 게 가장 효과적이에요

## 진행 방식
- 게시물 **URL만** 알려주시면 결제 후 10분 내 시작
- 다수 계정에서 시간을 분산해 자연스러운 그래프로 추가
- 인스타 정책에 안전한 속도로 처리

## 안심 보장
- **30일 유지 보장** — 자연 감소 시 무료 리필
- 게시물이 삭제되면 다른 게시물로 변경 또는 환불`,
    deliveryInfo: "결제 후 10분 내 시작 · 30분~2시간 내 완료",
    guaranteeInfo: "30일 유지 보장",
    faqs: [
      { q: "비공개 계정 게시물도 가능한가요?", a: "공개 게시물만 가능합니다." },
      { q: "오래된 게시물도 효과 있나요?", a: "효과는 있지만 게시 직후(첫 1~2시간)가 가장 좋습니다." },
      { q: "릴스(Reels)도 가능한가요?", a: "네, 일반 피드 게시물과 릴스 모두 가능합니다." },
      { q: "좋아요만 늘면 어색하지 않나요?", a: "댓글 상품과 함께 쓰면 더 자연스럽습니다. 보통 댓글:좋아요는 1:50~1:100 정도예요." },
      { q: "삭제된 게시물에 작업되면?", a: "URL이 무효 처리되며 환불 또는 다른 게시물로 변경해 드립니다." },
    ],
    keywords: "인스타 좋아요, 인스타그램 좋아요 늘리기, 한국 좋아요, 게시물 좋아요, 인스타 알고리즘",
  },
  {
    slug: "ig-comments-kr",
    name: "인스타 게시물 댓글 (실계정)",
    description: "원하는 문구로 인스타 게시물에 실계정 댓글. 좋아요보다 강한 신호로 게시물 신뢰도를 높여요.",
    longDescription: `직접 작성하신 문구를 **실제 사용자 계정**으로 댓글로 달아드립니다. 댓글은 좋아요보다 강한 알고리즘 신호라, 추천 노출과 게시물 신뢰도에 효과적입니다.

## 특징
- **원하는 문구 그대로** — 주문 시 입력한 댓글을 그대로 작성
- 다수 계정에서 시간을 분산해 자연스럽게 작성
- 글로벌 실계정 기반이라 단가가 합리적이에요 (한국어 100% 보장은 어렵습니다)

## 진행 방식
- 게시물 URL + 원하는 댓글 문구를 주문 시 입력
- 결제 후 30분 내 시작, 6시간 내 완료

## 안심 보장
- **30일 유지 보장** — 자연 삭제 시 무료 리필`,
    deliveryInfo: "결제 후 30분 내 시작 · 6시간 내 완료",
    guaranteeInfo: "30일 유지 보장",
    faqs: [
      { q: "한국어 댓글도 가능한가요?", a: "글로벌 실계정 기반이라 영문 위주이며 한국어 100% 보장은 어렵습니다. 입력하신 문구는 그대로 작성됩니다." },
      { q: "댓글 문구는 미리 정해야 하나요?", a: "네, 주문 시 원하시는 문구를 입력해주세요. 여러 개도 가능합니다." },
      { q: "이모지 사용 가능한가요?", a: "네, 이모지 포함 가능합니다." },
      { q: "댓글이 삭제되면 보충되나요?", a: "30일 이내 자연 삭제는 무료 리필됩니다." },
      { q: "여러 게시물에 나눠서 가능한가요?", a: "주문은 게시물 단위입니다. 여러 게시물은 각각 주문해주세요." },
    ],
    keywords: "인스타 댓글, 인스타그램 댓글, 커스텀 댓글, 게시물 댓글, 인스타 마케팅",
  },
  {
    slug: "tt-followers-kr",
    name: "틱톡 팔로워 (라이브 활성)",
    description: "틱톡 라이브 시청자 풀 기반의 활성 팔로워. 채널 활성도를 함께 끌어올려요.",
    longDescription: `틱톡 라이브 방송 시청자 풀에서 유입되는 팔로워라, 단순 숫자 채우기가 아닌 **활성 사용자 기반**의 팔로우입니다. 라이브를 운영하거나 채널 활성도를 강조하고 싶을 때 효과적이에요.

## 특징
- 활동성 있는 시청자 기반이라 일반 글로벌 상품보다 진성에 가까움
- 빠른 처리로 신속하게 반영
- 글로벌 혼합 계정입니다 (한국인 한정 아님)

## 진행 방식
- 계정 URL(또는 아이디)만 알려주시면 결제 후 30분 내 시작

## 안심 보장
- **30일 유지 보장** — 자연 감소 시 무료 리필`,
    deliveryInfo: "결제 후 30분 내 시작 · 빠른 처리",
    guaranteeInfo: "30일 유지 보장",
    faqs: [
      { q: "라이브를 하지 않는 채널도 가능한가요?", a: "네, 가능합니다. 다만 라이브를 정기적으로 운영하는 채널에서 효과가 가장 좋습니다." },
      { q: "일반 글로벌 팔로워와 뭐가 다른가요?", a: "활동성 높은 시청자 기반이라 단가가 약간 높고, 진성 팔로워에 더 가깝습니다." },
      { q: "한국인 팔로워인가요?", a: "글로벌 혼합입니다. 한국인 한정 타겟은 별도 문의 주세요." },
      { q: "비공개 계정도 가능?", a: "공개 계정만 가능합니다." },
    ],
    keywords: "틱톡 팔로워, 틱톡 팔로워 늘리기, 틱톡 라이브, 틱톡 활성 팔로워",
  },
];

async function main() {
  const apply = process.argv[2] === "apply";
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL 없음 (.env 확인)"); process.exit(1); }
  const sql = neon(url);

  console.log(apply ? "=== 실제 적용(apply) ===" : "=== dry-run (DB 변경 없음) ===\n");
  let done = 0;
  for (const p of PATCHES) {
    const rows = (await sql`SELECT slug, name FROM "Product" WHERE slug = ${p.slug}`) as Array<{ slug: string; name: string }>;
    if (rows.length === 0) { console.log(`⚠ 없음: ${p.slug} (건너뜀)`); continue; }
    const cur = rows[0].name;

    if (!apply) {
      console.log(`• ${p.slug}`);
      console.log(`    이름: ${cur}  →  ${p.name}`);
      console.log(`    설명: ${p.description}`);
      console.log(`    faqs ${p.faqs.length}개 · long ${p.longDescription.length}자\n`);
      continue;
    }

    await sql`
      UPDATE "Product" SET
        name = ${p.name},
        description = ${p.description},
        "longDescription" = ${p.longDescription},
        "deliveryInfo" = ${p.deliveryInfo},
        "guaranteeInfo" = ${p.guaranteeInfo},
        faqs = ${JSON.stringify(p.faqs)}::jsonb,
        keywords = ${p.keywords}
      WHERE slug = ${p.slug}
    `;
    console.log(`✓ ${p.slug} 반영 (${cur} → ${p.name})`);
    done++;
  }

  console.log(`\n${apply ? `총 ${done}건 적용 완료. (엣지 캐시로 최대 10분 지연)` : "미리보기 끝. 실제 적용: 인자 apply 붙여 재실행"}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
