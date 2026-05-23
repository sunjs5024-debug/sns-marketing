// 메인 페이지 실시간 위젯 데이터 — 매 요청마다 랜덤 생성
// (실제 동시 접속자 추적이 아닌 마케팅용 social proof — 일반적인 영업 사이트 패턴)
import type { PlatformSlug } from "#shared/catalog";

type LiveOrder = { kind: PlatformSlug; who: string; what: string; time: string };

// 닉네임 풀 (마스킹된 형태) — @ 시작 핸들은 제외
const NICK_PREFIX = [
  "ji", "ha", "min", "su", "yu", "ta", "ki", "jw", "park", "lee", "kim", "han",
  "design", "vintage", "seoul", "busan", "daegu", "incheon", "tg_c", "tg_n",
  "광교카", "강남맘", "성수카", "수원부", "양재한", "마포미", "감성카", "디지털",
  "de", "vi", "da", "k_t", "b", "yo", "s", "k_g", "n", "cha",
  "haerin", "jiwon", "minji", "soyeon", "youngsu", "junho",
];
const NICK_SUFFIX = [
  "**", "***", "_kr", "_yt", "_creator", "**@naver.com", "**@gmail.com",
  "**사장님", "**오너", "**점장", "**대표", "**studio", "**lab",
];

// 상품 풀
const PRODUCTS: { kind: PlatformSlug; templates: string[] }[] = [
  {
    kind: "instagram",
    templates: [
      "인스타 한국인 팔로워 1,000명 주문",
      "인스타 릴스 조회수 10,000회 주문",
      "인스타 게시물 좋아요 500개 주문",
      "인스타 한국인 댓글 30개 주문",
      "인스타 글로벌 팔로워 2,000명 주문",
    ],
  },
  {
    kind: "youtube",
    templates: [
      "유튜브 쇼츠 조회수 10,000회 주문",
      "유튜브 한국인 구독자 500명 주문",
      "유튜브 동영상 좋아요 200개 주문",
      "유튜브 쇼츠 조회수 50,000회 주문",
    ],
  },
  {
    kind: "tiktok",
    templates: [
      "틱톡 글로벌 팔로워 1,000명 주문",
      "틱톡 좋아요 1,000개 주문",
      "틱톡 한국 타겟 팔로워 500명 주문",
    ],
  },
  {
    kind: "kakaotalk",
    templates: [
      "카톡 채널친구 1,000명 주문",
      "카톡 채널친구 500명 (타겟) 주문",
      "카톡 오픈채팅 입장 200명 주문",
    ],
  },
  {
    kind: "telegram",
    templates: [
      "텔레그램 채널 구독자 1,000명 주문",
      "텔레그램 그룹 멤버 500명 주문",
    ],
  },
  {
    kind: "x",
    templates: [
      "X(트위터) 한국인 팔로워 500명 주문",
      "X(트위터) 좋아요 200개 주문",
    ],
  },
  {
    kind: "smartstore",
    templates: [
      "스마트스토어 포토 구매평 5건 주문",
      "스마트스토어 일반 구매평 10건 주문",
      "스마트스토어 찜 100건 주문",
    ],
  },
  {
    kind: "naver-blog",
    templates: [
      "블로그 체험단 5명 매칭 주문",
      "블로그 이웃 100명 주문",
      "블로그 공감 50개 주문",
      "블로그 VIEW탭 관리 (월) 주문",
    ],
  },
  {
    kind: "naver-cafe",
    templates: [
      "네이버 카페 가입자 200명 주문",
      "네이버 카페 댓글 20개 주문",
    ],
  },
];

const TIMES = ["방금 전", "1분 전", "2분 전", "3분 전", "5분 전", "7분 전", "9분 전", "12분 전", "15분 전", "18분 전"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateNick(): string {
  return pick(NICK_PREFIX) + pick(NICK_SUFFIX);
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

export default defineEventHandler((event) => {
  // 시간대별로 약간 다른 범위 (저녁 시간대 더 많이)
  const hour = new Date().getHours();
  const isPrime = hour >= 18 && hour <= 23;
  const min = isPrime ? 180 : 100;
  const max = isPrime ? 280 : 220;
  const activeUsers = Math.floor(min + Math.random() * (max - min));

  const recentOrders = generateOrders(10);

  // Cloudflare/브라우저 캐싱 방지 — 매 요청마다 새 값
  setHeader(event, "Cache-Control", "no-store, max-age=0");

  return { activeUsers, recentOrders };
});
