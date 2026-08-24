-- AlterTable: 품절 상태 (페이지·SEO 유지, 구매만 차단). isActive=false(완전 숨김)와 구분.
ALTER TABLE "Product" ADD COLUMN "isSoldOut" BOOLEAN NOT NULL DEFAULT false;
