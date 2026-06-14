// 한국 타겟 부활 + 신규 카테고리 12개 확장
//   Phase A: 글로벌 → 한국인 복원 (urpanel KOREA 매핑)
//   Phase B: 비활성 카테고리/상품 부활 (유튜브 구독자, 인스타 릴스)
//   Phase C: 신규 카테고리 + 상품 12개 추가
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const USD_TO_KRW = 1400;
const MARKUP = 2.0; // 마진율 100% = 원가 × 2
const MIN_PRICE = 500;

function priceFor(rateUsdPer1000: number, qty: number): number {
  const costUsd = (rateUsdPer1000 * qty) / 1000;
  const krw = costUsd * USD_TO_KRW * MARKUP;
  return Math.max(MIN_PRICE, Math.round(krw / 100) * 100);
}

type OptionDef = { label: string; quantity: number; price?: number };
type Faq = { q: string; a: string };
type ProductDef = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  deliveryInfo: string;
  guaranteeInfo: string;
  faqs: Faq[];
  keywords: string;
  basePrice?: number;
  badge?: "HOT" | "BEST" | "SALE" | "NEW";
  isActive?: boolean;
  isFeatured?: boolean;
  categorySlug: string; // 부모 카테고리 slug
  serviceId: number;
  rate: number; // USD per 1000
  optionTiers: number[]; // 수량 옵션
};

// ────────────────────────────────────────────────────────────────
// Phase A: 한국 복원 (rename + remap)
// ────────────────────────────────────────────────────────────────
const PHASE_A: Array<{ slug: string; newName: string; newServiceId: number; rate: number; optionTiers: number[]; descUpdate?: Partial<ProductDef> }> = [
  {
    slug: "ig-followers-kr",
    newName: "인스타 한국인 팔로워 (실계정 · HQ)",
    newServiceId: 11869,
    rate: 9.75,
    optionTiers: [50, 100, 250, 500, 1000],
    descUpdate: {
      description: "한국 🇰🇷 실계정 기반 인스타 팔로워. 80% 여성 비율 · No Drop · 6+ 게시물 보유 활성 계정.",
      longDescription: `한국에서 활동하는 실제 사용자 계정(80% 여성)으로 인스타 팔로워를 늘려드립니다. 프로필 게시물 6개 이상 보유한 활성 계정만 사용하여, 단순 봇이 아닌 진짜 유저처럼 자연스러운 팔로워 그래프를 형성합니다.

No Drop 정책으로 팔로워가 빠지지 않습니다. 한국 IP 기반이라 알고리즘이 "한국 콘텐츠"로 인식하여 한국인 추천 노출에 직접적인 도움을 줍니다.

비밀번호는 절대 요구하지 않습니다. 공개 프로필 URL 또는 사용자명만 알려주시면 됩니다. 한국인 비율이 중요한 인플루언서, 비즈니스 계정, 협찬 대상자에게 강력 추천합니다.

활용 추천: 한국 인플루언서 데뷔, 한국 시장 비즈니스 계정, 협찬 제안 자료, 한국인 타겟 광고.`,
      keywords: "인스타 팔로워, 한국인 팔로워, 인스타 한국, 한국 타겟 마케팅, 인스타그램 팔로워 늘리기",
    },
  },
  {
    slug: "ig-likes-kr",
    newName: "인스타 게시물 좋아요 (한국인 🇰🇷)",
    newServiceId: 11871,
    rate: 3.0,
    optionTiers: [25, 50, 100, 250, 500],
    descUpdate: {
      description: "한국 실계정 좋아요. 80% 여성 · No Drop · 6+ 게시물 보유 활성 계정.",
      longDescription: `특정 인스타 게시물에 한국 🇰🇷 실계정으로 좋아요를 추가합니다. 80% 여성 비율의 활성 사용자라 한국인 타겟 콘텐츠의 인기 시그널을 효과적으로 만듭니다.

No Drop 정책으로 좋아요가 빠지지 않으며, 게시물 게시 직후 활용 시 한국인 추천 피드 진입에 큰 도움이 됩니다. 게시물 URL만 알려주시면 즉시 작업 시작됩니다.

활용 추천: 새 게시물 게시 직후, 한국 광고/이벤트 게시물, 한국 인플루언서 협찬 게시물.`,
      keywords: "인스타 좋아요, 한국 좋아요, 한국인 좋아요, 인스타그램 게시물 좋아요",
    },
  },
];

