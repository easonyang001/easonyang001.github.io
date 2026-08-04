import { useMemo, useState } from "react";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import {
  ANNEALING_LANDSCAPES,
  runAnnealing,
  sampleLandscape,
} from "../../lib/optimization/annealing.ts";

const W = 720;
const H = 320;
const PAD = 36;

function scaleX(x: number): number {
  return PAD + (x / 100) * (W - PAD * 2);
}

function scaleY(value: number, min: number, max: number): number {
  if (max === min) return H / 2;
  return H - PAD - ((value - min) / (max - min)) * (H - PAD * 2);
}

function pathFromPoints(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export default function AnnealingPage() {
  const [landscapeSlug, setLandscapeSlug] = useState(ANNEALING_LANDSCAPES[0].slug);
  const [initialTemperature, setInitialTemperature] = useState(2.5);
  const [coolingRate, setCoolingRate] = useState(0.965);
  const [steps, setSteps] = useState(160);
  const [seed, setSeed] = useState(7);
  const [cursor, setCursor] = useState(160);

  const landscape =
    ANNEALING_LANDSCAPES.find((item) => item.slug === landscapeSlug) ?? ANNEALING_LANDSCAPES[0];
  const landscapePoints = useMemo(() => sampleLandscape(landscape), [landscape]);
  const trace = useMemo(
    () => runAnnealing({ landscape, initialTemperature, coolingRate, steps, seed }),
    [landscape, initialTemperature, coolingRate, steps, seed]
  );
  const clampedCursor = Math.min(cursor, trace.length - 1);
  const current = trace[clampedCursor];

  const allEnergyValues = [...landscapePoints.map((point) => point.energy), ...trace.map((point) => point.energy)];
  const minEnergy = Math.min(...allEnergyValues);
  const maxEnergy = Math.max(...allEnergyValues);
  const landscapePath = pathFromPoints(
    landscapePoints.map((point) => ({
      x: scaleX(point.x),
      y: scaleY(point.energy, minEnergy, maxEnergy),
    }))
  );
  const tracePath = pathFromPoints(
    trace.slice(0, clampedCursor + 1).map((point) => ({
      x: scaleX(point.x),
      y: scaleY(point.energy, minEnergy, maxEnergy),
    }))
  );
  const bestPath = pathFromPoints(
    trace.map((point) => ({
      x: PAD + (point.step / steps) * (W - PAD * 2),
      y: scaleY(point.bestEnergy, minEnergy, maxEnergy),
    }))
  );
  const acceptedCount = trace.filter((point) => point.accepted).length;

  const resetRun = () => {
    setSeed((value) => value + 1);
    setCursor(steps);
  };

  return (
    <ToolPageLayout
      eyebrow="Optimization Lab"
      title="Annealing Simulator"
      path="/lab/annealing"
      seoDescription="Explore how temperature controls stochastic search in simulated annealing, from exploration to exploitation."
      description={
        <p className="mt-3 text-small text-text-secondary">
          Explore how temperature controls stochastic search. Accepted uphill moves help the solver
          escape local minima early, while cooling gradually turns exploration into exploitation.
        </p>
      }
      panel={
        <>
          <div>
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Landscape</p>
            <Segmented>
              {ANNEALING_LANDSCAPES.map((item) => (
                <SegmentedButton
                  key={item.slug}
                  active={landscapeSlug === item.slug}
                  onClick={() => {
                    setLandscapeSlug(item.slug);
                    setCursor(steps);
                  }}
                >
                  {item.name}
                </SegmentedButton>
              ))}
            </Segmented>
            <p className="mt-3 text-small text-text-secondary">{landscape.description}</p>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Initial T</label>
              <span className="readout font-mono text-small text-text-primary">
                {initialTemperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={8}
              step={0.05}
              value={initialTemperature}
              onChange={(event) => setInitialTemperature(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Cooling</label>
              <span className="readout font-mono text-small text-text-primary">
                {coolingRate.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min={0.9}
              max={0.995}
              step={0.001}
              value={coolingRate}
              onChange={(event) => setCoolingRate(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Steps</label>
              <span className="readout font-mono text-small text-text-primary">{steps}</span>
            </div>
            <input
              type="range"
              min={40}
              max={320}
              step={1}
              value={steps}
              onChange={(event) => {
                const next = Number(event.target.value);
                setSteps(next);
                setCursor(next);
              }}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Trace</label>
              <span className="readout font-mono text-small text-text-primary">
                {clampedCursor} / {steps}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={steps}
              step={1}
              value={clampedCursor}
              onChange={(event) => setCursor(Number(event.target.value))}
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

          <button
            onClick={resetRun}
            className="mt-6 w-full rounded-md bg-accent px-3 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
          >
            New Seed
          </button>

          <div className="mt-6 rounded-panel border border-panel-border divide-y divide-panel-divider">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Current X</span>
              <span className="readout font-mono text-small text-text-primary">{current.x}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Energy</span>
              <span className="readout font-mono text-small text-text-primary">
                {current.energy.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Best</span>
              <span className="readout font-mono text-small text-text-primary">
                x={current.bestX}, {current.bestEnergy.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Accepted</span>
              <span className="readout font-mono text-small text-text-primary">
                {acceptedCount} / {trace.length}
              </span>
            </div>
          </div>
        </>
      }
    >
      <section>
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Energy Landscape</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border border-border bg-readout-bg">
          <path d={landscapePath} fill="none" stroke="#64748B" strokeWidth="2" />
          <path d={tracePath} fill="none" stroke="#D946EF" strokeWidth="2.5" strokeLinejoin="round" />
          <circle
            cx={scaleX(current.x)}
            cy={scaleY(current.energy, minEnergy, maxEnergy)}
            r="7"
            fill="#8B5CF6"
            stroke="#F8FAFC"
            strokeWidth="1.5"
          />
          <circle
            cx={scaleX(current.bestX)}
            cy={scaleY(current.bestEnergy, minEnergy, maxEnergy)}
            r="5"
            fill="#FCFDBF"
          />
        </svg>
      </section>

      <section className="mt-10">
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Best Energy Trace</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border border-border bg-readout-bg">
          <path d={bestPath} fill="none" stroke="#8B5CF6" strokeWidth="2.5" />
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#1E293B" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#1E293B" />
        </svg>
      </section>
    </ToolPageLayout>
  );
}
