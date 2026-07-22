import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";
import { sendTelegramMessage, tgEscape } from "../../utils/telegram";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

// 고객 → 관리자 쪽지 전송
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const parsed = schema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "메시지를 입력해주세요." });

  const msg = await prisma.message.create({
    data: { userId, fromAdmin: false, body: parsed.data.body },
    select: { id: true, fromAdmin: true, body: true, readAt: true, createdAt: true },
  });

  // 관리자 텔레그램 알림 (fail-silent)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  sendTelegramMessage(
    `💬 <b>고객 쪽지</b>\n${tgEscape(user?.name ?? "고객")}: ${tgEscape(parsed.data.body.slice(0, 300))}\n\n관리자 콘솔 → 쪽지에서 답장하세요.`,
  ).catch(() => {});

  return msg;
});
