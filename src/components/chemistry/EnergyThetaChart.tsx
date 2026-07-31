interface EnergyThetaChartProps {
  points: { theta: number; energy: number }[];
  currentTheta: number;
  currentEnergy: number;
}

export default function EnergyThetaChart({ points, currentTheta, currentEnergy }: EnergyThetaChartProps) {
  const width = 400;
  const height = 160;
  const padding = 10;

  const energies = points.map((p) => p.energy);
  const minE = Math.min(...energies);
  const maxE = Math.max(...energies);
  const range = maxE - minE || 1;

  const toX = (theta: number) => (theta / (2 * Math.PI)) * (width - 2 * padding) + padding;
  const toY = (energy: number) => height - padding - ((energy - minE) / range) * (height - 2 * padding);

  const path = points.map((p) => `${toX(p.theta)},${toY(p.energy)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Energy versus theta">
      <polyline points={path} fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
      <circle cx={toX(currentTheta)} cy={toY(currentEnergy)} r="4" fill="#8B5CF6" stroke="#020617" strokeWidth="1" />
    </svg>
  );
}
