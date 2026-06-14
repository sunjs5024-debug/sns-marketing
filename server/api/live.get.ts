// 메인 페이지 실시간 위젯 데이터 — 매 요청마다 랜덤 생성
// (실제 동시 접속자 추적이 아닌 마케팅용 social proof — 일반적인 영업 사이트 패턴)
import type { PlatformSlug } from "#shared/catalog";

type LiveOrder = { kind: PlatformSlug; who: string; what: string; time: string };

// ────────────────────────────────────────────────────────────────
// 닉네임 풀 — 실제처럼 다양하게 + 항상 마스킹 적용
// ────────────────────────────────────────────────────────────────

// 한국 성씨 (실제 분포 상위 30개)
const KOREAN_LAST_NAMES = [
  "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
  "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍",
  "유", "고", "문", "양", "손", "배", "백", "허", "남", "심",
];

// 한국 이름 (2~3음절)
const KOREAN_FIRST_NAMES = [
  "민수", "지영", "현우", "소연", "예진", "준호", "수빈", "도현", "지훈", "서연",
  "수아", "유진", "은우", "민지", "지원", "지호", "예린", "하은", "다은", "지민",
  "윤서", "수현", "지유", "예나", "서윤", "지안", "주원", "은성", "도윤", "하준",
  "유나", "다현", "지환", "현서", "건우", "재민", "지수", "민서", "수민", "다인",
  "예원", "시우", "은채", "서아", "민준", "정훈", "태민", "선우", "수영", "지희",
  "혜진", "유빈", "지율", "예준", "시현", "지원", "수진", "혜원", "은지", "유리",
];

// 영문 핸들 풀 (인스타·X 활동 크리에이터 느낌)
const EN_HANDLES = [
  "vintage_kim", "design_lab", "k_pop_fan", "minji_studio", "creator_haerin",
  "seoul_daily", "busan_food", "moodboard_y", "everyday_yoo", "kkomool",
  "designer_lee", "global_marketer", "the_kim", "park_studio", "modulab",
  "videoshooter", "haerin_world", "lifestyle_jw", "yumi_diary", "petfam",
  "soyeon_makeup", "han_creator", "seul_studio", "k_beauty_lover", "trip_minji",
  "daily_jiwon", "fitness_park", "coffee_kim", "running_lee", "yoga_soyeon",
  "vlog_dahae", "drawing_min", "studio_haerin", "pet_yoonji", "fashion_yu",
];

// 사업장 — 지역 + 업종 조합 (B2B 후기 느낌)
const REGIONS = ["강남", "성수", "홍대", "이태원", "광교", "송도", "마포", "수원", "분당", "판교", "잠실", "여의도", "신촌", "건대", "동탄"];
const BIZ_TYPES = ["헤어샵", "필라테스", "카페", "한의원", "치과", "꽃집", "베이커리", "디자인스튜디오", "바", "레스토랑", "요가스튜디오", "미술학원", "헬스장", "부동산", "스튜디오", "네일샵", "와인바"];

// 직책 (사업장 회원용)
const TITLES = ["사장님", "오너", "대표", "원장", "점장", "매니저"];

// ────────────────────────────────────────────────────────────────
// 마스킹 함수 — 항상 일부를 * 로 가리기 (개인정보 노출 방지 + 신뢰감)
// ────────────────────────────────────────────────────────────────

function maskKorean(name: string): string {
  // 김민수 → 김*수 / 김민*, 이영 → 이*, 김민수영 → 김*수영
  if (name.length <= 1) return name + "*";
  if (name.length === 2) {
    return Math.random() < 0.5 ? name[0]! + "*" : "*" + name[1]!;
  }
  if (name.length === 3) {
    // 가운데 또는 마지막 한 글자 마스킹
    const idx = Math.random() < 0.6 ? 1 : 2;
    return name.slice(0, idx) + "*" + name.slice(idx + 1);
  }
  // 4글자 이상: 2번째 글자 마스킹
  return name.slice(0, 1) + "*" + name.slice(2);
}

function maskEnglish(handle: string): string {
  // vintage_kim → vi****kim, design_lab → de****lab
  if (handle.length <= 4) return handle.slice(0, 2) + "***";
  const start = 2;
  const end = handle.length - 3;
  if (end <= start) return handle.slice(0, 2) + "***";
  return handle.slice(0, start) + "****" + handle.slice(end);
}

function maskBiz(name: string): string {
  // 강남헤어샵 → 강남**샵, 성수카페 → 성수**페
  if (name.length <= 2) return name + "**";
  return name.slice(0, 2) + "**" + name.slice(-1);
}

