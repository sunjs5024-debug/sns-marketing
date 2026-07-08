// 라이브 DB 멘트 배치2 — 감사 결과 반영. 콘텐츠 필드만 UPDATE (가격·옵션 불변).
//   ①FULL: 자기모순 3종 풀 재작성 (보장기간 60일 = 2026-07-08 사장 확인)
//   ②DICT: 도매 영어용어(No Drop·K/Day·Instant·평생보장 등) 전 상품 한글화
//   ③CAT : ig-comments-kr 카테고리 오배치(인스타 좋아요→인스타 댓글) 수정
//   실행:  npx tsx scripts/patch-live-copy2.ts          # dry-run(필드별 before/after 미리보기)
//          npx tsx scripts/patch-live-copy2.ts apply     # 실제 적용
//   ★선행: mdLite 렌더 코드(git push) 먼저 배포할 것 — 마크다운 멘트가 날것으로 보이지 않게.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

type Faq = { q: string; a: string };

// ── ① 풀 재작성 (모순 3종) ─────────────────────────────────────
const FULL: Array<{
  slug: string; name: string; description: string; longDescription: string;
  deliveryInfo: string; guaranteeInfo: string; faqs: Faq[]; keywords: string;
}> = [
  {
    // 최우선 SEO 상품 — 이름 60일 vs 본문 30일, HQ vs Medium Quality 모순 해소(60일 확정)
    slug: "tg-subscribers-kr",
    name: "텔레그램 채널 구독자 (60일 보장)",
    description: "텔레그램 구독자를 활성 계정으로 빠르게. 60일 유지 보장, 감소 시 무료 리필로 안심.",
    longDescription: `텔레그램 채널 구독자를 **활성도 높은 실사용 계정**으로 늘려드립니다. 채널의 첫인상(구독자 수)은 광고 단가와 신규 유입 전환을 좌우하는 핵심 지표예요.

## 이 상품의 강점
- 가성비 패키지보다 **활성도 높은 계정** 위주 — 외형과 도달률을 함께
- 결제 후 1시간 내 시작, 대량 주문도 빠르게 처리
- **60일 유지 보장** — 기간 내 감소는 무료 리필

## 진행 방식
- 공개 채널 주소(t.me/···)만 알려주시면 시작됩니다
- 비밀번호·관리자 권한은 요구하지 않아요

## 이런 분께 추천해요
- 채널을 새로 열어 초기 구독자가 필요한 분
- 광고·협찬 단가 협상용 지표가 필요한 분
- 정보 공유·마케팅 채널의 신뢰도를 높이고 싶은 분`,
    deliveryInfo: "결제 후 1시간 내 시작 · 대량도 빠른 처리",
    guaranteeInfo: "60일 유지 보장 · 감소 시 무료 리필",
    faqs: [
      { q: "텔레그램 구독자 구매, 안전한가요?", a: "네. 공개 채널 주소만으로 진행되고 비밀번호는 요구하지 않습니다. 자연스러운 속도로 나눠 반영돼 안전해요." },
      { q: "텔레그램 구독자 늘리는 데 얼마나 걸리나요?", a: "결제 후 1시간 내 시작되며, 수량에 따라 보통 하루 안에 완료됩니다." },
      { q: "한국인 구독자인가요?", a: "글로벌 계정 기반입니다. 활성도가 높은 계정 위주로 반영됩니다." },
      { q: "구독자가 빠지면 어떻게 되나요?", a: "60일 이내 자연 감소는 무료로 다시 채워드립니다." },
      { q: "그룹도 가능한가요?", a: "네, 공개 그룹도 가능합니다." },
    ],
    keywords: "텔레그램 구독자, 텔레그램 구독자 늘리기, 텔레그램 채널 멤버, Telegram Members",
  },
  {
    // 이름 7일 vs 보장 60일 모순(60일 확정) + '평생 안정 신호' 과장 제거
    slug: "yt-subscribers-global",
    name: "유튜브 구독자 (60일 리필 보장)",
    description: "유튜브 구독자를 빠르게. 60일 리필 보장으로 감소 걱정 없이 채널 신뢰도를 올려요.",
    longDescription: `유튜브 채널의 구독자 수를 빠르게 늘려드립니다. 구독자 수는 채널 신뢰도와 협찬·광고 단가 협상에 직접 영향을 주는 핵심 지표예요.

## 진행 방식
- 채널 URL만 알려주시면 결제 후 1시간 내 시작
- 수량에 따라 3~7일에 걸쳐 자연스러운 속도로 반영

## 안심 보장
- **60일 리필 보장** — 기간 내 자연 감소는 무료로 다시 채워드려요

## 이런 분께 추천해요
- 새 채널의 초기 구독자가 필요한 분
- 1만 구독 달성·협찬 자격을 준비하는 분
- 광고 단가 협상용 지표가 필요한 분`,
    deliveryInfo: "결제 후 1시간 내 시작 · 3~7일 완료",
    guaranteeInfo: "60일 리필 보장 · 감소 시 무료 리필",
    faqs: [
      { q: "구독자가 빠질 수 있나요?", a: "60일 이내 자연 감소는 무료 리필됩니다." },
      { q: "비밀번호를 알려줘야 하나요?", a: "아니요. 채널 URL만 알려주시면 됩니다." },
      { q: "한국인 구독자인가요?", a: "글로벌 혼합입니다. 한국 타겟 시청자는 별도 상품을 확인해주세요." },
      { q: "신규 채널도 가능한가요?", a: "가능합니다. 다만 최소 영상 1개 이상 게시 후 진행을 권장합니다." },
    ],
    keywords: "유튜브 구독자, 유튜브 구독자 늘리기, 채널 구독자, YouTube Subscribers",
  },
  {
    // '80% 여성' 가짜 수치(이름·설명·본문 3곳) + No Drop 영어용어 제거
    slug: "ig-followers-kr",
    name: "인스타 한국인 팔로워 (실계정)",
    description: "인스타 팔로워를 한국인 실계정으로. 활동 이력 있는 계정만 써서 자연스럽게 늘어나요.",
    longDescription: `한국에서 활동하는 **실제 사용자 계정**으로 인스타 팔로워를 늘려드립니다. 프로필과 게시물이 살아있는 활성 계정만 사용해 자연스러운 팔로워 그래프를 만들어요.

## 왜 한국인 실계정인가요
- 한국 IP 기반이라 알고리즘이 '한국 콘텐츠'로 인식 → 한국인 추천 노출에 유리
- 협찬·광고 제안에서 팔로워 국적 비율은 단가를 좌우합니다
- 봇 계정을 쓰지 않아 정책 위반 위험이 낮아요

## 진행 방식
- **비밀번호 요구 없음** — 공개 프로필 주소(또는 사용자명)만
- 결제 후 10분 내 시작, 수량에 따라 24~72시간 내 완료
- 시간을 분산해 자연스러운 속도로 반영

## 안심 보장
- **30일 유지 보장** — 자연 감소 시 무료 리필
- 작업 시작 전 100% 환불 가능

## 이런 분께 추천해요
- 인플루언서 데뷔를 준비하는 분
- 한국 시장 비즈니스·브랜드 계정
- 협찬 제안 자료가 필요한 분`,
    deliveryInfo: "결제 후 10분 내 시작 · 24~72시간 내 완료",
    guaranteeInfo: "30일 유지 보장 · 자연 감소 시 무료 리필",
    faqs: [
      { q: "비밀번호를 알려줘야 하나요?", a: "아니요. 공개 프로필 주소 또는 사용자명만 알려주시면 됩니다. 비밀번호는 절대 요구하지 않습니다." },
      { q: "정말 한국인 계정인가요?", a: "네, 한국 IP 환경에서 활동하는 실제 사용자 계정 위주로 진행됩니다. 프로필·게시물 활동이 있는 활성 계정만 사용합니다." },
      { q: "인스타그램 정책에 위반되나요?", a: "실계정 기반이고 자연스러운 속도로 진행되어 정책 위반 위험이 매우 낮습니다. 다만 인스타그램 측의 정책 변경 가능성은 외부 요인입니다." },
      { q: "팔로워가 떨어지면 어떻게 되나요?", a: "30일 이내 자연 감소가 발생하면 무료로 다시 채워드립니다. 마이페이지에서 리필을 신청하실 수 있습니다." },
      { q: "비공개 계정도 가능한가요?", a: "아니요. 공개 계정만 가능합니다. 작업 전에 계정을 공개로 전환해주세요." },
      { q: "작업 시작 후 취소 가능한가요?", a: "작업이 시작된 후에는 취소가 어렵습니다. 시작 전이라면 100% 환불 가능합니다." },
    ],
    // 풀네임 정확구문 선두 — 경쟁 상위 타이틀은 전부 "인스타그램" 풀네임(우리만 축약이었음)
    keywords: "인스타그램 팔로워, 인스타 팔로워, 한국인 팔로워, 인스타그램 팔로워 늘리기, 한국 타겟 마케팅",
  },
];

