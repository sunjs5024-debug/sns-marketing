import type { Prisma } from "~~/generated/prisma/client";
import type { Badge } from "~~/generated/prisma/enums";
import { prisma } from "../../../utils/prisma";

// 정렬 키 → Prisma orderBy
const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  popular: [{ isFeatured: "desc" }, { salesCount: "desc" }],
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ basePrice: "asc" }],
  "price-desc": [{ basePrice: "desc" }],
  rating: [{ rating: "desc" }, { salesCount: "desc" }],
};

// 가격 구간 (원)
const PRICE_RANGES: Record<string, { gte?: number; lt?: number }> = {
  "under-10k": { lt: 10_000 },
  "10k-50k": { gte: 10_000, lt: 50_000 },
  "50k-100k": { gte: 50_000, lt: 100_000 },
  "over-100k": { gte: 100_000 },
};

const VALID_BADGES: Badge[] = ["HOT", "BEST", "SALE", "NEW"];

export default defineEventHandler(async (event) => {
  const platform = getRouterParam(event, "platform");
  if (!platform) throw createError({ statusCode: 400, statusMessage: "platform 필수" });

  const q = getQuery(event);
  const sortKey = typeof q.sort === "string" && SORT_MAP[q.sort] ? q.sort : "popular";
  const badgeRaw = typeof q.badge === "string" ? q.badge.toUpperCase() : null;
  const badge = badgeRaw && VALID_BADGES.includes(badgeRaw as Badge) ? (badgeRaw as Badge) : null;
  const priceKey = typeof q.price === "string" && PRICE_RANGES[q.price] ? q.price : null;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    category: { slug: { startsWith: `${platform}-` } },
    ...(badge ? { badge } : {}),
    ...(priceKey ? { basePrice: PRICE_RANGES[priceKey]! } : {}),
  };

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: SORT_MAP[sortKey],
  });
});
