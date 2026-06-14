// 관리자 반려
import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

const schema = z.object({
  reason: z.string().max(200).optional(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  const body = await readBody(event).catch(() => ({}));
  const parsed = schema.parse(body || {});

  const charge = await prisma.charge.findUnique({ where: { id } });
  if (!charge) throw createError({ statusCode: 404 });
  if (charge.status !== "PENDING") {
    throw createError({
      statusCode: 409,
      statusMessage: `이미 처리된 신청입니다 (현재 상태: ${charge.status})`,
    });
  }

  await prisma.charge.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectReason: parsed.reason ?? "관리자 반려",
    },
  });

  return { ok: true };
});
