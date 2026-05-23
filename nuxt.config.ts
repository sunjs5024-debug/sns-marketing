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
    // /admin/*, /cart, /checkout/*, /orders/*, /auth/* 는 크롤링 차단
    disallow: ["/admin", "/admin/", "/cart", "/checkout", "/checkout/", "/orders", "/orders/", "/auth"],
  },

  // sitemap.xml 자동 생성 — 비공개 페이지는 제외, 동적 라우트는 sources 로 주입
  sitemap: {
    exclude: ["/admin/**", "/cart", "/checkout/**", "/orders/**", "/auth/**"],
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
      url: "https://xn--sns-yg9lh0pw9l.kr",
      logo: "https://xn--sns-yg9lh0pw9l.kr/logo.png",
    },
  },

  // 이 PC 의 Apache 리버스 프록시 뒤에서 도는 Node 서버 (production)
  nitro: {
    preset: "node-server",
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
    baseURL: "/api/auth",
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
      ],
      link: [
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
