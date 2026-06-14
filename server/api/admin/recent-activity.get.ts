// 어드민 — 최근 활동 피드 (가장 최근 20개 이벤트)
//   주문 생성 / 충전 신청 / 회원가입 등을 시간순 통합
import { requireAdmin } from "../../utils/session";
import { prisma } from "../../utils/prisma";

type Activity = {
  type: "order" | "charge" | "signup";
  at: Date;
  title: string;
  detail: string;
  amount?: number;
  status?: string;
  link?: string;
};

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const [orders, charges, users] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        orderNumber: true,
        buyerName: true,
        finalAmount: true,
        status: true,
        createdAt: true,
        items: { select: { productName: true }, take: 1 },
        _count: { select: { items: true } },
      },
    }),
    prisma.charge.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        chargeNumber: true,
        amount: true,
        depositorName: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const items: Activity[] = [
    ...orders.map((o) => ({
      type: "order" as const,
      at: o.createdAt,
      title: `${o.buyerName} 신규 주문`,
      detail: `${o.items[0]?.productName ?? "(상품)"}${o._count.items > 1 ? ` 외 ${o._count.items - 1}건` : ""}`,
      amount: o.finalAmount,
      status: o.status,
      link: `/orders/${o.orderNumber}`,
    })),
    ...charges.map((c) => ({
      type: "charge" as const,
      at: c.createdAt,
      title: `${c.user.name} 충전 신청`,
      detail: `입금자: ${c.depositorName}`,
      amount: c.amount,
      status: c.status,
    })),
    ...users.map((u) => ({
      type: "signup" as const,
      at: u.createdAt,
      title: `${u.name} 회원가입`,
      detail: u.email,
    })),
  ];

  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return items.slice(0, 20);
});
