import test from "node:test";
import assert from "node:assert/strict";
import {
  isOrderCancellable,
  validateOrderCancellation,
  cancelOrderState,
  calculateOrderTotals,
  stageIndex,
  Order,
} from "./orderRules";

test("isOrderCancellable correctly identifies cancellable statuses", () => {
  assert.equal(isOrderCancellable("placed"), true);
  assert.equal(isOrderCancellable("confirmed"), true);
  assert.equal(isOrderCancellable("preparing"), true);
  assert.equal(isOrderCancellable("out_for_delivery"), true);
  assert.equal(isOrderCancellable("delivered"), false);
  assert.equal(isOrderCancellable("cancelled"), false);
});

test("validateOrderCancellation rejects delivered and cancelled orders", () => {
  assert.deepEqual(validateOrderCancellation({ status: "placed" }), { allowed: true });
  assert.deepEqual(validateOrderCancellation({ status: "delivered" }), {
    allowed: false,
    errorMessage: "Delivered orders cannot be cancelled.",
  });
  assert.deepEqual(validateOrderCancellation({ status: "cancelled" }), {
    allowed: false,
    errorMessage: "This order is already cancelled.",
  });
});

test("cancelOrderState updates order status, reason and timestamp", () => {
  const mockOrder: Order = {
    id: "test-order-1",
    session_id: "session-1",
    address: "Koramangala 4th Block",
    items: [{ dish_id: "dish_1", name: "Dum Biryani", price: 280, qty: 1 }],
    item_total: 280,
    platform_fee: 3,
    delivery_fee: 0,
    total: 283,
    created_at: new Date().toISOString(),
    status: "placed",
    reward_amount: 20,
    reward_credited: false,
  };

  const cancelled = cancelOrderState(mockOrder, "Ordered by mistake");
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.cancel_reason, "Ordered by mistake");
  assert.ok(cancelled.cancelled_at);
  assert.equal(cancelled.reward_credited, false);
});

test("cancelOrderState throws when order is delivered", () => {
  const deliveredOrder: Order = {
    id: "test-order-2",
    session_id: "session-1",
    address: "Koramangala 4th Block",
    items: [],
    item_total: 100,
    platform_fee: 3,
    delivery_fee: 0,
    total: 103,
    created_at: new Date().toISOString(),
    status: "delivered",
    reward_amount: 20,
    reward_credited: true,
  };

  assert.throws(
    () => cancelOrderState(deliveredOrder, "No longer needed"),
    /Delivered orders cannot be cancelled/
  );
});

test("calculateOrderTotals calculates items, fee and reward accurately", () => {
  const items = [
    { price: 250, qty: 2 },
    { price: 120, qty: 1 },
  ];
  const totals = calculateOrderTotals(items);
  assert.equal(totals.item_total, 620);
  assert.equal(totals.platform_fee, 3);
  assert.equal(totals.delivery_fee, 0);
  assert.equal(totals.total, 623);
  assert.equal(totals.reward_amount, 20);
});

test("stageIndex resolves stages correctly", () => {
  assert.equal(stageIndex("placed"), 0);
  assert.equal(stageIndex("confirmed"), 1);
  assert.equal(stageIndex("preparing"), 2);
  assert.equal(stageIndex("out_for_delivery"), 3);
  assert.equal(stageIndex("delivered"), 4);
});
