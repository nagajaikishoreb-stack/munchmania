import { motion } from "framer-motion";
import { PackageCheck, Bike, ChefHat, Check, PackageOpen } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { scrollToId } from "@/lib/scroll";

const STAGES = [
  { key: "placed", label: "Placed", icon: PackageCheck },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Cooking", icon: ChefHat },
  { key: "out_for_delivery", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: PackageOpen },
];

const stageIndex = (status) => Math.max(0, STAGES.findIndex((s) => s.key === status));

const reveal = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const OrderCard = ({ order }) => {
  const current = stageIndex(order.status);
  const active = order.status !== "delivered";
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      data-testid={`order-card-${order.id}`}
      className="rounded-3xl bg-card border border-line p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono-accent text-[10px] text-chalk font-semibold">Order #{order.id.slice(0, 8)}</p>
          <p className="mt-1 font-display font-bold text-ink text-base sm:text-lg">
            {order.items[0]?.name}
            {itemCount > 1 && <span className="text-chalk font-semibold"> +{itemCount - 1} more</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-extrabold text-ink">₹{order.total}</p>
          <p className={`text-xs font-bold mt-0.5 ${active ? "text-chilli" : "text-emeraldveg"}`}>
            {active ? "In progress" : `Delivered · +₹${order.reward_amount} earned`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-line" />
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-chilli"
            initial={false}
            animate={{ width: `${(current / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const done = i <= current;
            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center gap-1.5" data-testid={`order-stage-${s.key}`}>
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done ? "bg-chilli border-chilli text-white" : "bg-white border-line text-chalk"
                  } ${i === current && active ? "animate-pulse-ring" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-[10px] sm:text-[11px] font-semibold ${done ? "text-ink" : "text-chalk"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 pt-4 border-t border-line text-xs text-chalk">
        Delivered to · {order.address}
      </p>
    </motion.div>
  );
};

export const OrdersSection = () => {
  const { orders } = useCart();

  return (
    <section id="orders" className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-mono-accent text-xs text-chilli font-semibold">Live Tracking</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">Your Orders</h2>
          </div>
          <p className="text-sm text-chalk max-w-xs">Status updates live — placed to delivered in minutes.</p>
        </motion.div>

        <div className="mt-10 space-y-5" data-testid="orders-list">
          {orders.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-line bg-card/60 p-10 sm:p-14 text-center" data-testid="orders-empty">
              <PackageOpen className="w-10 h-10 text-chalk mx-auto" />
              <p className="mt-4 font-display font-bold text-ink text-lg">No orders yet</p>
              <p className="mt-1 text-sm text-chalk">Add something delicious — every delivery earns you ₹20.</p>
              <button
                data-testid="orders-empty-cta"
                onClick={() => scrollToId("menu")}
                className="mt-6 h-11 px-6 rounded-full bg-obsidian text-bone text-sm font-bold hover:bg-ink transition-colors"
              >
                Browse the Menu
              </button>
            </div>
          ) : (
            orders.map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </div>
      </div>
    </section>
  );
};

export default OrdersSection;
