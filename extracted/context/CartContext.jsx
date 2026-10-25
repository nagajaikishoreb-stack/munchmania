import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const getSessionId = () => {
  let s = localStorage.getItem("foodrush_session");
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem("foodrush_session", s);
  }
  return s;
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [wallet, setWallet] = useState({ balance: 0, delivered_orders: 0 });
  const [orders, setOrders] = useState([]);
  const sessionId = useMemo(getSessionId, []);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await api.get("/wallet", { params: { session_id: sessionId } });
      setWallet(res.data);
    } catch (e) {
      console.error("wallet fetch failed", e);
    }
  }, [sessionId]);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders", { params: { session_id: sessionId } });
      setOrders(res.data);
    } catch (e) {
      console.error("orders fetch failed", e);
    }
  }, [sessionId]);

  useEffect(() => {
    refreshWallet();
    refreshOrders();
  }, [refreshWallet, refreshOrders]);

  const hasActiveOrder = orders.some((o) => o.status !== "delivered");

  useEffect(() => {
    const id = setInterval(refreshOrders, 4000);
    return () => clearInterval(id);
  }, [refreshOrders]);

  const addToCart = (dish) => {
    setItems((prev) => {
      const found = prev.find((i) => i.dish_id === dish.id);
      if (found) {
        return prev.map((i) => (i.dish_id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        { dish_id: dish.id, name: dish.name, price: dish.price, image_url: dish.image_url, is_veg: dish.is_veg, qty: 1 },
      ];
    });
  };

  const inc = (dishId) => setItems((prev) => prev.map((i) => (i.dish_id === dishId ? { ...i, qty: i.qty + 1 } : i)));
  const dec = (dishId) =>
    setItems((prev) =>
      prev
        .map((i) => (i.dish_id === dishId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  const removeItem = (dishId) => setItems((prev) => prev.filter((i) => i.dish_id !== dishId));
  const clearCart = () => setItems([]);

  const itemTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = async ({ address, customerName }) => {
    const res = await api.post("/orders", {
      session_id: sessionId,
      address,
      customer_name: customerName,
      items: items.map((i) => ({ dish_id: i.dish_id, name: i.name, price: i.price, qty: i.qty })),
    });
    clearCart();
    await Promise.all([refreshOrders(), refreshWallet()]);
    return res.data;
  };

  const doRecharge = async ({ operator, mobileNumber, planId }) => {
    const res = await api.post("/recharge", {
      session_id: sessionId,
      operator,
      mobile_number: mobileNumber,
      plan_id: planId,
    });
    await Promise.all([refreshWallet(), refreshOrders()]);
    return res.data;
  };

  const value = {
    items,
    isOpen,
    setIsOpen,
    sessionId,
    wallet,
    orders,
    hasActiveOrder,
    addToCart,
    inc,
    dec,
    removeItem,
    clearCart,
    itemTotal,
    count,
    placeOrder,
    doRecharge,
    refreshOrders,
    refreshWallet,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
