import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

// 시계열 매출/주문 통계
// query: ?period=day (최근 14일, 일별) | week (최근 12주, 주별) | month (최근 12개월, 월별)
// 응답: { period, labels: string[], orderCounts: number[], revenues: number[] }

type Period = "day" | "week" | "month";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // 월요일 0
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const { period } = getQuery(event);
  const p = (typeof period === "string" ? period : "day") as Period;
  const validPeriods: Period[] = ["day", "week", "month"];
  const finalPeriod: Period = validPeriods.includes(p) ? p : "day";

  // 범위 설정
  const now = new Date();
  let bucketCount: number;
  let bucketStart: (d: Date) => Date;
  let bucketLabel: (d: Date) => string;
  let advance: (d: Date) => void;
  if (finalPeriod === "day") {
    bucketCount = 14;
    bucketStart = startOfDay;
    bucketLabel = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    advance = (d) => d.setDate(d.getDate() + 1);
  } else if (finalPeriod === "week") {
    bucketCount = 12;
    bucketStart = startOfWeek;
    bucketLabel = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    advance = (d) => d.setDate(d.getDate() + 7);
  } else {
    bucketCount = 12;
    bucketStart = startOfMonth;
    bucketLabel = (d) => `${d.getFullYear().toString().slice(2)}/${pad(d.getMonth() + 1)}`;
    advance = (d) => d.setMonth(d.getMonth() + 1);
  }

  // 시작 시각: 현재 버킷에서 (bucketCount-1) 만큼 거꾸로
  const buckets: { start: Date; label: string }[] = [];
  const cursor = bucketStart(now);
  // 거꾸로 (bucketCount-1) 칸 이동
  for (let i = 0; i < bucketCount - 1; i++) {
    if (finalPeriod === "day") cursor.setDate(cursor.getDate() - 1);
    else if (finalPeriod === "week") cursor.setDate(cursor.getDate() - 7);
    else cursor.setMonth(cursor.getMonth() - 1);
  }
  // 정방향으로 bucketCount 만큼
  for (let i = 0; i < bucketCount; i++) {
    buckets.push({ start: new Date(cursor), label: bucketLabel(cursor) });
    advance(cursor);
  }

  const from = buckets[0]!.start;
  // 결제 완료 이상만 매출/주문으로 집계 (PENDING 제외)
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSING", "COMPLETED", "REFUNDED"] },
      paidAt: { gte: from },
    },
    select: { totalAmount: true, paidAt: true, status: true },
  });

  const orderCounts = new Array(bucketCount).fill(0) as number[];
  const revenues = new Array(bucketCount).fill(0) as number[];

  for (const o of orders) {
    if (!o.paidAt) continue;
    // 어느 버킷에 속하는지
    for (let i = bucketCount - 1; i >= 0; i--) {
      if (o.paidAt >= buckets[i]!.start) {
        orderCounts[i]!++;
        // 환불은 매출에서 제외
        if (o.status !== "REFUNDED") revenues[i]! += o.totalAmount;
        break;
      }
    }
  }

  return {
    period: finalPeriod,
    labels: buckets.map((b) => b.label),
    orderCounts,
    revenues,
  };
});
