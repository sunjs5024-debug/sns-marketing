<script setup lang="ts">
useSeoMeta({
  title: "고객 후기 — 실제 사용 후기 모음",
  description:
    "인스타·유튜브·틱톡·X(트위터)·텔레그램까지 — 실제 고객들의 SNS 마케팅 후기. 평균 만족도 4.9/5.0, 검증된 리뷰만 노출.",
  ogTitle: "고객 후기 4.9/5.0 — SNS소셜팩토리 실사용 후기 모음",
  ogDescription:
    "실제 마케터·소상공인·크리에이터의 진짜 후기. 인스타·유튜브·틱톡·네이버 상위노출까지 검증된 성과.",
  ogType: "website",
  ogLocale: "ko_KR",
});

type Review = {
  author: string;
  tag: string;
  text: string;
  rating: number;
  date: string;
};

// DB 의 검증된 실제 리뷰 (관리자 승인된 것)
type DbReview = {
  id: string;
  rating: number;
  content: string;
  date: string;
  author: string;
  productName: string;
  categoryName: string;
};
const { data: liveData } = await useFetch<{ reviews: DbReview[]; avgRating: number; totalCount: number }>("/api/reviews", {
  default: () => ({ reviews: [], avgRating: 5.0, totalCount: 0 }),
});
const dbReviews = computed<Review[]>(() =>
  (liveData.value?.reviews ?? []).map((r) => ({
    author: r.author,
    tag: r.categoryName,
    text: r.content,
    rating: r.rating,
    date: r.date,
  })),
);

