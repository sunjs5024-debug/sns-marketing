import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

const schema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"]),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw createError({ statusCode: 400 });

  await prisma.order.update({
    where: { id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.status === "COMPLETED" && { completedAt: new Date() }),
    },
  });
  return { ok: true };
});
