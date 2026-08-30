<script setup lang="ts">
import { CONTACT } from "#shared/catalog";

useSeoMeta({
  title: "회사소개 — SNS소셜팩토리",
  description:
    "SNS소셜팩토리(운영: 주식회사 영천기획)는 인스타·유튜브·틱톡·카카오톡·텔레그램 SNS 마케팅을 실계정 기반으로 처리하는 서비스입니다. 사업자 신원·운영 원칙·정직한 보장 범위를 공개합니다.",
  ogTitle: "회사소개 — SNS소셜팩토리",
  ogDescription: "실계정 기반 SNS 마케팅. 사업자 신원과 정직한 운영 원칙을 공개합니다.",
  ogType: "website",
  ogLocale: "ko_KR",
});

// AboutPage — 전역 identity Organization(@id=#identity)을 mainEntity로 참조(엔티티 grounding)
useSchemaOrg([
  defineWebPage({
    name: "회사소개 — SNS소셜팩토리",
    description: "SNS소셜팩토리 회사소개 · 사업자 신원 · 운영 원칙",
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
];
</script>

<template>
  <div>
    <PageHero
      eyebrow="ABOUT"
      title="SNS소셜팩토리 회사소개"
      subtitle="실계정 기반 SNS 마케팅을 정직하게 운영합니다. 우리가 무엇을 하고, 무엇은 보장하지 않는지 그대로 공개합니다."
    />
    <div class="mx-auto max-w-3xl space-y-10 px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">우리는 누구인가</h2>
        <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
          SNS소셜팩토리(운영: 주식회사 영천기획)는 인스타그램·유튜브·틱톡·카카오톡·X(트위터)·텔레그램 등의 SNS 성장을 돕는 마케팅 서비스입니다.
          팔로워·구독자·좋아요·조회수 같은 초기 신호를 실계정 기반으로 채워, 새 계정·신규 채널이 자연 유입으로 이어지기 전의 '마중물'을 만들어 드립니다.
          경상남도 진주시에 사업장을 둔 정식 등록 사업자이며, 통신판매업 신고를 마쳤습니다.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">어떻게 처리하나 — 운영 원칙</h2>
        <ul class="mt-4 space-y-3 text-sm leading-7 text-neutral-700 sm:text-base">
          <li class="flex gap-2"><span class="text-indigo-500">🔒</span><span><b>비밀번호를 요구하지 않습니다.</b> 공개 프로필 URL·닉네임만으로 진행해 계정 정보가 노출될 위험이 없습니다.</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">👥</span><span><b>실계정 기반</b>으로 처리해 봇 대량 유입보다 자연스럽고 유지력이 높은 편입니다. (상품별 성격은 각 상세 페이지에 명시)</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">📄</span><span><b>완료 시 결과보고서</b>를 자동 발송하며, 세금계산서 발행이 가능합니다.</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">↩️</span><span><b>작업 시작 전 100% 환불</b>, 진행 중·완료 후에는 진행률에 따라 부분 환불이 적용됩니다.</span></li>
          <li class="flex gap-2"><span class="text-indigo-500">🛟</span><span>유지 보장·무료 리필 정책을 대부분의 상품에 적용합니다(기간·범위는 상품별 상이, 상세 페이지 기준).</span></li>
        </ul>
      </section>

      <section class="rounded-3xl border border-amber-100 bg-amber-50/50 p-6">
        <h2 class="font-display text-xl text-neutral-900 sm:text-2xl">정직하게 — 보장하지 않는 것</h2>
        <ul class="mt-4 space-y-3 text-sm leading-7 text-neutral-700 sm:text-base">
          <li class="flex gap-2"><span class="text-amber-600">·</span><span>팔로워·구독자 '수' 확보가 목적이며, 좋아요·댓글 등 <b>상호작용이나 수익화·검색 순위·매출을 보장하지 않습니다.</b></span></li>
          <li class="flex gap-2"><span class="text-amber-600">·</span><span>각 플랫폼의 정책은 수시로 바뀔 수 있어, 계정 상태에 민감하다면 <b>소량부터 시작</b>을 권장합니다. 인위적 부스팅은 플랫폼 약관에서 권장되는 방식은 아닙니다.</span></li>
          <li class="flex gap-2"><span class="text-amber-600">·</span><span>부스팅은 <b>콘텐츠 품질을 대신하지 못합니다.</b> 노출의 기회를 넓히는 초기 신호이며, 지속 성장은 콘텐츠에 달려 있습니다.</span></li>
        </ul>
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
        <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">궁금한 점은 아래 채널로 편하게 문의해 주세요. 상담은 무료입니다.</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <a :href="CONTACT.telegram.url" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600">✈ {{ CONTACT.telegram.label }}</a>
          <a :href="CONTACT.kakao.url" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-yellow-500">💬 {{ CONTACT.kakao.label }}</a>
          <a :href="`mailto:${CONTACT.email}`" class="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">✉ 이메일 문의</a>
        </div>
      </section>
    </div>
  </div>
</template>