// ── ①-b 필드 단위 교정 (설명 한 줄만 문제인 것) ────────────────
const FIELD: Array<{ slug: string; fields: Record<string, string> }> = [
  { // description에 가격(150원) 하드코딩 — 가격 변경 시 카피가 거짓말이 됨
    slug: "kmong-favorite",
    fields: { description: "크몽 전문가 서비스의 찜(관심) 수를 늘려, 인기 서비스처럼 상단에 노출되고 의뢰 문의·구매 전환을 키웁니다." },
  },
  { // '채널 격 ↑' 조악 축약
    slug: "tg-premium-members",
    fields: {
      description: "텔레그램 프리미엄(⭐) 계정 구독자 · 채널 신뢰도 상승 · 7일 리필.",
      keywords: "텔레그램 프리미엄 멤버, 텔레그램 프리미엄, Telegram Premium, 텔레그램 채널 신뢰도",
    },
  },
  // ── 타이틀 키워드 정조준 (keywords[0] = <title> 선두 정확구문) ──
  //    ①인스타→인스타그램 풀네임(경쟁 상위 전부 풀네임) ②같은 keywords[0] 상품 간 중복 타이틀 해소
  { slug: "ig-followers-global", fields: { keywords: "인스타그램 해외 팔로워, 인스타 팔로워, 글로벌 팔로워, 가성비 인스타" } },
  { slug: "ig-likes-kr", fields: { keywords: "인스타그램 좋아요, 인스타 좋아요, 인스타그램 좋아요 늘리기, 한국 좋아요, 게시물 좋아요" } },
  { slug: "ig-comments-kr", fields: { keywords: "인스타그램 댓글, 인스타 댓글, 커스텀 댓글, 게시물 댓글" } },
  { slug: "ig-comments-real", fields: { keywords: "인스타그램 댓글 좋아요, 인스타 댓글, 게시물 댓글, 인스타 마케팅" } },
  { slug: "ig-reels-views", fields: { keywords: "인스타그램 릴스 조회수, 릴스 조회수, 인스타 릴스, 릴스 알고리즘" } },
  { slug: "tg-subscribers-global", fields: { keywords: "텔레그램 채널 멤버, 텔레그램 구독자, Telegram Members, 텔레그램 가성비" } }, // '텔레그램 구독자'는 kr(주력)이 소유
  { slug: "tg-bot-start", fields: { keywords: "텔레그램 봇 사용자, 텔레그램 봇, Bot Start, 챗봇" } },
  { slug: "yt-likes-korea", fields: { keywords: "유튜브 한국인 좋아요, 유튜브 좋아요, 한국 유튜브, 유튜브 마케팅" } }, // 기존 '유튜브 한국'→타이틀 어색
  { slug: "yt-shorts-views", fields: { keywords: "유튜브 쇼츠 조회수, 쇼츠 조회수, YouTube Shorts, 쇼츠 알고리즘" } },
  { slug: "tt-followers-kr", fields: { keywords: "틱톡 활성 팔로워, 틱톡 팔로워, 틱톡 팔로워 늘리기, 틱톡 라이브" } }, // '틱톡 팔로워'는 global이 소유
  { slug: "x-followers-global", fields: { keywords: "트위터 팔로워, X 팔로워, Twitter Followers, 트위터 마케팅" } }, // 실검색은 '트위터'
  { slug: "x-followers-kr", fields: { keywords: "X(트위터) 팔로워, 트위터 팔로워 실계정, 실계정 팔로워, 트위터 마케팅" } },
];

