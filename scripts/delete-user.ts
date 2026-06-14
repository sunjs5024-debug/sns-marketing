// 회원 강제 삭제 스크립트 (테스트 / 재가입 시나리오용)
//
// ⚠️ HARD DELETE — 전자상거래법 5년 보관 의무는 본 사용자가 결제·주문 기록이 없는 테스트 계정인 경우에만 적용
//    결제·주문 이력이 있는 계정은 /api/me/withdraw (soft delete + PII 익명화) 를 사용하세요
//
// 사용법:
//   npx tsx scripts/delete-user.ts <email>
//
// 예시:
//   npx tsx scripts/delete-user.ts tkswpsd1sskr@naver.com

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const email = process.argv[2];
if (!email) {
  console.error("❌ 이메일을 인자로 넘기세요: npx tsx scripts/delete-user.ts <email>");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const user = await prisma.user.findUnique({
  where: { email },
  include: {
    _count: { select: { orders: true, charges: true, cartItems: true, reviews: true, taxInvoiceRequests: true } },
  },
});

if (!user) {
  console.error(`❌ ${email} 사용자를 찾을 수 없습니다.`);
  await prisma.$disconnect();
  process.exit(1);
}

console.log(`\n🔎 대상 사용자:`);
console.log(`   id:    ${user.id}`);
console.log(`   email: ${user.email}`);
console.log(`   name:  ${user.name}`);
console.log(`   role:  ${user.role}`);
console.log(`   points:${user.points}`);
console.log(`   isDeleted: ${user.isDeleted}`);
console.log(`\n📦 연관 데이터:`);
console.log(`   orders:        ${user._count.orders}`);
console.log(`   charges:       ${user._count.charges}`);
console.log(`   cartItems:     ${user._count.cartItems}`);
console.log(`   reviews:       ${user._count.reviews}`);
console.log(`   taxInvoices:   ${user._count.taxInvoiceRequests}`);

if (user.role === "ADMIN") {
  console.error("\n❌ 관리자 계정은 안전상 삭제 거부합니다. DB 직접 작업 필요.");
  await prisma.$disconnect();
  process.exit(1);
}

console.log(`\n⚠️ 3초 후 HARD DELETE 진행합니다... (Ctrl+C 로 취소)`);
await new Promise((r) => setTimeout(r, 3000));

await prisma.$transaction(async (tx) => {
  // Order → OrderItem 는 onDelete:Cascade 라 Order 만 지우면 됨
  const orderIds = (await tx.order.findMany({ where: { userId: user.id }, select: { id: true } })).map((o) => o.id);

  // TaxInvoiceRequest 는 Order 와 unique 1:1 — 먼저 정리
  if (orderIds.length) {
    await tx.taxInvoiceRequest.deleteMany({ where: { orderId: { in: orderIds } } });
  }
  await tx.taxInvoiceRequest.deleteMany({ where: { userId: user.id } });

  // Charges
  await tx.charge.deleteMany({ where: { userId: user.id } });

  // CartItems — cascade 이지만 명시적 삭제
  await tx.cartItem.deleteMany({ where: { userId: user.id } });

  // Reviews
  await tx.review.deleteMany({ where: { userId: user.id } });

  // Orders (OrderItem 은 cascade)
  await tx.order.deleteMany({ where: { userId: user.id } });

  // User
  await tx.user.delete({ where: { id: user.id } });
});

console.log(`\n✅ ${email} 계정이 완전히 삭제되었습니다.`);
console.log(`   이제 같은 이메일로 신규 가입 가능 — 가입 흐름 캡쳐 진행하세요.`);
await prisma.$disconnect();
