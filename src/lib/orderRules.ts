export interface OrderItem {
  dish_id: string;
  name: string;
  restaurant?: string;
  price: number;
  qty: number;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  session_id: string;
  customer_name?: string;
  address: string;
  items: OrderItem[];
  item_total: number;
  platform_fee: number;
  delivery_fee: number;
  total: number;
  delivery_partner_id?: string;
  delivery_partner_name?: string;
  created_at: string;
  status: OrderStatus;
  reward_amount: number;
  reward_credited: boolean;
  cancelled_at?: string;
  cancel_reason?: string;
}

export const CANCELLATION_REASONS = [
  "Ordered by mistake",
  "Change of delivery address",
  "Delivery time is longer than expected",
  "Change of mind / No longer hungry",
  "Placed duplicate order",
  "Other reason",
] as const;

export function isOrderCancellable(status: OrderStatus): boolean {
  return status !== "delivered" && status !== "cancelled";
}

export function validateOrderCancellation(order: { status: OrderStatus }): {
  allowed: boolean;
  errorMessage?: string;
} {
  if (order.status === "delivered") {
    return {
      allowed: false,
      errorMessage: "Delivered orders cannot be cancelled.",
    };
  }
  if (order.status === "cancelled") {
    return {
      allowed: false,
      errorMessage: "This order is already cancelled.",
    };
  }
  return { allowed: true };
}

export function cancelOrderState(
  order: Order,
  reason: string = "Cancelled by user"
): Order {
  const check = validateOrderCancellation(order);
  if (!check.allowed) {
    throw new Error(check.errorMessage);
  }

  return {
    ...order,
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancel_reason: reason,
    reward_credited: false,
  };
}

export function calculateOrderTotals(items: Array<{ price: number; qty: number }>) {
  const item_total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const platform_fee = items.length > 0 ? 3 : 0;
  const delivery_fee = 0;
  const total = item_total + platform_fee + delivery_fee;
  const reward_amount = 20;

  return {
    item_total,
    platform_fee,
    delivery_fee,
    total,
    reward_amount,
  };
}

export const STAGES = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Cooking" },
  { key: "out_for_delivery", label: "On the way" },
  { key: "delivered", label: "Delivered" },
] as const;

export function stageIndex(status: OrderStatus): number {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}
