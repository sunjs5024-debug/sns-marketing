import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다. .env에 Neon 연결 문자열을 넣어주세요.");
}
const adapter = new PrismaNeon({ connectionString: url });
const prisma = new PrismaClient({ adapter });

type CatSeed = {
  slug: string;
  name: string;
  platform: "SNS" | "RANK";
  sortOrder: number;
};

const CATEGORIES: CatSeed[] = [
  // SNS
  { slug: "instagram-followers", name: "인스타 팔로워", platform: "SNS", sortOrder: 1 },
  { slug: "instagram-likes", name: "인스타 좋아요", platform: "SNS", sortOrder: 2 },
  { slug: "instagram-reels", name: "인스타 릴스 조회수", platform: "SNS", sortOrder: 3 },
  { slug: "youtube-subscribers", name: "유튜브 구독자", platform: "SNS", sortOrder: 4 },
  { slug: "youtube-views", name: "유튜브 조회수", platform: "SNS", sortOrder: 5 },
  { slug: "youtube-shorts", name: "유튜브 쇼츠 조회수", platform: "SNS", sortOrder: 6 },
  { slug: "tiktok-followers", name: "틱톡 팔로워", platform: "SNS", sortOrder: 7 },
  { slug: "tiktok-likes", name: "틱톡 좋아요", platform: "SNS", sortOrder: 8 },
  { slug: "tiktok-views", name: "틱톡 조회수", platform: "SNS", sortOrder: 9 },
  // 카카오톡
  { slug: "kakaotalk-friends", name: "카카오톡 채널친구", platform: "SNS", sortOrder: 9.1 },
  { slug: "kakaotalk-bizboard", name: "카카오톡 비즈보드 광고", platform: "SNS", sortOrder: 9.2 },
  { slug: "kakaotalk-openchat", name: "카카오톡 오픈채팅", platform: "SNS", sortOrder: 9.3 },
  // X (트위터)
  { slug: "x-followers", name: "X 팔로워", platform: "SNS", sortOrder: 9.4 },
  { slug: "x-engagement", name: "X 좋아요·리트윗", platform: "SNS", sortOrder: 9.5 },
  // 텔레그램
  { slug: "telegram-subscribers", name: "텔레그램 채널 구독자", platform: "SNS", sortOrder: 9.6 },
  { slug: "telegram-views", name: "텔레그램 게시물 조회수", platform: "SNS", sortOrder: 9.7 },
  // RANK
  { slug: "smartstore-review", name: "스마트스토어 구매평", platform: "RANK", sortOrder: 13 },
  { slug: "smartstore-traffic", name: "스마트스토어 트래픽", platform: "RANK", sortOrder: 14 },
  { slug: "smartstore-rank", name: "스마트스토어 상위노출", platform: "RANK", sortOrder: 15 },
  { slug: "naver-blog-rank", name: "블로그 상위노출", platform: "RANK", sortOrder: 16 },
  { slug: "naver-blog-neighbor", name: "블로그 이웃·공감", platform: "RANK", sortOrder: 17 },
  { slug: "naver-blog-review", name: "블로그 체험단", platform: "RANK", sortOrder: 18 },
  // 네이버 카페
  { slug: "naver-cafe-members", name: "네이버 카페 가입자", platform: "RANK", sortOrder: 19 },
  { slug: "naver-cafe-engagement", name: "네이버 카페 댓글·등급", platform: "RANK", sortOrder: 20 },
  { slug: "naver-cafe-rank", name: "네이버 카페 검색 상위노출", platform: "RANK", sortOrder: 21 },
];

type ProdSeed = {
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  longDescription?: string;
  basePrice: number;
  badge?: "HOT" | "BEST" | "SALE" | "NEW";
  isFeatured?: boolean;
  rating?: number;
  salesCount?: number;
  guaranteeInfo?: string;
  deliveryInfo?: string;
  options: { label: string; quantity: number; price: number }[];
};

