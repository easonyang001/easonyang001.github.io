/**
 * Sparse node/link network -- reads as information transfer / quantum
 * connectivity, not a blockchain diagram. Spans the full Hero background;
 * a right-side mask fades it out behind the text column so it reads as
 * "everywhere" without fighting text legibility, staying visible over the
 * skyline photo on the left (see Hero.tsx's scrim, which darkens the same
 * right side for the same reason). Mostly static; a few links carry a slow
 * traveling light packet via SVG animateMotion.
 */
const NODES = [
  { x: 4, y: 18 }, { x: 14, y: 34 }, { x: 9, y: 55 }, { x: 20, y: 8 },
  { x: 24, y: 46 }, { x: 30, y: 62 }, { x: 34, y: 20 }, { x: 40, y: 40 },
  { x: 46.6, y: 22 }, { x: 54.8, y: 10 }, { x: 61.7, y: 30 }, { x: 50.7, y: 48 },
  { x: 68.7, y: 16 }, { x: 75.6, y: 34 }, { x: 65.2, y: 52 }, { x: 80.3, y: 12 },
  { x: 87.2, y: 26 }, { x: 78.0, y: 46 }, { x: 93.0, y: 18 }, { x: 94.2, y: 40 },
  { x: 57.1, y: 62 }, { x: 72.2, y: 66 }, { x: 12, y: 68 }, { x: 44, y: 68 },
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [4, 5], [3, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [8, 11], [10, 12], [12, 13], [13, 14], [12, 15],
  [15, 16], [16, 17], [13, 17], [15, 18], [18, 19], [16, 19], [11, 20],
  [14, 21], [2, 22], [11, 23], [5, 23],
];

// Which links carry a traveling light packet -- kept small, never all of them.
const ACTIVE_LINKS = [1, 8, 13, 20];

export default function HeroQuantumNetwork() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 75"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-60 md:block"
      style={{
        maskImage: "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.35) 22%, black 45%)",
        WebkitMaskImage: "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.35) 22%, black 45%)",
      }}
    >
      <defs>
        {LINKS.map(([a, b], i) => (
          <path
            key={`path-${i}`}
            id={`hero-net-link-${i}`}
            d={`M${NODES[a].x},${NODES[a].y} L${NODES[b].x},${NODES[b].y}`}
          />
        ))}
      </defs>

      {LINKS.map(([a, b], i) => (
        <line
          key={`link-${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="rgba(103, 232, 249, 0.14)"
          strokeWidth={0.15}
        />
      ))}

      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i % 4 === 0 ? 0.55 : 0.35}
          fill={i % 4 === 0 ? "rgba(103, 232, 249, 0.55)" : "rgba(148, 190, 230, 0.35)"}
          className={i % 3 === 0 ? "hero-network-pulse" : undefined}
          style={i % 3 === 0 ? { animationDelay: `${i * 0.7}s` } : undefined}
        />
      ))}

      {ACTIVE_LINKS.map((linkIndex, i) => (
        <circle key={`packet-${linkIndex}`} r={0.6} fill="#67e8f9" className="hero-network-packet">
          <animateMotion
            dur={`${6 + i * 1.5}s`}
            repeatCount="indefinite"
            begin={`${i * 2}s`}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="linear"
          >
            <mpath href={`#hero-net-link-${linkIndex}`} />
          </animateMotion>
        </circle>
      ))}
    </svg>
  );
}
