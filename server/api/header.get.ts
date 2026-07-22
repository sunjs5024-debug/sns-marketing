import { readToken } from "../utils/session";
import { prisma } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const token = await readToken(event);
  const userId = token?.id as string | undefined;
  const role = token?.role as string | undefined;
  if (!userId) {
    return { isAuthed: false, role: null, cartCount: 0, name: null, points: 0, unreadMessages: 0 };
  }
  const [cartCount, dbUser, unreadMessages] = await Promise.all([
    prisma.cartItem.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, points: true } }),
    prisma.message.count({ where: { userId, fromAdmin: true, readAt: null } }),
  ]);
  return {
    isAuthed: true,
    role: role ?? "USER",
    cartCount,
    name: dbUser?.name ?? null,
    points: dbUser?.points ?? 0,
    unreadMessages,
  };
});
