// 전체 데이터 리셋 (관리자 계정과 상품·카테고리는 보존)
//
// 삭제 대상:
//   - 관리자(role=ADMIN) 가 아닌 모든 User
//   - 모든 Order + OrderItem (cascade)
//   - 모든 Charge
//   - 모든 BankSms (테스트 SMS 로그)
//   - 모든 CartItem
//   - 모든 Review
//   - 모든 TaxInvoiceRequest
//
// 보존:
//   - 관리자 User
//   - 모든 Category / Product / ProductOption (운영 설정)
//
// 사용법:
//   npx tsx --env-file=.env scripts/reset-all-non-admin.ts

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// 1) 현재 상태 출력
const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, email: true, name: true } });
const userCount = await prisma.user.count();
const orderCount = await prisma.order.count();
const chargeCount = await prisma.charge.count();
const smsCount = await prisma.bankSms.count();
const cartCount = await prisma.cartItem.count();
const reviewCount = await prisma.review.count();
const taxCount = await prisma.taxInvoiceRequest.count();

console.log("\n🔎 현재 DB 상태");
console.log(`   전체 사용자: ${userCount} (관리자 ${admins.length}명 보존)`);
admins.forEach((a) => console.log(`     👑 ${a.email} (${a.name})`));
console.log(`   주문: ${orderCount}`);
console.log(`   충전: ${chargeCount}`);
console.log(`   장바구니: ${cartCount}`);
console.log(`   리뷰: ${reviewCount}`);
console.log(`   세금계산서: ${taxCount}`);
console.log(`   BankSms 로그: ${smsCount}`);

if (admins.length === 0) {
  console.error("\n❌ 관리자가 한 명도 없어서 리셋 거부. (모두 지우면 복구 불가)");
  await prisma.$disconnect();
  process.exit(1);
}

console.log("\n⚠️ 3초 후 리셋 진행... (Ctrl+C 로 취소)");
await new Promise((r) => setTimeout(r, 3000));

// 2) 트랜잭션으로 정리
await prisma.$transaction(async (tx) => {
  // 의존성 역순으로:
  // TaxInvoiceRequest (Order/User 참조)
  await tx.taxInvoiceRequest.deleteMany({});
  // CartItem (User 참조, cascade)
  await tx.cartItem.deleteMany({});
  // Review (User/Product 참조)
  await tx.review.deleteMany({});
  // Charge (User 참조)
  await tx.charge.deleteMany({});
  // Order (OrderItem 은 cascade)
  await tx.order.deleteMany({});
  // BankSms (독립)
  await tx.bankSms.deleteMany({});
  // 비관리자 User 삭제
  await tx.user.deleteMany({ where: { role: { not: "ADMIN" } } });
});

// 3) 결과 출력
const after = {
  users: await prisma.user.count(),
  orders: await prisma.order.count(),
  charges: await prisma.charge.count(),
  cart: await prisma.cartItem.count(),
  reviews: await prisma.review.count(),
  tax: await prisma.taxInvoiceRequest.count(),
  sms: await prisma.bankSms.count(),
};

console.log("\n✅ 리셋 완료");
console.log(`   남은 사용자: ${after.users} (관리자만)`);
console.log(`   주문: ${after.orders}`);
console.log(`   충전: ${after.charges}`);
console.log(`   장바구니: ${after.cart}`);
console.log(`   리뷰: ${after.reviews}`);
console.log(`   세금계산서: ${after.tax}`);
console.log(`   BankSms: ${after.sms}`);

console.log("\n💡 이제 네이버로 첫 가입 시도 가능 — 동의 화면이 뜸 (계정 자체가 사라졌으므로)");
console.log("   단, 네이버 쪽 '외부 사이트 연결' 에 우리 앱 권한이 남아있으면 동의 화면 스킵될 수 있음");

await prisma.$disconnect();
