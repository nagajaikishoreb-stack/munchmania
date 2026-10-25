import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PackageCheck,
  Bike,
  ChefHat,
  Check,
  PackageOpen,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/context/CartContext";
import { scrollToId } from "@/src/lib/scroll";
import { CANCELLATION_REASONS } from "@/src/lib/orderRules";

const STAGES = [
  { key: "placed", label: "Placed", icon: PackageCheck },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Cooking", icon: ChefHat },
  { key: "out_for_delivery", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: PackageOpen },
];

const stageIndex = (status: string) =>
  Math.max(0, STAGES.findIndex((s) => s.key === status));

const reveal: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

interface CancelModalProps {
  order: any;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading: boolean;
}

const CancelOrderModal = ({
  order,
  onClose,
  onConfirm,
  loading,
}: CancelModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>(
    CANCELLATION_REASONS[0]
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm"
      data-testid="cancel-order-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-md rounded-3xl bg-card border border-line p-6 sm:p-7 shadow-2xl"
      >
        <button
          onClick={onClose}
          disabled={loading}
          data-testid="dismiss-cancel-modal-button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full inline-flex items-center justify-center text-chalk hover:bg-secondary/70 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-chilli/10 border border-chilli/20 inline-flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-chilli" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-ink">
              Cancel Order #{order.id.slice(0, 8)}?
            </h3>
            <p className="text-xs text-chalk mt-0.5">
              ₹{order.total} · {order.items[0]?.name}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-chalk leading-relaxed">
          Please select a reason for cancellation. We'll immediately halt preparation and notify the kitchen.
        </p>

        <div className="mt-4 space-y-2">
          {CANCELLATION_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                selectedReason === reason
                  ? "bg-secondary/60 border-obsidian text-ink"
                  : "border-line bg-bone/60 text-chalk hover:border-ink/20"
              }`}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="w-4 h-4 accent-chilli"
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-5 rounded-full border border-line bg-white text-xs font-bold text-ink hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            Keep Order
          </button>
          <button
            type="button"
            data-testid={`confirm-cancel-button-${order.id}`}
            onClick={() => onConfirm(selectedReason)}
            disabled={loading}
            className="h-10 px-5 rounded-full bg-chilli text-white text-xs font-bold hover:bg-chilli-deep transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? "Cancelling…" : "Yes, Cancel Order"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const OrderCard = ({
  order,
  onCancelRequest,
}: {
  order: any;
  onCancelRequest: (order: any) => void;
}) => {
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const active = !isDelivered && !isCancelled;
  const current = stageIndex(order.status);
  const itemCount = order.items.reduce((s: number, i: any) => s + i.qty, 0);

  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      data-testid={`order-card-${order.id}`}
      className={`rounded-3xl bg-card border p-5 sm:p-6 transition-all ${
        isCancelled
          ? "border-chilli/30 bg-card/80 opacity-95"
          : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono-accent text-[10px] text-chalk font-semibold">
              Order #{order.id.slice(0, 8)}
            </p>
            {isCancelled && (
              <span
                data-testid={`order-status-badge-${order.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-chilli/15 text-chilli border border-chilli/30"
              >
                <XCircle className="w-3 h-3" /> Cancelled
              </span>
            )}
          </div>
          <p className="mt-1 font-display font-bold text-ink text-base sm:text-lg">
            {order.items[0]?.name}
            {itemCount > 1 && (
              <span className="text-chalk font-semibold"> +{itemCount - 1} more</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-extrabold text-ink">₹{order.total}</p>
          <p
            className={`text-xs font-bold mt-0.5 ${
              isCancelled
                ? "text-chilli"
                : active
                ? "text-chilli"
                : "text-emeraldveg"
            }`}
          >
            {isCancelled
              ? "Order Cancelled"
              : active
              ? "In progress"
              : `Delivered · +₹${order.reward_amount} earned`}
          </p>
        </div>
      </div>

      {isCancelled ? (
        <div
          data-testid={`order-cancelled-notice-${order.id}`}
          className="mt-5 rounded-2xl bg-chilli/5 border border-chilli/20 p-4 flex items-start gap-3"
        >
          <XCircle className="w-5 h-5 text-chilli shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-ink">This order has been cancelled.</p>
            <p className="text-chalk mt-0.5">
              Reason: <span className="font-medium text-ink">{order.cancel_reason || "Cancelled by customer"}</span>.
              No amount will be deducted and delivery has been stopped.
            </p>
          </div>
        </div>
      ) : (
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
                <div
                  key={s.key}
                  className="relative z-10 flex flex-col items-center gap-1.5"
                  data-testid={`order-stage-${s.key}`}
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done
                        ? "bg-chilli border-chilli text-white"
                        : "bg-white border-line text-chalk"
                    } ${i === current && active ? "animate-pulse-ring" : ""}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold ${
                      done ? "text-ink" : "text-chalk"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-chalk">
        <p>Delivered to · {order.address}</p>
        {active && (
          <button
            type="button"
            data-testid={`cancel-order-button-${order.id}`}
            onClick={() => onCancelRequest(order)}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-chilli/30 text-chilli hover:bg-chilli hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel Order
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const OrdersSection = () => {
  const { orders, cancelOrder } = useCart();
  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmCancel = async (reason: string) => {
    if (!cancellingOrder) return;
    setLoading(true);
    try {
      await cancelOrder(cancellingOrder.id, reason);
      toast.success(`Order #${cancellingOrder.id.slice(0, 8)} cancelled successfully`);
      setCancellingOrder(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="orders" className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <p className="font-mono-accent text-xs text-chilli font-semibold">Live Tracking</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
              Your Orders
            </h2>
          </div>
          <p className="text-sm text-chalk max-w-xs">
            Status updates live — placed to delivered in minutes.
          </p>
        </motion.div>

        <div className="mt-10 space-y-5" data-testid="orders-list">
          {orders.length === 0 ? (
            <div
              className="rounded-3xl border-2 border-dashed border-line bg-card/60 p-10 sm:p-14 text-center"
              data-testid="orders-empty"
            >
              <PackageOpen className="w-10 h-10 text-chalk mx-auto" />
              <p className="mt-4 font-display font-bold text-ink text-lg">No orders yet</p>
              <p className="mt-1 text-sm text-chalk">
                Add something delicious — every delivery earns you ₹20.
              </p>
              <button
                data-testid="orders-empty-cta"
                onClick={() => scrollToId("menu")}
                className="mt-6 h-11 px-6 rounded-full bg-obsidian text-bone text-sm font-bold hover:bg-ink transition-colors cursor-pointer"
              >
                Browse the Menu
              </button>
            </div>
          ) : (
            orders.map((o: any) => (
              <OrderCard
                key={o.id}
                order={o}
                onCancelRequest={(ord) => setCancellingOrder(ord)}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {cancellingOrder && (
          <CancelOrderModal
            order={cancellingOrder}
            loading={loading}
            onClose={() => setCancellingOrder(null)}
            onConfirm={handleConfirmCancel}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default OrdersSection;