const PRODUCTS: ProdSeed[] = [
  // === 인스타그램 ===
  {
    slug: "ig-followers-kr",
    name: "인스타 한국인 팔로워 (실계정)",
    categorySlug: "instagram-followers",
    description: "한국인 실계정 기반 팔로워 증가. 자연스럽고 안전하게.",
    longDescription:
      "한국 IP / 한국인 실계정 기반으로 진행됩니다.\n프로필 사진과 게시물이 있는 활성 계정만 사용해 자연스러운 팔로워 그래프를 만듭니다.\n비밀번호 요구 없이 공개 URL만으로 처리되며, 평균 10분 이내 시작됩니다.\n30일 유지 보장 — 이탈 발생 시 자동 리필됩니다.",
    basePrice: 11000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 12340,
    rating: 4.9,
    guaranteeInfo: "30일 유지 보장",
    deliveryInfo: "결제 후 10분 내 시작 / 24~72시간 완료",
    options: [
      { label: "100명", quantity: 100, price: 11000 },
      { label: "500명", quantity: 500, price: 49000 },
      { label: "1,000명", quantity: 1000, price: 89000 },
      { label: "3,000명", quantity: 3000, price: 249000 },
    ],
  },
  {
    slug: "ig-followers-global",
    name: "인스타 글로벌 팔로워 (가성비)",
    categorySlug: "instagram-followers",
    description: "글로벌 계정 기반. 빠른 처리와 합리적 가격이 강점.",
    basePrice: 4000,
    badge: "SALE",
    isFeatured: true,
    salesCount: 9821,
    rating: 4.7,
    guaranteeInfo: "7일 유지 보장",
    deliveryInfo: "30분 내 시작 / 12시간 완료",
    options: [
      { label: "100명", quantity: 100, price: 4000 },
      { label: "1,000명", quantity: 1000, price: 28000 },
      { label: "5,000명", quantity: 5000, price: 120000 },
    ],
  },
  {
    slug: "ig-likes-kr",
    name: "인스타 게시물 좋아요 (한국인)",
    categorySlug: "instagram-likes",
    description: "특정 게시물에 한국인 좋아요. 알고리즘 노출에 효과.",
    basePrice: 3500,
    badge: "HOT",
    isFeatured: true,
    salesCount: 18500,
    rating: 4.9,
    deliveryInfo: "10분 내 시작",
    options: [
      { label: "50개", quantity: 50, price: 3500 },
      { label: "200개", quantity: 200, price: 12000 },
      { label: "500개", quantity: 500, price: 25000 },
    ],
  },
  {
    slug: "ig-reels-views",
    name: "인스타 릴스 조회수 부스팅",
    categorySlug: "instagram-reels",
    description: "릴스 조회수 증가로 추천 피드 진입 확률 상승.",
    basePrice: 5000,
    isFeatured: true,
    salesCount: 7610,
    rating: 4.8,
    deliveryInfo: "20분 내 시작",
    options: [
      { label: "1,000회", quantity: 1000, price: 5000 },
      { label: "10,000회", quantity: 10000, price: 39000 },
      { label: "50,000회", quantity: 50000, price: 159000 },
    ],
  },
  {
    slug: "ig-comments-kr",
    name: "인스타 한국인 댓글 (커스텀)",
    categorySlug: "instagram-likes",
    description: "원하는 문구로 한국인 실계정 댓글을 작성합니다.",
    basePrice: 9900,
    badge: "NEW",
    salesCount: 1240,
    rating: 4.9,
    options: [
      { label: "10개", quantity: 10, price: 9900 },
      { label: "30개", quantity: 30, price: 26000 },
      { label: "100개", quantity: 100, price: 75000 },
    ],
  },

  // === 유튜브 ===
  {
    slug: "yt-subscribers-global",
    name: "유튜브 구독자 (글로벌 실계정)",
    categorySlug: "youtube-subscribers",
    description: "글로벌 실계정 기반 구독자. 채널 신뢰도 상승.",
    basePrice: 29000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 5320,
    rating: 4.8,
    guaranteeInfo: "60일 유지 보장",
    deliveryInfo: "1시간 내 시작 / 3~7일 완료",
    options: [
      { label: "500명", quantity: 500, price: 29000 },
      { label: "1,000명", quantity: 1000, price: 55000 },
      { label: "5,000명", quantity: 5000, price: 245000 },
    ],
  },
  {
    slug: "yt-views-natural",
    name: "유튜브 일반 조회수 (자연 유입)",
    categorySlug: "youtube-views",
    description: "자연 유입처럼 점진적으로 조회수가 증가합니다.",
    basePrice: 8000,
    badge: "HOT",
    salesCount: 7200,
    rating: 4.7,
    deliveryInfo: "지표 자연 유입 방식",
    options: [
      { label: "1,000회", quantity: 1000, price: 8000 },
      { label: "10,000회", quantity: 10000, price: 70000 },
      { label: "100,000회", quantity: 100000, price: 590000 },
    ],
  },
  {
    slug: "yt-shorts-views",
    name: "유튜브 쇼츠 조회수 부스팅",
    categorySlug: "youtube-shorts",
    description: "쇼츠 초기 조회수를 빠르게 끌어올려 추천 진입 유도.",
    basePrice: 4500,
    badge: "SALE",
    isFeatured: true,
    salesCount: 6820,
    rating: 4.8,
    options: [
      { label: "1,000회", quantity: 1000, price: 4500 },
      { label: "10,000회", quantity: 10000, price: 35000 },
      { label: "100,000회", quantity: 100000, price: 290000 },
    ],
  },
  {
    slug: "yt-likes",
    name: "유튜브 좋아요",
    categorySlug: "youtube-views",
    description: "영상 좋아요 증가로 채널 활성화 신호를 강화합니다.",
    basePrice: 3000,
    salesCount: 4100,
    rating: 4.7,
    options: [
      { label: "100개", quantity: 100, price: 3000 },
      { label: "500개", quantity: 500, price: 13000 },
      { label: "1,000개", quantity: 1000, price: 24000 },
    ],
  },

  // === 틱톡 ===
  {
    slug: "tt-followers-kr",
    name: "틱톡 한국인 팔로워",
    categorySlug: "tiktok-followers",
    description: "한국 타겟 실계정 팔로워. 한국어 댓글까지 자연스럽게.",
    basePrice: 12000,
    badge: "HOT",
    isFeatured: true,
    salesCount: 4250,
    rating: 4.9,
    guaranteeInfo: "30일 유지 보장",
    options: [
      { label: "100명", quantity: 100, price: 12000 },
      { label: "1,000명", quantity: 1000, price: 99000 },
      { label: "5,000명", quantity: 5000, price: 450000 },
    ],
  },
  {
    slug: "tt-followers-global",
    name: "틱톡 글로벌 팔로워 (가성비)",
    categorySlug: "tiktok-followers",
    description: "글로벌 타겟. 빠르고 저렴하게 팔로워 확보.",
    basePrice: 4000,
    badge: "SALE",
    salesCount: 5800,
    rating: 4.6,
    options: [
      { label: "100명", quantity: 100, price: 4000 },
      { label: "1,000명", quantity: 1000, price: 32000 },
    ],
  },
  {
    slug: "tt-views",
    name: "틱톡 영상 조회수 부스팅",
    categorySlug: "tiktok-views",
    description: "추천 피드 진입을 위한 초기 조회수 부스팅.",
    basePrice: 3500,
    isFeatured: true,
    salesCount: 8910,
    rating: 4.8,
    options: [
      { label: "1,000회", quantity: 1000, price: 3500 },
      { label: "10,000회", quantity: 10000, price: 28000 },
      { label: "100,000회", quantity: 100000, price: 220000 },
    ],
  },
  {
    slug: "tt-likes",
    name: "틱톡 좋아요",
    categorySlug: "tiktok-likes",
    description: "추천 알고리즘에 강한 시그널을 보냅니다.",
    basePrice: 2500,
    salesCount: 3200,
    rating: 4.7,
    options: [
      { label: "100개", quantity: 100, price: 2500 },
      { label: "500개", quantity: 500, price: 11000 },
      { label: "1,000개", quantity: 1000, price: 20000 },
    ],
  },

  // === 카카오톡 ===
  {
    slug: "kt-channel-friends-kr",
    name: "카카오톡 채널친구 늘리기 (한국인 실계정)",
    categorySlug: "kakaotalk-friends",
    description: "사장님·소상공인을 위한 카톡 채널친구 확보. 채널 신뢰도와 메시지 도달률을 동시에 올립니다.",
    longDescription:
      "한국인 실계정 친구로 채널을 채워드립니다.\n채널 친구 수가 많을수록 새 친구 추천 노출과 검색 노출이 함께 상승합니다.\n메시지 발송 시 도달률·열람률도 자연스럽게 개선됩니다.\n수량별 단가가 차등 적용되며, 5,000명 이상 대량 주문 시 추가 할인이 적용됩니다.\n작업은 결제 후 30분 내 시작되며 평균 24~72시간 안에 완료됩니다.",
    basePrice: 15000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 6420,
    rating: 4.9,
    guaranteeInfo: "이탈 시 30일 무상 리필 보장",
    deliveryInfo: "결제 후 30분 내 시작 / 24~72시간 완료",
    options: [
      { label: "100명", quantity: 100, price: 15000 },
      { label: "500명", quantity: 500, price: 60000 },
      { label: "1,000명", quantity: 1000, price: 110000 },
      { label: "3,000명", quantity: 3000, price: 300000 },
      { label: "5,000명", quantity: 5000, price: 450000 },
      { label: "10,000명", quantity: 10000, price: 850000 },
    ],
  },
  {
    slug: "kt-channel-friends-target",
    name: "카카오톡 채널친구 (지역·연령 타겟)",
    categorySlug: "kakaotalk-friends",
    description: "특정 지역·연령대로 타겟팅된 채널친구. 매장·서비스업에 최적.",
    basePrice: 22000,
    badge: "HOT",
    isFeatured: true,
    salesCount: 2180,
    rating: 4.9,
    guaranteeInfo: "30일 유지 보장",
    deliveryInfo: "타겟 컨설팅 후 시작",
    options: [
      { label: "100명 / 지역타겟", quantity: 100, price: 22000 },
      { label: "500명 / 지역타겟", quantity: 500, price: 95000 },
      { label: "1,000명 / 지역타겟", quantity: 1000, price: 180000 },
    ],
  },
  {
    slug: "kt-bizboard-monthly",
    name: "카카오톡 비즈보드 광고 운영 (월관리)",
    categorySlug: "kakaotalk-bizboard",
    description: "카톡 채팅 탭 최상단 노출. 키워드·타겟 세팅부터 소재 제작·최적화까지 풀패키지.",
    longDescription:
      "카카오톡 채팅 탭 최상단에 노출되는 비즈보드 광고를 전문가가 운영해드립니다.\n광고 소재 제작 + 타겟 설정 + 일일 모니터링 + 주간 리포트가 모두 포함됩니다.\n광고비는 별도이며 최소 운영 광고비 30만원부터 권장합니다.",
    basePrice: 290000,
    badge: "NEW",
    isFeatured: true,
    salesCount: 320,
    rating: 4.8,
    guaranteeInfo: "성과 미달 시 1개월 추가 운영",
    deliveryInfo: "킥오프 미팅 후 3영업일 내 광고 ON",
    options: [
      { label: "1개월 운영 / 소재 2종", quantity: 1, price: 290000 },
      { label: "3개월 운영 / 소재 4종", quantity: 3, price: 790000 },
      { label: "6개월 운영 / 소재 8종", quantity: 6, price: 1490000 },
    ],
  },
  {
    slug: "kt-openchat-entry",
    name: "카카오톡 오픈채팅방 입장",
    categorySlug: "kakaotalk-openchat",
    description: "오픈채팅방 인원수 확보. 활성화된 방은 검색·추천 노출이 올라갑니다.",
    basePrice: 18000,
    salesCount: 1240,
    rating: 4.7,
    deliveryInfo: "결제 후 1시간 내 시작",
    options: [
      { label: "50명", quantity: 50, price: 18000 },
      { label: "200명", quantity: 200, price: 55000 },
      { label: "500명", quantity: 500, price: 130000 },
    ],
  },

  // === X (트위터) ===
  {
    slug: "x-followers-kr",
    name: "X(트위터) 한국인 팔로워",
    categorySlug: "x-followers",
    description: "한국 타겟 실계정 기반 X 팔로워. 자연스러운 그래프로 증가.",
    basePrice: 9000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 1820,
    rating: 4.8,
    guaranteeInfo: "30일 유지 보장",
    deliveryInfo: "결제 후 30분 내 시작",
    options: [
      { label: "100명", quantity: 100, price: 9000 },
      { label: "500명", quantity: 500, price: 39000 },
      { label: "1,000명", quantity: 1000, price: 75000 },
      { label: "3,000명", quantity: 3000, price: 210000 },
    ],
  },
  {
    slug: "x-followers-global",
    name: "X(트위터) 글로벌 팔로워 (가성비)",
    categorySlug: "x-followers",
    description: "글로벌 계정 기반 — 빠르고 저렴한 부스팅.",
    basePrice: 3500,
    badge: "SALE",
    salesCount: 2940,
    rating: 4.6,
    options: [
      { label: "100명", quantity: 100, price: 3500 },
      { label: "1,000명", quantity: 1000, price: 24000 },
      { label: "5,000명", quantity: 5000, price: 110000 },
    ],
  },
  {
    slug: "x-likes-retweets",
    name: "X(트위터) 좋아요 + 리트윗 패키지",
    categorySlug: "x-engagement",
    description: "특정 게시물 좋아요/리트윗 동시 부스팅. 알고리즘 노출에 효과적.",
    basePrice: 4500,
    badge: "HOT",
    isFeatured: true,
    salesCount: 2210,
    rating: 4.8,
    deliveryInfo: "10분 내 시작",
    options: [
      { label: "좋아요 100 + RT 30", quantity: 100, price: 4500 },
      { label: "좋아요 500 + RT 150", quantity: 500, price: 22000 },
      { label: "좋아요 1,000 + RT 300", quantity: 1000, price: 40000 },
    ],
  },

  // === 텔레그램 ===
  {
    slug: "tg-subscribers-kr",
    name: "텔레그램 채널 구독자 (한국인)",
    categorySlug: "telegram-subscribers",
    description: "한국 타겟 실계정 텔레그램 채널 구독자. 채널 신뢰도와 활성도 동시 상승.",
    basePrice: 13000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 1450,
    rating: 4.8,
    guaranteeInfo: "30일 유지 보장",
    deliveryInfo: "결제 후 1시간 내 시작",
    options: [
      { label: "100명", quantity: 100, price: 13000 },
      { label: "500명", quantity: 500, price: 55000 },
      { label: "1,000명", quantity: 1000, price: 100000 },
      { label: "5,000명", quantity: 5000, price: 460000 },
    ],
  },
  {
    slug: "tg-subscribers-global",
    name: "텔레그램 채널 구독자 (글로벌 가성비)",
    categorySlug: "telegram-subscribers",
    description: "글로벌 계정 기반. 빠른 처리 + 저렴한 단가.",
    basePrice: 4500,
    badge: "SALE",
    isFeatured: true,
    salesCount: 3220,
    rating: 4.6,
    options: [
      { label: "100명", quantity: 100, price: 4500 },
      { label: "1,000명", quantity: 1000, price: 32000 },
      { label: "10,000명", quantity: 10000, price: 280000 },
    ],
  },
  {
    slug: "tg-post-views",
    name: "텔레그램 게시물 조회수",
    categorySlug: "telegram-views",
    description: "특정 게시물 조회수 부스팅. 메시지 도달율·신뢰도 강화.",
    basePrice: 3500,
    badge: "HOT",
    salesCount: 2810,
    rating: 4.7,
    deliveryInfo: "10분 내 시작",
    options: [
      { label: "1,000회", quantity: 1000, price: 3500 },
      { label: "10,000회", quantity: 10000, price: 28000 },
      { label: "100,000회", quantity: 100000, price: 220000 },
    ],
  },

  // === 스마트스토어 ===
  {
    slug: "ss-purchase-review",
    name: "스마트스토어 구매평 (실구매)",
    categorySlug: "smartstore-review",
    description: "실제 구매 → 결제 → 후기 작성까지 풀세트.",
    longDescription:
      "실제 한국인 계정이 구매하여 구매평까지 자연스럽게 작성합니다.\n구매 금액은 별도 정산되며, 5점 만점 기준으로 작성됩니다.\n포토 리뷰 / 텍스트 리뷰 선택 가능.",
    basePrice: 35000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 2340,
    rating: 4.9,
    guaranteeInfo: "구매평 누락 시 100% 환불",
    options: [
      { label: "텍스트 리뷰 1건", quantity: 1, price: 35000 },
      { label: "포토 리뷰 1건", quantity: 1, price: 49000 },
      { label: "프리미엄 리뷰 1건", quantity: 1, price: 79000 },
    ],
  },
  {
    slug: "ss-traffic",
    name: "스마트스토어 트래픽 유입",
    categorySlug: "smartstore-traffic",
    description: "키워드 검색 → 상품 페이지 진입 트래픽 시뮬레이션.",
    basePrice: 18000,
    badge: "HOT",
    salesCount: 1820,
    rating: 4.7,
    options: [
      { label: "500명", quantity: 500, price: 18000 },
      { label: "1,000명", quantity: 1000, price: 33000 },
      { label: "5,000명", quantity: 5000, price: 145000 },
    ],
  },
  {
    slug: "ss-zzim",
    name: "스마트스토어 찜 증가",
    categorySlug: "smartstore-traffic",
    description: "한국인 계정 기반 찜하기. 상품 신뢰도 강화.",
    basePrice: 8000,
    salesCount: 3120,
    rating: 4.8,
    options: [
      { label: "50건", quantity: 50, price: 8000 },
      { label: "200건", quantity: 200, price: 28000 },
      { label: "500건", quantity: 500, price: 64000 },
    ],
  },
  {
    slug: "ss-rank-monthly",
    name: "스마트스토어 상위노출 (월 관리)",
    categorySlug: "smartstore-rank",
    description: "키워드 분석 + 트래픽 + 구매평 통합 월간 관리.",
    basePrice: 220000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 480,
    rating: 4.9,
    guaranteeInfo: "키워드별 순위 진입 보장",
    deliveryInfo: "1:1 상담 후 시작",
    options: [
      { label: "1개 키워드", quantity: 1, price: 220000 },
      { label: "3개 키워드", quantity: 3, price: 580000 },
      { label: "5개 키워드", quantity: 5, price: 890000 },
    ],
  },

  // === 네이버 블로그 ===
  {
    slug: "nb-rank-monthly",
    name: "블로그 상위노출 (월 관리)",
    categorySlug: "naver-blog-rank",
    description: "블로그 지수 관리 + 키워드 분석 + 포스팅 최적화.",
    basePrice: 220000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 720,
    rating: 4.9,
    guaranteeInfo: "VIEW탭 상위노출 보장",
    options: [
      { label: "1개 키워드", quantity: 1, price: 220000 },
      { label: "3개 키워드", quantity: 3, price: 580000 },
    ],
  },
  {
    slug: "nb-neighbor",
    name: "블로그 이웃 추가 (한국인)",
    categorySlug: "naver-blog-neighbor",
    description: "한국인 실계정 기반 이웃 추가 — 블로그 지수 상승.",
    basePrice: 9000,
    badge: "HOT",
    salesCount: 2840,
    rating: 4.8,
    options: [
      { label: "100명", quantity: 100, price: 9000 },
      { label: "500명", quantity: 500, price: 40000 },
      { label: "1,000명", quantity: 1000, price: 75000 },
    ],
  },
  {
    slug: "nb-empathy",
    name: "블로그 공감·댓글",
    categorySlug: "naver-blog-neighbor",
    description: "특정 포스트의 공감과 댓글을 자연스럽게 늘립니다.",
    basePrice: 5500,
    salesCount: 1920,
    rating: 4.7,
    options: [
      { label: "공감 50개", quantity: 50, price: 5500 },
      { label: "공감 200개", quantity: 200, price: 19000 },
      { label: "공감+댓글 50개", quantity: 50, price: 29000 },
    ],
  },
  {
    slug: "nb-experience",
    name: "블로그 체험단 매칭",
    categorySlug: "naver-blog-review",
    description: "활동 블로거 매칭 — 양질의 후기 콘텐츠 생성.",
    basePrice: 220000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 360,
    rating: 4.9,
    guaranteeInfo: "블로거 지수 검증 후 매칭",
    options: [
      { label: "블로거 3명", quantity: 3, price: 220000 },
      { label: "블로거 5명", quantity: 5, price: 350000 },
      { label: "블로거 10명", quantity: 10, price: 650000 },
    ],
  },

  // === 네이버 카페 ===
  {
    slug: "nc-members-kr",
    name: "네이버 카페 가입자 늘리기 (한국인 실계정)",
    categorySlug: "naver-cafe-members",
    description: "한국인 실계정 가입으로 카페 활성도와 검색 노출을 동시에 끌어올립니다.",
    longDescription:
      "카페 가입자 수는 검색 노출과 신뢰도의 핵심 지표입니다.\n한국인 실계정 가입으로 자연스럽게 카페를 성장시켜드립니다.\n등업 조건이 있는 카페는 별도 컨설팅 후 진행됩니다.",
    basePrice: 39000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 880,
    rating: 4.9,
    guaranteeInfo: "탈퇴 시 30일 무상 리필",
    deliveryInfo: "결제 후 1시간 내 시작",
    options: [
      { label: "50명", quantity: 50, price: 39000 },
      { label: "200명", quantity: 200, price: 145000 },
      { label: "500명", quantity: 500, price: 340000 },
      { label: "1,000명", quantity: 1000, price: 620000 },
    ],
  },
  {
    slug: "nc-comments",
    name: "네이버 카페 게시물 댓글·좋아요",
    categorySlug: "naver-cafe-engagement",
    description: "특정 게시물에 자연스러운 댓글과 좋아요. 카페 활성화 지표 상승.",
    basePrice: 15000,
    badge: "HOT",
    salesCount: 1320,
    rating: 4.8,
    deliveryInfo: "20분 내 시작",
    options: [
      { label: "댓글 20개", quantity: 20, price: 15000 },
      { label: "댓글 50개", quantity: 50, price: 32000 },
      { label: "댓글 100 + 좋아요 100", quantity: 100, price: 65000 },
    ],
  },
  {
    slug: "nc-rank-monthly",
    name: "네이버 카페 검색 상위노출 (월관리)",
    categorySlug: "naver-cafe-rank",
    description: "카페글이 통합검색·VIEW 탭 상위에 노출되도록 키워드별 종합 관리.",
    basePrice: 240000,
    badge: "BEST",
    isFeatured: true,
    salesCount: 240,
    rating: 4.9,
    guaranteeInfo: "키워드별 상위 진입 보장",
    deliveryInfo: "1:1 상담 후 시작 / 월 단위 진행",
    options: [
      { label: "1개 키워드", quantity: 1, price: 240000 },
      { label: "3개 키워드", quantity: 3, price: 620000 },
      { label: "5개 키워드", quantity: 5, price: 950000 },
    ],
  },
];

