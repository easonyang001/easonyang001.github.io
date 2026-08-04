import { useMemo, useState } from "react";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import {
  KERNEL_DATASETS,
  kernelAlignment,
  kernelMatrix,
  type KernelKind,
} from "../../lib/qml/kernel.ts";

const SIZE = 360;
const PAD = 26;

function heatColor(value: number): string {
  const t = Math.max(0, Math.min(1, value));
  return `rgb(${Math.round(20 + t * 180)}, ${Math.round(22 + t * 70)}, ${Math.round(40 + t * 190)})`;
}

function pointX(x: number): number {
  return PAD + ((x + Math.PI) / (Math.PI * 2)) * (SIZE - PAD * 2);
}

function pointY(y: number): number {
  return SIZE - PAD - ((y + Math.PI) / (Math.PI * 2)) * (SIZE - PAD * 2);
}

export default function QuantumKernelPage() {
  const [datasetSlug, setDatasetSlug] = useState(KERNEL_DATASETS[0].slug);
  const [kernelKind, setKernelKind] = useState<KernelKind>("quantum");
  const [depth, setDepth] = useState(2);
  const [gamma, setGamma] = useState(0.8);

  const datasetInfo =
    KERNEL_DATASETS.find((item) => item.slug === datasetSlug) ?? KERNEL_DATASETS[0];
  const dataset = useMemo(() => datasetInfo.generate(), [datasetInfo]);
  const matrix = useMemo(
    () => kernelMatrix(dataset, kernelKind, { gamma, depth }),
    [dataset, kernelKind, gamma, depth]
  );
  const quantumMatrix = useMemo(
    () => kernelMatrix(dataset, "quantum", { gamma, depth }),
    [dataset, gamma, depth]
  );
  const rbfMatrix = useMemo(() => kernelMatrix(dataset, "rbf", { gamma, depth }), [dataset, gamma, depth]);
  const alignment = kernelAlignment(matrix, dataset);
  const quantumAlignment = kernelAlignment(quantumMatrix, dataset);
  const rbfAlignment = kernelAlignment(rbfMatrix, dataset);
  const cell = SIZE / matrix.length;

  return (
    <ToolPageLayout
      eyebrow="Quantum Machine Learning"
      title="Quantum Kernel Explorer"
      path="/lab/quantum-kernel"
      seoDescription="Compare a quantum-inspired feature-map kernel with a classical RBF kernel using a pairwise similarity heatmap."
      description={
        <p className="mt-3 text-small text-text-secondary">
          Compare a quantum-inspired feature-map kernel with a classical RBF kernel. The heatmap
          shows pairwise similarity; alignment measures how well similarity agrees with class labels.
        </p>
      }
      panel={
        <>
          <div>
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Dataset</p>
            <Segmented>
              {KERNEL_DATASETS.map((item) => (
                <SegmentedButton
                  key={item.slug}
                  active={datasetSlug === item.slug}
                  onClick={() => setDatasetSlug(item.slug)}
                >
                  {item.name}
                </SegmentedButton>
              ))}
            </Segmented>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Kernel</p>
            <Segmented>
              <SegmentedButton active={kernelKind === "quantum"} onClick={() => setKernelKind("quantum")}>
                Quantum
              </SegmentedButton>
              <SegmentedButton active={kernelKind === "rbf"} onClick={() => setKernelKind("rbf")}>
                RBF
              </SegmentedButton>
            </Segmented>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Feature Depth</label>
              <span className="readout font-mono text-small text-text-primary">{depth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={depth}
              onChange={(event) => setDepth(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">RBF Gamma</label>
              <span className="readout font-mono text-small text-text-primary">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={3}
              step={0.05}
              value={gamma}
              onChange={(event) => setGamma(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6 rounded-panel border border-panel-border divide-y divide-panel-divider">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Selected</span>
              <span className="readout font-mono text-small text-text-primary">{alignment.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Quantum</span>
              <span className="readout font-mono text-small text-text-primary">
                {quantumAlignment.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">RBF</span>
              <span className="readout font-mono text-small text-text-primary">{rbfAlignment.toFixed(3)}</span>
            </div>
          </div>
        </>
      }
    >
      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Kernel Matrix</p>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-md rounded-md border border-border bg-readout-bg">
            {matrix.map((row, i) =>
              row.map((value, j) => (
                <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell + 0.4} height={cell + 0.4} fill={heatColor(value)} />
              ))
            )}
          </svg>
        </section>

        <section>
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Dataset</p>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-md rounded-md border border-border bg-readout-bg">
            <line x1={PAD} y1={SIZE / 2} x2={SIZE - PAD} y2={SIZE / 2} stroke="#1E293B" />
            <line x1={SIZE / 2} y1={PAD} x2={SIZE / 2} y2={SIZE - PAD} stroke="#1E293B" />
            {dataset.map((point, index) => (
              <circle
                key={index}
                cx={pointX(point.x[0])}
                cy={pointY(point.x[1])}
                r="5"
                fill={point.label === 1 ? "#D946EF" : "#8B5CF6"}
                stroke="#F8FAFC"
                strokeWidth="0.8"
              />
            ))}
          </svg>
        </section>
      </div>
    </ToolPageLayout>
  );
}
