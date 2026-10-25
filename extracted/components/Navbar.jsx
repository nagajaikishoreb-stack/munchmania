import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ShoppingBag, Wallet, Menu as MenuIcon, X, Vault } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { scrollToId } from "@/lib/scroll";

const LINKS = [
  { label: "Menu", id: "menu" },
  { label: "Restaurants", id: "restaurants" },
  { label: "Rewards", id: "rewards" },
  { label: "Recharge", id: "recharge" },
  { label: "Orders", id: "orders" },
];

export const Navbar = () => {
  const { count, setIsOpen, wallet } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setMobileOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-bone/85 border-b border-line/70 shadow-[0_1px_24px_rgba(18,18,18,0.06)]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px] gap-3">
          <button data-testid="header-logo" onClick={() => go("home")} className="shrink-0">
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-link-${l.id}`}
                onClick={() => go(l.id)}
                className="px-4 py-2 text-sm font-medium text-chalk hover:text-ink rounded-full hover:bg-secondary/60 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              data-testid="partner-vault-link"
              onClick={() => { setMobileOpen(false); navigate("/partners"); }}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-chalk hover:text-ink px-3 py-2 rounded-full hover:bg-secondary/60 transition-colors"
            >
              <Vault className="w-4 h-4 text-saffron" /> Partner Vault
            </button>

            <button
              data-testid="location-selector-button"
              onClick={() => go("restaurants")}
              className="hidden xl:flex items-center gap-1.5 text-sm font-medium text-ink/80 hover:text-ink px-3 py-2 rounded-full border border-line bg-white/60 transition-colors"
            >
              <MapPin className="w-4 h-4 text-chilli" />
              Koramangala 4th Block
            </button>

            <span
              data-testid="wallet-balance-badge"
              className="hidden sm:inline-flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full bg-obsidian text-bone text-sm font-semibold"
            >
              <Wallet className="w-4 h-4 text-saffron" />₹{Math.round(wallet.balance)}
            </span>

            <button
              data-testid="cart-trigger-button"
              onClick={() => setIsOpen(true)}
              className="relative inline-flex items-center gap-2 h-11 px-4 rounded-full bg-chilli text-white text-sm font-semibold hover:bg-chilli-deep transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span
                  data-testid="cart-count-badge"
                  className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-obsidian text-white text-[11px] font-bold flex items-center justify-center"
                >
                  {count}
                </span>
              )}
            </button>

            <button
              data-testid="mobile-menu-toggle-button"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-line bg-white/70"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden backdrop-blur-xl bg-bone/95 border-b border-line"
          >
            <div className="px-4 py-3 flex flex-col">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="text-left px-3 py-3.5 text-base font-semibold text-ink rounded-xl hover:bg-secondary/60 transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileOpen(false); navigate("/partners"); }}
                className="text-left px-3 py-3.5 text-base font-semibold text-ink rounded-xl hover:bg-secondary/60 transition-colors inline-flex items-center gap-2"
              >
                <Vault className="w-4 h-4 text-saffron" /> Partner Vault
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