// ── ② 도매 영어용어 사전 (순서 중요: 긴 것 먼저) ────────────────
const DICT: Array<[RegExp | string, string]> = [
  // '평생' 과장 → 정직한 보장 표현
  ["평생 안정성 보장 (No Drop)", "유지 보장 (감소 시 무료 리필)"],
  ["평생 안정성 보장(No Drop)입니다", "감소 시 무료 리필로 안정적입니다"],
  ["평생 안정성 보장", "유지 보장 · 감소 시 무료 리필"],
  ["평생 No Drop 보장이라 무료 리필됩니다", "감소 시 무료 리필됩니다"],
  ["평생 No Drop 보장이라 늘어난 조회수가 줄어들지 않습니다", "감소분은 무료 리필되어 안정적입니다"],
  ["평생 No Drop 보장", "유지 보장 · 감소 시 무료 리필"],
  ["Non Drop · Lifetime Refill 보장으로 빠지지 않습니다", "감소 시 무료로 다시 채워드려 안정적입니다"],
  ["Non Drop · 평생 리필", "유지 보장 · 감소 시 무료 리필"],
  ["Lifetime 평생 리필 보장", "유지 보장 · 감소 시 무료 리필"],
  ["평생 리필 보장이라 좋아요가 빠지지 않습니다", "감소 시 무료로 다시 채워드려 안정적입니다"],
  ["평생 리필 보장으로 빠지면 자동 보충됩니다", "감소 시 무료로 다시 채워드립니다"],
  ["평생 리필 보장", "리필 보장 (감소 시 무료 재충전)"],
  ["평생 리필 · 한국 채널 핵심 자산", "감소 시 무료 리필"],
  // No Drop 계열
  ["No Drop 보장입니다", "감소분은 무료 리필됩니다"],
  ["No Drop 보장이라 안정적입니다", "감소분은 무료 리필되어 안정적입니다"],
  ["No Drop 보장", "감소 시 무료 리필"],
  [/ ?· ?No Drop/g, " · 감소 시 무료 리필"],
  ["No Drop", "감소 없음"],
  // Drop Possible
  ["Drop Possible (자연 감소 가능)이라 표시되어 있지만", "일부 자연 감소가 있을 수 있지만"],
  ["Drop Possible이 무슨 뜻인가요?", "팔로워가 자연 감소할 수 있나요?"],
  ["글로벌 가성비 패키지라 일부 계정이 자연 감소할 수 있다는 의미입니다", "글로벌 가성비 패키지라 일부 계정이 자연 감소할 수 있습니다"],
  // 속도·등급 용어
  ["SuperFast 처리됩니다", "초고속으로 처리됩니다"],
  ["SuperFast 처리", "초고속 처리"],
  ["ULTRAFAST 속도로", "초고속으로"],
  ["ULTRAFAST 부스팅", "초고속 부스팅"],
  ["ULTRAFAST", "초고속"],
  ["Instant 시작 옵션이라 결제 즉시", "결제 즉시"],
  ["Instant 시작으로", "결제 즉시 시작돼"],
  ["Instant 시작이라", "결제 즉시 시작이라"],
  ["Instant 시작", "결제 즉시 시작"],
  ["Instant 시작 (결제 후 1~3분 내)", "결제 후 1~3분 내 즉시 시작"],
  ["Medium Quality 옵션으로", "표준 등급 옵션으로"],
  ["Medium Quality 계정 위주로", "표준 등급 계정 위주로"],
  ["Medium Quality 글로벌 계정입니다", "표준 등급의 글로벌 계정입니다"],
  ["Medium Quality", "표준 등급"],
  ["High Quality 옵션으로", "고품질 옵션으로"],
  ["High Quality 안정 처리", "고품질 안정 처리"],
  ["High Quality", "고품질"],
  [" (Auto Refill)", ""],
  ["Auto Refill", "자동 리필"],
  ["고품질(HQ) 실계정으로", "고품질 실계정으로"],
  ["HQ 상품을 추천", "고품질 상품을 추천"],
  ["(HQ)", "(고품질)"],
  ["Real 사용자 계정 기반으로 빠르게 처리됩니다(Fast).", "실제 사용자 계정 기반으로 빠르게 처리됩니다."],
  ["Real 사용자 기반 안정 처리", "실사용자 기반 안정 처리"],
  ["Real 사용자 기반이라", "실사용자 기반이라"],
  ["External Source(외부 트래픽) 기반으로", "외부 유입 트래픽 기반으로"],
  // 어뷰징 워딩(위험 표현) 완화
  ["유튜브의 어뷰징 탐지를 회피하면서 안전하게", "유튜브 정책에 안전한 속도를 지키며"],
  // 처리량 표기: K/Day·M/Day → 한글
  [/(\d+)M\/Day의 압도적 속도로 처리됩니다/g, "하루 최대 수백만 단위의 압도적 속도로 처리됩니다"],
  [/5M\/Day/g, "하루 최대 500만"],
  [/150K\/Day 초고속/g, "하루 최대 15만 초고속"],
  [/150K\/Day/g, "하루 최대 15만"],
  [/100K\/Day/g, "하루 최대 10만"],
  [/30K\/Day로 빠르게 처리됩니다/g, "하루 최대 3만 개씩 빠르게 처리됩니다"],
  [/30K\/Day 처리/g, "하루 최대 3만 처리"],
  [/25K\/Day 속도로/g, "하루 최대 2만 5천씩"],
  [/25K\/Day/g, "하루 최대 2만 5천"],
  [/20K\/Day/g, "하루 최대 2만"],
  [/10K\/Day 속도/g, "하루 최대 1만 처리"],
  [/10K\/Day/g, "하루 최대 1만"],
  [/5K\/Hour 초고속/g, "시간당 최대 5천 초고속"],
  [/5K\/Hour로/g, "시간당 최대 5천으로"],
  [/5K\/Day 속도로/g, "하루 최대 5천씩"],
  [/5K\/Day/g, "하루 최대 5천"],
  [/4K\/Day 빠른 속도로 처리되며/g, "하루 최대 4천씩 빠르게 처리되며"],
  [/4K\/Day 처리/g, "하루 최대 4천 처리"],
  [/4K\/Day/g, "하루 최대 4천"],
  [/3K\/Day 속도/g, "하루 최대 3천 처리"],
  [/빠른 처리\(3K\/Day\)/g, "빠른 처리(하루 최대 3천)"],
  [/3K\/Day/g, "하루 최대 3천"],
  [/250시간\/Day 속도/g, "하루 최대 250시간 처리"],
  // 맞춤법
  [/도달율/g, "도달률"],
  ["Max 100K", "최대 10만"],
  ["100K까지 처리 가능합니다", "10만까지 처리 가능합니다"],
];

