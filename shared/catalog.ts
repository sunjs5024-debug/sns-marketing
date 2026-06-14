import type { Platform } from "~~/generated/prisma/enums";

// 고객 문의 채널 — 한 곳에서 관리. 텔레그램 1:1 다이렉트 채팅
export const CONTACT = {
  telegram: {
    handle: "@snssocialfactory",
    url: "https://t.me/snssocialfactory",
    label: "텔레그램 상담",
    iconText: "✈",
  },
  email: "dkssudgktka53@gmail.com",
} as const;

export type PlatformSlug =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "kakaotalk"
  | "x"
  | "telegram"
  | "ably"
  | "tistory"
  | "smartstore"
  | "naver-blog"
  | "naver-cafe";

export type PlatformMeta = {
  slug: PlatformSlug;
  name: string;
  shortName: string;
  emoji: string;
  platform: Platform;
  accent: string;
  bgGradient: string;
  tagline: string;
  description: string;
};

export const PLATFORMS: Record<PlatformSlug, PlatformMeta> = {
  instagram: {
    slug: "instagram",
    name: "인스타그램 마케팅",
    shortName: "인스타그램",
    emoji: "📸",
    platform: "SNS",
    accent: "from-pink-500 to-purple-500",
    bgGradient: "from-pink-50 via-rose-50 to-purple-50",
    tagline: "팔로워·좋아요·릴스 조회수를 빠르게",
    description:
      "한국인 실계정 팔로워, 좋아요, 릴스 조회수, 댓글, 저장까지 — 인스타 알고리즘에 맞춰 안전하게 채워드립니다.",
  },
  youtube: {
    slug: "youtube",
    name: "유튜브 마케팅",
    shortName: "유튜브",
    emoji: "▶️",
    platform: "SNS",
    accent: "from-red-500 to-rose-600",
    bgGradient: "from-red-50 via-orange-50 to-rose-50",
    tagline: "구독자·조회수·쇼츠 노출 폭발",
    description:
      "구독자, 일반 영상 조회수, 쇼츠 조회수, 좋아요까지. 채널 성장의 첫 단추를 빠르게 채워드립니다.",
  },
  tiktok: {
    slug: "tiktok",
    name: "틱톡 마케팅",
    shortName: "틱톡",
    emoji: "🎵",
    platform: "SNS",
    accent: "from-slate-800 to-cyan-500",
    bgGradient: "from-slate-50 via-cyan-50 to-fuchsia-50",
    tagline: "팔로워·좋아요·조회수 한 번에",
    description: "글로벌·한국 타겟 모두 가능. 추천 피드 노출을 위한 초기 부스팅을 안전하게 처리합니다.",
  },
  kakaotalk: {
    slug: "kakaotalk",
    name: "카카오톡 채널 마케팅",
    shortName: "카카오톡",
    emoji: "💬",
    platform: "SNS",
    accent: "from-yellow-300 to-amber-500",
    bgGradient: "from-yellow-50 via-amber-50 to-orange-50",
    tagline: "채널친구·비즈보드·오픈채팅 한 번에",
    description:
      "카카오톡 채널친구 늘리기부터 비즈보드 광고 운영, 오픈채팅방 입장까지 — 카카오 생태계 마케팅을 한 곳에서 해결합니다.",
  },
  x: {
    slug: "x",
    name: "X(트위터) 마케팅",
    shortName: "X (트위터)",
    emoji: "✖️",
    platform: "SNS",
    accent: "from-neutral-900 to-neutral-700",
    bgGradient: "from-neutral-100 via-slate-100 to-zinc-100",
    tagline: "팔로워·좋아요·리트윗 부스팅",
    description:
      "글로벌·한국 타겟 모두 가능. 팔로워, 좋아요, 리트윗, 임프레션 — X 알고리즘에 맞춘 자연스러운 부스팅을 제공합니다.",
  },
  telegram: {
    slug: "telegram",
    name: "텔레그램 마케팅",
    shortName: "텔레그램",
    emoji: "✈️",
    platform: "SNS",
    accent: "from-sky-400 to-sky-600",
    bgGradient: "from-sky-50 via-cyan-50 to-blue-50",
    tagline: "채널 구독자·그룹 멤버·조회수",
    description: "텔레그램 채널 구독자, 그룹 멤버, 게시물 조회수까지. 글로벌·한국 타겟 모두 지원하며 빠른 처리가 강점입니다.",
  },
  ably: {
    slug: "ably",
    name: "에이블리 마켓 마케팅",
    shortName: "에이블리",
    emoji: "🛍️",
    platform: "SNS",
    accent: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 via-rose-50 to-fuchsia-50",
    tagline: "찜·소식받기로 마켓 활성화",
    description:
      "에이블리 마켓의 상품 찜과 소식받기(팔로워)를 늘려 인기 마켓처럼 노출되도록 돕습니다. 단골 고객 기반과 구매 전환을 키워보세요.",
  },
  tistory: {
    slug: "tistory",
    name: "티스토리 블로그 마케팅",
    shortName: "티스토리",
    emoji: "✍️",
    platform: "SNS",
    accent: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 via-amber-50 to-red-50",
    tagline: "조회수·공감·구독자 부스팅",
    description:
      "티스토리 블로그의 조회수, 공감, 구독자를 자연스럽게 늘려 글 노출과 채널 영향력을 키웁니다. 블로그 성장의 첫 단추를 빠르게 채워드립니다.",
  },
  smartstore: {
    slug: "smartstore",
    name: "스마트스토어 상위노출",
    shortName: "스마트스토어",
    emoji: "🛒",
    platform: "RANK",
    accent: "from-green-500 to-lime-500",
    bgGradient: "from-green-50 via-lime-50 to-emerald-50",
    tagline: "구매평·찜·트래픽으로 매출 점프",
    description:
      "스마트스토어 랭킹 알고리즘에 맞춘 구매평, 찜, Q&A, 트래픽 유입까지 — 실제 구매 시뮬레이션 기반.",
  },
  "naver-blog": {
    slug: "naver-blog",
    name: "네이버 블로그 상위노출",
    shortName: "네이버블로그",
    emoji: "✍️",
    platform: "RANK",
    accent: "from-lime-500 to-emerald-500",
    bgGradient: "from-lime-50 via-green-50 to-emerald-50",
    tagline: "이웃·공감·체험단으로 노출 강화",
    description: "블로그 지수 관리, 이웃 추가, 공감, 댓글, 체험단 매칭까지 — VIEW 탭 상위노출을 위한 풀패키지.",
  },
  "naver-cafe": {
    slug: "naver-cafe",
    name: "네이버 카페 마케팅",
    shortName: "네이버카페",
    emoji: "☕",
    platform: "RANK",
    accent: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 via-emerald-50 to-teal-50",
    tagline: "가입자·댓글·검색 상위노출",
    description:
      "네이버 카페 가입자 늘리기, 등급 올리기, 댓글·좋아요, 카페글 검색 상위노출까지 — 커뮤니티 마케팅 풀패키지.",
  },
};

