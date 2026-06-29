import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NuxtAuthHandler } from "#auth";
import { prisma } from "../../utils/prisma";

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// next-auth v4 provider 는 번들 환경(CJS/ESM)에 따라 실제 함수가 m.default 에 있기도 하고 m 자체이기도 함.
// node-server 빌드는 m.default, cloudflare ESM 번들은 m 자체 → 둘 다 처리.
function resolveProvider<T>(m: T): T {
  const d = (m as { default?: unknown }).default;
  return (typeof d === "function" ? d : m) as T;
}

// OAuth provider 환경변수 누락 시 provider 자체를 빼는 헬퍼
function oauthOrNull<T>(id: string | undefined, secret: string | undefined, factory: () => T): T | null {
  if (!id || !secret) return null;
  return factory();
}

const oauthProviders = [
  oauthOrNull(process.env.KAKAO_CLIENT_ID, process.env.KAKAO_CLIENT_SECRET, () =>
    resolveProvider(KakaoProvider)({ clientId: process.env.KAKAO_CLIENT_ID!, clientSecret: process.env.KAKAO_CLIENT_SECRET! }),
  ),
  oauthOrNull(process.env.NAVER_CLIENT_ID, process.env.NAVER_CLIENT_SECRET, () =>
    resolveProvider(NaverProvider)({ clientId: process.env.NAVER_CLIENT_ID!, clientSecret: process.env.NAVER_CLIENT_SECRET! }),
  ),
  oauthOrNull(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, () =>
    resolveProvider(GoogleProvider)({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  ),
].filter((p): p is NonNullable<typeof p> => p !== null);

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  pages: { signIn: "/auth/signin" },
  providers: [
    resolveProvider(CredentialsProvider)({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials: { email?: string; password?: string }) {
        const parsed = credSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !user.passwordHash) return null;
        if (user.isDeleted) return null; // 탈퇴 회원 차단
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          points: user.points,
        };
      },
    }),
    ...oauthProviders,
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60,   // 매일 토큰 갱신
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      // 카카오 등 일부 provider 는 이메일 안 줄 수 있음 (사업자 검수 전).
      // 그 경우 provider + providerAccountId 로 가짜 이메일 만들어 DB 식별.
      const fallbackEmail = `${account.provider}_${account.providerAccountId}@${account.provider}.local`;
      const email = user.email || fallbackEmail;
      // user 객체에 email 박아서 jwt 콜백에서 매칭 가능하게
      user.email = email;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing?.isDeleted) return false; // 탈퇴 회원 차단
      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            name: user.name || `${account.provider}_user`,
            role: "USER",
          },
        });
      }
      return true;
    },
    jwt: async ({ token, user, account }) => {
      if (user && account) {
        if (account.provider === "credentials") {
          const u = user as { id: string; role: "USER" | "ADMIN"; points: number };
          token.id = u.id;
          token.role = u.role;
          token.points = u.points;
        } else if (user.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.points = dbUser.points;
            token.name = dbUser.name;
          }
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = (token as Record<string, unknown>).role;
        (session.user as Record<string, unknown>).points = (token as Record<string, unknown>).points;
      }
      return session;
    },
  },
});
