import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, Star } from "lucide-react";
import { api } from "@/src/lib/api";
import { useCart } from "@/src/context/CartContext";
import dishesData from "@/src/data/dishes.json";

const CATEGORIES = [
  "All Cravings",
  "Biryani & Handi",
  "Pizzas & Pasta",
  "South Indian",
  "Craft Burgers",
  "Asian & Wok",
  "Chai & Snacks",
];

const sectionReveal: any = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const VegDot = ({ isVeg }: { isVeg: boolean }) => (
  <span
    className={`inline-flex items-center justify-center w-4 h-4 rounded-[3px] border-2 ${
      isVeg ? "border-emeraldveg" : "border-[#8B3A2E]"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-emeraldveg" : "bg-[#8B3A2E]"}`}
    />
  </span>
);

const DishCard = ({
  dish,
  qty,
  onAdd,
  onInc,
  onDec,
}: {
  dish: any;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) => (
  <motion.article
    variants={sectionReveal}
    data-testid={`dish-card-${dish.id}`}
    className="group bg-card rounded-3xl border border-line overflow-hidden flex flex-col h-full hover:shadow-[0_24px_48px_-16px_rgba(18,18,18,0.18)] hover:-translate-y-1 transition-all duration-300"
  >
    <div className="relative h-44 sm:h-48 overflow-hidden">
      <img
        src={dish.image_url}
        alt={dish.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/92 backdrop-blur px-2.5 py-1 text-xs font-bold text-ink">
        <Star className="w-3.5 h-3.5 text-gold fill-gold" /> {dish.rating}
      </span>
      <span className="absolute bottom-3 left-3 text-[10px] font-mono-accent text-white/90 bg-obsidian/60 backdrop-blur rounded-full px-2.5 py-1">
        {dish.restaurant}
      </span>
    </div>

    <div className="flex flex-col flex-1 p-4 sm:p-5">
      <div className="flex items-start gap-2">
        <VegDot isVeg={dish.is_veg} />
        <h3 className="font-display font-bold text-ink leading-snug text-[15px] sm:text-base">
          {dish.name}
        </h3>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-chalk line-clamp-2 flex-1">
        {dish.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-display text-lg font-extrabold text-ink">₹{dish.price}</p>
        {qty === 0 ? (
          <button
            data-testid={`add-to-cart-button-${dish.id}`}
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full border-2 border-obsidian text-obsidian font-bold text-sm hover:bg-obsidian hover:text-bone transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        ) : (
          <div
            data-testid={`qty-stepper-${dish.id}`}
            className="inline-flex items-center gap-1 h-10 rounded-full bg-obsidian text-bone px-1.5"
          >
            <button
              data-testid={`qty-dec-${dish.id}`}
              onClick={onDec}
              className="w-8 h-8 rounded-full inline-flex items-center justify-center hover:bg-white/10"
              aria-label="Decrease"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span
              data-testid={`qty-value-${dish.id}`}
              className="w-6 text-center font-bold text-sm"
            >
              {qty}
            </span>
            <button
              data-testid={`qty-inc-${dish.id}`}
              onClick={onInc}
              className="w-8 h-8 rounded-full inline-flex items-center justify-center hover:bg-white/10"
              aria-label="Increase"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  </motion.article>
);

export const MenuSection = () => {
  const { items, addToCart, inc, dec } = useCart();
  const [category, setCategory] = useState("All Cravings");
  const [dishes, setDishes] = useState<any[]>(() => dishesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    api
      .get("/dishes", { params: { category } })
      .then((res) => {
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : dishesData;
          const filtered =
            !category || category === "All Cravings"
              ? list
              : list.filter((d: any) => d.category === category);
          setDishes(filtered);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const list = dishesData;
          const filtered =
            !category || category === "All Cravings"
              ? list
              : list.filter((d: any) => d.category === category);
          setDishes(filtered);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const qtyOf = (id: string) => items.find((i: any) => i.dish_id === id)?.qty || 0;

  return (
    <section id="menu" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <p className="font-mono-accent text-xs text-chilli font-semibold">The Menu</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
              Most Loved Dishes
            </h2>
          </div>
          <p className="text-sm text-chalk max-w-xs">
            Every dish earns you ₹20 back on delivery. No codes, no catch.
          </p>
        </motion.div>

        <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max sm:w-full sm:flex-wrap pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                data-testid={`category-filter-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                onClick={() => setCategory(c)}
                className={`h-11 px-5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border-2 ${
                  category === c
                    ? "bg-obsidian text-bone border-obsidian"
                    : "bg-white/60 text-ink border-line hover:border-ink/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div
            className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            data-testid="dishes-loading"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-line overflow-hidden bg-card"
              >
                <div className="h-48 bg-secondary/60 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-secondary/60 rounded animate-pulse" />
                  <div className="h-3 w-full bg-secondary/40 rounded animate-pulse" />
                  <div className="h-9 w-24 bg-secondary/40 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="mt-10 rounded-3xl border border-line bg-card p-10 text-center"
            data-testid="dishes-error"
          >
            <p className="font-display font-bold text-ink text-lg">Menu didn't load</p>
            <p className="text-sm text-chalk mt-1">Check your connection and try again.</p>
            <button
              onClick={() => setCategory("All Cravings")}
              className="mt-4 h-10 px-5 rounded-full bg-obsidian text-bone text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            data-testid="dishes-grid"
          >
            <AnimatePresence mode="popLayout">
              {dishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  qty={qtyOf(dish.id)}
                  onAdd={() => addToCart(dish)}
                  onInc={() => inc(dish.id)}
                  onDec={() => dec(dish.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
