import { motion, useReducedMotion } from "framer-motion";

const WIDTH = 1200;
const HEIGHT = 420;
const WIRE_COUNT = 5;
const WIRE_GAP = HEIGHT / (WIRE_COUNT + 1);

const GATES = [
  { wire: 0, x: 160, label: "H" },
  { wire: 1, x: 320, label: "RY" },
  { wire: 2, x: 260, label: "X" },
  { wire: 0, x: 560, label: "RZ" },
  { wire: 3, x: 460, label: "H" },
  { wire: 4, x: 680, label: "X" },
  { wire: 1, x: 820, label: "H" },
  { wire: 2, x: 940, label: "RZ" },
  { wire: 3, x: 1020, label: "RY" },
];

const CNOTS = [
  { x: 400, from: 1, to: 2 },
  { x: 760, from: 3, to: 4 },
];

/**
 * Purely decorative, static quantum circuit diagram used as the About
 * page's hero background. Deliberately not the interactive Lab
 * CircuitDiagram component -- coupling the About page to Lab's editable
 * circuit state would be the wrong kind of reuse for a background image.
 */
export default function AboutCircuitBackground() {
  const prefersReducedMotion = useReducedMotion();
  const wireY = (wire: number) => (wire + 1) * WIRE_GAP;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {Array.from({ length: WIRE_COUNT }, (_, i) => (
        <line key={i} x1={0} y1={wireY(i)} x2={WIDTH} y2={wireY(i)} className="stroke-border-strong" strokeWidth={1} />
      ))}

      {CNOTS.map((c) => (
        <g key={`${c.x}-${c.from}`}>
          <line x1={c.x} y1={wireY(c.from)} x2={c.x} y2={wireY(c.to)} className="stroke-accent" strokeWidth={1.5} />
          <circle cx={c.x} cy={wireY(c.from)} r={5} className="fill-accent" />
          <circle cx={c.x} cy={wireY(c.to)} r={11} fill="none" className="stroke-accent" strokeWidth={1.5} />
          <line x1={c.x - 11} y1={wireY(c.to)} x2={c.x + 11} y2={wireY(c.to)} className="stroke-accent" strokeWidth={1.5} />
          <line x1={c.x} y1={wireY(c.to) - 11} x2={c.x} y2={wireY(c.to) + 11} className="stroke-accent" strokeWidth={1.5} />
        </g>
      ))}

      {GATES.map((g, i) => (
        <g key={i}>
          <rect
            x={g.x - 20}
            y={wireY(g.wire) - 20}
            width={40}
            height={40}
            rx={6}
            className="fill-surface stroke-accent"
            strokeWidth={1.5}
          />
          <text
            x={g.x}
            y={wireY(g.wire) + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={500}
            className="fill-accent font-mono"
          >
            {g.label}
          </text>
        </g>
      ))}

      {!prefersReducedMotion &&
        [0, 2, 4].map((wire) => (
          <motion.circle
            key={wire}
            r={4}
            className="fill-accent"
            initial={{ cx: 0, cy: wireY(wire), opacity: 0 }}
            animate={{ cx: [0, WIDTH], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: wire * 1.6,
            }}
          />
        ))}
    </svg>
  );
}
