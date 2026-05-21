<script setup lang="ts">
import { PLATFORMS, SNS_PLATFORMS, RANK_PLATFORMS, platformKeyFor } from "#shared/catalog";

const { data: featured } = await useFetch("/api/products/featured");

const WHY_ITEMS = [
  { emoji: "🔒", title: "비밀번호 없이 안전하게", desc: "주문 시 비밀번호를 요구하지 않습니다. 공개된 URL과 닉네임만으로 처리되어 계정이 안전합니다." },
  { emoji: "👥", title: "실제 사용자 기반", desc: "어뷰징 봇이 아닌 실계정 기반으로 처리합니다. 알고리즘에 자연스럽게 녹아드는 부스팅입니다." },
  { emoji: "📊", title: "투명한 결과보고서", desc: "주문 진행률과 완료 시점을 실시간으로 확인할 수 있고, 완료 시 결과보고서가 자동 발송됩니다." },
  { emoji: "⚡", title: "10분 내 빠른 시작", desc: "결제 후 평균 10분 안에 작업이 시작됩니다. 긴급 상황엔 우선 처리도 가능합니다." },
  { emoji: "💳", title: "안전결제 시스템", desc: "카드결제, 계좌이체, 카카오페이, 토스 등 다양한 결제수단을 지원하며 모두 PG사를 통합니다." },
  { emoji: "💬", title: "24시간 카톡 상담", desc: "주문 전·후 언제든 카카오톡 채널로 문의 가능. 평일 영업시간 외에도 봇 + 인간 하이브리드로 응대합니다." },
];

const REVIEWS = [
  { author: "@de****_yj", tag: "인스타 크리에이터", text: "릴스 조회수랑 같이 팔로워가 늘어서 진짜 자연스러웠어요. 알고리즘이 푸쉬해주는 게 체감됩니다." },
  { author: "광교**사장님", tag: "네이버카페", text: "타겟 지역 카페에 가입자랑 후기글 같이 올렸더니 매장 검색 노출까지 같이 올라갔어요. 방문 손님이 30% 늘었습니다." },
  { author: "@vi***_seoul", tag: "스마트스토어 셀러", text: "상품 구매평이 20개 넘어가니까 그 다음부터는 자연 유입이 알아서 늘더라고요. 초기 부스팅용으로 추천!" },
  { author: "@da***_jiwon", tag: "유튜브", text: "쇼츠 조회수만 살짝 올렸는데 알고리즘이 노출을 늘려줘서 구독자가 따라 늘었어요." },
  { author: "감성카**오너", tag: "블로그 체험단", text: "체험단 5명 매칭으로 양질의 후기 글이 빠르게 쌓였습니다. 광고 같지 않고 자연스러워요." },
  { author: "@k_t****er", tag: "틱톡 크리에이터", text: "한국 타겟으로 부탁드렸는데 진짜 한국인 계정이 들어와서 댓글까지 달리더라고요. 만족!" },
];

const FAQS = [
  { q: "정말 계정이 안전한가요?", a: "네, 비밀번호를 요구하지 않습니다. 공개 프로필 URL과 닉네임만으로 처리되어 SNS 약관상 문제될 일이 없습니다." },
  { q: "작업은 얼마나 빨리 시작되나요?", a: "결제 완료 후 평균 10분 내 시작됩니다. 일부 대형 상품은 30분~수 시간 내 진행됩니다." },
  { q: "유지 기간이 있나요?", a: "상품별로 다릅니다. 일반적으로 30일 ~ 평생 보장 옵션을 제공하며, 유지 보장 기간 내 이탈 시 자동 리필됩니다." },
  { q: "결제는 어떻게 하나요?", a: "카드결제, 계좌이체, 카카오페이, 토스페이, 네이버페이 등 모두 지원합니다. 모든 결제는 안전한 PG사를 통합니다." },
  { q: "환불은 가능한가요?", a: "작업 시작 전엔 100% 환불 가능합니다. 작업 진행 중 / 완료 후엔 진행률에 따라 부분 환불이 적용됩니다." },
  { q: "결과 보고서를 받을 수 있나요?", a: "네, 모든 주문은 완료 시 자동으로 결과보고서가 이메일로 발송됩니다. 마이페이지에서도 확인 가능합니다." },
];
</script>

<template>
  <div>
    <Hero />
    <LiveOrderTicker />

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="CATEGORY" title="어떤 마케팅이 필요하신가요?" description="플랫폼별 전문 상품으로 빠르게 시작하세요. 카테고리 클릭 시 상세 상품을 확인할 수 있습니다." />
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlatformCard v-for="slug in SNS_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="sns" />
        <PlatformCard v-for="slug in RANK_PLATFORMS" :key="slug" :platform="PLATFORMS[slug]" base="rank" />
      </div>
    </section>

    <section class="bg-neutral-50/60 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="BEST" title="시선집중! 가장 많이 찾는 상품" description="이번 주 가장 많이 판매된 BEST 상품을 모았습니다." more-href="/sns" />
        <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard
            v-for="p in featured ?? []"
            :key="p.id"
            :slug="p.slug"
            :name="p.name"
            :base-price="p.basePrice"
            :badge="p.badge"
            :rating="p.rating"
            :sales-count="p.salesCount"
            :category-name="p.category.name"
            :icon-key="platformKeyFor(p.category.slug)"
          />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="WHY US" title="왜 SNS 소셜팩토리를 선택할까요?" />
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(w, i) in WHY_ITEMS"
          :key="w.title"
          class="group rounded-3xl border border-neutral-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="inline-block text-4xl anim-bounce" :style="{ animationDelay: `-${i * 0.4}s` }">{{ w.emoji }}</div>
          <h3 class="mt-3 font-display text-lg text-neutral-900">{{ w.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-neutral-600">{{ w.desc }}</p>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
      <div class="pointer-events-none absolute -left-20 top-10 h-72 w-72 bg-indigo-300/30 blur-3xl anim-blob" />
      <div class="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 bg-pink-300/30 blur-3xl anim-blob" style="animation-delay: -7s" />
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="REVIEWS" title="실제 고객 후기" description="평균 만족도 4.9/5.0 — 마케터·소상공인·크리에이터의 진짜 후기를 확인하세요." more-href="/reviews" />
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="r in REVIEWS"
            :key="r.author"
            class="rounded-3xl border border-white/60 bg-white/85 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-center gap-2 text-amber-500">★★★★★</div>
            <p class="mt-3 text-sm leading-6 text-neutral-700">"{{ r.text }}"</p>
            <p class="mt-4 text-xs text-neutral-500">— {{ r.author }} · {{ r.tag }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
      <div class="mt-8 divide-y divide-neutral-100 rounded-3xl border border-neutral-100">
        <details v-for="f in FAQS" :key="f.q" class="group p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm text-neutral-800">
            {{ f.q }}
            <span class="text-neutral-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-sm leading-6 text-neutral-600">{{ f.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>
