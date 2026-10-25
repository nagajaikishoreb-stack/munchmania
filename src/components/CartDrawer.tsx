import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, Trash2, ShoppingBag, Gift, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/context/CartContext";
import { scrollToId } from "@/src/lib/scroll";

export const CartDrawer = () => {
  const {
    items,
    isOpen,
    setIsOpen,
    inc,
    dec,
    removeItem,
    itemTotal,
    count,
    placeOrder,
    refreshOrders,
  } = useCart();
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddress(
          `GPS location (${latitude.toFixed(5)}, ${longitude.toFixed(5)}) — add flat / house number`
        );
        setLocating(false);
        toast.success("Current location captured — riders will navigate right here");
      },
      (err) => {
        setLocating(false);
        toast.error(
          err && err.code === 1
            ? "Location permission denied. Type your address instead."
            : "Couldn't fetch your location. Type it instead."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const total = itemTotal + (count > 0 ? 3 : 0);

  const checkout = async () => {
    if (count === 0) return;
    if (address.trim().length < 8) {
      toast.error("Enter your full delivery address");
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder({ address, customerName: name });
      setIsOpen(false);
      setAddress("");
      toast.success("Order placed! Track it live below.", {
        description: `Order #${order.id.slice(0, 8)} · You'll earn ₹20 on delivery`,
      });
      setTimeout(() => scrollToId("orders"), 400);
      await refreshOrders();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Checkout failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] bg-obsidian/50 backdrop-blur-sm"
            data-testid="cart-overlay"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed z-[70] inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[440px] max-h-[88vh] sm:max-h-none bg-bone sm:border-l border-t sm:border-t-0 border-line shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
              <div>
                <h3 className="font-display font-extrabold text-xl text-ink">Your Cart</h3>
                <p className="text-xs text-chalk mt-0.5">
                  {count} item{count !== 1 ? "s" : ""} · earning ₹20 on delivery
                </p>
              </div>
              <button
                data-testid="cart-drawer-close"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full inline-flex items-center justify-center hover:bg-secondary/70 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {items.length === 0 ? (
                <div
                  className="h-full min-h-[220px] flex flex-col items-center justify-center text-center"
                  data-testid="cart-empty"
                >
                  <span className="w-16 h-16 rounded-full bg-secondary/70 inline-flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-chalk" />
                  </span>
                  <p className="mt-4 font-display font-bold text-ink">Your cart is empty</p>
                  <p className="mt-1 text-sm text-chalk">
                    Add dishes from the menu to get started.
                  </p>
                  <button
                    data-testid="cart-empty-cta"
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => scrollToId("menu"), 250);
                    }}
                    className="mt-5 h-11 px-6 rounded-full bg-obsidian text-bone text-sm font-bold cursor-pointer"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((i: any) => (
                    <li
                      key={i.dish_id}
                      className="py-4 flex gap-3 items-start"
                      data-testid={`cart-item-${i.dish_id}`}
                    >
                      <img
                        src={i.image_url}
                        alt={i.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-ink leading-snug line-clamp-2">
                          {i.name}
                        </p>
                        <p className="mt-1 text-sm font-bold text-ink">₹{i.price}</p>
                        <div className="mt-2 inline-flex items-center gap-1 h-9 rounded-full bg-obsidian text-bone px-1.5">
                          <button
                            data-testid={`cart-item-dec-${i.dish_id}`}
                            onClick={() => dec(i.dish_id)}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-white/10 cursor-pointer"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            data-testid={`cart-item-qty-${i.dish_id}`}
                            className="w-5 text-center text-sm font-bold"
                          >
                            {i.qty}
                          </span>
                          <button
                            data-testid={`cart-item-inc-${i.dish_id}`}
                            onClick={() => inc(i.dish_id)}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-white/10 cursor-pointer"
                            aria-label="Increase"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        data-testid={`cart-item-remove-${i.dish_id}`}
                        onClick={() => removeItem(i.dish_id)}
                        className="p-2 text-chalk hover:text-chilli transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-5 sm:px-6 py-4 space-y-3 bg-card">
                <div className="grid grid-cols-1 gap-2.5">
                  <input
                    data-testid="checkout-name-input"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border border-input bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="relative">
                    <input
                      data-testid="checkout-address-input"
                      placeholder="Delivery address — flat, street, landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-white pl-4 pr-[104px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      data-testid="use-current-location-button"
                      onClick={useMyLocation}
                      disabled={locating}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 h-8 rounded-full bg-saffron-soft text-obsidian px-2.5 text-[11px] font-bold whitespace-nowrap hover:bg-saffron/50 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                      {locating ? "Locating…" : "Use GPS"}
                    </button>
                  </div>
                </div>

                <div className="text-sm space-y-1.5">
                  <div className="flex justify-between text-chalk">
                    <span>Item total</span>
                    <span>₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between text-chalk">
                    <span>Platform fee</span>
                    <span>₹3</span>
                  </div>
                  <div className="flex justify-between text-chalk">
                    <span>Delivery fee</span>
                    <span className="text-emeraldveg font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-ink pt-1.5 border-t border-line">
                    <span>To pay</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <p
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-2 text-xs font-semibold text-ink"
                  data-testid="cart-reward-banner"
                >
                  <Gift className="w-3.5 h-3.5 text-gold" /> You'll earn ₹20 reward on this delivery
                </p>

                <button
                  data-testid="checkout-button"
                  onClick={checkout}
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-chilli text-white font-bold text-sm hover:bg-chilli-deep transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Placing order…" : `Proceed to Checkout · Pay ₹${total}`}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
