import { z } from "zod";
import { prisma } from "../../../utils/prisma";
import { requireAdmin } from "../../../utils/session";

const optionSchema = z.object({
  id: z.string().optional(), // 있으면 update, 없으면 create
  label: z.string().min(1).max(100),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
  sortOrder: z.number().int().optional().default(0),
});

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  longDescription: z.string().max(5000).nullable().optional(),
  categoryId: z.string().min(1).optional(),
  basePrice: z.number().int().min(0).optional(),
  badge: z.enum(["HOT", "BEST", "SALE", "NEW"]).nullable().optional(),
  deliveryInfo: z.string().max(200).nullable().optional(),
  guaranteeInfo: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  options: z.array(optionSchema).optional(), // 옵션 전체 동기화
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "id 없음" });
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? "잘못된 요청",
    });
  }
  const { options, ...productData } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: productData });
    if (options) {
      // 기존 옵션 중 id가 들어온 것만 유지, 나머지는 삭제 (cascade로 OrderItem option은 nullable이라 안전)
      const incomingIds = options.filter((o) => o.id).map((o) => o.id!);
      await tx.productOption.deleteMany({
        where: { productId: id, id: { notIn: incomingIds.length ? incomingIds : ["__none__"] } },
      });
      for (const opt of options) {
        if (opt.id) {
          await tx.productOption.update({
            where: { id: opt.id },
            data: { label: opt.label, quantity: opt.quantity, price: opt.price, sortOrder: opt.sortOrder ?? 0 },
          });
        } else {
          await tx.productOption.create({
            data: {
              productId: id,
              label: opt.label,
              quantity: opt.quantity,
              price: opt.price,
              sortOrder: opt.sortOrder ?? 0,
            },
          });
        }
      }
    }
  });

  return prisma.product.findUnique({
    where: { id },
    include: { category: true, options: true },
  });
});
