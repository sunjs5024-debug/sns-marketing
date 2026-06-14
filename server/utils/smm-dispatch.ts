// 외부 SMM 패널 자동 발주 + 상태 동기화 헬퍼
//   - 현재는 urpanel 지원, 추후 다른 패널 추가 가능 (externalProvider 분기)
//   - 발주: 결제 매칭 직후 호출 (재시도 3회)
//   - 동기화: 5분 주기 cron (외부 trigger)
import { prisma } from "./prisma";
import {
  addUrpanelOrder,
  getUrpanelOrdersStatus,
  type UrpanelOrderStatus,
} from "./urpanel";

const MAX_DISPATCH_ATTEMPTS = 3;
const SYNC_BATCH_SIZE = 100; // urpanel 다중 status 최대 100개

/**
 * 주어진 Order의 모든 OrderItem을 urpanel로 자동 발주.
 * - 이미 발주된 항목 (externalOrderId 있음) 또는
 * - 옵션이 매핑 안 됨 (externalServiceId 없음) 또는
 * - 시도 횟수 초과 → 건너뜀
 *
 * 멱등성 보장: 같은 OrderItem 중복 호출해도 1회만 발주됨.
 */
export async function dispatchOrderToProviders(orderId: string): Promise<{
  dispatched: number;
  skipped: number;
  failed: number;
  errors: string[];
}> {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { option: true },
  });

  let dispatched = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of items) {
    // 이미 발주됨
    if (item.externalOrderId) {
      skipped++;
      continue;
    }
    // 시도 횟수 초과
    if (item.dispatchedAttempts >= MAX_DISPATCH_ATTEMPTS) {
      skipped++;
      continue;
    }
    // 옵션에 외부 서비스 매핑 안 됨
    const serviceId = item.option?.externalServiceId;
    if (!serviceId) {
      // 매핑 안 된 항목은 그냥 패스 (수동 처리 대상)
      skipped++;
      continue;
    }
    // targetUrl 필수
    if (!item.targetUrl?.trim()) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          dispatchedAttempts: { increment: 1 },
          dispatchError: "targetUrl 비어있음 — 사용자가 작업 대상 URL 입력 안 함",
        },
      });
      failed++;
      errors.push(`item:${item.id} targetUrl missing`);
      continue;
    }

    // urpanel 발주 시도
    try {
      const res = await addUrpanelOrder({
        service: serviceId,
        link: item.targetUrl,
        quantity: item.quantity,
      });

      if (typeof res.order === "number" || typeof res.order === "string") {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            externalProvider: "urpanel",
            externalServiceId: serviceId,
            externalOrderId: String(res.order),
            externalStatus: "Pending",
            dispatchedAt: new Date(),
            dispatchedAttempts: { increment: 1 },
            dispatchError: null,
          },
        });
        dispatched++;
      } else {
        // 응답에 order 필드 없음 (이상한 케이스)
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            dispatchedAttempts: { increment: 1 },
            dispatchError: `urpanel 응답에 order 필드 없음: ${JSON.stringify(res).slice(0, 200)}`,
          },
        });
        failed++;
        errors.push(`item:${item.id} no order field`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          dispatchedAttempts: { increment: 1 },
          dispatchError: msg.slice(0, 500),
        },
      });
      failed++;
      errors.push(`item:${item.id} ${msg}`);
    }
  }

  return { dispatched, skipped, failed, errors };
}

/**
 * 진행 중인 모든 urpanel 주문의 상태를 일괄 동기화.
 * - cron(5분)으로 호출
 * - Completed / Cancelled 항목은 다시 조회 안 함
 */
export async function syncUrpanelStatuses(): Promise<{
  checked: number;
  updated: number;
  completed: number;
}> {
  // 동기화 대상: externalOrderId 있고, 상태가 종료 상태 아닌 것
  const pendingItems = await prisma.orderItem.findMany({
    where: {
      externalProvider: "urpanel",
      externalOrderId: { not: null },
      externalStatus: { notIn: ["Completed", "Cancelled"] },
    },
    select: { id: true, externalOrderId: true, orderId: true },
  });

  if (pendingItems.length === 0) {
    return { checked: 0, updated: 0, completed: 0 };
  }

  let updated = 0;
  let completed = 0;

  // 100개씩 배치 처리
  for (let i = 0; i < pendingItems.length; i += SYNC_BATCH_SIZE) {
    const batch = pendingItems.slice(i, i + SYNC_BATCH_SIZE);
    const ids = batch.map((it) => it.externalOrderId!).filter(Boolean);

    let statusMap: Record<string, UrpanelOrderStatus>;
    try {
      statusMap = await getUrpanelOrdersStatus(ids);
    } catch (e) {
      console.error("[sync] urpanel 호출 실패", e);
      continue;
    }

    for (const item of batch) {
      const st = statusMap[item.externalOrderId!];
      if (!st) continue;
      const newStatus = st.status ?? null;
      const remains = st.remains !== undefined ? Number(st.remains) : null;
      const startCount = st.start_count !== undefined ? Number(st.start_count) : null;
      const charge = st.charge !== undefined ? Number(st.charge) : null;

      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          externalStatus: newStatus,
          remainsCount: remains,
          startCount,
          externalCharge: charge,
          lastSyncedAt: new Date(),
        },
      });
      updated++;
      if (newStatus === "Completed") completed++;
    }
  }

  // 모든 OrderItem이 Completed인 Order는 자동으로 COMPLETED 처리
  await markCompletedOrders();

  return { checked: pendingItems.length, updated, completed };
}

/**
 * 모든 OrderItem이 Completed(또는 외부 매핑 없음)인 Order를 COMPLETED 로 변경
 */
async function markCompletedOrders() {
  const paidOrders = await prisma.order.findMany({
    where: { status: "PAID" },
    include: { items: true },
  });
  for (const o of paidOrders) {
    const allDone = o.items.every((it) =>
      // 외부 발주 없음 (수동) 또는 Completed
      !it.externalOrderId || it.externalStatus === "Completed",
    );
    // 외부 발주가 한 건이라도 있어야 자동 완료 처리
    const hasAnyDispatched = o.items.some((it) => !!it.externalOrderId);
    if (allDone && hasAnyDispatched) {
      await prisma.order.update({
        where: { id: o.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }
  }
}
