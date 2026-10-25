import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, Clock, MapPin, Users, Banknote } from "lucide-react";
import { api } from "@/src/lib/api";
import restaurantsData from "@/src/data/restaurants.json";

const reveal: any = {
  hidden: { opacity: 0, y: 36 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const RestaurantSection = () => {
  const [restaurants, setRestaurants] = useState<any[]>(() => restaurantsData);

  useEffect(() => {
    api
      .get("/restaurants")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRestaurants(res.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="restaurants" className="py-16 sm:py-24 bg-obsidian text-bone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <p className="font-mono-accent text-xs text-saffron font-semibold">Delivering from</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight flex items-center gap-3">
              Koramangala 4th Block
              <MapPin className="w-7 h-7 text-chilli hidden sm:block" />
            </h2>
          </div>
          <p className="text-sm text-bone/60 max-w-xs">
            Iconic local kitchens, hand-picked. Rewards stack on every one.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          data-testid="payout-notice"
          className="mt-8 flex items-start gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 px-4 sm:px-5 py-4"
        >
          <Banknote className="w-5 h-5 text-saffron shrink-0 mt-0.5" />
          <p className="text-sm text-bone/85 leading-relaxed">
            <span className="font-bold text-saffron">Partner promise:</span> every restaurant on FoodRush receives{" "}
            <strong className="text-bone">100% of its profit in its vault within 24 hours of each order</strong> — no weekly waits.
          </p>
        </motion.div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" data-testid="restaurants-grid">
          {restaurants.map((r, i) => (
            <motion.article
              key={r.id}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              custom={i % 3}
              data-testid={`restaurant-card-${r.id}`}
              className="group rounded-3xl overflow-hidden bg-card/[0.06] border border-white/10 hover:border-saffron/40 transition-colors"
            >
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={r.image_url}
                  alt={r.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 inline-flex rounded-full bg-gold text-obsidian text-[11px] sm:text-xs font-bold px-3 py-2 w-fit max-w-full">
                  {r.badge}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-lg leading-snug">{r.name}</h3>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emeraldveg/20 text-emeraldveg border border-emeraldveg/30 px-2 py-1 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> {r.rating}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-bone/60 leading-relaxed">{r.cuisine}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-bone/75 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-saffron" />
                    {r.delivery_time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-saffron" />
                    {r.distance}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-saffron" />
                    {r.cost_for_two} for two
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantSection;
