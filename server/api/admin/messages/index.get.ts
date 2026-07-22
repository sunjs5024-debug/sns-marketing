import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

// 관리자 — 쪽지 대화 목록 (고객별 최근 메시지 + 안읽음 수)
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  // 메시지가 있는 고객들
  const grouped = await prisma.message.groupBy({
    by: ["userId"],
    _max: { createdAt: true },
  });
  const userIds = grouped.map((g) => g.userId);
  if (userIds.length === 0) return [];

  const [users, latestMsgs, unreadCounts] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, points: true },
    }),
    // 각 유저의 최신 메시지 (간단히 전부 가져와 map)
    prisma.message.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, body: true, fromAdmin: true, createdAt: true },
    }),
    // 고객→관리자 안읽음 수
    prisma.message.groupBy({
      by: ["userId"],
      where: { fromAdmin: false, readAt: null },
      _count: { _all: true },
    }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const unreadMap = new Map(unreadCounts.map((c) => [c.userId, c._count._all]));
  const latestMap = new Map<string, (typeof latestMsgs)[number]>();
  for (const m of latestMsgs) if (!latestMap.has(m.userId)) latestMap.set(m.userId, m);

  const list = userIds.map((uid) => {
    const u = userMap.get(uid);
    const last = latestMap.get(uid);
    return {
      userId: uid,
      name: u?.name ?? "(알 수 없음)",
      email: u?.email ?? "",
      points: u?.points ?? 0,
      lastBody: last?.body ?? "",
      lastFromAdmin: last?.fromAdmin ?? false,
      lastAt: last?.createdAt ?? null,
      unread: unreadMap.get(uid) ?? 0,
    };
  });
  // 안읽음 우선, 그다음 최신순
  list.sort((a, b) => {
    if ((b.unread > 0 ? 1 : 0) !== (a.unread > 0 ? 1 : 0)) return (b.unread > 0 ? 1 : 0) - (a.unread > 0 ? 1 : 0);
    return new Date(b.lastAt ?? 0).getTime() - new Date(a.lastAt ?? 0).getTime();
  });
  return list;
});