// ────────────────────────────────────────────────────────────────
// Phase B: 비활성 카테고리/상품 부활
// ────────────────────────────────────────────────────────────────
const PHASE_B: Array<{
  productSlug: string;
  newName?: string;
  serviceId: number;
  rate: number;
  optionTiers: number[];
  reactivateCategory: string; // category slug
  descUpdate?: Partial<ProductDef>;
}> = [
  {
    productSlug: "yt-subscribers-global",
    newName: "유튜브 구독자 (7일 리필 보장)",
    serviceId: 976,
    rate: 4.95,
    optionTiers: [50, 100, 500, 1000, 3000],
    reactivateCategory: "youtube-subscribers",
    descUpdate: {
      description: "유튜브 구독자 빠르게 증가 · 7일 리필 보장 · 평생 안정 신호.",
      longDescription: `유튜브 채널의 구독자 수를 빠르게 늘려드립니다. 채널의 신뢰도와 협찬 단가 협상력에 직접적인 영향을 주는 핵심 지표입니다.

Super Fast 처리 속도로 결제 후 즉시 시작되며, 7일 이내 자연 감소분은 무료 리필됩니다.

활용 추천: 신규 채널 시드 구독자, 1만 구독자 달성, 광고 단가 협상, 협찬 자격 확보.`,
      faqs: [
        { q: "구독자가 빠질 수 있나요?", a: "7일 이내 자연 감소는 무료 리필됩니다. 이후엔 자체 활동성으로 유지 관리됩니다." },
        { q: "비밀번호를 알려줘야 하나요?", a: "아니요. 채널 URL만 알려주시면 됩니다." },
        { q: "한국인 구독자인가요?", a: "글로벌 혼합입니다. 한국 타겟 시청자는 별도 상품을 확인해주세요." },
        { q: "신규 채널도 가능?", a: "가능합니다. 다만 최소 영상 1개 이상 게시 후 진행 권장합니다." },
      ],
      keywords: "유튜브 구독자, 유튜브 구독자 늘리기, 채널 구독자, YouTube Subscribers",
      badge: "BEST",
    },
  },
  {
    productSlug: "ig-reels-views",
    newName: "인스타 릴스 + IGTV 조회수 부스팅",
    serviceId: 11200,
    rate: 0.0065,
    optionTiers: [1000, 5000, 10000, 50000, 100000],
    reactivateCategory: "instagram-reels",
    descUpdate: {
      description: "릴스·IGTV·비디오 조회수 일괄 부스팅 · Instant 시작 · 매우 저렴.",
      longDescription: `인스타그램 릴스(Reels), IGTV, 일반 비디오 게시물의 조회수를 부스팅합니다. Instant 시작으로 게시 직후 즉시 노출 신호를 만들 수 있어 추천 피드 진입에 유리합니다.

매우 저렴한 단가로 대량 조회수 확보가 가능하며, 1억 단위까지 처리 가능합니다. 릴스 알고리즘은 첫 1~3시간의 누적 조회수가 결정적이므로, 게시 직후 활용을 권장합니다.

활용 추천: 신규 릴스 게시 직후, 챌린지·트렌드 참여, 광고 게시물 노출 강화, 브랜드 콘텐츠 확산.`,
      faqs: [
        { q: "일반 피드 비디오도 가능한가요?", a: "네, 릴스 / IGTV / 일반 비디오 모두 가능합니다." },
        { q: "스토리(Story) 조회수도 같이?", a: "스토리는 별도 상품을 이용해주세요." },
        { q: "조회수가 줄어들 수 있나요?", a: "안정적이며 거의 줄지 않습니다." },
        { q: "얼마나 빨리 시작?", a: "Instant 시작 (결제 후 1~3분 내)." },
      ],
      keywords: "인스타 릴스, 릴스 조회수, IGTV 조회수, 인스타 비디오, 릴스 알고리즘",
      badge: "HOT",
    },
  },
];

// ────────────────────────────────────────────────────────────────
// Phase C: 신규 카테고리 + 상품
// ────────────────────────────────────────────────────────────────
type NewCategoryDef = {
  slug: string;
  name: string;
  platform: "SNS";
  iconEmoji?: string;
  sortOrder: number;
};
type NewProductDef = ProductDef;

