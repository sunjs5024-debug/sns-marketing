// 어드민 — 세금계산서 신청 상태 변경 (발행/거절/메모)
import { z } from "zod";
import { requireAdmin } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

const schema = z.object({
  status: z.enum(["REQUESTED", "ISSUED", "REJECTED"]).optional(),
  rejectReason: z.string().max(500).nullable().optional(),
  adminMemo: z.string().max(500).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });

  const data: Record<string, unknown> = {};
  if (parsed.data.status) {
    data.status = parsed.data.status;
    if (parsed.data.status === "ISSUED") data.issuedAt = new Date();
    if (parsed.data.status === "REJECTED") data.rejectReason = parsed.data.rejectReason ?? null;
    if (parsed.data.status === "REQUESTED") {
      data.issuedAt = null;
      data.rejectReason = null;
    }
  }
  if (parsed.data.adminMemo !== undefined) data.adminMemo = parsed.data.adminMemo;
  if (parsed.data.rejectReason !== undefined) data.rejectReason = parsed.data.rejectReason;

  const updated = await prisma.taxInvoiceRequest.update({
    where: { id },
    data,
  });
  return { ok: true, item: updated };
});
