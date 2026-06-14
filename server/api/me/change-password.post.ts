// 비밀번호 변경 — 이메일 가입 사용자만 (OAuth 사용자는 passwordHash 없음)
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

const schema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
  newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다.").max(100),
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw createError({ statusCode: 404 });
  if (!user.passwordHash) {
    throw createError({
      statusCode: 400,
      statusMessage: "소셜 로그인 계정은 비밀번호 변경이 지원되지 않습니다. 가입한 소셜 계정에서 변경해주세요.",
    });
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    throw createError({ statusCode: 400, statusMessage: "현재 비밀번호가 일치하지 않습니다." });
  }

  // 동일 비밀번호 재사용 방지
  const same = await bcrypt.compare(parsed.data.newPassword, user.passwordHash);
  if (same) {
    throw createError({ statusCode: 400, statusMessage: "기존 비밀번호와 동일합니다." });
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { ok: true };
});