const NEW_CATEGORIES: NewCategoryDef[] = [
  { slug: "instagram-comments", name: "인스타 댓글", platform: "SNS", iconEmoji: "💬", sortOrder: 12 },
  { slug: "instagram-stories", name: "인스타 스토리 조회수", platform: "SNS", iconEmoji: "📸", sortOrder: 13 },
  { slug: "instagram-saves", name: "인스타 게시물 저장", platform: "SNS", iconEmoji: "🔖", sortOrder: 14 },
  { slug: "youtube-watchtime", name: "유튜브 시청시간", platform: "SNS", iconEmoji: "⏱", sortOrder: 22 },
  { slug: "youtube-korea", name: "유튜브 한국 타겟", platform: "SNS", iconEmoji: "🇰🇷", sortOrder: 23 },
  { slug: "tiktok-comments", name: "틱톡 댓글", platform: "SNS", iconEmoji: "💬", sortOrder: 32 },
  { slug: "tiktok-shares", name: "틱톡 공유/저장", platform: "SNS", iconEmoji: "🔄", sortOrder: 33 },
  { slug: "x-retweets", name: "X(트위터) 리트윗", platform: "SNS", iconEmoji: "🔁", sortOrder: 42 },
  { slug: "x-impressions", name: "X(트위터) 트윗 조회수", platform: "SNS", iconEmoji: "👀", sortOrder: 43 },
  { slug: "telegram-reactions", name: "텔레그램 리액션", platform: "SNS", iconEmoji: "❤️", sortOrder: 52 },
  { slug: "telegram-bot-start", name: "텔레그램 봇 사용자", platform: "SNS", iconEmoji: "🤖", sortOrder: 53 },
  { slug: "telegram-premium", name: "텔레그램 프리미엄 멤버", platform: "SNS", iconEmoji: "⭐", sortOrder: 54 },
];

