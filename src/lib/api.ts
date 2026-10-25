import axios, { AxiosResponse } from "axios";
import dishesData from "@/src/data/dishes.json";
import restaurantsData from "@/src/data/restaurants.json";
import plansData from "@/src/data/plans.json";
import type { Order, OrderStatus } from "./orderRules";

const rawBaseURL = import.meta.env.VITE_BACKEND_URL;
const baseURL = rawBaseURL
  ? `${rawBaseURL.replace(/\/+$/, "")}/api`
  : "/api";

export const api = axios.create({ baseURL, timeout: 15000 });

// Helper to progress orders by time
function getUpdatedStatus(order: Order): OrderStatus {
  if (order.status === "cancelled" || order.status === "delivered") {
    return order.status;
  }
  const ageMs = Date.now() - new Date(order.created_at).getTime();
  if (ageMs > 180000) return "delivered";
  if (ageMs > 90000) return "out_for_delivery";
  if (ageMs > 40000) return "preparing";
  if (ageMs > 15000) return "confirmed";
  return "placed";
}

const LOCAL_ORDERS_KEY = "foodrush_local_orders";
const LOCAL_RECHARGES_KEY = "foodrush_local_recharges";

function getLocalOrders(): Order[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_ORDERS_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (e) {
    console.error("Failed to save local orders", e);
  }
}

function getLocalRecharges(): any[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_RECHARGES_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRecharges(recharges: any[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_RECHARGES_KEY, JSON.stringify(recharges));
    }
  } catch (e) {
    console.error("Failed to save local recharges", e);
  }
}

const PARTNERS = {
  "nawabi@foodrush.in": {
    id: "72e24153-72d9-4cbb-9ba9-8009a8f44b7a",
    type: "restaurant",
    name: "Nawabi Handi & Biryani",
    email: "nawabi@foodrush.in",
    restaurant_name: "Nawabi Handi & Biryani",
    phone: "+91 90000 10001",
    password: "restaurant123",
  },
  "rider1@foodrush.in": {
    id: "fd920fec-4f5e-493a-8f9d-06b5fc995e40",
    type: "delivery_partner",
    name: "Arjun Kumar",
    email: "rider1@foodrush.in",
    restaurant_name: "",
    phone: "+91 90000 20001",
    password: "partner123",
  },
};

