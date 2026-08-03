import { useMemo, useState } from "react";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import {
  sampleGradients,
  varianceTrend,
  type CostScope,
} from "../../lib/qml/barrenPlateau.ts";

const W = 720;
const H = 320;
const PAD = 42;

function sx(index: number, count: number): number {
  return PAD + (index / Math.max(1, count - 1)) * (W - PAD * 2);
}

function syLog(value: number, min: number, max: number): number {
  const lv = Math.log10(value);
  const lmin = Math.log10(min);
  const lmax = Math.log10(max);
  return H - PAD - ((lv - lmin) / (lmax - lmin)) * (H - PAD * 2);
}

function path(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export default function BarrenPlateauPage() {
  const [qubits, setQubits] = useState(6);
  const [depth, setDepth] = useState(8);
  const [samples, setSamples] = useState(80);
  const [scope, setScope] = useState<CostScope>("global");
  const [seed, setSeed] = useState(11);

  const trend = useMemo(() => varianceTrend({ maxQubits: 12, depth, scope }), [depth, scope]);
  const gradients = useMemo(
    () => sampleGradients({ qubits, depth, scope, samples, seed }),
    [qubits, depth, scope, samples, seed]
  );
  const selectedVariance = trend[qubits - 1]?.variance ?? trend[trend.length - 1].variance;
  const minVariance = Math.min(...trend.map((point) => point.variance));
  const maxVariance = Math.max(...trend.map((point) => point.variance));
  const trendPath = path(
    trend.map((point, index) => ({
      x: sx(index, trend.length),
      y: syLog(point.variance, minVariance, maxVariance),
    }))
  );
  const maxAbsGradient = Math.max(...gradients.map((point) => Math.abs(point.value)), 1e-6);

  return (
    <ToolPageLayout
      eyebrow="Trainability Lab"
      title="Barren Plateau Demo"
      description={
        <p className="mt-3 text-small text-text-secondary">
          Explore how gradient variance shrinks as variational circuits grow. This lightweight
          simulator models the statistical pattern: global costs collapse exponentially with width,
          while local costs degrade more gently.
        </p>
      }
      panel={
        <>
          <div>
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Cost Scope</p>
            <Segmented>
              <SegmentedButton active={scope === "global"} onClick={() => setScope("global")}>
                Global
              </SegmentedButton>
              <SegmentedButton active={scope === "local"} onClick={() => setScope("local")}>
                Local
              </SegmentedButton>
            </Segmented>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Qubits</label>
              <span className="readout font-mono text-small text-text-primary">{qubits}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={qubits}
              onChange={(event) => setQubits(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Depth</label>
              <span className="readout font-mono text-small text-text-primary">{depth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={32}
              step={1}
              value={depth}
              onChange={(event) => setDepth(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Samples</label>
              <span className="readout font-mono text-small text-text-primary">{samples}</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={1}
              value={samples}
              onChange={(event) => setSamples(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
              Seed
            </label>
            <input
              type="number"
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value) || 0)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="mt-6 rounded-panel border border-panel-border divide-y divide-panel-divider">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Variance</span>
              <span className="readout font-mono text-small text-text-primary">
                {selectedVariance.toExponential(2)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Std Dev</span>
              <span className="readout font-mono text-small text-text-primary">
                {Math.sqrt(selectedVariance).toExponential(2)}
              </span>
            </div>
          </div>
        </>
      }
    >
      <section>
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Gradient Variance vs. Width</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border border-border bg-readout-bg">
          <path d={trendPath} fill="none" stroke="#8B5CF6" strokeWidth="2.5" />
          {trend.map((point, index) => (
            <circle
              key={point.qubits}
              cx={sx(index, trend.length)}
              cy={syLog(point.variance, minVariance, maxVariance)}
              r={point.qubits === qubits ? 7 : 4}
              fill={point.qubits === qubits ? "#FCFDBF" : "#D946EF"}
            />
          ))}
          <text x={PAD} y={PAD - 12} fill="#64748B" fontSize="12">
            log variance
          </text>
        </svg>
      </section>

      <section className="mt-10">
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Sampled Gradients</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border border-border bg-readout-bg">
          <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="#1E293B" />
          {gradients.map((sample) => {
            const x = sx(sample.index, gradients.length);
            const y = H / 2 - (sample.value / maxAbsGradient) * (H / 2 - PAD);
            return (
              <line
                key={sample.index}
                x1={x}
                x2={x}
                y1={H / 2}
                y2={y}
                stroke={sample.value >= 0 ? "#8B5CF6" : "#D946EF"}
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </section>
    </ToolPageLayout>
  );
}
