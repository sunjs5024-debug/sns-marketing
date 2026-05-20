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

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  pages: { signIn: "/auth/signin" },
  providers: [
    // @ts-expect-error sidebase + next-auth v4 default export
    CredentialsProvider.default({
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
    // @ts-expect-error
    KakaoProvider.default({
      clientId: process.env.KAKAO_CLIENT_ID ?? "dummy",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "dummy",
    }),
    // @ts-expect-error
    NaverProvider.default({
      clientId: process.env.NAVER_CLIENT_ID ?? "dummy",
      clientSecret: process.env.NAVER_CLIENT_SECRET ?? "dummy",
    }),
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "dummy",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
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
