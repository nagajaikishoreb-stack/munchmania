import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Smartphone, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/src/lib/api";
import { useCart } from "@/src/context/CartContext";
import plansData from "@/src/data/plans.json";

const reveal: any = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const OPERATORS = ["Jio", "Airtel", "Vi", "BSNL"];

export const RechargeSection = () => {
  const { wallet, doRecharge } = useCart();
  const [plans, setPlans] = useState<any>(() => plansData);
  const [operator, setOperator] = useState("Jio");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/plans")
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setPlans(res.data);
        }
      })
      .catch(() => {});
    api
      .get("/recharges", {
        params: { session_id: localStorage.getItem("foodrush_session") },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setHistory(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const operatorPlans = useMemo(() => plans[operator] || [], [plans, operator]);

  const submit = async () => {
    if (!selectedPlan) {
      toast.error("Pick a recharge plan first");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await doRecharge({
        operator,
        mobileNumber: mobile,
        planId: String(selectedPlan.price),
      });
      toast.success(`Recharged ${operator} ${mobile} — ${selectedPlan.data}`);
      setHistory((h) => [res.recharge, ...h]);
      setSelectedPlan(null);
      setMobile("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Recharge failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="recharge" className="py-16 sm:py-24 bg-saffron-soft/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="lg:col-span-5"
          >
            <p className="font-mono-accent text-xs text-chilli font-semibold">Reward Utility</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink leading-[1.08]">
              Recharge any mobile with your food rewards.
            </h2>
            <p className="mt-5 text-base text-chalk leading-relaxed max-w-md">
              Every delivered order drops ₹20 into your wallet. Spend it on prepaid packs across Jio, Airtel, Vi and BSNL — instantly.
            </p>

            <div className="mt-8 rounded-3xl bg-card border border-line p-6" data-testid="recharge-form-card">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="font-semibold text-ink inline-flex items-center gap-2 text-sm sm:text-base">
                  <Smartphone className="w-5 h-5 text-chilli" /> Available balance
                </p>
                <p data-testid="recharge-balance" className="font-display text-2xl font-extrabold text-emeraldveg">
                  ₹{Math.round(wallet.balance)}
                </p>
              </div>

              <div className="mt-5">
                <label htmlFor="recharge-mobile" className="text-xs font-semibold text-chalk font-mono-accent">
                  Mobile number
                </label>
                <input
                  id="recharge-mobile"
                  data-testid="recharge-mobile-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit prepaid number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 w-full h-12 rounded-xl border border-input bg-white px-4 text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <button
                data-testid="mobile-recharge-submit-button"
                onClick={submit}
                disabled={submitting}
                className="mt-5 w-full h-12 rounded-full bg-obsidian text-bone font-bold text-sm hover:bg-ink transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting
                  ? "Recharging…"
                  : selectedPlan
                  ? `Recharge Now · Pay ₹${selectedPlan.price}`
                  : "Select a plan to continue"}
              </button>
              <p className="mt-3 text-[11px] text-chalk leading-relaxed">
                Rewards pay for the plan directly from your wallet. Remaining balance stays usable on food orders too.
              </p>
            </div>

            {history.length > 0 && (
              <div className="mt-5 rounded-2xl border border-line bg-card p-4" data-testid="recharge-history">
                <p className="font-mono-accent text-[10px] text-chalk font-semibold px-1">Recent recharges</p>
                <ul className="mt-2 divide-y divide-line">
                  {history.slice(0, 4).map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-3 px-1 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 text-ink font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emeraldveg" />
                        {h.operator} · {h.mobile_number}
                      </span>
                      <span className="text-chalk">₹{h.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          <div className="lg:col-span-7">
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1"
              data-testid="recharge-operator-tabs"
            >
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  data-testid={`mobile-recharge-tab-button-${op.toLowerCase()}`}
                  onClick={() => {
                    setOperator(op);
                    setSelectedPlan(null);
                  }}
                  className={`h-12 px-6 rounded-full text-sm font-bold whitespace-nowrap border-2 transition-all cursor-pointer ${
                    operator === op
                      ? "bg-obsidian text-bone border-obsidian"
                      : "bg-white/70 text-ink border-line hover:border-ink/40"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-4" data-testid="recharge-plans-grid">
              {operatorPlans.length === 0
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-card border border-line p-5 h-44 animate-pulse" />
                  ))
                : operatorPlans.map((p: any) => {
                    const active = selectedPlan?.price === p.price;
                    return (
                      <button
                        key={`${operator}-${p.price}`}
                        data-testid={`recharge-plan-${p.price}`}
                        onClick={() => setSelectedPlan(p)}
                        className={`text-left rounded-2xl p-5 border-2 transition-all duration-200 h-full flex flex-col cursor-pointer ${
                          active
                            ? "border-obsidian bg-obsidian text-bone shadow-xl"
                            : "border-line bg-card hover:border-ink/30"
                        }`}
                      >
                        <span className={`font-display text-3xl font-extrabold ${active ? "text-saffron" : "text-ink"}`}>
                          ₹{p.price}
                        </span>
                        <span className={`mt-2 text-sm font-semibold leading-snug ${active ? "text-bone/90" : "text-ink"}`}>
                          {p.data}
                        </span>
                        <span className={`mt-1 text-xs ${active ? "text-bone/60" : "text-chalk"}`}>
                          Validity · {p.validity}
                        </span>
                        <span
                          className={`mt-auto pt-4 text-[10px] font-mono-accent font-semibold inline-flex items-center gap-1 ${
                            active ? "text-saffron" : "text-emeraldveg"
                          }`}
                        >
                          <Zap className="w-3 h-3" /> Pays with rewards
                        </span>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RechargeSection;