export async function handleLocalFallback(config: any): Promise<AxiosResponse> {
  const rawUrl = (config.url || "")
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/?api\/?/, "/")
    .split("?")[0];
  const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  const method = (config.method || "get").toLowerCase();

  let body = config.data;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // keep original
    }
  }

  // 1. GET /dishes
  if (method === "get" && (cleanPath === "/dishes" || cleanPath === "/dishes.json")) {
    const category = config.params?.category;
    if (!category || category === "All Cravings") {
      return makeResponse(dishesData, 200, config);
    }
    const filtered = (dishesData as any[]).filter((d) => d.category === category);
    return makeResponse(filtered, 200, config);
  }

  // 2. GET /restaurants
  if (method === "get" && (cleanPath === "/restaurants" || cleanPath === "/restaurants.json")) {
    return makeResponse(restaurantsData, 200, config);
  }

  // 3. GET /plans
  if (method === "get" && (cleanPath === "/plans" || cleanPath === "/plans.json")) {
    return makeResponse(plansData, 200, config);
  }

  // 4. GET /wallet
  if (method === "get" && cleanPath === "/wallet") {
    const sessionId = (config.params?.session_id as string) || "";
    const allOrders = getLocalOrders();
    const sessionOrders = allOrders.filter((o) => o.session_id === sessionId);

    let deliveredCount = 0;
    let modified = false;
    for (const o of sessionOrders) {
      const prev = o.status;
      o.status = getUpdatedStatus(o);
      if (o.status !== prev) modified = true;
      if (o.status === "delivered") {
        o.reward_credited = true;
        deliveredCount++;
      }
    }
    if (modified) {
      saveLocalOrders(allOrders);
    }

    const allRecharges = getLocalRecharges();
    const sessionRecharges = allRecharges.filter((r) => r.session_id === sessionId);
    const spentOnRecharge = sessionRecharges.reduce(
      (sum, r) => sum + Number(r.price || 0),
      0
    );

    const balance = Math.max(0, 40 + deliveredCount * 20 - spentOnRecharge);
    return makeResponse({ balance, delivered_orders: deliveredCount }, 200, config);
  }

  // 5. GET /orders
  if (method === "get" && cleanPath === "/orders") {
    const sessionId = (config.params?.session_id as string) || "";
    const allOrders = getLocalOrders();
    const sessionOrders = allOrders
      .filter((o) => o.session_id === sessionId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    let modified = false;
    for (const o of sessionOrders) {
      const prev = o.status;
      o.status = getUpdatedStatus(o);
      if (o.status !== prev) modified = true;
      if (o.status === "delivered") {
        o.reward_credited = true;
      }
    }
    if (modified) {
      saveLocalOrders(allOrders);
    }

    return makeResponse(sessionOrders, 200, config);
  }

  // 6. POST /orders
  if (method === "post" && cleanPath === "/orders") {
    const { session_id, address, customer_name, items } = body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return makeError(400, "Order must contain at least one item.", config);
    }

    const itemTotal = items.reduce(
      (sum: number, i: any) => sum + Number(i.price) * Number(i.qty),
      0
    );
    const platformFee = 3;
    const deliveryFee = 0;
    const total = itemTotal + platformFee + deliveryFee;

    const riders = [
      { id: "rider_1", name: "Imran Khan" },
      { id: "rider_2", name: "Arjun Kumar" },
      { id: "rider_3", name: "Vikram Sen" },
    ];
    const assignedRider = riders[Math.floor(Math.random() * riders.length)];

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const newOrder: Order = {
      id,
      session_id: session_id || "default_session",
      customer_name: customer_name || "FoodRush Customer",
      address: address || "Koramangala 4th Block, Bengaluru",
      items: items.map((i: any) => ({
        dish_id: i.dish_id,
        name: i.name,
        restaurant: i.restaurant || "FoodRush Partner Kitchen",
        price: Number(i.price),
        qty: Number(i.qty),
      })),
      item_total: itemTotal,
      platform_fee: platformFee,
      delivery_fee: deliveryFee,
      total,
      delivery_partner_id: assignedRider.id,
      delivery_partner_name: assignedRider.name,
      created_at: new Date().toISOString(),
      reward_credited: false,
      status: "placed",
      reward_amount: 20,
    };

    const allOrders = getLocalOrders();
    allOrders.unshift(newOrder);
    saveLocalOrders(allOrders);

    return makeResponse(newOrder, 201, config);
  }

  // 7. POST /orders/:id/cancel
  const cancelMatch = cleanPath.match(/^\/orders\/([^/]+)\/cancel$/);
  if (method === "post" && cancelMatch) {
    const orderId = cancelMatch[1];
    const reason = body?.reason;
    const allOrders = getLocalOrders();
    const order = allOrders.find((o) => o.id === orderId);
    if (!order) {
      return makeError(404, "Order not found.", config);
    }

    order.status = getUpdatedStatus(order);
    if (order.status === "delivered") {
      return makeError(400, "Delivered orders cannot be cancelled.", config);
    }
    if (order.status === "cancelled") {
      return makeResponse({ message: "Order is already cancelled.", order }, 200, config);
    }

    order.status = "cancelled";
    order.cancelled_at = new Date().toISOString();
    order.cancel_reason = reason || "Cancelled by customer";
    order.reward_credited = false;

    saveLocalOrders(allOrders);
    return makeResponse({ message: "Order cancelled successfully.", order }, 200, config);
  }

  // 8. DELETE /orders/:id
  const deleteMatch = cleanPath.match(/^\/orders\/([^/]+)$/);
  if (method === "delete" && deleteMatch) {
    const orderId = deleteMatch[1];
    const allOrders = getLocalOrders();
    const order = allOrders.find((o) => o.id === orderId);
    if (!order) {
      return makeError(404, "Order not found.", config);
    }
    order.status = "cancelled";
    order.cancelled_at = new Date().toISOString();
    order.cancel_reason = body?.reason || "Cancelled by customer";
    saveLocalOrders(allOrders);
    return makeResponse({ message: "Order cancelled successfully.", order }, 200, config);
  }

  // 9. POST /recharge
  if (method === "post" && cleanPath === "/recharge") {
    const { session_id, operator, mobile_number, plan_id } = body || {};
    const price = Number(plan_id);

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const recharge = {
      id,
      session_id: session_id || "default_session",
      operator,
      mobile_number,
      plan_id: String(plan_id),
      price,
      created_at: new Date().toISOString(),
    };

    const recharges = getLocalRecharges();
    recharges.unshift(recharge);
    saveLocalRecharges(recharges);

    return makeResponse({ success: true, recharge }, 200, config);
  }

  // 10. GET /recharges
  if (method === "get" && cleanPath === "/recharges") {
    const sessionId = config.params?.session_id as string;
    const recharges = getLocalRecharges().filter((r) => r.session_id === sessionId);
    return makeResponse(recharges, 200, config);
  }

  // 11. POST /partners/login
  if (method === "post" && cleanPath === "/partners/login") {
    const { email, password } = body || {};
    const partner = PARTNERS[email as keyof typeof PARTNERS];
    if (!partner || partner.password !== password) {
      return makeError(401, "Invalid email or password", config);
    }
    const token = btoa(
      JSON.stringify({
        sub: partner.id,
        email: partner.email,
        type: partner.type,
        exp: Date.now() + 86400000,
      })
    );
    const { password: _, ...partnerSafe } = partner;
    return makeResponse({ token, partner: partnerSafe }, 200, config);
  }

  // 12. GET /partners/vault
  if (method === "get" && cleanPath === "/partners/vault") {
    const auth = config.headers?.Authorization || config.headers?.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return makeError(401, "Missing or invalid authorization token", config);
    }
    try {
      const raw = atob(auth.slice(7));
      const payload = JSON.parse(raw);
      const partner = Object.values(PARTNERS).find((p) => p.id === payload.sub);
      if (!partner) {
        return makeError(401, "Partner not found", config);
      }

      const isRestaurant = partner.type === "restaurant";
      const allOrders = getLocalOrders();
      const relevantOrders = allOrders.filter((o) => {
        if (isRestaurant) {
          return o.items.some(
            (i) => i.restaurant?.includes("Nawabi") || i.restaurant === partner.name
          );
        } else {
          return o.delivery_partner_name === partner.name;
        }
      });

      const nonCancelled = relevantOrders.filter((o) => o.status !== "cancelled");
      const inProgress = nonCancelled.filter((o) => o.status !== "delivered");
      const totalEarnings = nonCancelled.reduce((sum, o) => {
        return sum + (isRestaurant ? o.item_total : 35);
      }, 0);

      const vaultOrders = relevantOrders.map((o) => ({
        order_id: o.id,
        short_id: o.id.slice(0, 8),
        summary: o.items.map((i) => `${i.name} ×${i.qty}`).join(", "),
        order_total: o.total,
        your_earning: isRestaurant ? o.item_total : 35,
        status: o.status,
        delivery_partner_name: o.delivery_partner_name || "Assigned Rider",
        settled: false,
        settlement_at: new Date(Date.now() + 24 * 3600000).toISOString(),
        hours_left: 24,
        upside: 0,
      }));

      const vaultData = {
        partner: {
          id: partner.id,
          type: partner.type,
          name: partner.name,
          email: partner.email,
          restaurant_name: partner.restaurant_name,
          phone: partner.phone,
        },
        summary: {
          total_earnings: totalEarnings,
          settled: 0,
          pending_within_24h: totalEarnings,
          in_progress_orders: inProgress.length,
          in_progress_upside: isRestaurant ? 0 : inProgress.length * 35,
          next_settlement_at: new Date(Date.now() + 24 * 3600000).toISOString(),
          payout_hours: 24,
          earning_label: isRestaurant ? "Your item sales" : "Deliveries completed",
        },
        orders: vaultOrders,
      };

      return makeResponse(vaultData, 200, config);
    } catch {
      return makeError(401, "Invalid token", config);
    }
  }

  return makeError(404, `Not found: ${cleanPath}`, config);
}

function makeResponse(data: any, status: number, config: any): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: {},
    config,
  };
}

function makeError(status: number, detail: string, config: any): Promise<never> {
  const err: any = new Error(detail);
  err.response = {
    status,
    data: { detail },
    headers: {},
    config,
  };
  return Promise.reject(err);
}

// Axios interceptor for Netlify static deployments:
// If backend returns HTML (Netlify SPA 200 fallback) or fails (404, connection refused, network error),
// seamlessly fall back to local store with authentic data.
api.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === "string" &&
      (response.data.trim().startsWith("<!doctype") ||
        response.data.trim().startsWith("<html"))
    ) {
      return handleLocalFallback(response.config);
    }
    return response;
  },
  async (error) => {
    if (error.config) {
      try {
        return await handleLocalFallback(error.config);
      } catch (fallbackError: any) {
        if (fallbackError?.response) {
          return Promise.reject(fallbackError);
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
