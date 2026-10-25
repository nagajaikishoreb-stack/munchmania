import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Clock, Star } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

const HERO_IMG =
  "https://images.unsplash.com/photo-1705174299330-939dd03cc864?auto=format&fit=crop&w=1200&q=85";

const lineReveal = {
  hidden: { y: "115%" },
  show: (i) => ({
    y: "0%",
    transition: { duration: 0.9, delay: 0.15 + i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.55 + d * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section id="home" ref={ref} className="relative pt-24 sm:pt-28 lg:pt-36 pb-12 sm:pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ y: glowY }}
          className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full bg-saffron/25 blur-[130px]"
        />
        <div className="absolute top-40 -left-48 w-[480px] h-[480px] rounded-full bg-chilli/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="font-mono-accent text-[11px] sm:text-xs text-chilli font-semibold"
            >
              Koramangala 4th Block · Bengaluru
            </motion.p>

            <h1 className="mt-5 font-display font-extrabold tracking-tight leading-[1.02] text-[clamp(2.6rem,8.5vw,5.4rem)]">
              <span className="block overflow-hidden pb-1">
                <motion.span custom={0} variants={lineReveal} initial="hidden" animate="show" className="block">
                  Guaranteed ₹20
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-1">
                <motion.span custom={1} variants={lineReveal} initial="hidden" animate="show" className="block text-chilli">
                  Reward on Every
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-2">
                <motion.span custom={2} variants={lineReveal} initial="hidden" animate="show" className="block">
                  Single Meal.
                </motion.span>
              </span>
            </h1>

            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={1} className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-chalk">
              Order authentic biryanis, woodfired pizzas, ghee dosas & craft burgers from iconic local kitchens.
              Real value on every delivery — no fake discounts, ever.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                data-testid="hero-explore-menu-button"
                onClick={() => scrollToId("menu")}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-obsidian text-bone font-semibold text-sm sm:text-base hover:bg-ink transition-all hover:gap-4"
              >
                Explore the Menu
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>
              <button
                data-testid="hero-rewards-button"
                onClick={() => scrollToId("rewards")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-ink/15 bg-white/50 font-semibold text-sm sm:text-base text-ink hover:border-ink/40 transition-colors"
              >
                How ₹20 Rewards Work
              </button>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-10 grid grid-cols-3 max-w-lg divide-x divide-line">
              {[
                { big: "₹20", small: "reward / order" },
                { big: "₹3", small: "flat platform fee" },
                { big: "30 min", small: "avg delivery" },
              ].map((s) => (
                <div key={s.small} className="px-4 first:pl-0">
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink">{s.big}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-chalk font-medium">{s.small}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div style={{ y: imgY }} className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-24px_rgba(18,18,18,0.35)]">
                <img
                  src={HERO_IMG}
                  alt="Indian feast spread"
                  className="w-full h-[320px] sm:h-[440px] lg:h-[540px] object-cover"
                  loading="eager"
                />
                <div className="spotlight-frame absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                  <div className="rounded-2xl bg-white/90 backdrop-blur px-4 py-3">
                    <p className="font-mono-accent text-[10px] text-chalk">Trending now</p>
                    <p className="font-display font-bold text-ink text-sm sm:text-base mt-0.5">Hyderabadi Dum Biryani</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-obsidian/90 text-bone px-3 py-2 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 text-saffron fill-saffron" /> 4.9
                  </span>
                </div>
              </motion.div>

              <div className="animate-float-soft absolute -top-4 -left-3 sm:-left-6 rounded-2xl bg-obsidian text-bone px-4 sm:px-5 py-3.5 shadow-xl">
                <p className="font-mono-accent text-[10px] text-saffron">Reward wallet</p>
                <p className="font-display text-xl sm:text-2xl font-extrabold mt-0.5">₹40 ready</p>
                <p className="text-[11px] text-bone/70 mt-0.5">usable on food + recharge</p>
              </div>

              <div className="absolute -bottom-4 right-4 sm:right-8 rounded-full bg-emeraldveg text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-lg inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Hot & fast · 30 min avg
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
