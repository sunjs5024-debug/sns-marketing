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
import {
  addKakaoOrder,
  getKakaoOrderStatus,
  mapKakaoStatus,
} from "./kakao-order";

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
    // 발주 provider 결정 — urpanel(serviceId) vs kakao(command)
    const opt = item.option;
    const serviceId = opt?.externalServiceId ?? null;
    const command = opt?.externalCommand ?? null;
    const provider: "urpanel" | "kakao" | null =
      opt?.externalProvider === "kakao" || (command && !serviceId)
        ? "kakao"
        : serviceId
          ? "urpanel"
          : null;
    if (!provider) {
      // 매핑 안 된 항목은 그냥 패스 (수동 처리 대상)
      skipped++;
      continue;
    }
    // targetUrl 필수 (공통)
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

    // 외부에 보낼 수량 = 옵션의 실제 작업수량(예: 좋아요 25개) × 구매 묶음수(item.quantity)
    //   item.quantity 는 "몇 개 묶음을 샀나"라서 그대로 보내면 안 됨 (옵션 수량 곱해야 함)
    const smmQuantity = (opt?.quantity ?? 1) * item.quantity;
    try {
      if (provider === "kakao") {
        // 카카오 발주 — { command, count, target }. Idempotency-Key = OrderItem id (중복발주 방지)
        if (!command) throw new Error("kakao 옵션에 externalCommand 없음");
        const res = await addKakaoOrder({
          command,
          count: smmQuantity,
          target: item.targetUrl,
          idempotencyKey: item.id,
        });
        if (res.order_id) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              externalProvider: "kakao",
              externalServiceId: null,
              externalOrderId: res.order_id,
              externalStatus: "Pending",
              dispatchedAt: new Date(),
              dispatchedAttempts: { increment: 1 },
              dispatchError: null,
            },
          });
          dispatched++;
        } else {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              dispatchedAttempts: { increment: 1 },
              dispatchError: `kakao 응답에 order_id 없음: ${JSON.stringify(res).slice(0, 200)}`,
            },
          });
          failed++;
          errors.push(`item:${item.id} no order_id`);
        }
      } else {
        // urpanel 발주 시도
        const res = await addUrpanelOrder({
          service: serviceId!,
          link: item.targetUrl,
          quantity: smmQuantity,
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
 * 진행 중인 모든 kakao 주문의 상태를 일괄 동기화.
 * - kakao 는 다중 status 엔드포인트가 없어 주문별로 개별 조회 (GET /api/v1/orders/{id})
 * - Completed / Cancelled / Partial(종료) 항목은 다시 조회 안 함
 */
export async function syncKakaoStatuses(): Promise<{
  checked: number;
  updated: number;
  completed: number;
}> {
  const pendingItems = await prisma.orderItem.findMany({
    where: {
      externalProvider: "kakao",
      externalOrderId: { not: null },
      externalStatus: { notIn: ["Completed", "Cancelled", "Partial"] },
    },
    select: { id: true, externalOrderId: true },
  });
  if (pendingItems.length === 0) return { checked: 0, updated: 0, completed: 0 };

  let updated = 0;
  let completed = 0;

  for (const item of pendingItems) {
    try {
      const st = await getKakaoOrderStatus(item.externalOrderId!);
      const mapped = mapKakaoStatus(st);
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          externalStatus: mapped.status,
          remainsCount: mapped.remains,
          startCount: mapped.startCount,
          lastSyncedAt: new Date(),
        },
      });
      updated++;
      if (mapped.status === "Completed") completed++;
    } catch (e) {
      console.error(`[sync-kakao] ${item.externalOrderId} 조회 실패`, e);
    }
  }

  await markCompletedOrders();
  return { checked: pendingItems.length, updated, completed };
}

/**
 * 특정 주문 1건만 즉시 동기화 (고객이 주문 조회할 때 호출).
 *
 * cron(GitHub Actions)은 스케줄이 실제로는 1~3시간 간격으로 지연 실행되기 때문에
 * cron 에만 의존하면 이미 끝난 작업이 사이트에서 "진행중"으로 오래 남는다.
 * → 고객이 주문을 볼 때마다 오래된 항목만 골라 urpanel 에 물어본다.
 *
 * - maxAgeMs 이내에 이미 동기화된 항목은 건너뛴다 (조회 폭주 시 API 낭비 방지)
 * - 실패해도 절대 예외를 던지지 않는다 (주문 조회 화면이 깨지면 안 됨)
 * @returns 실제로 갱신했으면 true (호출측에서 다시 읽어야 함)
 */
export async function syncOrderStatusIfStale(orderId: string, maxAgeMs = 60_000): Promise<boolean> {
  try {
    const items = await prisma.orderItem.findMany({
      where: {
        orderId,
        externalOrderId: { not: null },
        externalStatus: { notIn: ["Completed", "Cancelled", "Partial"] },
      },
      select: { id: true, externalProvider: true, externalOrderId: true, lastSyncedAt: true },
    });
    if (items.length === 0) return false;

    const now = Date.now();
    const stale = items.filter((it) => !it.lastSyncedAt || now - it.lastSyncedAt.getTime() > maxAgeMs);
    if (stale.length === 0) return false;

    let updated = 0;

    // urpanel — 다중 status 일괄 조회
    const urpanelStale = stale.filter((it) => it.externalProvider !== "kakao");
    if (urpanelStale.length > 0) {
      const statusMap = await getUrpanelOrdersStatus(urpanelStale.map((it) => it.externalOrderId!));
      for (const item of urpanelStale) {
        const st = statusMap[item.externalOrderId!];
        if (!st) continue;
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            externalStatus: st.status ?? null,
            remainsCount: st.remains !== undefined ? Number(st.remains) : null,
            startCount: st.start_count !== undefined ? Number(st.start_count) : null,
            externalCharge: st.charge !== undefined ? Number(st.charge) : null,
            lastSyncedAt: new Date(),
          },
        });
        updated++;
      }
    }

    // kakao — 주문별 개별 조회
    const kakaoStale = stale.filter((it) => it.externalProvider === "kakao");
    for (const item of kakaoStale) {
      try {
        const st = await getKakaoOrderStatus(item.externalOrderId!);
        const mapped = mapKakaoStatus(st);
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            externalStatus: mapped.status,
            remainsCount: mapped.remains,
            startCount: mapped.startCount,
            lastSyncedAt: new Date(),
          },
        });
        updated++;
      } catch (e) {
        console.error(`[sync-on-view] kakao ${item.externalOrderId} 실패`, e);
      }
    }

    if (updated > 0) await markOrderCompletedIfDone(orderId);
    return updated > 0;
  } catch (e) {
    // 외부 패널 장애 등 — 조회는 계속 되어야 하므로 삼킨다
    console.error("[sync-on-view] 실패", e);
    return false;
  }
}

/** 주문 1건이 모두 끝났으면 COMPLETED 처리 (markCompletedOrders 의 단건 버전) */
async function markOrderCompletedIfDone(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "PAID") return;
  const allDone = order.items.every((it) => !it.externalOrderId || it.externalStatus === "Completed");
  const hasAnyDispatched = order.items.some((it) => !!it.externalOrderId);
  if (allDone && hasAnyDispatched) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }
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
