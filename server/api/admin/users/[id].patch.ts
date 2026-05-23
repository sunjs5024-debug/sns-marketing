import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

const schema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  points: z.number().int().min(0).max(100_000_000).optional(),
  name: z.string().min(1).max(50).optional(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "id 없음" });
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "잘못된 요청" });

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true, points: true },
  });
  return updated;
});