async function main() {
  console.log("🌱 시드 시작...");

  // 사용 중단된 플랫폼(naver-place) 데이터 정리
  const deprecated = await prisma.product.findMany({
    where: { category: { slug: { startsWith: "naver-place" } } },
    select: { id: true },
  });
  if (deprecated.length > 0) {
    const ids = deprecated.map((p) => p.id);
    await prisma.productOption.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.category.deleteMany({ where: { slug: { startsWith: "naver-place" } } });
  if (deprecated.length > 0) {
    console.log(`✓ 네이버플레이스 잔존 상품 ${deprecated.length}개 + 카테고리 정리 완료`);
  }

  // 카테고리 upsert
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, platform: c.platform, sortOrder: c.sortOrder },
    });
  }
  console.log(`✓ 카테고리 ${CATEGORIES.length}개 처리 완료`);

  // 상품 upsert
  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!category) {
      console.warn(`⚠ 카테고리 없음: ${p.categorySlug}`);
      continue;
    }
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        longDescription: p.longDescription,
        categoryId: category.id,
        basePrice: p.basePrice,
        badge: p.badge,
        isFeatured: p.isFeatured ?? false,
        salesCount: p.salesCount ?? 0,
        rating: p.rating ?? 5.0,
        guaranteeInfo: p.guaranteeInfo,
        deliveryInfo: p.deliveryInfo,
      },
      update: {
        name: p.name,
        description: p.description,
        longDescription: p.longDescription,
        basePrice: p.basePrice,
        badge: p.badge,
        isFeatured: p.isFeatured ?? false,
        salesCount: p.salesCount ?? 0,
        rating: p.rating ?? 5.0,
        guaranteeInfo: p.guaranteeInfo,
        deliveryInfo: p.deliveryInfo,
      },
    });

    // 옵션 재구성 (기존 삭제 후 생성)
    await prisma.productOption.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < p.options.length; i++) {
      const opt = p.options[i];
      await prisma.productOption.create({
        data: {
          productId: product.id,
          label: opt.label,
          quantity: opt.quantity,
          price: opt.price,
          sortOrder: i,
        },
      });
    }
  }
  console.log(`✓ 상품 ${PRODUCTS.length}개 처리 완료`);

  // 관리자/테스트 계정
  const adminHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@boostermarket.dev" },
    create: {
      email: "admin@boostermarket.dev",
      name: "운영자",
      passwordHash: adminHash,
      role: "ADMIN",
      points: 100000,
    },
    update: { role: "ADMIN" },
  });
  const userHash = await bcrypt.hash("test1234", 10);
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    create: {
      email: "test@example.com",
      name: "테스트유저",
      passwordHash: userHash,
      points: 5000,
    },
    update: {},
  });
  console.log("✓ 계정 시드: admin@boostermarket.dev / admin1234, test@example.com / test1234");

  console.log("🌱 시드 완료!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