const NEW_PRODUCTS: NewProductDef[] = [
  // ── 인스타 댓글 ──
  {
    slug: "ig-comments-real",
    name: "인스타 게시물 댓글 (실계정)",
    categorySlug: "instagram-comments",
    serviceId: 11371,
    rate: 0.70,
    optionTiers: [5, 10, 25, 50, 100],
    description: "특정 게시물에 실계정 댓글. 게시물 신뢰도와 알고리즘 신호 강화.",
    longDescription: `인스타그램 게시물에 실제 사용자 계정으로 좋아요+댓글이 함께 추가됩니다. 0~15분 내 시작되어 게시 직후 부스팅에 효과적입니다.

댓글은 좋아요보다 훨씬 강한 알고리즘 신호입니다. 추천 피드 진입과 게시물 신뢰도에 직접적인 영향을 줍니다. 글로벌 계정 기반이라 단가가 합리적이며, 30K/Day로 빠르게 처리됩니다.

활용 추천: 새 게시물 게시 직후 부스팅, 광고·이벤트 게시물 신뢰도 강화, 브랜드 협찬 게시물.`,
    deliveryInfo: "0~15분 내 시작 · 30K/Day 처리",
    guaranteeInfo: "댓글 자연 유지",
    faqs: [
      { q: "댓글 내용을 지정할 수 있나요?", a: "이 상품은 자동 댓글입니다. 지정 문구가 필요하면 커스텀 댓글 상품을 이용해주세요." },
      { q: "한국어 댓글인가요?", a: "글로벌 혼합입니다. 영문 위주이며 한국어 보장은 어렵습니다." },
      { q: "비공개 게시물도 가능?", a: "공개 게시물만 가능합니다." },
      { q: "댓글이 삭제될 수 있나요?", a: "안정적으로 유지됩니다." },
    ],
    keywords: "인스타 댓글, 인스타그램 댓글, 게시물 댓글, 인스타 마케팅",
  },
  // ── 인스타 스토리 ──
  {
    slug: "ig-story-views",
    name: "인스타 스토리 조회수 부스팅",
    categorySlug: "instagram-stories",
    serviceId: 9328,
    rate: 0.012,
    optionTiers: [1000, 5000, 10000, 20000],
    description: "스토리 조회수 ULTRAFAST 부스팅 · 24시간 노출 효과 극대화.",
    longDescription: `인스타그램 스토리의 조회수를 빠르게 늘려 24시간 노출 효과를 극대화합니다. 스토리는 게시 후 24시간만 노출되기에 첫 몇 시간의 조회수 누적이 매우 중요합니다.

ULTRAFAST 속도로 0~15분 내 시작됩니다. 모든 스토리(All Story)에 자동 적용되며, 수동 선택도 가능합니다. 24시간 안에 빠르게 처리되어 스토리 만료 전 효과를 확보합니다.

활용 추천: 광고 스토리 노출, 이벤트·할인 안내, 인플루언서 스토리 협찬, 신규 콘텐츠 홍보.`,
    deliveryInfo: "0~15분 내 시작 · ULTRAFAST",
    guaranteeInfo: "24시간 안정 유지",
    faqs: [
      { q: "특정 스토리만 가능한가요?", a: "All Story 옵션으로 모든 스토리에 적용됩니다. 특정 스토리는 별도 문의." },
      { q: "스토리 만료 후엔?", a: "스토리가 만료되면 작업도 종료됩니다. 게시 직후 주문 권장합니다." },
      { q: "비공개 계정도?", a: "공개 계정만 가능합니다." },
      { q: "하이라이트도 가능?", a: "하이라이트는 별도 상품 예정입니다." },
    ],
    keywords: "인스타 스토리, 스토리 조회수, 인스타 스토리 부스팅, 24시간 노출",
  },
  // ── 인스타 저장 ──
  {
    slug: "ig-saves",
    name: "인스타 게시물 저장 (Saves) 부스팅",
    categorySlug: "instagram-saves",
    serviceId: 11471,
    rate: 0.0036,
    optionTiers: [500, 1000, 5000, 10000],
    description: "Saves는 인스타 알고리즘이 가장 좋아하는 신호. 추천 진입 확률 상승.",
    longDescription: `인스타그램 게시물의 저장(Saves) 수를 늘립니다. Saves는 알고리즘이 가장 높이 평가하는 시그널 중 하나로, "이 게시물은 다시 보고 싶을 만큼 가치 있다"는 의미입니다.

좋아요·댓글보다 추천 피드 진입에 큰 영향을 줍니다. 1시간 내 시작되며 100K까지 처리 가능합니다.

활용 추천: 정보성 콘텐츠(팁/가이드), 인포그래픽, 레시피·튜토리얼, 알고리즘 추천 진입 목표.`,
    deliveryInfo: "1시간 내 시작 · Max 100K",
    guaranteeInfo: "저장 안정 유지",
    faqs: [
      { q: "저장이 좋아요보다 효과적인가요?", a: "네, 알고리즘 가중치가 높습니다. 정보성 콘텐츠에 특히 효과적." },
      { q: "팔로워 한테 보이나요?", a: "저장은 비공개입니다. 본인만 확인 가능합니다." },
      { q: "어떤 게시물에 적합?", a: "튜토리얼, 팁, 인포그래픽, 레시피 등 \"다시 볼 가치\"가 있는 콘텐츠." },
    ],
    keywords: "인스타 저장, 인스타그램 Saves, 인스타 알고리즘, 추천 피드 진입",
  },
  // ── 유튜브 시청시간 ──
  {
    slug: "yt-watchtime",
    name: "유튜브 시청시간 (Watchtime) - 10시간 단위",
    categorySlug: "youtube-watchtime",
    serviceId: 12911,
    rate: 2.99,
    optionTiers: [100, 500, 1000, 3000],
    description: "수익화 4,000시간 달성용 · 1000=10시간 · 평생 리필 보장.",
    longDescription: `유튜브 채널의 시청시간(Watchtime)을 늘려드립니다. **1000 단위 = 10시간 시청** 으로 환산되며, 유튜브 파트너 프로그램 자격 요건인 4,000시간 시청 달성에 핵심적입니다.

1분 이상 길이의 영상에 적용 가능하며, External Source(외부 트래픽) 기반으로 자연스러운 시청자 유입처럼 처리됩니다. Non Drop · Lifetime Refill 보장으로 빠지지 않습니다.

활용 추천: 유튜브 파트너 프로그램(YPP) 4,000시간 달성, 채널 활성도 강화, 광고 단가 향상.`,
    deliveryInfo: "시작 후 250시간/Day 속도",
    guaranteeInfo: "Non Drop · 평생 리필",
    faqs: [
      { q: "1000 옵션이 10시간이라고요?", a: "맞습니다. 1000 단위 주문 = 10시간 시청 추가." },
      { q: "수익화 4,000시간 달성에 사용 가능?", a: "네, 정확히 그 목적의 상품입니다. 400개 주문 시 4,000시간." },
      { q: "영상 길이 제한?", a: "1분 이상 영상이어야 합니다. 쇼츠는 적용 안 됩니다." },
      { q: "시청 비율이 어떻게 측정되나요?", a: "유튜브가 \"평균 시청 시간\"으로 기록합니다." },
      { q: "여러 영상에 분산 가능?", a: "주문은 영상 단위입니다. 여러 영상은 각각 주문." },
    ],
    keywords: "유튜브 시청시간, 유튜브 Watchtime, 4000시간, 유튜브 수익화, YPP",
    badge: "HOT",
  },
  // ── 유튜브 한국 타겟 ──
  {
    slug: "yt-likes-korea",
    name: "유튜브 좋아요 (한국 타겟 🇰🇷)",
    categorySlug: "youtube-korea",
    serviceId: 12677,
    rate: 6.75,
    optionTiers: [10, 50, 100, 500, 1000],
    description: "South Korea 🇰🇷 타겟 진짜 좋아요 · 평생 리필 · 한국 채널 핵심 자산.",
    longDescription: `한국 🇰🇷 사용자 계정으로 유튜브 영상에 좋아요를 추가합니다. 단순 봇이 아닌 한국 IP 환경의 실제 활동 계정 위주로 진행되어, 한국 시장 채널의 신뢰도 강화에 효과적입니다.

평생 리필 보장이라 좋아요가 빠지지 않습니다. 한국 채널, 한국 콘텐츠 크리에이터, 한국 광고주 협상에 핵심적인 한국 시장 시그널을 확보합니다.

활용 추천: 한국 유튜브 크리에이터, 한국 시장 비즈니스 채널, 한국 광고주 협찬 대상 채널.`,
    deliveryInfo: "10K/Day 속도 · No Drop",
    guaranteeInfo: "Lifetime 평생 리필 보장",
    faqs: [
      { q: "정말 한국 계정인가요?", a: "네, South Korea 🇰🇷 타겟 서비스로 한국 IP/계정 위주로 진행됩니다." },
      { q: "구독자도 한국 타겟 가능?", a: "현재는 좋아요만 한국 타겟 가능합니다. 구독자는 글로벌 상품이 있습니다." },
      { q: "비공개/미등록 영상?", a: "공개 영상만 가능합니다." },
      { q: "좋아요가 줄어들 수 있나요?", a: "평생 리필 보장으로 빠지면 자동 보충됩니다." },
    ],
    keywords: "유튜브 한국, 유튜브 좋아요, 한국 타겟, 한국 유튜브, 유튜브 마케팅",
    badge: "NEW",
  },
  // ── 틱톡 댓글 ──
  {
    slug: "tt-comments",
    name: "틱톡 커스텀 댓글 (실계정)",
    categorySlug: "tiktok-comments",
    serviceId: 11734,
    rate: 2.62,
    optionTiers: [10, 25, 50, 100],
    description: "원하는 문구로 틱톡 댓글 작성 · 실계정 · For You 진입 신호 강화.",
    longDescription: `틱톡 영상에 직접 작성하신 댓글 문구를 실제 사용자 계정으로 입력해드립니다. 댓글은 좋아요보다 강한 알고리즘 신호로, For You Page (FYP) 진입 확률을 크게 높입니다.

원하시는 댓글 내용을 미리 작성해 주문 시 입력해주세요. 다수 계정에서 시간을 분산해 자연스럽게 작성됩니다.

활용 추천: 챌린지 영상 활성화, 광고 영상 신뢰도, 이벤트 응모 활성화, FYP 진입 부스팅.`,
    deliveryInfo: "결제 후 30분 내 시작",
    guaranteeInfo: "실계정 안정 처리",
    faqs: [
      { q: "댓글 문구는 어디 입력?", a: "주문 시 요청사항 칸에 원하는 댓글을 작성해주세요. 1줄에 하나씩 여러 개 가능." },
      { q: "한국어 댓글 가능?", a: "글로벌 댓글 위주이며 한국어 100% 보장은 어렵습니다." },
      { q: "이모지 가능?", a: "네, 이모지 포함 가능합니다." },
      { q: "댓글이 삭제되면?", a: "30일 이내 자연 삭제는 무료 보충됩니다." },
    ],
    keywords: "틱톡 댓글, TikTok Comments, 틱톡 마케팅, 틱톡 FYP",
  },
  // ── 틱톡 공유 ──
  {
    slug: "tt-shares",
    name: "틱톡 영상 공유/저장 부스팅",
    categorySlug: "tiktok-shares",
    serviceId: 3820,
    rate: 0.094,
    optionTiers: [1000, 5000, 10000, 50000],
    description: "Shares는 틱톡 알고리즘이 가장 좋아하는 신호 · 30일 리필.",
    longDescription: `틱톡 영상의 공유(Share) 수를 늘립니다. Shares는 좋아요·댓글보다 알고리즘이 더 높이 평가하는 시그널로, "이 영상은 다른 사람에게 보여줄 가치가 있다"는 의미입니다.

10분 내 시작 · 500K/Day로 빠르게 처리되며, 30일 리필 보장이 포함됩니다. 매우 저렴한 단가로 대량 부스팅 가능합니다.

활용 추천: 챌린지·바이럴 부스팅, FYP 진입 시도, 브랜드 영상 확산, 트렌드 영상.`,
    deliveryInfo: "10분 내 시작 · 500K/Day",
    guaranteeInfo: "30일 리필 보장",
    faqs: [
      { q: "Shares가 좋아요보다 효과적?", a: "네, 알고리즘 가중치가 가장 높은 신호입니다." },
      { q: "Saves(저장)도 같이?", a: "이 상품은 Shares 위주입니다." },
      { q: "비공개 영상?", a: "공개 영상만 가능합니다." },
    ],
    keywords: "틱톡 공유, 틱톡 Shares, 틱톡 바이럴, FYP, 틱톡 알고리즘",
  },
  // ── X 리트윗 ──
  {
    slug: "x-retweets",
    name: "X(트위터) 리트윗 부스팅",
    categorySlug: "x-retweets",
    serviceId: 5638,
    rate: 1.84,
    optionTiers: [50, 100, 250, 500],
    description: "특정 트윗 리트윗 부스팅 · 트윗 확산력 강화 · 5K/Day.",
    longDescription: `특정 트윗에 리트윗(RT) 수를 늘려 X(트위터)의 확산 알고리즘 신호를 강화합니다. 리트윗은 좋아요보다 강한 확산 시그널로, 트윗 노출 범위를 직접 확대합니다.

5K/Day 속도로 1시간 내 시작됩니다. 트윗 게시 직후 부스팅 시 가장 효과적입니다.

활용 추천: 광고·홍보 트윗 확산, 이벤트·캠페인 트윗, 인플루언서 트윗 노출 강화.`,
    deliveryInfo: "1시간 내 시작 · 5K/Day",
    guaranteeInfo: "리트윗 안정 유지",
    faqs: [
      { q: "좋아요도 같이?", a: "리트윗만 추가됩니다. 좋아요는 별도 상품 있습니다." },
      { q: "Quote Retweet도?", a: "일반 리트윗(RT)만 가능합니다." },
      { q: "비공개 트윗?", a: "공개 트윗만 가능합니다." },
      { q: "트윗 삭제 시?", a: "URL 무효 처리되며 환불 또는 변경 가능합니다." },
    ],
    keywords: "트위터 리트윗, X 리트윗, 트윗 확산, Retweet",
  },
  // ── X 임프레션/북마크 ──
  {
    slug: "x-impressions",
    name: "X(트위터) 트윗 조회수 (Tweet Views)",
    categorySlug: "x-impressions",
    serviceId: 5669,
    rate: 0.013,
    optionTiers: [10000, 50000, 100000, 500000],
    description: "트윗 조회수 폭증 · 5M/Day · No Drop · 가성비 최고.",
    longDescription: `X(트위터)의 트윗 조회수(Tweet Views / Impressions)를 빠르게 늘립니다. 매우 저렴한 단가로 대량 부스팅이 가능하며, No Drop 보장입니다.

조회수는 알고리즘 트렌드 진입의 핵심 지표입니다. 1시간 내 시작 · 5M/Day의 압도적 속도로 처리됩니다.

활용 추천: 트렌드 진입 시도, 광고 트윗 노출, 바이럴 트윗 만들기, 단가 협상 자료.`,
    deliveryInfo: "1시간 내 시작 · 5M/Day",
    guaranteeInfo: "No Drop 보장",
    faqs: [
      { q: "임프레션과 조회수 차이?", a: "비슷한 개념입니다. 트윗이 사용자 피드에 노출된 횟수." },
      { q: "비공개 트윗?", a: "공개 트윗만 가능합니다." },
      { q: "줄어들 수 있나요?", a: "No Drop 보장이라 안정적입니다." },
    ],
    keywords: "트위터 조회수, X 조회수, 트윗 임프레션, Tweet Views",
  },
  // ── 텔레그램 리액션 ──
  {
    slug: "tg-reactions-positive",
    name: "텔레그램 포지티브 리액션 (이모지)",
    categorySlug: "telegram-reactions",
    serviceId: 12160,
    rate: 0.065,
    optionTiers: [100, 500, 1000, 5000, 10000],
    description: "👍🤩🎉🔥❤️🥰👏 긍정 이모지 리액션 · No Drop · 30일 리필.",
    longDescription: `텔레그램 게시물에 긍정 이모지 리액션(👍🤩🎉🔥❤️🥰👏🏻)을 추가합니다. 게시물의 신뢰도와 활성도를 시각적으로 강화하는 가장 저렴하고 효과적인 방법입니다.

Instant 시작 · No Drop · 30일 리필 보장. 채널 게시물의 시그널 강화에 매우 유용합니다.

활용 추천: 광고 게시물 신뢰도, 정보 공유 채널 활성도, 마케팅 메시지 도달율.`,
    deliveryInfo: "Instant 시작",
    guaranteeInfo: "No Drop · 30일 리필",
    faqs: [
      { q: "어떤 이모지가 추가?", a: "긍정 이모지 위주 (👍🤩🎉🔥❤️🥰👏)로 자동 배분됩니다." },
      { q: "특정 이모지 지정 가능?", a: "이 상품은 자동 배분입니다." },
      { q: "여러 게시물?", a: "게시물 단위 주문입니다." },
      { q: "공개 채널만 가능?", a: "네, 공개 채널 게시물만 가능합니다." },
    ],
    keywords: "텔레그램 리액션, 텔레그램 이모지, 텔레그램 좋아요, 채널 활성화",
  },
  // ── 텔레그램 봇 시작 ──
  {
    slug: "tg-bot-start",
    name: "텔레그램 봇 사용자 (Bot Start)",
    categorySlug: "telegram-bot-start",
    serviceId: 12898,
    rate: 0.40,
    optionTiers: [100, 500, 1000, 5000],
    description: "텔레그램 봇 사용자 늘리기 · Instant · 마케팅 봇 운영 필수.",
    longDescription: `텔레그램 봇의 사용자(/start 누른 유저) 수를 늘려드립니다. 마케팅 봇, 커뮤니티 봇, 챗봇 등을 운영하는 경우 활성 사용자 수가 신뢰도의 핵심입니다.

Instant 시작 · 매우 저렴. 봇 URL만 알려주시면 진행됩니다.

활용 추천: 마케팅 자동화 봇, 커뮤니티 봇, 챗봇 시드 유저, 봇 광고 단가 협상.`,
    deliveryInfo: "Instant 시작",
    guaranteeInfo: "봇 사용자 안정 유지",
    faqs: [
      { q: "봇 URL 형식?", a: "@봇이름 또는 t.me/봇이름 형식으로 입력해주세요." },
      { q: "사용자가 메시지도 보내나요?", a: "/start 누른 사용자만 추가됩니다. 메시지 발송은 아닙니다." },
      { q: "비공개 봇?", a: "공개 봇만 가능합니다." },
    ],
    keywords: "텔레그램 봇, Bot Start, 텔레그램 마케팅 봇, 챗봇",
  },
  // ── 텔레그램 프리미엄 멤버 ──
  {
    slug: "tg-premium-members",
    name: "텔레그램 프리미엄 멤버 (⭐)",
    categorySlug: "telegram-premium",
    serviceId: 11831,
    rate: 3.25,
    optionTiers: [50, 100, 250, 500, 1000],
    description: "텔레그램 프리미엄 ⭐ 마크 사용자 멤버 · 채널 격 ↑ · 7일 리필.",
    longDescription: `텔레그램 프리미엄(⭐) 멤버를 채널 구독자로 추가합니다. 프리미엄 계정은 일반 계정보다 활성도가 높고, 채널 격을 시각적으로 향상시킵니다.

조회수(Views)도 함께 추가되어 채널 활성도가 함께 상승합니다. 0~1시간 내 시작 · 20K/Day · 7일 리필 보장.

활용 추천: 고급 비즈니스 채널, 프리미엄 콘텐츠 채널, 협찬·광고 단가 강화.`,
    deliveryInfo: "0~1시간 내 시작 · 20K/Day",
    guaranteeInfo: "7일 리필 보장",
    faqs: [
      { q: "프리미엄과 일반 차이?", a: "프리미엄 계정은 ⭐ 마크가 표시되며 활성도가 높아 채널 격이 올라갑니다." },
      { q: "조회수도 함께?", a: "네, 멤버와 조회수가 함께 추가됩니다." },
      { q: "비공개 채널?", a: "공개 채널만 가능합니다." },
    ],
    keywords: "텔레그램 프리미엄, Telegram Premium, 프리미엄 멤버, 채널 격 상승",
  },
];

