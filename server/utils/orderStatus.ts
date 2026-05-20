import type { OrderStatus } from "~~/generated/prisma/enums";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  PROCESSING: "진행 중",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
  REFUNDED: "환불됨",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-neutral-200 text-neutral-500",
  REFUNDED: "bg-rose-100 text-rose-700",
};
