<script setup lang="ts">
useSeoMeta({
  title: "개인정보처리방침",
  description:
    "SNS소셜팩토리(sns늘리기.kr)의 개인정보처리방침입니다. 수집 항목, 이용 목적, 보유 기간, 제3자 제공 및 회원의 권리를 안내합니다.",
  ogTitle: "개인정보처리방침 | SNS소셜팩토리",
  ogDescription: "수집 항목·이용 목적·보유 기간·이용자 권리 안내",
  ogType: "article",
  ogLocale: "ko_KR",
});

useSchemaOrg([
  defineWebPage({ name: "개인정보처리방침", description: "SNS소셜팩토리 개인정보처리방침" }),
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://xn--sns-yg9lh0pw9l.kr/" },
      { "@type": "ListItem", position: 2, name: "개인정보처리방침", item: "https://xn--sns-yg9lh0pw9l.kr/privacy" },
    ],
  },
]);

const lastUpdated = "2026-05-24";

const COMPANY = {
  name: "SNS소셜팩토리",
  ceo: "(대표자명)",
  privacyOfficer: "(개인정보보호 책임자)",
  privacyEmail: "(개인정보보호 이메일)",
};
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
    <h1 class="font-display text-3xl text-neutral-900">개인정보처리방침</h1>
    <p class="mt-2 text-xs text-neutral-500">최종 개정일: {{ lastUpdated }}</p>

    <article class="mt-8 space-y-8 text-sm leading-7 text-neutral-700">
      <section>
        <p>
          {{ COMPANY.name }}(이하 "회사")는 개인정보 보호법 등 관련 법령을 준수하며, 회원의 개인정보를 안전하게
          보호하기 위해 다음과 같은 처리방침을 두고 있습니다.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제1조 (수집하는 개인정보 항목)</h2>
        <p class="mt-2">회사는 다음의 개인정보를 수집합니다.</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li><b>필수</b>: 이메일, 비밀번호(암호화 저장), 이름, 휴대전화번호</li>
          <li><b>주문 시 추가</b>: 결제정보(계좌이체 시 입금자명), 작업 대상 SNS 공개 URL/닉네임</li>
          <li><b>자동 수집</b>: 접속 IP, 쿠키, 접속 로그, 기기 정보, 브라우저 정보</li>
          <li><b>소셜 로그인 시</b>: 해당 SNS 플랫폼이 제공하는 식별 정보 (이메일, 이름 등)</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제2조 (개인정보의 이용 목적)</h2>
        <ol class="mt-2 list-decimal space-y-1 pl-5">
          <li>회원가입, 본인 식별, 부정 이용 방지</li>
          <li>주문·결제 처리 및 결과보고서 발송</li>
          <li>고객 문의 응대 및 공지사항 전달</li>
          <li>서비스 이용 통계 분석 및 품질 개선</li>
          <li>법령상 의무 이행 및 분쟁 해결</li>
        </ol>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제3조 (보유 및 이용 기간)</h2>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>회원정보: 회원탈퇴 시까지 (단, 부정이용 방지를 위해 탈퇴 후 30일간 보관 후 삭제)</li>
          <li>주문·결제 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만/분쟁 기록: 3년 (전자상거래법)</li>
          <li>접속 로그: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제4조 (개인정보의 제3자 제공)</h2>
        <p class="mt-2">
          회사는 회원의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.
        </p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>회원이 사전 동의한 경우</li>
          <li>법령에 의거하거나 수사기관의 적법한 절차 요청이 있는 경우</li>
          <li>결제 처리를 위해 결제대행사(PG)에 결제 정보 일부 전달</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제5조 (개인정보 처리의 위탁)</h2>
        <p class="mt-2">
          회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁할 수 있습니다.
        </p>
        <table class="mt-3 w-full table-fixed border-collapse text-xs">
          <thead class="bg-neutral-50 text-neutral-500">
            <tr>
              <th class="border border-neutral-200 px-3 py-2 text-left">수탁업체</th>
              <th class="border border-neutral-200 px-3 py-2 text-left">위탁 업무</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-neutral-200 px-3 py-2">Neon (DB 호스팅)</td>
              <td class="border border-neutral-200 px-3 py-2">회원 데이터 및 주문 데이터 저장</td>
            </tr>
            <tr>
              <td class="border border-neutral-200 px-3 py-2">Cloudflare</td>
              <td class="border border-neutral-200 px-3 py-2">웹사이트 보안 및 콘텐츠 전송 (CDN)</td>
            </tr>
            <tr>
              <td class="border border-neutral-200 px-3 py-2">PG 결제대행사 (추후 연동)</td>
              <td class="border border-neutral-200 px-3 py-2">결제 처리 및 환불</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제6조 (회원의 권리)</h2>
        <p class="mt-2">
          회원은 언제든지 자신의 개인정보를 조회·수정·삭제·처리정지 요청할 수 있으며, 회원 탈퇴를 통해
          개인정보의 처리에 대한 동의를 철회할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제7조 (개인정보의 안전성 확보 조치)</h2>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>비밀번호 일방향 암호화 저장 (bcrypt)</li>
          <li>전 구간 HTTPS 통신 암호화</li>
          <li>개인정보 접근 권한 최소화 및 접근 기록 보관</li>
          <li>주기적 보안 점검 및 취약점 점검</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-lg text-neutral-900">제8조 (쿠키 사용)</h2>
        <p class="mt-2">
          회사는 로그인 세션 유지 및 서비스 개선을 위해 쿠키를 사용합니다. 회원은 브라우저 설정에서 쿠키 저장을
          거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <h2 class="font-display text-base text-neutral-900">개인정보보호 책임자</h2>
        <dl class="mt-3 grid grid-cols-1 gap-1 text-xs text-neutral-600">
          <div><dt class="inline text-neutral-500">책임자: </dt><dd class="inline">{{ COMPANY.privacyOfficer }}</dd></div>
          <div><dt class="inline text-neutral-500">연락처: </dt><dd class="inline">{{ COMPANY.privacyEmail }}</dd></div>
        </dl>
        <p class="mt-3 text-xs text-neutral-500">
          개인정보 처리와 관련된 문의·불만·피해구제 요청은 위 연락처로 접수해주시면 신속히 처리해드립니다.
        </p>
      </section>
    </article>
  </div>
</template>
