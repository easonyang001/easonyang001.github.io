import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import DecisionBoundary from "../../components/qml/DecisionBoundary.tsx";
import LossCurve from "../../components/qml/LossCurve.tsx";
import MagmaLegend from "../../components/viz/MagmaLegend.tsx";
import { DATASETS } from "../../lib/qml/datasets.ts";
import { initWeights, trainStep } from "../../lib/qml/train.ts";
import { datasetLoss, datasetAccuracy } from "../../lib/qml/cost.ts";

const MIN_LAYERS = 1;
const MAX_LAYERS = 4;
const BOUNDARY_REDRAW_INTERVAL = 5;

export default function VQCPage() {
  const [datasetSlug, setDatasetSlug] = useState(DATASETS[0].slug);
  const [layers, setLayers] = useState(2);
  const [learningRate, setLearningRate] = useState(0.5);
  const [maxEpochs, setMaxEpochs] = useState(80);
  const [seed, setSeed] = useState(42);

  const dataset = useMemo(() => {
    const info = DATASETS.find((d) => d.slug === datasetSlug) ?? DATASETS[0];
    return info.generate();
  }, [datasetSlug]);

  const [weights, setWeights] = useState(() => initWeights(2, 42));
  const [boundaryWeights, setBoundaryWeights] = useState(weights);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [training, setTraining] = useState(false);

  const stateRef = useRef({ weights, epoch, lossHistory });
  stateRef.current = { weights, epoch, lossHistory };

  const resetTraining = useCallback(() => {
    setTraining(false);
    const fresh = initWeights(layers, seed);
    setWeights(fresh);
    setBoundaryWeights(fresh);
    setEpoch(0);
    setLossHistory([]);
  }, [layers, seed]);

  useEffect(() => {
    resetTraining();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetSlug, layers, seed]);

  const doEpoch = useCallback(() => {
    const { weights: w, epoch: e, lossHistory: h } = stateRef.current;
    const nextWeights = trainStep(dataset, w, layers, learningRate);
    const loss = datasetLoss(dataset, nextWeights, layers);
    const nextEpoch = e + 1;
    const nextHistory = [...h, loss];
    setWeights(nextWeights);
    setEpoch(nextEpoch);
    setLossHistory(nextHistory);
    if (nextEpoch % BOUNDARY_REDRAW_INTERVAL === 0 || nextEpoch >= maxEpochs) {
      setBoundaryWeights(nextWeights);
    }
    return nextEpoch;
  }, [dataset, layers, learningRate, maxEpochs]);

  useEffect(() => {
    if (!training) return;
    let raf: number;
    const tick = () => {
      const nextEpoch = doEpoch();
      if (nextEpoch >= maxEpochs) {
        setTraining(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [training, doEpoch, maxEpochs]);

  const handleStep = () => {
    if (training) return;
    doEpoch();
  };

  const currentAccuracy = datasetAccuracy(dataset, weights, layers);
  const currentLoss = lossHistory[lossHistory.length - 1] ?? datasetLoss(dataset, weights, layers);

  return (
    <ToolPageLayout
      eyebrow="2 Qubits · Parameter-Shift"
      title="Variational Quantum Classifier"
      description={
        <p className="mt-2 text-small text-text-secondary">
          A 2-qubit classifier trained with the parameter-shift rule. Watch the decision boundary
          form as training progresses — this is a live computation, not an animation.
        </p>
      }
      panel={
        <>
          <div>
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Dataset</p>
            <Segmented>
              {DATASETS.map((d) => (
                <SegmentedButton
                  key={d.slug}
                  active={datasetSlug === d.slug}
                  onClick={() => setDatasetSlug(d.slug)}
                >
                  {d.name}
                </SegmentedButton>
              ))}
            </Segmented>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Layers</p>
            <Segmented>
              {Array.from({ length: MAX_LAYERS - MIN_LAYERS + 1 }, (_, i) => MIN_LAYERS + i).map(
                (n) => (
                  <SegmentedButton key={n} active={layers === n} onClick={() => setLayers(n)}>
                    {n}
                  </SegmentedButton>
                )
              )}
            </Segmented>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">
                Learning Rate
              </label>
              <span className="readout font-mono text-small text-text-primary">
                {learningRate.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.01}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Epochs</label>
              <span className="readout font-mono text-small text-text-primary">{maxEpochs}</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={1}
              value={maxEpochs}
              onChange={(e) => setMaxEpochs(Number(e.target.value))}
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
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => setTraining((t) => !t)}
              disabled={epoch >= maxEpochs}
              className="rounded-md bg-accent px-3 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {training ? "Pause" : "Train"}
            </button>
            <button
              onClick={handleStep}
              disabled={training || epoch >= maxEpochs}
              className="rounded-md border border-border px-3 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Step
            </button>
          </div>
          <button
            onClick={resetTraining}
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
          >
            Reset
          </button>

          <div className="mt-6 rounded-panel border border-panel-border divide-y divide-panel-divider">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Epoch</span>
              <span className="readout font-mono text-small text-text-primary">
                {epoch} / {maxEpochs}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Loss</span>
              <span className="readout font-mono text-small text-text-primary">
                {currentLoss.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Accuracy</span>
              <span className="readout font-mono text-small text-text-primary">
                {currentAccuracy.toFixed(4)}
              </span>
            </div>
          </div>
        </>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="font-mono text-mono-label uppercase text-text-muted">Decision Boundary</p>
        <MagmaLegend label="P(class 1)" />
      </div>
      <div className="mt-4">
        <DecisionBoundary weights={boundaryWeights} layers={layers} dataset={dataset} />
      </div>

      <div className="mt-10">
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Loss Curve</p>
        <LossCurve lossHistory={lossHistory} />
      </div>
    </ToolPageLayout>
  );
}