// 상품 풀 — 활성 카테고리만
const PRODUCTS: { kind: PlatformSlug; templates: string[] }[] = [
  {
    kind: "instagram",
    templates: [
      "인스타 한국인 팔로워 1,000명 주문",
      "인스타 릴스 조회수 10,000회 주문",
      "인스타 게시물 좋아요 500개 주문",
      "인스타 댓글 + 좋아요 50개 주문",
      "인스타 글로벌 가성비 팔로워 2,000명 주문",
      "인스타 스토리 조회수 5,000회 주문",
      "인스타 게시물 저장 1,000회 주문",
    ],
  },
  {
    kind: "youtube",
    templates: [
      "유튜브 쇼츠 조회수 10,000회 주문",
      "유튜브 구독자 500명 주문",
      "유튜브 시청시간 1,000 (10시간) 주문",
      "유튜브 쇼츠 조회수 50,000회 주문",
      "유튜브 한국 좋아요 100개 주문",
    ],
  },
  {
    kind: "tiktok",
    templates: [
      "틱톡 글로벌 팔로워 1,000명 주문",
      "틱톡 좋아요 1,000개 주문",
      "틱톡 커스텀 댓글 25개 주문",
      "틱톡 공유(Share) 5,000회 주문",
    ],
  },
  {
    kind: "telegram",
    templates: [
      "텔레그램 채널 구독자 1,000명 주문",
      "텔레그램 게시물 조회수 5,000회 주문",
      "텔레그램 리액션 1,000개 주문",
      "텔레그램 프리미엄 멤버 100명 주문",
      "텔레그램 봇 사용자 500명 주문",
    ],
  },
  {
    kind: "x",
    templates: [
      "X(트위터) 실계정 팔로워 500명 주문",
      "X(트위터) 좋아요 200개 주문",
      "X(트위터) 리트윗 100회 주문",
      "X(트위터) 트윗 조회수 50,000회 주문",
    ],
  },
];

const TIMES = ["방금 전", "1분 전", "2분 전", "3분 전", "5분 전", "7분 전", "9분 전", "12분 전", "15분 전", "18분 전"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// 닉네임 생성 — 4가지 패턴 비율 가중치
//   한국 실명 (50%) - 김** / 김*수 / 이*연 / ...
//   영문 핸들 (25%) - @vi****kim / @se****daily
//   지역+업종 (15%) - 강남**샵 / 성수**페
//   직책 (10%)     - 김**원장 / 이**사장님
function generateNick(): string {
  const r = Math.random();

  // 한국 실명 (가장 흔함)
  if (r < 0.5) {
    return maskKorean(pick(KOREAN_LAST_NAMES) + pick(KOREAN_FIRST_NAMES));
  }

  // 영문 핸들
  if (r < 0.75) {
    return "@" + maskEnglish(pick(EN_HANDLES));
  }

  // 지역 + 업종 (B2B 느낌)
  if (r < 0.9) {
    return maskBiz(pick(REGIONS) + pick(BIZ_TYPES));
  }

  // 성씨 + ** + 직책 (소상공인 느낌)
  return pick(KOREAN_LAST_NAMES) + "**" + pick(TITLES);
}

function generateOrders(count: number): LiveOrder[] {
  const orders: LiveOrder[] = [];
  for (let i = 0; i < count; i++) {
    const productSet = pick(PRODUCTS);
    orders.push({
      kind: productSet.kind,
      who: generateNick(),
      what: pick(productSet.templates),
      time: TIMES[i] ?? "수 분 전",
    });
  }
  return orders;
}

// ────────────────────────────────────────────────────────────────
// 누적 주문 — 기준일부터 자연스럽게 매일 +1~2 증가 (deterministic)
//   2026-05-01 = 58,200 시작 → 매일 평균 1.5건씩 증가
//   영업일 (월~금) +2, 주말 +1
// ────────────────────────────────────────────────────────────────
function getCumulativeOrders(): number {
  const BASE_DATE = new Date("2026-05-01T00:00:00+09:00").getTime();
  const BASE_ORDERS = 58200;
  const now = Date.now();
  const daysSince = Math.floor((now - BASE_DATE) / (1000 * 60 * 60 * 24));

  let added = 0;
  for (let i = 0; i < daysSince; i++) {
    const d = new Date(BASE_DATE + i * 24 * 60 * 60 * 1000);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    added += isWeekend ? 1 : 2;
  }
  return BASE_ORDERS + added;
}

// ────────────────────────────────────────────────────────────────
// 동시 접속자 — 매 새로고침이 아니라 "분 단위" 로 갱신 (deterministic)
//   같은 분 동안은 같은 숫자 → 새로고침해도 안 바뀜 → 자연스러움
// ────────────────────────────────────────────────────────────────
function getActiveUsers(): number {
  const now = new Date();
  const minute = Math.floor(now.getTime() / 60000);
  // 분 기반 deterministic 랜덤 (0~1)
  const seedR = Math.abs(Math.sin(minute * 12.9898) * 43758.5453);
  const rand = seedR - Math.floor(seedR);

  // 시간대별 기본 범위 (저녁이 활발)
  const hour = now.getHours();
  const isPrime = hour >= 18 && hour <= 23;
  const isDawn = hour >= 2 && hour <= 6;
  const min = isDawn ? 40 : isPrime ? 180 : 100;
  const max = isDawn ? 90 : isPrime ? 240 : 180;

  return Math.floor(min + rand * (max - min));
}

export default defineEventHandler((event) => {
  const activeUsers = getActiveUsers();
  const cumulativeOrders = getCumulativeOrders();
  const recentOrders = generateOrders(10);

  // recentOrders 는 매 요청마다 새로 (활기 있게) — 캐싱 방지
  // activeUsers / cumulativeOrders 는 분/일 단위라 캐싱돼도 사실상 같음
  setHeader(event, "Cache-Control", "no-store, max-age=0");

  return { activeUsers, cumulativeOrders, recentOrders };
});
