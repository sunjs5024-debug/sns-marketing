import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true, platform: true },
    orderBy: [{ platform: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
});
