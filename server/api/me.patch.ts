// 본인 회원정보 수정 — 이름 / 연락처
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireUserId } from "../utils/session";

const schema = z.object({
  name: z.string().min(1).max(30).trim().optional(),
  phone: z.string().max(20).trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? "잘못된 요청" });
  }
  const data: { name?: string; phone?: string | null } = {};
  if (typeof parsed.data.name === "string") data.name = parsed.data.name;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone || null;

  if (Object.keys(data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: "변경할 내용이 없습니다." });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, phone: true, email: true },
  });
  return { ok: true, user: updated };
});
