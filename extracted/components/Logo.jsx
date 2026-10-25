export const Logo = ({ dark = false, size = "md" }) => {
  const box = size === "lg" ? "w-11 h-11 rounded-2xl" : "w-9 h-9 rounded-xl";
  const text = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className={`${box} bg-obsidian inline-flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 64 64" className={size === "lg" ? "w-7 h-7" : "w-6 h-6"} aria-hidden="true">
          <defs>
            <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F4A261" />
              <stop offset="1" stopColor="#E63946" />
            </linearGradient>
          </defs>
          <path d="M25 24.5 c0-3.2 2.8-3.6 2.8-6.8 0-1.8-1.3-2.9-2-3.4" stroke="url(#logoG)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          <path d="M34.5 23.5 c0-2.8 2.4-3.2 2.4-6 0-1.6-1.1-2.6-1.7-3" stroke="url(#logoG)" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.75" />
          <path d="M14 31.5 h36 c0.4 0 0.7 0.3 0.7 0.8 0 8.6-5.3 15-12.6 17.4 l0.3 4.8 h-12.8 l0.3-4.8 C18.6 47.3 13.3 40.9 13.3 32.3 c0-0.5 0.3-0.8 0.7-0.8 Z" fill="url(#logoG)" />
        </svg>
      </span>
      <span className={`font-display ${text} font-extrabold tracking-tight ${dark ? "text-bone" : "text-ink"}`}>
        Food<span className="text-chilli">Rush</span>
      </span>
    </span>
  );
};

export default Logo;
