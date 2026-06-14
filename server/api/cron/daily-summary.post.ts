// 매일 자정 어드민 텔레그램에 매출 요약 발송
//   인증: X-CRON-SECRET 헤더
//   호출: GitHub Actions cron (또는 외부)
import { prisma } from "../../utils/prisma";
import { notifyDailySummary } from "../../utils/telegram";

export default defineEventHandler(async (event) => {
  const expected = process.env.CRON_SECRET;
  if (!expected) throw createError({ statusCode: 500, statusMessage: "CRON_SECRET 미설정" });
  const provided = getHeader(event, "x-cron-secret");
  if (provided !== expected) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  // 어제 0시 ~ 오늘 0시 (KST 기준)
  const now = new Date();
  const todayKstMidnight = new Date(now.toISOString().slice(0, 10) + "T00:00:00+09:00");
  const yesterdayKstMidnight = new Date(todayKstMidnight.getTime() - 24 * 60 * 60 * 1000);

  const [orderCount, revenueAgg, completedCount, newUsers] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: yesterdayKstMidnight, lt: todayKstMidnight } },
    }),
    prisma.order.aggregate({
      _sum: { finalAmount: true },
      where: {
        status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
        paidAt: { gte: yesterdayKstMidnight, lt: todayKstMidnight },
      },
    }),
    prisma.order.count({
      where: { status: "COMPLETED", completedAt: { gte: yesterdayKstMidnight, lt: todayKstMidnight } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: yesterdayKstMidnight, lt: todayKstMidnight }, isDeleted: false },
    }),
  ]);

  const date = yesterdayKstMidnight.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });

  const sent = await notifyDailySummary({
    date,
    orderCount,
    revenue: revenueAgg._sum.finalAmount ?? 0,
    completedCount,
    newUsers,
  });

  return { ok: true, sent, summary: { date, orderCount, revenue: revenueAgg._sum.finalAmount ?? 0, completedCount, newUsers } };
});
