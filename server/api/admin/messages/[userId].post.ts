import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

// 관리자 → 고객 쪽지 전송
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const userId = getRouterParam(event, "userId");
  if (!userId) throw createError({ statusCode: 400 });
  const parsed = schema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "메시지를 입력해주세요." });

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) throw createError({ statusCode: 404, statusMessage: "회원을 찾을 수 없습니다." });

  return prisma.message.create({
    data: { userId, fromAdmin: true, body: parsed.data.body },
    select: { id: true, fromAdmin: true, body: true, readAt: true, createdAt: true },
  });
});
