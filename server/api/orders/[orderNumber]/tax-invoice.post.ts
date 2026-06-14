// 세금계산서 신청 (신규 생성)
//   - 결제 완료(PAID 이상) 주문만 신청 가능
//   - 1주문 = 1신청 (이미 있으면 PATCH 사용)
import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { requireUserId } from "../../../utils/session";

const schema = z.object({
  companyName: z.string().min(1).max(100),
  bizRegNo: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, "사업자등록번호는 000-00-00000 형식으로 입력해주세요."),
  ceoName: z.string().min(1).max(50),
  address: z.string().min(1).max(200),
  businessType: z.string().max(50).nullable().optional(),
  businessItem: z.string().max(50).nullable().optional(),
  taxEmail: z.string().email(),
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const orderNumber = getRouterParam(event, "orderNumber");
  if (!orderNumber) throw createError({ statusCode: 400 });

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? "잘못된 요청" });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { taxInvoiceRequest: true },
  });
  if (!order || order.userId !== userId) throw createError({ statusCode: 404 });
  if (!["PAID", "PROCESSING", "COMPLETED"].includes(order.status)) {
    throw createError({ statusCode: 400, statusMessage: "결제 완료된 주문만 신청 가능합니다." });
  }
  if (order.taxInvoiceRequest && order.taxInvoiceRequest.status === "ISSUED") {
    throw createError({ statusCode: 409, statusMessage: "이미 발행 완료된 세금계산서가 있습니다." });
  }

  if (order.taxInvoiceRequest) {
    // 기존 신청(REQUESTED/REJECTED) 업데이트
    const updated = await prisma.taxInvoiceRequest.update({
      where: { id: order.taxInvoiceRequest.id },
      data: {
        ...parsed.data,
        businessType: parsed.data.businessType ?? null,
        businessItem: parsed.data.businessItem ?? null,
        status: "REQUESTED",
        rejectReason: null,
      },
    });
    return { ok: true, request: updated, updated: true };
  }

  const created = await prisma.taxInvoiceRequest.create({
    data: {
      userId,
      orderId: order.id,
      companyName: parsed.data.companyName,
      bizRegNo: parsed.data.bizRegNo,
      ceoName: parsed.data.ceoName,
      address: parsed.data.address,
      businessType: parsed.data.businessType ?? null,
      businessItem: parsed.data.businessItem ?? null,
      taxEmail: parsed.data.taxEmail,
    },
  });
  return { ok: true, request: created, updated: false };
});