// 활성 플랫폼만 노출 — urpanel 매핑이 가능한 플랫폼 위주
// 카카오톡 / 네이버 (스마트스토어/블로그/카페) 는 urpanel 미지원이라 일시 비활성 (별도 패널 도입 시 복원)
export const SNS_PLATFORMS: PlatformSlug[] = [
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "telegram",
  "tistory",
  "ably",
];
export const RANK_PLATFORMS: PlatformSlug[] = [];

export function isValidPlatformSlug(slug: string): slug is PlatformSlug {
  return slug in PLATFORMS;
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

export function platformKeyFor(categorySlug: string): PlatformSlug | null {
  if (categorySlug.startsWith("instagram")) return "instagram";
  if (categorySlug.startsWith("youtube")) return "youtube";
  if (categorySlug.startsWith("tiktok")) return "tiktok";
  if (categorySlug.startsWith("kakaotalk")) return "kakaotalk";
  if (categorySlug.startsWith("x-")) return "x";
  if (categorySlug.startsWith("telegram")) return "telegram";
  if (categorySlug.startsWith("ably")) return "ably";
  if (categorySlug.startsWith("tistory")) return "tistory";
  if (categorySlug.startsWith("smartstore")) return "smartstore";
  if (categorySlug.startsWith("naver-blog")) return "naver-blog";
  if (categorySlug.startsWith("naver-cafe")) return "naver-cafe";
  return null;
}
