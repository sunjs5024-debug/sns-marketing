import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: ["@sidebase/nuxt-auth", "@nuxtjs/seo"],

  // 사이트 전역 SEO 설정 (sitemap, robots, og-image, schema-org에서 공통 사용)
  // ⚠️ 현재 dev 모드로 실서비스 중이라 indexable: true 강제 (dev 자동 차단 무시)
  site: {
    url: "https://xn--sns-yg9lh0pw9l.kr",
    name: "SNS소셜팩토리",
    description:
      "인스타·유튜브·틱톡·텔레그램·카카오톡 SNS 마케팅부터 스마트스토어·블로그·카페 상위노출까지. 실계정·안전결제·결과보고서 보장.",
    defaultLocale: "ko",
    indexable: true,
  },

  // 검색엔진 색인 정책 — 운영 도메인은 색인 허용, 그 외 차단
  robots: {
    // /admin/*, /cart, /checkout/*, /orders/*, /auth/*, /mypage/* 는 크롤링 차단 (비공개·인증 영역)
    disallow: ["/admin", "/admin/", "/cart", "/checkout", "/checkout/", "/orders", "/orders/", "/auth", "/mypage", "/search"],
  },

  // sitemap.xml 자동 생성 — 비공개·리다이렉트 페이지는 제외, 동적 라우트는 sources 로 주입
  // /mypage/**(인증 전용)·/rank(/sns 로 301) 는 indexable 200 이 아니므로 사이트맵에서 제외
  sitemap: {
    // /search 는 noindex,follow(검색 결과 페이지) → 사이트맵 제외
    exclude: ["/admin/**", "/cart", "/checkout/**", "/orders/**", "/auth/**", "/mypage/**", "/messages", "/messages/**", "/rank", "/rank/**", "/search"],
    sources: ["/api/__sitemap__/urls"],
  },

  // OG 이미지는 zero-runtime 모드 (동적 생성 비활성, 정적 OG 이미지 URL로만 처리)
  ogImage: {
    enabled: false,
  },

  // JSON-LD 자동 주입용 조직 정보
  schemaOrg: {
    identity: {
      type: "Organization",
      name: "SNS소셜팩토리",
      alternateName: "주식회사 영천기획",
      url: "https://xn--sns-yg9lh0pw9l.kr",
      logo: "https://xn--sns-yg9lh0pw9l.kr/logo.png",
      email: "dkssudgktka53@gmail.com",
      // E-E-A-T 엔티티 신호 — AI 검색·구글이 실존 사업자로 확정(entity grounding)하는 근거
      sameAs: ["https://t.me/snssocialfactory"],
      foundingDate: "2026",
      areaServed: "KR",
      knowsLanguage: ["ko"],
      founder: { "@type": "Person", name: "김선민" },
      identifier: [
        { "@type": "PropertyValue", propertyID: "사업자등록번호", value: "447-81-03597" },
        { "@type": "PropertyValue", propertyID: "통신판매업신고번호", value: "제2026-경남진주-0298호" },
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://t.me/snssocialfactory",
        availableLanguage: ["ko"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "에나로77번길 4, 502호",
        addressLocality: "진주시",
        addressRegion: "경상남도",
        addressCountry: "KR",
      },
    },
  },

  // Cloudflare Pages 배포 (서버리스). 빌드 산출물은 ./dist/_worker.js
  // experimental.wasm: Prisma driver adapter 의 query engine wasm(?module import) 번들링 허용
  nitro: {
    preset: "cloudflare_pages",
    experimental: {
      wasm: true,
      // 요청별 DB 클라이언트 캐싱(useEvent)을 위해 필요 — server/utils/prisma.ts 참고
      asyncContext: true,
    },
    alias: {
      // @panva/hkdf 의 default export 가 엣지 번들 interop 에서 함수로 안 잡혀
      // next-auth JWT 암호화(getDerivedEncryptionKey)가 죽는다 → Web Crypto 기반 shim 으로 교체.
      "@panva/hkdf": fileURLToPath(new URL("./shims/hkdf.cjs", import.meta.url)),
    },
    // 공개 상품 페이지·카탈로그 API 를 엣지에서 SWR 캐싱 → 재방문 시 DB 안 거치고 즉시 로드.
    // (개인화 데이터인 /api/header·/api/me·/api/cart·/api/orders 등은 캐시 대상 아님)
    routeRules: {
      // 통합·폐지된 상품 → 대체 상품으로 301 영구 리다이렉트 (색인/북마크 보존)
      "/products/ig-comments-real": { redirect: { to: "/products/ig-comments-kr", statusCode: 301 } },
      // 비활성/폐지 상품 → 관련 라이브 페이지로 301 (GSC 404 정리 + 링크에쿼티 보존)
      "/products/ig-saves": { redirect: { to: "/sns/instagram", statusCode: 301 } },
      "/products/ig-story-views": { redirect: { to: "/products/ig-reels-views", statusCode: 301 } },
      "/products/tt-shares": { redirect: { to: "/sns/tiktok", statusCode: 301 } },
      "/products/kt-channel-friends-kr": { redirect: { to: "/products/kko-channel-add", statusCode: 301 } },
      "/products/kt-channel-friends-target": { redirect: { to: "/products/kko-channel-add", statusCode: 301 } },
      "/products/kt-openchat-entry": { redirect: { to: "/products/kko-open-join", statusCode: 301 } },
      "/products/kt-bizboard-monthly": { redirect: { to: "/sns/kakaotalk", statusCode: 301 } },
      "/products/nb-empathy": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/nb-neighbor": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/nb-experience": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/nb-rank-monthly": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/nc-comments": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/nc-members-kr": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/nc-rank-monthly": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/ss-traffic": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/ss-rank-monthly": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/ss-purchase-review": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/ss-zzim": { redirect: { to: "/sns", statusCode: 301 } },
      "/products/**": { swr: 600 },
      "/sns/**": { swr: 600 },
      "/marketing/**": { swr: 600 },
      "/price": { swr: 600 },
      "/api/products/**": { swr: 600 },
      "/api/reviews": { swr: 120 },
      // 사이트맵 — Neon 콜드스타트 시 503(발견 병목) 방지. 캐시된 last-good 재서빙.
      "/sitemap.xml": { swr: 3600 },
      "/sitemap_index.xml": { swr: 3600 },
      "/__sitemap__/**": { swr: 3600 },
    },
  },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    server: {
      // dev 서버 사용 시 외부 도메인 허용 (production 빌드에서는 영향 없음)
      allowedHosts: true,
    },
  },

  // @sidebase/nuxt-auth (Auth.js v5 호환)
  // SSR 시 sidebase 가 /session 무한 루프 → disableServerSideAuth 로 회피
  auth: {
    // ⚠️ Cloudflare Workers 는 워커 시작(init) 시점에 환경변수(AUTH_ORIGIN)를 읽지 못해
    // sidebase 가 origin 을 못 찾고 AUTH_NO_ORIGIN 으로 죽는다.
    // → origin 을 전체 URL 로 코드에 박아 빌드시 포함시킨다 (운영 도메인 고정).
    baseURL: "https://xn--sns-yg9lh0pw9l.kr/api/auth",
    originEnvKey: "AUTH_ORIGIN",
    disableInternalRouting: true,
    disableServerSideAuth: true,
    provider: {
      type: "authjs",
      trustHost: true,
    },
    globalAppMiddleware: false,
  },

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "",
    portoneApiSecret: process.env.PORTONE_API_SECRET ?? "",
    portoneStoreId: process.env.PORTONE_STORE_ID ?? "",
    public: {
      portoneChannelKey: process.env.NUXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "ko" },
      title: "SNS소셜팩토리 — SNS 마케팅 & 상위노출 전문",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "인스타·유튜브·틱톡·텔레그램·카카오톡 SNS 마케팅부터 스마트스토어·블로그·카페 상위노출까지. 실계정·안전결제·결과보고서 보장.",
        },
        { name: "theme-color", content: "#a855f7" },
        // OG 이미지 글로벌 fallback — 모든 페이지에서 SNS 공유 시 이 커버
        // v2 파일명으로 카카오·페북 캐시 강제 무효화
        { property: "og:image", content: "https://xn--sns-yg9lh0pw9l.kr/og-cover-v2.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:alt", content: "SNS소셜팩토리 — SNS 마케팅 & 검색 상위노출 1번지" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://xn--sns-yg9lh0pw9l.kr/og-cover-v2.png" },
        // 검색엔진 소유권 확인 (네이버 서치어드바이저 / 구글 Search Console)
        { name: "naver-site-verification", content: "e32863e2b7babe778820b4898bbcaec727dc604d" },
        { name: "google-site-verification", content: "v-IYp-1JE-V-cuz71BDBd3gCW6Dah93P3_P52EQ1X-M" },
      ],
      link: [
        // 본문·헤딩 폰트 Pretendard — dynamic-subset(필요 글자만 로드) + preconnect 로 LCP 개선.
        //   ⚠️ 구 main.css @font-face URL(gh/…/PretendardVariable.woff2)은 404였음 → 정상 npm 경로로 교체.
        { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossorigin: "anonymous" },
        // 렌더블로킹 제거 — media='print'로 비동기 로드 후 onload에서 'all' 스왑(표준 async-CSS).
        //   pretendard 자체가 font-display:swap이라 텍스트는 폴백으로 즉시 표시 → LCP 안 막힘.
        //   onload 미발화 시에도 폴백 스택(Apple SD Gothic Neo·system)으로 우아하게 저하(하드브레이크 없음).
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css",
          media: "print",
          onload: "this.media='all'",
        },
        // 현대 브라우저 — 벡터 SVG favicon 우선
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        // 구형 브라우저 fallback
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
        { rel: "icon", href: "/favicon.ico" },
        // iOS 홈 화면 / 안드로이드
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      ],
    },
  },
});
