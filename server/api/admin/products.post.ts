import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/session";

const optionSchema = z.object({
  label: z.string().min(1).max(100),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
  sortOrder: z.number().int().optional().default(0),
  externalProvider: z.string().max(20).nullable().optional(),
  externalServiceId: z.number().int().min(1).nullable().optional(),
});

const schema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/i, "영문/숫자/하이픈만 가능"),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  longDescription: z.string().max(5000).nullable().optional(),
  categoryId: z.string().min(1),
  basePrice: z.number().int().min(0),
  badge: z.enum(["HOT", "BEST", "SALE", "NEW"]).nullable().optional(),
  deliveryInfo: z.string().max(200).nullable().optional(),
  guaranteeInfo: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  options: z.array(optionSchema).default([]),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? "잘못된 요청",
    });
  }
  const { options, ...productData } = parsed.data;

  // slug 중복 체크
  const exists = await prisma.product.findUnique({ where: { slug: productData.slug } });
  if (exists) throw createError({ statusCode: 409, statusMessage: "이미 존재하는 slug" });

  const created = await prisma.product.create({
    data: {
      ...productData,
      options: { create: options },
    },
    include: { category: true, options: true },
  });
  return created;
});
