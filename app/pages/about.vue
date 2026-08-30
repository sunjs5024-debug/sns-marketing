<script setup lang="ts">
useSeoMeta({
  title: "회사소개 — 실계정 SNS 마케팅 SNS소셜팩토리",
  description:
    "인스타 팔로워·유튜브 구독자·틱톡 좋아요·카카오톡 채널 친구·텔레그램 구독자까지, SNS소셜팩토리(주식회사 영천기획)는 실계정 기반으로 SNS 초기 성장을 돕는 마케팅 서비스입니다. 사업자 정보·운영 방식·정직한 보장 범위를 공개합니다.",
  ogTitle: "회사소개 — SNS소셜팩토리",
  ogDescription: "실계정 기반 SNS 마케팅. 진주 소재 정식 등록 사업자가 정직하게 운영합니다.",
  ogType: "website",
  ogLocale: "ko_KR",
});

useSchemaOrg([
  defineWebPage({
    name: "회사소개 — SNS소셜팩토리",
    description: "실계정 기반 SNS 마케팅 서비스 SNS소셜팩토리 회사소개 · 사업자 정보 · 운영 원칙",
  }),
  {
    "@type": "AboutPage",
    "@id": "https://xn--sns-yg9lh0pw9l.kr/about",
    mainEntity: { "@id": "https://xn--sns-yg9lh0pw9l.kr/#identity" },
  },
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "회사소개", item: "https://xn--sns-yg9lh0pw9l.kr/about" },
    ],
  },
]);

const bizRows: { k: string; v: string }[] = [
  { k: "상호", v: "SNS소셜팩토리 (운영: 주식회사 영천기획)" },
  { k: "대표", v: "김선민" },
  { k: "사업자등록번호", v: "447-81-03597" },
  { k: "통신판매업신고", v: "제2026-경남진주-0298호" },
  { k: "사업장 주소", v: "경상남도 진주시 에나로77번길 4, 502호" },
  { k: "고객문의", v: "텔레그램 @snssocialfactory · 카카오톡 채널" },
];

// 취급 채널 — 키워드 노출 + 내부링크 허브
const channels = [
  { name: "인스타그램", desc: "팔로워·좋아요·릴스 조회수", to: "/sns/instagram" },
  { name: "유튜브", desc: "구독자·조회수·시청시간·쇼츠", to: "/sns/youtube" },
  { name: "틱톡", desc: "팔로워·좋아요·조회수", to: "/sns/tiktok" },
  { name: "카카오톡", desc: "채널 친구·오픈방 인원·좋아요", to: "/sns/kakaotalk" },
  { name: "X(트위터)", desc: "팔로워·좋아요·리트윗·조회수", to: "/sns/x" },
  { name: "텔레그램", desc: "채널 구독자·조회수·멤버", to: "/sns/telegram" },
];
</script>

