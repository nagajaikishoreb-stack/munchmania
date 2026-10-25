import { motion } from "framer-motion";
import { Wallet, BadgeIndianRupee, Timer, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { scrollToId } from "@/lib/scroll";

const reveal = {
  hidden: { opacity: 0, y: 36 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

const OPERATORS = ["Jio", "Airtel", "Vi", "BSNL"];

export const RewardsSection = () => {
  const { wallet } = useCart();

  return (
    <section id="rewards" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} custom={0}>
          <p className="font-mono-accent text-xs text-chilli font-semibold">The ₹20 System</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
            Real value, not fake discounts.
          </h2>
        </motion.div>

        <div className="mt-10 grid md:grid-cols-3 gap-5 sm:gap-6" data-testid="rewards-bento">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            custom={1}
            className="md:col-span-2 rounded-3xl bg-obsidian text-bone p-6 sm:p-10 relative overflow-hidden"
            data-testid="wallet-card"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-saffron/20 blur-[90px]" />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-saffron/15 border border-saffron/30 inline-flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-saffron" />
                </span>
                <p className="font-mono-accent text-xs text-saffron font-semibold">Your Reward Wallet</p>
              </div>
              <p data-testid="wallet-card-balance" className="mt-6 font-display text-6xl sm:text-7xl font-extrabold tracking-tight">
                ₹{Math.round(wallet.balance)}
              </p>
              <p className="mt-2 text-sm text-bone/60">
                earned from {wallet.delivered_orders} delivered orders · usable on food orders & mobile recharges
              </p>
              <button
                data-testid="wallet-recharge-cta"
                onClick={() => scrollToId("recharge")}
                className="mt-7 h-12 px-6 rounded-full bg-saffron text-obsidian font-bold text-sm hover:bg-[#e8944d] transition-colors"
              >
                Use Balance on Recharge
              </button>
            </div>
          </motion.div>

          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} custom={2} className="rounded-3xl bg-card border border-line p-6 sm:p-8 flex flex-col">
            <span className="w-10 h-10 rounded-xl bg-chilli/10 inline-flex items-center justify-center">
              <BadgeIndianRupee className="w-5 h-5 text-chilli" />
            </span>
            <p className="mt-5 font-display text-4xl font-extrabold text-ink">₹3</p>
            <p className="mt-2 font-semibold text-ink">Flat platform fee</p>
            <p className="mt-1.5 text-sm text-chalk leading-relaxed flex-1">
              One transparent fee. No surge, no small-cart penalty, no hidden charges — ever.
            </p>
          </motion.div>

          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} custom={3} className="rounded-3xl bg-card border border-line p-6 sm:p-8 flex flex-col">
            <span className="w-10 h-10 rounded-xl bg-emeraldveg/10 inline-flex items-center justify-center">
              <Timer className="w-5 h-5 text-emeraldveg" />
            </span>
            <p className="mt-5 font-display text-4xl font-extrabold text-ink">30<span className="text-xl text-chalk"> min</span></p>
            <p className="mt-2 font-semibold text-ink">Average delivery</p>
            <p className="mt-1.5 text-sm text-chalk leading-relaxed flex-1">
              Hot food, hyperlocal riders, tight kitchen SLAs. Late? Your ₹20 still lands.
            </p>
          </motion.div>

          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} custom={4} className="md:col-span-2 rounded-3xl bg-card border border-line p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-gold/15 inline-flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-gold" />
              </span>
              <p className="font-mono-accent text-xs text-chalk font-semibold">Recharge Utility</p>
            </div>
            <p className="mt-4 font-display text-xl sm:text-2xl font-bold text-ink leading-snug">
              Turn food rewards into talk time & data — instantly.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {OPERATORS.map((op) => (
                <span key={op} className="inline-flex items-center h-10 px-4 rounded-full border border-line bg-bone font-bold text-sm text-ink">
                  {op}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RewardsSection;
