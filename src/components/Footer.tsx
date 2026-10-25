import { Logo } from "@/src/components/Logo";
import { scrollToId } from "@/src/lib/scroll";

const QUICK = [
  { label: "Explore Restaurants", id: "restaurants" },
  { label: "₹20 Reward System", id: "rewards" },
  { label: "Mobile Recharge Utility", id: "recharge" },
  { label: "Browse the Menu", id: "menu" },
  { label: "Track Your Orders", id: "orders" },
];

const CUISINES = [
  "Hyderabadi Dum Biryani",
  "Artisanal Wood-Fired Pizza",
  "South Indian Ghee Dosas",
  "Mughlai Kebabs & Curries",
  "Craft Burgers & Shakes",
];

export const Footer = () => (
  <footer className="bg-obsidian text-bone">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm text-bone/60 leading-relaxed max-w-xs">
            Crafted with love for hungry food lovers across India. Real value on every single meal.
          </p>
          <p className="mt-5 font-mono-accent text-[10px] text-saffron font-semibold">
            256-bit Encrypted Checkout
          </p>
        </div>

        <div>
          <p className="font-mono-accent text-[10px] text-bone/50 font-semibold">Quick Links</p>
          <ul className="mt-4 space-y-2.5">
            {QUICK.map((q) => (
              <li key={q.id}>
                <button
                  onClick={() => scrollToId(q.id)}
                  className="text-sm text-bone/75 hover:text-saffron transition-colors cursor-pointer"
                  data-testid={`footer-link-${q.id}`}
                >
                  {q.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono-accent text-[10px] text-bone/50 font-semibold">Popular Cuisines</p>
          <ul className="mt-4 space-y-2.5">
            {CUISINES.map((c) => (
              <li key={c}>
                <button
                  onClick={() => scrollToId("menu")}
                  className="text-sm text-bone/75 hover:text-saffron transition-colors cursor-pointer"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono-accent text-[10px] text-bone/50 font-semibold">Policies</p>
          <ul className="mt-4 space-y-2.5 text-sm text-bone/75">
            <li>₹20 Reward Policy Rules</li>
            <li>Refund & Cancellation Policy</li>
            <li>Terms of Service</li>
            <li>Privacy Policy & Data Security</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-bone/50">
          © 2026 FoodRush Technologies India Pvt. Ltd. All rights reserved.
        </p>
        <p className="text-xs text-bone/50">Koramangala 4th Block · Bengaluru</p>
      </div>
    </div>
  </footer>
);

export default Footer;
