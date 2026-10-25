const ITEMS = [
  "Guaranteed ₹20 Cashback on Every Single Order",
  "30-Min Delivery in Koramangala & Indiranagar",
  "Pay Mobile Bills & Recharges with Reward Balance",
  "100% Authentic Local Iconic Restaurants",
  "Restaurant Profits Settle To Their Vault Within 24 Hours",
  "Zero Fake Discounts · Real Value Delivered",
];

const Spark = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-saffron" fill="currentColor" aria-hidden="true">
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
  </svg>
);

export const Marquee = () => (
  <div className="relative bg-obsidian text-bone border-y border-obsidian overflow-hidden marquee-paused" data-testid="editorial-marquee">
    <div className="flex w-max animate-marquee py-4 sm:py-5">
      {[0, 1].map((loop) => (
        <div key={loop} className="flex items-center shrink-0" aria-hidden={loop === 1}>
          {ITEMS.map((item, i) => (
            <span key={i} className="flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8 font-mono-accent text-[11px] sm:text-sm text-bone/90">
              <Spark />
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Marquee;
