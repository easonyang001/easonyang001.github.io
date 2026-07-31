interface PesPoint {
  r: number;
  vqeEnergy: number;
  exactEnergy: number;
}

interface PesChartProps {
  points: PesPoint[];
  equilibriumR: number;
  currentR: number;
}

export default function PesChart({ points, equilibriumR, currentR }: PesChartProps) {
  const width = 400;
  const height = 200;
  const padding = 12;

  const rs = points.map((p) => p.r);
  const energies = points.flatMap((p) => [p.vqeEnergy, p.exactEnergy]);
  const minR = Math.min(...rs);
  const maxR = Math.max(...rs);
  const minE = Math.min(...energies);
  const maxE = Math.max(...energies);
  const rRange = maxR - minR || 1;
  const eRange = maxE - minE || 1;

  const toX = (r: number) => ((r - minR) / rRange) * (width - 2 * padding) + padding;
  const toY = (e: number) => height - padding - ((e - minE) / eRange) * (height - 2 * padding);

  const vqePath = points.map((p) => `${toX(p.r)},${toY(p.vqeEnergy)}`).join(" ");
  const exactPath = points.map((p) => `${toX(p.r)},${toY(p.exactEnergy)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Potential energy surface">
      <line
        x1={toX(equilibriumR)}
        y1={padding}
        x2={toX(equilibriumR)}
        y2={height - padding}
        stroke="#1E293B"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <line
        x1={toX(currentR)}
        y1={padding}
        x2={toX(currentR)}
        y2={height - padding}
        stroke="#8B5CF6"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <polyline points={exactPath} fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" />
      <polyline points={vqePath} fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
    </svg>
  );
}
