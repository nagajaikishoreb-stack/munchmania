import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import type { Order, OrderStatus } from "./src/lib/orderRules.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Load static json data
const restaurants = JSON.parse(
  fs.readFileSync(path.join(__dirname, "src/data/restaurants.json"), "utf-8")
);
const dishes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "src/data/dishes.json"), "utf-8")
);
const plans = JSON.parse(
  fs.readFileSync(path.join(__dirname, "src/data/plans.json"), "utf-8")
);

// In-memory state
const orders: Order[] = [
  {
    id: "dc3c110d-c049-4efd-85cf-94095bb35189",
    session_id: "demo-seed-session",
    customer_name: "Ananya Sharma",
    address: "Koramangala 4th Block, 12th Main Rd",
    items: [
      {
        dish_id: "dish_1",
        name: "Special Hyderabadi Dum Biryani",
        restaurant: "Nawabi Handi & Biryani",
        price: 280.0,
        qty: 1,
      },
    ],
    item_total: 280.0,
    platform_fee: 3.0,
    delivery_fee: 0.0,
    total: 283.0,
    delivery_partner_id: "rider_1",
    delivery_partner_name: "Imran Khan",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: "delivered",
    reward_credited: true,
    reward_amount: 20,
  },
  {
    id: "073eb9c0-1127-4e71-b3d3-fb51eea2f244",
    session_id: "demo-seed-session",
    customer_name: "Rohan Mehta",
    address: "Indiranagar 100ft Road, Bengaluru",
    items: [
      {
        dish_id: "dish_1",
        name: "Special Hyderabadi Dum Biryani",
        restaurant: "Nawabi Handi & Biryani",
        price: 280.0,
        qty: 2,
      },
      {
        dish_id: "dish_7",
        name: "Murgh Malai Tikka Kebab",
        restaurant: "Nawabi Handi & Biryani",
        price: 310.0,
        qty: 1,
      },
    ],
    item_total: 870.0,
    platform_fee: 3.0,
    delivery_fee: 0.0,
    total: 873.0,
    delivery_partner_id: "rider_2",
    delivery_partner_name: "Arjun Kumar",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    status: "delivered",
    reward_credited: true,
    reward_amount: 20,
  },
];

interface RechargeRecord {
  id: string;
  session_id: string;
  operator: string;
  mobile_number: string;
  plan_id: string;
  price: number;
  data?: string;
  created_at: string;
}

const recharges: RechargeRecord[] = [];

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

// Routes
app.get("/api/restaurants", (_req, res) => {
  res.json(restaurants);
});

app.get("/api/dishes", (req, res) => {
  const category = req.query.category as string | undefined;
  if (!category || category === "All Cravings") {
    return res.json(dishes);
  }
  const filtered = dishes.filter((d: any) => d.category === category);
  res.json(filtered);
});

app.get("/api/plans", (_req, res) => {
  res.json(plans);
});

app.get("/api/wallet", (req, res) => {
  const sessionId = (req.query.session_id as string) || "";
  const sessionOrders = orders.filter((o) => o.session_id === sessionId);

  // Update statuses
  let deliveredCount = 0;
  for (const o of sessionOrders) {
    o.status = getUpdatedStatus(o);
    if (o.status === "delivered") {
      o.reward_credited = true;
      deliveredCount++;
    }
  }

  const sessionRecharges = recharges.filter((r) => r.session_id === sessionId);
  const spentOnRecharge = sessionRecharges.reduce((sum, r) => sum + r.price, 0);

  // Base bonus of ₹40 for welcoming users + ₹20 on every delivered order
  const balance = Math.max(0, 40 + deliveredCount * 20 - spentOnRecharge);

  res.json({
    balance,
    delivered_orders: deliveredCount,
  });
});

app.get("/api/orders", (req, res) => {
  const sessionId = (req.query.session_id as string) || "";
  const sessionOrders = orders
    .filter((o) => o.session_id === sessionId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  for (const o of sessionOrders) {
    o.status = getUpdatedStatus(o);
  }

  res.json(sessionOrders);
});

app.post("/api/orders", (req, res) => {
  const { session_id, address, customer_name, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ detail: "Order must contain at least one item." });
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

  const newOrder: Order = {
    id: crypto.randomUUID(),
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

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// ORDER CANCEL ENDPOINT
app.post("/api/orders/:id/cancel", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ detail: "Order not found." });
  }

  // Check current status
  order.status = getUpdatedStatus(order);
  if (order.status === "delivered") {
    return res
      .status(400)
      .json({ detail: "Delivered orders cannot be cancelled." });
  }

  if (order.status === "cancelled") {
    return res.json({
      message: "Order is already cancelled.",
      order,
    });
  }

  order.status = "cancelled";
  order.cancelled_at = new Date().toISOString();
  order.cancel_reason = reason || "Cancelled by customer";
  order.reward_credited = false;

  res.json({
    message: "Order cancelled successfully.",
    order,
  });
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ detail: "Order not found." });
  }
  order.status = "cancelled";
  order.cancelled_at = new Date().toISOString();
  order.cancel_reason = (req.body && req.body.reason) || "Cancelled by customer";
  res.json({ message: "Order cancelled successfully.", order });
});

app.post("/api/recharge", (req, res) => {
  const { session_id, operator, mobile_number, plan_id } = req.body;
  const price = Number(plan_id);

  const recharge: RechargeRecord = {
    id: crypto.randomUUID(),
    session_id: session_id || "default_session",
    operator,
    mobile_number,
    plan_id: String(plan_id),
    price,
    created_at: new Date().toISOString(),
  };

  recharges.unshift(recharge);
  res.json({ success: true, recharge });
});

app.get("/api/recharges", (req, res) => {
  const sessionId = req.query.session_id as string;
  const sessionRecharges = recharges.filter((r) => r.session_id === sessionId);
  res.json(sessionRecharges);
});

// Partner login and vault
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

app.post("/api/partners/login", (req, res) => {
  const { email, password } = req.body;
  const partner = PARTNERS[email as keyof typeof PARTNERS];
  if (!partner || partner.password !== password) {
    return res.status(401).json({ detail: "Invalid email or password" });
  }

  const token = Buffer.from(
    JSON.stringify({ sub: partner.id, email: partner.email, type: partner.type, exp: Date.now() + 86400000 })
  ).toString("base64");

  const { password: _, ...partnerSafe } = partner;
  res.json({ token, partner: partnerSafe });
});

app.get("/api/partners/vault", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid authorization token" });
  }

  try {
    const raw = Buffer.from(auth.slice(7), "base64").toString("utf-8");
    const payload = JSON.parse(raw);
    const partner = Object.values(PARTNERS).find((p) => p.id === payload.sub);
    if (!partner) {
      return res.status(401).json({ detail: "Partner not found" });
    }

    const isRestaurant = partner.type === "restaurant";

    // Find all matching orders
    const relevantOrders = orders.filter((o) => {
      if (isRestaurant) {
        return o.items.some((i) => i.restaurant?.includes("Nawabi") || i.restaurant === partner.name);
      } else {
        return o.delivery_partner_name === partner.name;
      }
    });

    const nonCancelled = relevantOrders.filter((o) => o.status !== "cancelled");
    const inProgress = nonCancelled.filter((o) => o.status !== "delivered");

    const totalEarnings = nonCancelled.reduce((sum, o) => {
      if (isRestaurant) {
        return sum + o.item_total;
      } else {
        return sum + 35;
      }
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

    res.json({
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
    });
  } catch {
    res.status(401).json({ detail: "Invalid token" });
  }
});

// Dev and Prod serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodRush server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