// ────────────────────────────────────────────────────────────────
// 실행
// ────────────────────────────────────────────────────────────────
async function main() {
  const p = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) });

  console.log("\n=== Phase A: 한국 복원 ===");
  for (const a of PHASE_A) {
    const prod = await p.product.findUnique({ where: { slug: a.slug } });
    if (!prod) { console.log(`⚠ ${a.slug} 없음`); continue; }

    // 옵션 동기화
    await p.productOption.deleteMany({ where: { productId: prod.id } });
    const optsCreate = a.optionTiers.map((qty, i) => {
      const price = priceFor(a.rate, qty);
      return {
        productId: prod.id,
        label: `${qty.toLocaleString("ko-KR")}명`,
        quantity: qty,
        price,
        sortOrder: i,
        externalProvider: "urpanel" as const,
        externalServiceId: a.newServiceId,
      };
    });
    await p.productOption.createMany({ data: optsCreate });

    await p.product.update({
      where: { id: prod.id },
      data: {
        name: a.newName,
        ...(a.descUpdate ?? {}),
        basePrice: priceFor(a.rate, Math.min(...a.optionTiers)),
        isActive: true,
      },
    });
    console.log(`✓ ${a.slug} → ${a.newName} (urpanel #${a.newServiceId}, ${a.optionTiers.length}개 옵션)`);
  }

  console.log("\n=== Phase B: 비활성 부활 ===");
  for (const b of PHASE_B) {
    const prod = await p.product.findUnique({ where: { slug: b.productSlug } });
    if (!prod) { console.log(`⚠ ${b.productSlug} 없음`); continue; }

    // 카테고리 부활
    await p.category.updateMany({ where: { slug: b.reactivateCategory }, data: { isActive: true } });

    // 옵션 재생성
    await p.productOption.deleteMany({ where: { productId: prod.id } });
    const optsCreate = b.optionTiers.map((qty, i) => {
      const isView = b.productSlug.includes("views") || b.productSlug.includes("reels");
      const unit = isView ? "회" : "명";
      return {
        productId: prod.id,
        label: `${qty.toLocaleString("ko-KR")}${unit}`,
        quantity: qty,
        price: priceFor(b.rate, qty),
        sortOrder: i,
        externalProvider: "urpanel" as const,
        externalServiceId: b.serviceId,
      };
    });
    await p.productOption.createMany({ data: optsCreate });

    await p.product.update({
      where: { id: prod.id },
      data: {
        ...(b.newName ? { name: b.newName } : {}),
        ...(b.descUpdate ?? {}),
        basePrice: priceFor(b.rate, Math.min(...b.optionTiers)),
        isActive: true,
      },
    });
    console.log(`✓ ${b.productSlug} ${b.newName ? `→ ${b.newName}` : ""} 부활 (#${b.serviceId})`);
  }

  console.log("\n=== Phase C-1: 신규 카테고리 ===");
  for (const c of NEW_CATEGORIES) {
    const exists = await p.category.findUnique({ where: { slug: c.slug } });
    if (exists) {
      await p.category.update({ where: { id: exists.id }, data: { isActive: true } });
      console.log(`  (이미 있음) ${c.slug}`);
      continue;
    }
    await p.category.create({
      data: {
        slug: c.slug,
        name: c.name,
        platform: c.platform,
        iconEmoji: c.iconEmoji,
        sortOrder: c.sortOrder,
      },
    });
    console.log(`✓ ${c.slug} (${c.name})`);
  }

  console.log("\n=== Phase C-2: 신규 상품 ===");
  for (const np of NEW_PRODUCTS) {
    const cat = await p.category.findUnique({ where: { slug: np.categorySlug } });
    if (!cat) { console.log(`⚠ 카테고리 ${np.categorySlug} 없음`); continue; }

    const exists = await p.product.findUnique({ where: { slug: np.slug } });
    if (exists) {
      console.log(`  (이미 있음) ${np.slug}`);
      continue;
    }

    const basePrice = priceFor(np.rate, Math.min(...np.optionTiers));
    await p.product.create({
      data: {
        slug: np.slug,
        name: np.name,
        description: np.description,
        longDescription: np.longDescription,
        deliveryInfo: np.deliveryInfo,
        guaranteeInfo: np.guaranteeInfo,
        faqs: np.faqs as object,
        keywords: np.keywords,
        categoryId: cat.id,
        basePrice,
        badge: np.badge ?? null,
        isActive: true,
        isFeatured: np.badge === "HOT" || np.badge === "BEST",
        salesCount: Math.floor(Math.random() * 800) + 100, // 100~900 시드값
        rating: 4.7 + Math.random() * 0.3,
        options: {
          create: np.optionTiers.map((qty, i) => {
            const unit = /comments|댓글/i.test(np.name) ? "개" : /views|조회수|임프|share|saves|저장|reactions|리액션|bot/i.test(np.name) ? "회" : "명";
            return {
              label: `${qty.toLocaleString("ko-KR")}${unit}`,
              quantity: qty,
              price: priceFor(np.rate, qty),
              sortOrder: i,
              externalProvider: "urpanel" as const,
              externalServiceId: np.serviceId,
            };
          }),
        },
      },
    });
    console.log(`✓ ${np.slug} - ${np.name} (urpanel #${np.serviceId}, ${np.optionTiers.length}개 옵션)`);
  }

  // 최종 통계
  const [activeProducts, activeCategories, mappedOptions] = await Promise.all([
    p.product.count({ where: { isActive: true } }),
    p.category.count({ where: { isActive: true } }),
    p.productOption.count({ where: { externalServiceId: { not: null } } }),
  ]);
  console.log(`\n=== 최종 ===`);
  console.log(`활성 상품: ${activeProducts}개 / 활성 카테고리: ${activeCategories}개 / 매핑 옵션: ${mappedOptions}개`);
  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
