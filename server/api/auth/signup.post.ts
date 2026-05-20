import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../utils/prisma";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요."),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  phone: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? "잘못된 입력" });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "이미 가입된 이메일입니다." });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  return { user };
});