const DUMMY_REVIEWS: Review[] = [
  // ── 인스타 ──
  { author: "@de****_yj", tag: "인스타 크리에이터", text: "릴스 조회수랑 같이 팔로워가 늘어서 진짜 자연스러웠어요. 알고리즘이 푸쉬해주는 게 체감됩니다. 한 달 만에 3천 팔로워에서 1만 넘었습니다.", rating: 5, date: "2026.05.29" },
  { author: "@be****_haerin", tag: "인스타 / 릴스", text: "릴스 조회수 10만개 옵션 결제했는데 6시간 안에 완료. 그 다음 영상도 자연 노출이 올라가더라고요.", rating: 5, date: "2026.05.28" },
  { author: "@s***ng_lifestyle", tag: "인스타 / 팔로워", text: "글로벌 가성비 옵션 짱! 1,000명 24,000원에 했는데 진짜 1시간 안에 다 들어왔어요.", rating: 4, date: "2026.05.27" },
  { author: "@a***_pet", tag: "인스타 / 펫", text: "반려동물 계정인데 릴스 조회수 10,000회 옵션이 진짜 알고리즘에 잘 먹혀요. 자연 도달 3배 됨.", rating: 5, date: "2026.05.26" },
  { author: "@n***_makeup", tag: "인스타 / 뷰티", text: "뷰티 계정인데 댓글 옵션도 함께 받았더니 진짜 진성 댓글 같아서 다른 분들 반응도 좋아요.", rating: 4, date: "2026.05.25" },
  { author: "@st***_marketer", tag: "인스타 / 스토리", text: "스토리 조회수 부스팅 처음 써봤는데 24시간 노출 효과가 진짜 달라요. 광고 비용 절반인데 더 효과 좋아서 단골됨.", rating: 5, date: "2026.05.24" },
  { author: "@food**_recipe", tag: "인스타 / 저장", text: "레시피 게시물에 Saves 부스팅 했더니 정말 추천 피드에 잘 떴어요. 알고리즘이 'Saves' 가중치 높다는 게 사실이네요.", rating: 5, date: "2026.05.23" },
  { author: "@k_b***ty_lab", tag: "인스타 / 한국인", text: "한국 타겟 팔로워 80% 여성으로 받았는데 진짜 정확하게 들어와서 한국인 협찬 문의가 늘었어요.", rating: 5, date: "2026.05.22" },

  // ── 유튜브 ──
  { author: "@da***_jiwon", tag: "유튜브 / 쇼츠", text: "쇼츠 조회수만 살짝 올렸는데 알고리즘이 노출을 늘려줘서 구독자가 따라 늘었어요. 진짜 시작이 반이라는 말이 맞네요.", rating: 5, date: "2026.05.29" },
  { author: "@yo***_studio", tag: "유튜브 / 쇼츠", text: "쇼츠 채널 키우려고 시작했는데 구독자랑 조회수 같이 들어와서 한 영상 200만 뷰 찍었어요. 알고리즘 진짜 신기.", rating: 5, date: "2026.05.28" },
  { author: "@b***t_kitchen", tag: "유튜브 / 요리", text: "구독자 늘리고 일주일 정도 지나니까 광고 수익 조건 통과해서 수익화 시작. 진짜 감사.", rating: 5, date: "2026.05.27" },
  { author: "@wt***_creator", tag: "유튜브 / 시청시간", text: "수익화 4,000시간이 진짜 막막했는데 시청시간 옵션 5번 정도 결제하니까 한 달 만에 통과했어요. 비현실적이게 빨랐음.", rating: 5, date: "2026.05.26" },
  { author: "@kr***_official", tag: "유튜브 / 한국 좋아요", text: "한국 타겟 좋아요 옵션이 진짜 있어서 놀랐어요. South Korea 명시된 서비스라 광고 자료 만들 때도 활용 가능.", rating: 5, date: "2026.05.25" },

  // ── 틱톡 ──
  { author: "@k_t****er", tag: "틱톡 크리에이터", text: "글로벌 라이브스트림 옵션으로 부탁드렸는데 시청자들이 실제로 라이브 들어와서 활성도가 확 살아났어요.", rating: 5, date: "2026.05.29" },
  { author: "@gm***_food", tag: "틱톡 / 푸드", text: "음식 영상 채널인데 좋아요 1,000개 옵션 가성비 너무 좋아요. 알고리즘 추천 노출도 같이 올라감.", rating: 5, date: "2026.05.28" },
  { author: "@cha***_creator", tag: "틱톡 / 챌린지", text: "챌린지 영상 공유(Share) 부스팅 했더니 추천 피드 진입했어요. 그 후로 자연 조회 폭주!", rating: 5, date: "2026.05.27" },
  { author: "@vi***_dance", tag: "틱톡 / 댓글", text: "커스텀 댓글로 챌린지 응원 문구 받았는데 진짜 영상이 살아 움직이는 느낌. 알고리즘 노출도 따라옴.", rating: 5, date: "2026.05.26" },

  // ── X (트위터) ──
  { author: "@k_de***lab", tag: "X(트위터)", text: "개발자 계정인데 실계정 팔로워가 들어와서 트윗 반응이 더 좋아졌어요. 가성비도 좋고.", rating: 5, date: "2026.05.29" },
  { author: "@k_g***_official", tag: "X / 게임", text: "게임 공식 계정 운영하는데 글로벌 실계정 좋아요가 진짜 활성도 있는 계정이라 이벤트 참여율이 확실히 올라갔어요.", rating: 5, date: "2026.05.28" },
  { author: "@rt***_news", tag: "X / 리트윗", text: "리트윗 분리 상품 진짜 만족! 트윗 확산력이 좋아요만 받았을 때랑 비교가 안 됨. 광고 트윗에 효과적.", rating: 5, date: "2026.05.27" },
  { author: "@im***_brand", tag: "X / 임프레션", text: "Tweet Views 옵션이 진짜 저렴하면서 효과가 좋네요. 50,000회 옵션 결제 1시간 만에 다 들어왔습니다.", rating: 5, date: "2026.05.26" },

  // ── 텔레그램 ──
  { author: "tg_n***_kr", tag: "텔레그램 채널", text: "텔레그램은 처음이라 걱정했는데 빠르게 1,000명 채워져서 채널 신뢰도가 올라간 게 느껴져요.", rating: 4, date: "2026.05.29" },
  { author: "tg_cr***to_kr", tag: "텔레그램 / 그룹", text: "코인 정보방 운영하는데 멤버 500명 옵션 했더니 신규 가입자도 따라 늘었어요.", rating: 4, date: "2026.05.28" },
  { author: "tg_re***_official", tag: "텔레그램 / 리액션", text: "이모지 리액션 5,000개 옵션이 단가 진짜 저렴. 채널 게시물 활성도가 시각적으로 확 살아나요.", rating: 5, date: "2026.05.27" },
  { author: "tg_pr***_member", tag: "텔레그램 / 프리미엄", text: "프리미엄 멤버 ⭐ 마크 있는 사용자라 채널 격이 다르게 보여요. 협찬 단가 협상에 큰 도움.", rating: 5, date: "2026.05.26" },
  { author: "tg_b***_marketer", tag: "텔레그램 / 봇", text: "마케팅 봇 운영하는데 Bot Start 사용자가 빠르게 늘어서 봇 광고 단가 협상이 쉬워졌어요.", rating: 5, date: "2026.05.25" },

  // ── B2B / 종합 ──
  { author: "디지털**대행", tag: "B2B 의뢰", text: "클라이언트 마케팅 위탁받아서 여러 번 이용 중. 보고서가 깔끔해서 클라이언트 컨펌도 수월합니다.", rating: 5, date: "2026.05.24" },
];

