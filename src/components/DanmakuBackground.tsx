import { danmakuItems } from "../data/danmaku.ts";

const CJK_RE = /[一-鿿]/;
const LANES = 8;

const LATIN_TIERS = [
  { fontSize: 20, opacity: 0.18 },
  { fontSize: 26, opacity: 0.14 },
  { fontSize: 32, opacity: 0.1 },
];

const CJK_TIERS = [
  { fontSize: 22, opacity: 0.14 },
  { fontSize: 28, opacity: 0.11 },
  { fontSize: 34, opacity: 0.08 },
];

export default function DanmakuBackground() {
  return (
    <div aria-hidden="true" className="motion-reduce:hidden pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes danmaku-drift {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
      `}</style>
      {danmakuItems.map((text, i) => {
        const isCJK = CJK_RE.test(text);
        const tier = (isCJK ? CJK_TIERS : LATIN_TIERS)[i % 3];
        const lane = i % LANES;
        const top = 6 + (lane * 88) / (LANES - 1);
        const duration = 20 + (i % 5) * 3;
        const delay = -((i * 3.7) % duration);

        return (
          <span
            key={i}
            className={isCJK ? "font-sans-tc font-light" : "font-sans font-normal"}
            style={{
              position: "absolute",
              top: `${top}%`,
              left: 0,
              whiteSpace: "nowrap",
              color: "#F8FAFC",
              fontSize: `${tier.fontSize}px`,
              opacity: tier.opacity,
              letterSpacing: isCJK ? "0.05em" : "normal",
              animation: `danmaku-drift ${duration}s linear ${delay}s infinite`,
              willChange: "transform",
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}
