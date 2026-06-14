// urpanel 서비스 자동 매칭 — 우리 상품/옵션의 한글 키워드를 urpanel 영문 서비스명에 매칭

// ────────────────────────────────────────────────────────────────
// 키워드 매핑 사전 (한글 → 영문 키워드 가중치)
// ────────────────────────────────────────────────────────────────

// 1단계: 플랫폼 식별 (필수 매칭)
const PLATFORM_KEYWORDS: Record<string, string[]> = {
  instagram: ["인스타", "instagram", "ig"],
  youtube: ["유튜브", "youtube", "yt"],
  tiktok: ["틱톡", "tiktok"],
  facebook: ["페이스북", "facebook", "fb"],
  twitter: ["트위터", "twitter", "엑스 ", "X "],
  telegram: ["텔레그램", "telegram"],
  threads: ["스레드", "threads"],
  spotify: ["스포티파이", "spotify"],
  twitch: ["트위치", "twitch"],
};

// 2단계: 서비스 유형 (가중치 높음)
const TYPE_KEYWORDS: Record<string, string[]> = {
  followers: ["팔로워", "구독자", "친구", "follower", "subscriber"],
  likes: ["좋아요", "공감", "like"],
  views: ["조회수", "view"],
  comments: ["댓글", "comment"],
  shares: ["공유", "리트윗", "share", "retweet"],
  members: ["가입자", "멤버", "member", "joiner"],
};

// 3단계: 품질/지역 (선택)
const QUALITY_KEYWORDS: Record<string, string[]> = {
  korean: ["한국인", "한국", "korean", "korea"],
  real: ["실계정", "실제", "real", "active"],
  refill: ["보장", "리필", "refill", "guarantee"],
};

// 4단계: 가격대 의도 (가성비 / 프리미엄)
const PRICE_TIER_KEYWORDS = {
  budget: ["가성비", "저렴", "이코노미", "budget", "cheap"],   // 싼 거 원함
  premium: ["프리미엄", "고급", "premium", "vip", "best", "premium quality"],
};

// 프리미엄 서비스를 가리키는 영어 키워드
const PREMIUM_INDICATORS = [
  "premium", "vip", "high quality", "hq", "best", "top", "elite",
  "japan", "korea", "korean", "usa", "germany", "uk", "active",
];

// 가성비 서비스를 가리키는 영어 키워드
const BUDGET_INDICATORS = [
  "cheap", "fast", "instant", "global", "mix", "world",
];

export type CandidateService = {
  service: number | string;
  name: string;
  category: string;
  rate: string;
  min: string;
  max: string;
};

export type MatchResult = {
  service: CandidateService | null;
  score: number;          // 0~100
  reasons: string[];      // 디버깅용
};

/**
 * 우리 옵션 (상품명, 옵션 라벨, 수량) → urpanel 후보 서비스 매칭
 * @returns 점수 가장 높은 서비스 1개 + 추천 사유
 */
export function findBestMatch(
  productName: string,
  optionLabel: string | null,
  quantity: number,
  candidates: CandidateService[],
): MatchResult {
  const queryText = `${productName} ${optionLabel ?? ""}`.toLowerCase();

  // 1단계: 플랫폼 식별
  let platform: string | null = null;
  for (const [key, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    if (keywords.some((k) => queryText.includes(k.toLowerCase()))) {
      platform = key;
      break;
    }
  }
  if (!platform) {
    return { service: null, score: 0, reasons: ["플랫폼 식별 실패"] };
  }

  // 2단계: 서비스 유형
  let serviceType: string | null = null;
  for (const [key, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((k) => queryText.includes(k.toLowerCase()))) {
      serviceType = key;
      break;
    }
  }
  if (!serviceType) {
    return { service: null, score: 0, reasons: [`플랫폼=${platform}, 서비스 유형 식별 실패`] };
  }

  // 3단계: 품질/지역 키워드
  const qualityKeys: string[] = [];
  for (const [key, keywords] of Object.entries(QUALITY_KEYWORDS)) {
    if (keywords.some((k) => queryText.includes(k.toLowerCase()))) {
      qualityKeys.push(key);
    }
  }

  // 4단계: 가격대 의도 (가성비/프리미엄)
  let priceTier: "budget" | "premium" | null = null;
  if (PRICE_TIER_KEYWORDS.budget.some((k) => queryText.includes(k.toLowerCase()))) {
    priceTier = "budget";
  } else if (PRICE_TIER_KEYWORDS.premium.some((k) => queryText.includes(k.toLowerCase()))) {
    priceTier = "premium";
  }

  // 4단계: 후보 필터링 + 스코어링
  const scored = candidates
    .map((c) => {
      const reasons: string[] = [];
      const nameLower = c.name.toLowerCase();
      const catLower = c.category.toLowerCase();

      // 플랫폼 일치 (필수 — 카테고리 또는 이름에 포함)
      const platformMatch =
        catLower.includes(platform!) || nameLower.includes(platform!);
      if (!platformMatch) return { c, score: 0, reasons: [] };
      reasons.push(`+30 ${platform}`);
      let score = 30;

      // 서비스 유형 일치
      const typeMatch = nameLower.includes(serviceType!);
      if (typeMatch) {
        score += 25;
        reasons.push(`+25 ${serviceType}`);
      }

      // 수량 범위 (옵션 quantity 가 min~max 안에 들어가야)
      const min = Number(c.min);
      const max = Number(c.max);
      if (quantity >= min && quantity <= max) {
        score += 15;
        reasons.push("+15 수량범위 OK");
      } else {
        score -= 10;
        reasons.push("-10 수량범위 벗어남");
      }

      // 품질 키워드 보너스
      for (const q of qualityKeys) {
        if (nameLower.includes(q)) {
          score += 10;
          reasons.push(`+10 ${q}`);
        }
      }

      // 가격대 의도 반영
      if (priceTier === "budget") {
        // 가성비 의도 → 프리미엄 단어 있으면 감점, 가성비 단어 있으면 가점
        const hasPremium = PREMIUM_INDICATORS.some((k) => nameLower.includes(k));
        const hasBudget = BUDGET_INDICATORS.some((k) => nameLower.includes(k));
        if (hasPremium) {
          score -= 25;
          reasons.push("-25 가성비인데 프리미엄 서비스");
        }
        if (hasBudget) {
          score += 15;
          reasons.push("+15 가성비 키워드 매칭");
        }
      } else if (priceTier === "premium") {
        const hasPremium = PREMIUM_INDICATORS.some((k) => nameLower.includes(k));
        if (hasPremium) {
          score += 15;
          reasons.push("+15 프리미엄 키워드 매칭");
        }
      }

      // 가격 가산 — 단가 낮을수록 (같은 점수일 때 저렴한 거 우선)
      const rate = parseFloat(c.rate);
      if (rate > 0 && rate <= 1) {
        score += 5;
        reasons.push("+5 매우 저렴");
      } else if (rate > 0 && rate <= 3) {
        score += 3;
        reasons.push("+3 저렴");
      } else if (rate > 10) {
        score -= 5;
        reasons.push("-5 고가");
      }

      // 네거티브 키워드 (제외)
      if (nameLower.includes("test") || nameLower.includes("demo") || nameLower.includes("speed test")) {
        score = 0;
        reasons.push("0 테스트/데모 제외");
      }

      return { c, score, reasons };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { service: null, score: 0, reasons: [`플랫폼=${platform}, 유형=${serviceType}, 매칭 후보 없음`] };
  }

  const best = scored[0]!;
  return {
    service: best.c,
    score: best.score,
    reasons: best.reasons,
  };
}