<template>
  <div>
    <PageHero
      eyebrow="ABOUT"
      title="SNS 마케팅, 정직하게 합니다"
      subtitle="인스타·유튜브·틱톡·카카오톡·텔레그램의 초기 성장을 실계정으로 돕는 SNS소셜팩토리입니다. 부풀린 약속 대신, 무엇을 하고 무엇은 보장하지 않는지 그대로 공개합니다."
    />
    <div class="mx-auto max-w-3xl space-y-12 px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">

      <section>
        <p class="text-sm leading-8 text-neutral-700 sm:text-base">
          <b>SNS소셜팩토리</b>는 인스타그램 팔로워, 유튜브 구독자, 틱톡 좋아요, 카카오톡 채널 친구, 텔레그램 구독자처럼
          채널이 자리 잡기 전 가장 어려운 <b>0에서 1</b> 구간을 실계정 기반으로 채워 드리는 SNS 마케팅 서비스입니다.
          숫자가 두 자리인 계정과 수천인 계정은 같은 게시물을 올려도 방문자의 반응이 다릅니다.
          저희는 그 <b>초기 신뢰 신호(social proof)</b>를 자연스러운 속도로 만들어, 이후 광고·협업·자연 유입의 전환이 빨라지도록 돕습니다.
          경상남도 진주에 사업장을 둔 정식 등록 사업자(주식회사 영천기획)이며, 통신판매업 신고를 마치고 운영하고 있습니다.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">이런 채널을 다룹니다</h2>
        <p class="mt-3 text-sm leading-7 text-neutral-600">플랫폼마다 알고리즘이 보는 신호가 다릅니다. 채널별 상품과 자세한 원리는 각 페이지에서 확인하세요.</p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="c in channels"
            :key="c.name"
            :to="c.to"
            class="group rounded-2xl border border-neutral-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <p class="text-sm font-semibold text-neutral-900 group-hover:text-indigo-600">{{ c.name }} 마케팅 <span class="text-indigo-400">→</span></p>
            <p class="mt-1 text-[13px] text-neutral-500">{{ c.desc }}</p>
          </NuxtLink>
        </div>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">왜 '실계정'을 고집하나요</h2>
        <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
          숫자만 채우는 빈 봇 계정은 플랫폼의 정기적인 비활성 계정 정리에서 가장 먼저 걸러지고, 그래프가 부자연스러워 오히려 신뢰를 떨어뜨립니다.
          그래서 저희는 프로필·활동 이력이 남아 있는 실사용 계정 위주로, 한 번에 몰아넣지 않고 <b>시간에 분산</b>해 진행합니다.
          한국인 타깃이 필요한 상품과 글로벌 가성비 상품을 나눠 두어, 목적(국내 신뢰도 vs 빠른 볼륨)에 맞게 고르실 수 있습니다.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">계정은 안전한가요 — 비밀번호를 묻지 않습니다</h2>
        <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
          가장 많이 받는 질문입니다. 저희는 <b>공개 프로필 URL과 닉네임만으로</b> 작업하며, SNS 비밀번호나 관리자 권한을 절대 요구하지 않습니다.
          로그인 위임이 없으니 계정 정보가 넘어갈 일이 없습니다. 작업이 끝나면 처리 내역을 담은 <b>결과보고서</b>를 자동으로 보내 드리고, 세금계산서 발행도 가능합니다.
        </p>
      </section>

      <section class="rounded-3xl border border-amber-100 bg-amber-50/60 p-6">
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">정직하게 — 약속하지 않는 것</h2>
        <p class="mt-3 text-sm leading-7 text-neutral-600">과장은 결국 신뢰를 깎습니다. 다음은 저희가 <b>보장하지 않는</b> 것들입니다.</p>
        <ul class="mt-4 space-y-3 text-sm leading-7 text-neutral-700 sm:text-base">
          <li class="flex gap-2"><span class="text-amber-600">·</span><span>팔로워·구독자 '수' 확보가 목적이며, 좋아요·댓글 같은 <b>상호작용이나 수익화·검색 순위·매출은 보장하지 않습니다.</b></span></li>
          <li class="flex gap-2"><span class="text-amber-600">·</span><span>각 플랫폼 정책은 수시로 바뀝니다. 인위적 부스팅은 약관에서 권장되는 방식이 아니며, 계정 상태에 민감하다면 <b>소량부터</b> 권합니다.</span></li>
          <li class="flex gap-2"><span class="text-amber-600">·</span><span>부스팅은 <b>콘텐츠 품질을 대신하지 못합니다.</b> 노출의 기회를 넓히는 마중물일 뿐, 지속 성장은 결국 콘텐츠에 달려 있습니다.</span></li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">주문부터 완료까지</h2>
        <ol class="mt-4 space-y-3 text-sm leading-7 text-neutral-700 sm:text-base">
          <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs text-white">1</span><span>원하는 상품·수량을 고르고 공개 URL(또는 아이디)만 입력해 주문합니다.</span></li>
          <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs text-white">2</span><span>안내된 계좌로 입금하면 결제 확인 후 <b>평균 10분 내</b> 자동으로 시작됩니다.</span></li>
          <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs text-white">3</span><span>완료되면 결과보고서를 보내 드리고, 보장 기간(상품별 상이) 내 감소는 정책에 따라 리필 또는 환불로 도와드립니다.</span></li>
          <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs text-white">4</span><span>작업 시작 전에는 <b>100% 환불</b>이 가능합니다.</span></li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">사업자 정보</h2>
        <dl class="mt-4 divide-y divide-neutral-100 rounded-3xl border border-neutral-100 bg-white text-sm">
          <div v-for="row in bizRows" :key="row.k" class="flex gap-4 px-5 py-3.5">
            <dt class="w-28 shrink-0 text-neutral-500">{{ row.k }}</dt>
            <dd class="text-neutral-800">{{ row.v }}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">문의</h2>
        <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">궁금한 점은 아래 채널로 편하게 문의해 주세요. 상담은 무료이고, 평균 30분 이내에 답변드립니다.</p>
        <ContactButtons class="mt-4" />
      </section>
    </div>
  </div>
</template>
