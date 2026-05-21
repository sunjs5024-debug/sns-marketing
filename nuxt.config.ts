import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: ["@sidebase/nuxt-auth"],

  // Cloudflare Pages 배포 프리셋
  nitro: {
    preset: "cloudflare-pages",
  },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    server: {
      // 터널/외부 도메인에서도 dev 서버에 접속 가능하게
      allowedHosts: true,
    },
  },

  // @sidebase/nuxt-auth (Auth.js v5 호환)
  auth: {
    baseURL: "/api/auth",
    originEnvKey: "_DISABLED_ORIGIN_ENV_", // AUTH_ORIGIN 자동 override 비활성
    disableInternalRouting: true, // 재귀 체크 우회 (Vue Router 잘못 잡는 이슈)
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
      title: "SNS 소셜팩토리 — SNS 마케팅 & 상위노출 전문",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "인스타·유튜브·틱톡·텔레그램·카카오톡 SNS 마케팅부터 스마트스토어·블로그·카페 상위노출까지. 실계정·안전결제·결과보고서 보장.",
        },
      ],
    },
  },
});
