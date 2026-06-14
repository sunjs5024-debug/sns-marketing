// 관리자 — 리뷰 승인 / 거절
// action: "approve" → isVerified=true, rejectedAt=null
// action: "reject"  → isVerified=false, rejectedAt=NOW(), adminMemo=거절사유
import { z } from "zod";
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  adminMemo: z.string().max(500).optional(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "리뷰 ID 누락" });

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "잘못된 요청" });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw createError({ statusCode: 404, statusMessage: "리뷰를 찾을 수 없습니다." });

  if (parsed.data.action === "approve") {
    await prisma.review.update({
      where: { id },
      data: {
        isVerified: true,
        rejectedAt: null,
        adminMemo: parsed.data.adminMemo ?? review.adminMemo,
      },
    });
    return { ok: true, status: "approved" };
  }

  // reject
  await prisma.review.update({
    where: { id },
    data: {
      isVerified: false,
      rejectedAt: new Date(),
      adminMemo: parsed.data.adminMemo ?? "관리자 거절",
    },
  });
  return { ok: true, status: "rejected" };
});
