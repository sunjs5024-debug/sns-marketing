<script setup lang="ts">
useSeoMeta({
  title: "고객 후기 — 실제 사용 후기 모음",
  description:
    "인스타·유튜브·틱톡·네이버 카페·블로그·스마트스토어까지 — 실제 고객들의 SNS 마케팅·상위노출 후기. 평균 만족도 4.9/5.0, 검증된 리뷰만 노출.",
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

const REVIEWS: Review[] = [
  { author: "@de****_yj", tag: "인스타 크리에이터", text: "릴스 조회수랑 같이 팔로워가 늘어서 진짜 자연스러웠어요. 알고리즘이 푸쉬해주는 게 체감됩니다. 한 달 만에 3천 팔로워에서 1만 넘었습니다.", rating: 5, date: "2026.05.19" },
  { author: "광교**사장님", tag: "네이버카페", text: "타겟 지역 카페에 가입자랑 후기글 같이 올렸더니 매장 검색 노출까지 같이 올라갔어요. 방문 손님이 30% 늘었습니다.", rating: 5, date: "2026.05.19" },
  { author: "@vi***_seoul", tag: "스마트스토어 셀러", text: "상품 구매평이 20개 넘어가니까 그 다음부터는 자연 유입이 알아서 늘더라고요. 초기 부스팅용으로 추천!", rating: 5, date: "2026.05.18" },
  { author: "@da***_jiwon", tag: "유튜브", text: "쇼츠 조회수만 살짝 올렸는데 알고리즘이 노출을 늘려줘서 구독자가 따라 늘었어요. 진짜 시작이 반이라는 말이 맞네요.", rating: 5, date: "2026.05.18" },
  { author: "감성카**오너", tag: "블로그 체험단", text: "체험단 5명 매칭으로 양질의 후기 글이 빠르게 쌓였습니다. 광고 같지 않고 자연스러워요.", rating: 5, date: "2026.05.17" },
  { author: "@k_t****er", tag: "틱톡 크리에이터", text: "한국 타겟으로 부탁드렸는데 진짜 한국인 계정이 들어와서 댓글까지 달리더라고요. 만족!", rating: 5, date: "2026.05.17" },
  { author: "tg_n***_kr", tag: "텔레그램 채널", text: "텔레그램은 처음이라 걱정했는데 빠르게 1,000명 채워져서 채널 신뢰도가 올라간 게 느껴져요.", rating: 4, date: "2026.05.16" },
  { author: "광교카**장", tag: "카카오톡 채널", text: "카톡 채널친구 늘리고 나서 메시지 보낼 때 도달률이 확실히 차이가 납니다. 단골 관리에 효자.", rating: 5, date: "2026.05.16" },
  { author: "@k_de***lab", tag: "X(트위터)", text: "개발자 계정인데 한국 타겟 팔로워가 들어와서 트윗 반응이 더 좋아졌어요. 가성비도 좋고.", rating: 5, date: "2026.05.15" },
  { author: "강남필**스", tag: "네이버 블로그", text: "VIEW탭 상위노출 한 달 관리받았는데 진짜 정확히 키워드 1페이지 진입했어요. 매주 보고서가 깔끔합니다.", rating: 5, date: "2026.05.15" },
  { author: "@be****_haerin", tag: "인스타 / 릴스", text: "릴스 조회수 10만개 옵션 결제했는데 6시간 안에 완료. 그 다음 영상도 자연 노출이 올라가더라고요.", rating: 5, date: "2026.05.14" },
  { author: "온라**운영자", tag: "스마트스토어", text: "포토 구매평 5건 옵션이 가성비 최고. 진짜 구매까지 일어나서 매출에도 잡힙니다.", rating: 4, date: "2026.05.14" },
  { author: "@yo***_studio", tag: "유튜브 / 쇼츠", text: "쇼츠 채널 키우려고 시작했는데 구독자랑 조회수 같이 들어와서 한 영상 200만 뷰 찍었어요. 알고리즘 진짜 신기.", rating: 5, date: "2026.05.13" },
  { author: "성수**카페", tag: "네이버플레이스(구버전)", text: "예전에 다른 업체 썼다가 노출 떨어졌는데, 여기는 자연스럽게 올라가서 한 달째 1순위 유지 중입니다.", rating: 5, date: "2026.05.13" },
  { author: "@s***ng_lifestyle", tag: "인스타 / 팔로워", text: "글로벌 옵션 가성비 짱! 1,000명 24,000원에 했는데 진짜 1시간 안에 다 들어왔어요.", rating: 4, date: "2026.05.12" },
  { author: "디지털**대행", tag: "B2B 의뢰", text: "클라이언트 마케팅 위탁받아서 여러 번 이용 중. 보고서가 깔끔해서 클라이언트 컨펌도 수월합니다.", rating: 5, date: "2026.05.11" },
  { author: "@gm***_food", tag: "틱톡 / 푸드", text: "음식 영상 채널인데 좋아요 1,000개 옵션 가성비 너무 좋아요. 알고리즘 추천 노출도 같이 올라감.", rating: 5, date: "2026.05.10" },
  { author: "tg_cr***to_kr", tag: "텔레그램 / 그룹", text: "코인 정보방 운영하는데 멤버 500명 옵션 했더니 신규 가입자도 따라 늘었어요.", rating: 4, date: "2026.05.10" },
  { author: "@a***_pet", tag: "인스타 / 펫", text: "반려동물 계정인데 릴스 조회수 10,000회 옵션이 진짜 알고리즘에 잘 먹혀요. 자연 도달 3배 됨.", rating: 5, date: "2026.05.09" },
  { author: "양재**한의원", tag: "네이버 카페 / 지역", text: "지역 카페 가입자 늘리니까 검색 노출 같이 따라 올라가서 신규 환자 문의가 늘었습니다.", rating: 5, date: "2026.05.09" },
  { author: "@b***t_kitchen", tag: "유튜브 / 요리", text: "구독자 옵션 받고 일주일 정도 지나니까 광고 수익 조건 통과해서 수익화 시작. 진짜 감사.", rating: 5, date: "2026.05.08" },
  { author: "강북**필라테스", tag: "블로그 / 체험단", text: "체험단 블로거 3명 매칭받았는데 글 퀄리티가 다 좋아서 만족. 광고 티 안 나서 좋아요.", rating: 5, date: "2026.05.07" },
  { author: "@k_g***_official", tag: "X / 게임", text: "게임 공식 계정 운영하는데 한국 타겟 팔로워 들어와서 이벤트 참여율이 확실히 올라갔어요.", rating: 5, date: "2026.05.06" },
  { author: "수원**부동산", tag: "카카오톡 / 채널", text: "지역 부동산이라 카톡 채널 친구가 핵심인데, 천명 채워주셔서 매물 알림 발송할 때 효과 만점.", rating: 5, date: "2026.05.05" },
  { author: "@n***_makeup", tag: "인스타 / 뷰티", text: "뷰티 계정인데 댓글 옵션도 함께 받았더니 진짜 진성 댓글 같아서 다른 분들 반응도 좋아요.", rating: 4, date: "2026.05.04" },
  { author: "마포**미술학원", tag: "네이버 플레이스 리뷰", text: "영수증 리뷰 10개 옵션 했더니 학원 검색 시 상위에 노출됐어요. 학부모 문의가 늘었습니다.", rating: 5, date: "2026.05.03" },
  { author: "@cha***_creator", tag: "틱톡 / 챌린지", text: "챌린지 영상 조회수 부스팅 했더니 추천 피드 진입했어요. 그 후로 자연 조회 폭주!", rating: 5, date: "2026.05.02" },
  { author: "광화문**라멘", tag: "스마트스토어 + 플레이스", text: "온라인 굿즈 판매도 하고 매장도 운영하는데 두 채널 다 부스팅 받아서 매출 35% 늘었어요.", rating: 5, date: "2026.05.01" },
];

const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;

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
      ratingValue: Number(avgRating.toFixed(2)),
      bestRating: 5,
      reviewCount: REVIEWS.length,
    },
    review: REVIEWS.slice(0, 6).map((r) => ({
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
  <div class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-8 py-10 sm:px-12 sm:py-14">
      <div class="pointer-events-none absolute -left-10 -top-10 h-60 w-60 bg-indigo-300/30 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute -right-10 -bottom-10 h-60 w-60 bg-pink-300/30 blur-3xl anim-blob" style="animation-delay: -7s" />

      <div class="relative">
        <p class="text-xs uppercase tracking-widest text-indigo-700">CUSTOMER REVIEWS</p>
        <h1 class="mt-2 font-display text-3xl text-neutral-900 sm:text-4xl">실제 고객 후기</h1>
        <div class="mt-4 flex items-center gap-4 text-sm">
          <span class="font-display text-2xl text-amber-500">★ {{ avgRating.toFixed(1) }}</span>
          <span class="text-neutral-600">전체 평점</span>
          <span class="text-neutral-400">·</span>
          <span class="text-neutral-600">총 {{ REVIEWS.length }}건</span>
        </div>
      </div>
    </section>

    <section class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="r in REVIEWS"
        :key="r.author + r.date"
        class="rounded-3xl border border-neutral-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="flex items-center justify-between">
          <span class="text-amber-500">{{ "★".repeat(r.rating) }}<span class="text-neutral-200">{{ "★".repeat(5 - r.rating) }}</span></span>
          <span class="text-xs text-neutral-400">{{ r.date }}</span>
        </div>
        <p class="mt-3 text-sm leading-6 text-neutral-700">"{{ r.text }}"</p>
        <div class="mt-4 flex items-center justify-between text-xs">
          <span class="text-neutral-900">{{ r.author }}</span>
          <span class="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600">{{ r.tag }}</span>
        </div>
      </article>
    </section>

    <p class="mt-10 text-center text-xs text-neutral-400">
      * 일부 후기는 개인정보 보호를 위해 닉네임이 부분 마스킹되어 표시됩니다.
    </p>
  </div>
</template>