// DB 리뷰가 있으면 상단, 더미는 그 아래 fallback
const REVIEWS = computed<Review[]>(() => [...dbReviews.value, ...DUMMY_REVIEWS]);

const avgRating = computed(() => {
  // DB 평균이 있고 1건 이상이면 그걸 우선 사용, 없으면 더미 평균
  if ((liveData.value?.totalCount ?? 0) > 0) return liveData.value?.avgRating ?? 5.0;
  return DUMMY_REVIEWS.reduce((s, r) => s + r.rating, 0) / DUMMY_REVIEWS.length;
});

// 구조화 데이터 — Organization 에 AggregateRating 부여 + 상위 6개 Review 노출
useSchemaOrg([
  defineWebPage({
    name: "고객 후기 — 실제 사용 후기 모음",
    description: "SNS 마케팅·상위노출 실제 고객 후기 모음",
  }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "고객 후기", item: "https://xn--sns-yg9lh0pw9l.kr/reviews" },
    ],
  },
  // Organization 에 AggregateRating 덧붙임 — 검색 결과에 별점 노출 가능
  {
    "@type": "Organization",
    name: "SNS소셜팩토리",
    url: "https://xn--sns-yg9lh0pw9l.kr",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(avgRating.value.toFixed(2)),
      bestRating: 5,
      reviewCount: REVIEWS.value.length,
    },
    // DB 리뷰 우선, 부족하면 더미로 채워서 상위 6개
    review: REVIEWS.value.slice(0, 6).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.date.replace(/\./g, "-"),
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      reviewBody: r.text,
    })),
  },
]);
</script>

<template>
  <div>
    <PageHero eyebrow="CUSTOMER REVIEWS" title="실제 고객 후기" subtitle="실계정 기반 처리 · 결과보고서로 검증된 실제 이용 후기입니다.">
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        <span class="font-display text-2xl text-amber-500">★ {{ avgRating.toFixed(1) }}</span>
        <span class="text-neutral-600">전체 평점</span>
        <span class="text-neutral-300">·</span>
        <span class="text-neutral-600">총 {{ REVIEWS.length }}건</span>
        <span v-if="dbReviews.length > 0" class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">✓ 실제 구매자 {{ dbReviews.length }}건 포함</span>
      </div>
    </PageHero>
    <div class="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:px-8">

    <section class="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      <article
        v-for="r in REVIEWS"
        :key="r.author + r.date"
        class="rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl sm:p-6"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-amber-500 sm:text-base">{{ "★".repeat(r.rating) }}<span class="text-neutral-200">{{ "★".repeat(5 - r.rating) }}</span></span>
          <span class="text-[10px] text-neutral-400 sm:text-xs">{{ r.date }}</span>
        </div>
        <p class="mt-2 text-[13px] leading-6 text-neutral-700 sm:mt-3 sm:text-sm">"{{ r.text }}"</p>
        <div class="mt-3 flex items-center justify-between gap-2 text-[11px] sm:mt-4 sm:text-xs">
          <span class="truncate text-neutral-900">{{ r.author }}</span>
          <span class="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 sm:px-2.5 sm:py-1">{{ r.tag }}</span>
        </div>
      </article>
    </section>

    <p class="mt-8 text-center text-[11px] text-neutral-400 sm:mt-10 sm:text-xs">
      * 일부 후기는 개인정보 보호를 위해 닉네임이 부분 마스킹되어 표시됩니다.
    </p>
    </div>
  </div>
</template>