const FULL_SLUGS = new Set(FULL.map((f) => f.slug));
const TEXT_FIELDS = ["name", "description", "longDescription", "deliveryInfo", "guaranteeInfo", "keywords"] as const;

function applyDict(s: string): string {
  let out = s;
  for (const [pat, rep] of DICT) out = typeof pat === "string" ? out.split(pat).join(rep) : out.replace(pat, rep);
  return out;
}

async function main() {
  const apply = process.argv[2] === "apply";
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL 없음"); process.exit(1); }
  const sql = neon(url);
  console.log(apply ? "=== 실제 적용(apply) ===\n" : "=== dry-run (DB 변경 없음) ===\n");

  // ① 풀 재작성
  for (const p of FULL) {
    if (apply) {
      await sql`UPDATE "Product" SET
        name=${p.name}, description=${p.description}, "longDescription"=${p.longDescription},
        "deliveryInfo"=${p.deliveryInfo}, "guaranteeInfo"=${p.guaranteeInfo},
        faqs=${JSON.stringify(p.faqs)}::jsonb, keywords=${p.keywords}
        WHERE slug=${p.slug}`;
      console.log(`✓ [FULL] ${p.slug} → ${p.name}`);
    } else console.log(`[FULL] ${p.slug} → 이름 "${p.name}" · long ${p.longDescription.length}자 · faqs ${p.faqs.length}개`);
  }

  // ①-b 필드 교정
  for (const f of FIELD) {
    if (apply) {
      for (const [k, v] of Object.entries(f.fields)) {
        if (k === "description") await sql`UPDATE "Product" SET description=${v} WHERE slug=${f.slug}`;
        if (k === "keywords") await sql`UPDATE "Product" SET keywords=${v} WHERE slug=${f.slug}`;
      }
      console.log(`✓ [FIELD] ${f.slug}: ${Object.keys(f.fields).join(", ")}`);
    } else console.log(`[FIELD] ${f.slug}: ${Object.keys(f.fields).join(", ")} 교정`);
  }

  // ② 사전 치환 (FULL 대상 제외 전 활성 상품)
  const rows = (await sql`SELECT slug, name, description, "longDescription", "deliveryInfo", "guaranteeInfo", keywords, faqs
                          FROM "Product" WHERE "isActive"=true`) as Array<Record<string, unknown>>;
  let dictCount = 0;
  for (const r of rows) {
    const slug = String(r.slug);
    if (FULL_SLUGS.has(slug)) continue;
    const upd: Record<string, string> = {};
    for (const f of TEXT_FIELDS) {
      const cur = r[f] == null ? null : String(r[f]);
      if (!cur) continue;
      const next = applyDict(cur);
      if (next !== cur) upd[f] = next;
    }
    let faqsNext: Faq[] | null = null;
    if (Array.isArray(r.faqs)) {
      const orig = r.faqs as Faq[];
      const fixed = orig.map((x) => ({ q: applyDict(x.q), a: applyDict(x.a) }));
      // jsonb는 키를 알파벳순 재정렬하므로 stringify 비교 금지 — 내용(q/a)만 비교
      if (fixed.some((x, i) => x.q !== orig[i].q || x.a !== orig[i].a)) faqsNext = fixed;
    }
    if (Object.keys(upd).length === 0 && !faqsNext) continue;
    dictCount++;
    if (!apply) {
      console.log(`[DICT] ${slug}: ${[...Object.keys(upd), ...(faqsNext ? ["faqs"] : [])].join(", ")}`);
      for (const [k, v] of Object.entries(upd)) console.log(`    ${k}: ${String(r[k]).slice(0, 60)}…\n      → ${v.slice(0, 60)}…`);
      continue;
    }
    await sql`UPDATE "Product" SET
      name=${upd.name ?? r.name}, description=${upd.description ?? r.description},
      "longDescription"=${upd.longDescription ?? r.longDescription},
      "deliveryInfo"=${upd.deliveryInfo ?? r.deliveryInfo}, "guaranteeInfo"=${upd.guaranteeInfo ?? r.guaranteeInfo},
      keywords=${upd.keywords ?? r.keywords},
      faqs=${faqsNext ? JSON.stringify(faqsNext) : JSON.stringify(r.faqs)}::jsonb
      WHERE slug=${slug}`;
    console.log(`✓ [DICT] ${slug}: ${[...Object.keys(upd), ...(faqsNext ? ["faqs"] : [])].join(", ")}`);
  }

  // ③ 카테고리 오배치: ig-comments-kr (인스타 좋아요 → 인스타 댓글)
  if (apply) {
    const res = (await sql`UPDATE "Product" SET "categoryId"=(SELECT id FROM "Category" WHERE slug='instagram-comments')
                           WHERE slug='ig-comments-kr' AND EXISTS (SELECT 1 FROM "Category" WHERE slug='instagram-comments')
                           RETURNING slug`) as unknown[];
    console.log(res.length ? "✓ [CAT] ig-comments-kr → instagram-comments" : "⚠ [CAT] instagram-comments 카테고리 없음 — 건너뜀");
  } else console.log("[CAT] ig-comments-kr: 인스타 좋아요 → 인스타 댓글(instagram-comments) 이동 예정");

  console.log(`\n${apply ? "적용 완료 (엣지 캐시 최대 10분)" : `미리보기 끝 — FULL ${FULL.length} · FIELD ${FIELD.length} · DICT ${dictCount}개 상품. 적용: apply 인자로 재실행`}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
