<script setup lang="ts">
useSeoMeta({
  title: "이용약관",
  description:
    "SNS소셜팩토리(sns늘리기.kr)의 이용약관입니다. 회원 가입, 서비스 이용, 결제·환불, 책임의 범위 등을 안내합니다.",
  ogTitle: "이용약관 | SNS소셜팩토리",
  ogDescription: "SNS 마케팅·상위노출 서비스 이용약관",
  ogType: "article",
  ogLocale: "ko_KR",
});

useSchemaOrg([
  defineWebPage({ name: "이용약관", description: "SNS소셜팩토리 이용약관" }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "이용약관", item: "https://xn--sns-yg9lh0pw9l.kr/terms" },
    ],
  },
]);

// 최종 개정일 — 약관 변경 시 같이 갱신
const lastUpdated = "2026-05-30";

// 사업자 정보
const COMPANY = {
  name: "주식회사 영천기획",
  service: "SNS소셜팩토리", // 서비스 브랜드명
  ceo: "김선민",
  bizRegNo: "447-81-03597",
  mailOrderNo: "제 2026-경남진주-0298 호",
  address: "경상남도 진주시 에나로77번길 4, 502호",
  email: "dkssudgktka53@gmail.com",
};
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
    <h1 class="font-display text-3xl text-neutral-900">이용약관</h1>
    <p class="mt-2 text-xs text-neutral-500">최종 개정일: {{ lastUpdated }}</p>

    <article class="mt-8 space-y-8 text-sm leading-7 text-neutral-700">
      <section>
        <h2 class="font-display text-lg text-neutral-900">제1조 (목적)</h2>
        <p class="mt-2">
          본 약관은 {{ COMPANY.name }}(이하 "회사")가 운영하는 SNS 마케팅·검색 상위노출 서비스(이하 "서비스")의
          이용 조건 및 절차, 회사와 회원의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제2조 (용어의 정의)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>"서비스"란 회사가 제공하는 SNS 팔로워·좋아요·조회수 부스팅, 검색 상위노출 관리 등 마케팅 관련 일체의 서비스를 말합니다.</li>
          <li>"회원"이란 본 약관에 동의하고 회사가 정한 절차에 따라 가입한 자를 말합니다.</li>
          <li>"이용계약"이란 서비스 이용을 위해 회원과 회사가 본 약관에 따라 체결하는 계약을 말합니다.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제3조 (약관의 게시 및 변경)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>회사는 본 약관을 회원이 쉽게 확인할 수 있도록 서비스 초기 화면에 게시합니다.</li>
          <li>회사는 관련 법령을 위배하지 않는 범위 내에서 본 약관을 개정할 수 있으며, 변경 시 최소 7일 전(회원에게 불리한 변경은 30일 전)부터 공지합니다.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제4조 (회원가입)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>이용자는 회사가 정한 양식에 따라 가입신청을 하고, 회사가 이를 승낙함으로써 회원자격을 부여받습니다.</li>
          <li>회원은 정확한 정보를 제공할 의무가 있으며, 허위 정보로 인한 불이익은 회원이 부담합니다.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제5조 (서비스 이용)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>회원은 회사가 제공하는 상품을 선택해 주문할 수 있으며, 결제 완료 후 작업이 진행됩니다.</li>
          <li>회사는 회원이 입력한 공개 URL과 닉네임 등 최소 정보로 작업을 수행하며, 회원의 SNS 비밀번호를 요구하지 않습니다.</li>
          <li>일부 서비스는 외부 SNS 플랫폼의 정책 변경에 따라 일시적으로 중단되거나 결과가 달라질 수 있습니다.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제6조 (결제 및 환불)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>결제는 회사가 안내하는 방법(현재는 계좌이체)으로 진행됩니다.</li>
          <li>작업 시작 전: 100% 환불.</li>
          <li>작업 진행 중: 진행률을 차감한 잔여분 환불.</li>
          <li>작업 완료 후: 결과보고서를 토대로 협의 환불.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제7조 (회원의 의무)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>회원은 타인의 계정 정보를 도용하거나 부정한 방법으로 서비스를 이용해서는 안 됩니다.</li>
          <li>회원은 회사가 제공하는 결과보고서를 통해 진행 상황을 확인할 책임이 있습니다.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제8조 (회사의 책임 제한)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>회사는 천재지변, SNS 플랫폼의 정책 변경, 시스템 장애 등 회사의 귀책사유가 아닌 사유로 인한 서비스 중단·결과 변동에 대해 책임을 지지 않습니다.</li>
          <li>회사는 회원이 입력한 URL·닉네임 등의 오류로 인한 잘못된 작업에 대해 책임을 지지 않습니다.</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제9조 (분쟁 해결 및 관할법원)</h2>
        <p class="mt-2">
          본 약관과 관련된 분쟁은 대한민국 법령에 따라 해결하며, 분쟁의 관할법원은 회사의 본점 소재지 관할 법원으로 합니다.
        </p>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <h2 class="font-display text-base text-neutral-900">사업자 정보</h2>
        <dl class="mt-3 grid grid-cols-1 gap-1 text-xs text-neutral-600 sm:grid-cols-2">
          <div><dt class="inline text-neutral-500">상호: </dt><dd class="inline">{{ COMPANY.name }}</dd></div>
          <div><dt class="inline text-neutral-500">서비스명: </dt><dd class="inline">{{ COMPANY.service }}</dd></div>
          <div><dt class="inline text-neutral-500">대표: </dt><dd class="inline">{{ COMPANY.ceo }}</dd></div>
          <div><dt class="inline text-neutral-500">사업자등록번호: </dt><dd class="inline">{{ COMPANY.bizRegNo }}</dd></div>
          <div class="sm:col-span-2"><dt class="inline text-neutral-500">통신판매업: </dt><dd class="inline">{{ COMPANY.mailOrderNo }}</dd></div>
          <div class="sm:col-span-2"><dt class="inline text-neutral-500">주소: </dt><dd class="inline">{{ COMPANY.address }}</dd></div>
          <div class="sm:col-span-2"><dt class="inline text-neutral-500">이메일: </dt><dd class="inline">{{ COMPANY.email }}</dd></div>
        </dl>
      </section>
    </article>
  </div>
</template>
