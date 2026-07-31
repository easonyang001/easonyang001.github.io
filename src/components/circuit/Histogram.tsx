import { formatProbability } from "../../lib/quantum/format.ts";

interface HistogramProps {
  basisLabels: string[];
  probabilities: number[];
}

export default function Histogram({ basisLabels, probabilities }: HistogramProps) {
  const maxIndex = probabilities.reduce(
    (best, p, i) => (p > probabilities[best] ? i : best),
    0
  );

  return (
    <div className="flex items-end gap-2" style={{ height: 180 }}>
      {basisLabels.map((label, i) => {
        const p = probabilities[i];
        const barHeight = Math.max(2, p * 150);
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <span className="readout font-mono text-small text-text-secondary">
              {formatProbability(p)}
            </span>
            <div
              className="w-full rounded-t-sm"
              style={{
                height: barHeight,
                backgroundColor: i === maxIndex ? "#A78BFA" : "#8B5CF6",
              }}
            />
            <span className="font-mono text-mono-label text-text-muted">|{label}⟩</span>
          </div>
        );
      })}
    </div>
  );
}
