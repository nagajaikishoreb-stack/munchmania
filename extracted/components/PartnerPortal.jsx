import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Bike, Vault, LogOut, Banknote, Clock, PackageCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";

const TOKEN_KEY = "foodrush_partner_token";
const PARTNER_KEY = "foodrush_partner";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

const DemoChip = ({ role, email, password }) => (
  <button
    type="button"
    data-testid={`demo-cred-${role}`}
    onClick={() => {
      document.getElementById("partner-email").value = email;
      document.getElementById("partner-password").value = password;
    }}
    className="text-left rounded-xl border border-line bg-bone px-3.5 py-2.5 hover:border-ink/30 transition-colors"
  >
    <p className="text-[10px] font-mono-accent text-chalk font-semibold">{role === "restaurant" ? "Restaurant demo" : "Rider demo"}</p>
    <p className="text-xs font-semibold text-ink mt-0.5">{email}</p>
  </button>
);

function LoginView({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/partners/login", { email, password });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(PARTNER_KEY, JSON.stringify(res.data.partner));
      toast.success(`Welcome back, ${res.data.partner.name}`);
      onLoggedIn(res.data.partner);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone grain flex flex-col">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6">
        <button data-testid="partner-back-home" onClick={() => (window.location.href = "/")} className="inline-flex items-center gap-2 text-sm font-semibold text-chalk hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to FoodRush
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
          <div className="rounded-3xl bg-obsidian text-bone p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-saffron/20 blur-[80px]" />
            <div className="relative">
              <span className="w-12 h-12 rounded-2xl bg-saffron/15 border border-saffron/30 inline-flex items-center justify-center">
                <Vault className="w-6 h-6 text-saffron" />
              </span>
              <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">Partner Vault</h1>
              <p className="mt-2 text-sm text-bone/60 leading-relaxed">
                Private earnings space for FoodRush restaurants & delivery partners. Access only with your credentials.
              </p>
            </div>
          </div>

          <form data-testid="partner-login-form" onSubmit={submit} className="mt-5 rounded-3xl bg-card border border-line p-6 sm:p-8">
            <div>
              <label htmlFor="partner-email" className="text-xs font-semibold text-chalk font-mono-accent">Email</label>
              <input
                id="partner-email"
                data-testid="partner-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@foodrush.in"
                className="mt-2 w-full h-12 rounded-xl border border-input bg-white px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="partner-password" className="text-xs font-semibold text-chalk font-mono-accent">Password</label>
              <input
                id="partner-password"
                data-testid="partner-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your vault password"
                className="mt-2 w-full h-12 rounded-xl border border-input bg-white px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              data-testid="partner-login-button"
              disabled={submitting}
              className="mt-6 w-full h-12 rounded-full bg-chilli text-white font-bold text-sm hover:bg-chilli-deep transition-colors disabled:opacity-50"
            >
              {submitting ? "Opening your vault…" : "Open My Vault"}
            </button>

            <div className="mt-6 pt-5 border-t border-line">
              <p className="text-[10px] font-mono-accent text-chalk font-semibold">Demo credentials — tap to fill</p>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <DemoChip role="restaurant" email="nawabi@foodrush.in" password="restaurant123" />
                <DemoChip role="rider" email="rider1@foodrush.in" password="partner123" />
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const StageChip = ({ status }) => {
  const map = {
    placed: ["Placed", "bg-secondary text-ink"],
    confirmed: ["Confirmed", "bg-secondary text-ink"],
    preparing: ["Cooking", "bg-saffron-soft text-obsidian"],
    out_for_delivery: ["On the way", "bg-gold-soft text-obsidian"],
    delivered: ["Delivered", "bg-emeraldveg/15 text-emeraldveg"],
  };
  const [label, cls] = map[status] || [status, "bg-secondary"];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{label}</span>;
};

const SettlementChip = ({ row }) =>
  row.settled ? (
    <span data-testid="settlement-settled" className="inline-flex items-center gap-1 rounded-full bg-emeraldveg/15 text-emeraldveg px-2.5 py-1 text-[11px] font-bold">
      <Banknote className="w-3 h-3" /> Settled to vault
    </span>
  ) : row.status !== "delivered" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-chalk px-2.5 py-1 text-[11px] font-bold">
      <Clock className="w-3 h-3" /> Settles within 24h of delivery
    </span>
  ) : (
    <span data-testid="settlement-pending" className="inline-flex items-center gap-1 rounded-full bg-gold-soft text-obsidian px-2.5 py-1 text-[11px] font-bold">
      <Clock className="w-3 h-3" /> Settles in {row.hours_left}h
    </span>
  );

function VaultView({ partner, onLogout }) {
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await api.get("/partners/vault", { headers: { Authorization: `Bearer ${token}` } });
      setVault(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout(true);
        return;
      }
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRestaurant = partner.type === "restaurant";
  const s = vault?.summary;

  return (
    <div className="min-h-screen bg-bone grain">
      <div className="bg-obsidian text-bone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <button data-testid="partner-back-home-vault" onClick={() => (window.location.href = "/")} className="inline-flex items-center gap-2 text-sm font-semibold text-bone/70 hover:text-bone transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to FoodRush
          </button>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono-accent text-xs text-saffron font-semibold inline-flex items-center gap-2">
                {isRestaurant ? <Store className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                {isRestaurant ? "Restaurant Partner" : "Delivery Partner"}
              </p>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">{partner.name}</h1>
              <p className="mt-1 text-sm text-bone/60">Private earnings vault · access only you</p>
            </div>
            <button
              data-testid="vault-logout-button"
              onClick={() => onLogout(false)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/20 text-sm font-semibold text-bone hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10" data-testid="vault-dashboard">
        <div className="rounded-2xl border border-saffron/40 bg-gold-soft px-4 sm:px-5 py-4 flex items-start gap-3" data-testid="vault-payout-notice">
          <Banknote className="w-5 h-5 text-obsidian shrink-0 mt-0.5" />
          <p className="text-sm text-obsidian leading-relaxed font-medium">
            Partner promise: <strong>100% of your profit is settled into your vault within 24 hours of every order</strong> — no weekly waits, no hidden cuts.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-card border border-line animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="mt-6 grid sm:grid-cols-3 gap-4" data-testid="vault-summary">
              <div className="rounded-2xl bg-obsidian text-bone p-6">
                <p className="font-mono-accent text-[10px] text-saffron font-semibold">Total earnings</p>
                <p data-testid="vault-total-earnings" className="mt-3 font-display text-4xl font-extrabold">₹{s.total_earnings}</p>
                <p className="mt-1.5 text-xs text-bone/60">{s.earning_label}</p>
              </div>
              <div className="rounded-2xl bg-card border border-line p-6">
                <p className="font-mono-accent text-[10px] text-chalk font-semibold">Settled</p>
                <p data-testid="vault-settled" className="mt-3 font-display text-4xl font-extrabold text-emeraldveg">₹{s.settled}</p>
                <p className="mt-1.5 text-xs text-chalk">Already in your bank vault</p>
              </div>
              <div className="rounded-2xl bg-card border border-line p-6">
                <p className="font-mono-accent text-[10px] text-chalk font-semibold">Pending (≤ 24h)</p>
                <p data-testid="vault-pending" className="mt-3 font-display text-4xl font-extrabold text-chilli">₹{s.pending_within_24h}</p>
                <p className="mt-1.5 text-xs text-chalk">
                  {s.next_settlement_at ? `Next payout ${new Date(s.next_settlement_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Nothing in the queue"}
                </p>
              </div>
            </div>

            {s.in_progress_orders > 0 && (
              <p className="mt-4 text-sm text-chalk" data-testid="vault-in-progress">
                {s.in_progress_orders} order{s.in_progress_orders > 1 ? "s" : ""} in progress right now
                {isRestaurant ? " — earnings appear here the moment they're delivered" : ` — ₹${s.in_progress_upside} more coming your way on delivery`}
              </p>
            )}

            <h2 className="mt-10 font-display text-xl font-extrabold text-ink">Order-wise earnings</h2>
            <div className="mt-4 space-y-3" data-testid="vault-orders">
              {vault.orders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-line bg-card/60 p-8 text-center text-sm text-chalk">
                  No orders assigned yet. Earnings show up here automatically as customers order.
                </div>
              ) : (
                vault.orders.map((row) => (
                  <div key={row.order_id} data-testid={`vault-order-${row.short_id}`} className="rounded-2xl bg-card border border-line p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono-accent text-[10px] text-chalk font-semibold">Order #{row.short_id} {!isRestaurant && row.delivery_partner_name ? `· you're the rider` : ""}</p>
                      <p className="mt-1 text-sm font-semibold text-ink leading-snug">{row.summary}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StageChip status={row.status} />
                        <SettlementChip row={row} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p data-testid={`vault-order-earning-${row.short_id}`} className="font-display text-xl font-extrabold text-ink">₹{row.your_earning}</p>
                      <p className="text-[11px] text-chalk mt-0.5">Order ₹{row.order_total}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="mt-8 text-center inline-flex items-center gap-1.5 text-xs text-chalk mx-auto w-full justify-center">
              <PackageCheck className="w-3.5 h-3.5" /> Earnings auto-appear here — no manual claims, no paperwork.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PartnerPortal() {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PARTNER_KEY)) || null;
    } catch {
      return null;
    }
  });

  const logout = (expired) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PARTNER_KEY);
    setPartner(null);
    if (expired) toast.error("Your session expired. Please log in again.");
  };

  return partner ? <VaultView partner={partner} onLogout={logout} /> : <LoginView onLoggedIn={setPartner} />;
}
