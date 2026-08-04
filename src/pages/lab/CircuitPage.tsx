import { useMemo, useState } from "react";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import CircuitDiagram from "../../components/circuit/CircuitDiagram.tsx";
import Histogram from "../../components/circuit/Histogram.tsx";
import AmplitudeTable from "../../components/circuit/AmplitudeTable.tsx";
import { GATE_INFO, CATEGORY_COLORS, type CircuitGateName } from "../../lib/quantum/gates.ts";
import {
  MAX_QUBITS,
  MIN_QUBITS,
  emptyCircuit,
  addGate,
  removeGate,
  clearGates,
  resizeCircuit,
  gateAtCell,
  type Circuit,
} from "../../lib/quantum/circuit.ts";
import { simulate } from "../../lib/quantum/simulator.ts";
import { circuitExamples } from "../../lib/quantum/examples.ts";

const ROTATION_GATES: CircuitGateName[] = ["Rx", "Ry", "Rz"];

export default function CircuitPage() {
  const [circuit, setCircuit] = useState<Circuit>(() => emptyCircuit(2));
  const [selectedGate, setSelectedGate] = useState<CircuitGateName>("H");
  const [rotationAngleDeg, setRotationAngleDeg] = useState(90);
  const [pendingControl, setPendingControl] = useState<{ column: number; qubit: number } | null>(
    null
  );

  const result = useMemo(() => simulate(circuit), [circuit]);

  const handleQubitCount = (n: number) => {
    setCircuit((c) => resizeCircuit(c, n));
    setPendingControl(null);
  };

  const handleCellClick = (column: number, qubit: number) => {
    const existing = gateAtCell(circuit, column, qubit);
    if (existing) return; // occupied — click the gate itself to remove it

    if (selectedGate === "CNOT") {
      if (!pendingControl) {
        setPendingControl({ column, qubit });
        return;
      }
      if (pendingControl.column === column && pendingControl.qubit !== qubit) {
        setCircuit((c) => addGate(c, { name: "CNOT", control: pendingControl.qubit, qubit, column }));
      }
      setPendingControl(null);
      return;
    }

    const isRotation = ROTATION_GATES.includes(selectedGate);
    setCircuit((c) =>
      addGate(c, {
        name: selectedGate,
        qubit,
        column,
        param: isRotation ? (rotationAngleDeg * Math.PI) / 180 : undefined,
      })
    );
  };

  const handleGateClick = (id: string) => {
    setCircuit((c) => removeGate(c, id));
  };

  const handleClear = () => {
    setCircuit((c) => clearGates(c));
    setPendingControl(null);
  };

  const handleExample = (slug: string) => {
    const example = circuitExamples.find((e) => e.slug === slug);
    if (example) {
      setCircuit(example.build());
      setPendingControl(null);
    }
  };

  return (
    <ToolPageLayout
      title="Circuit Playground"
      path="/lab/circuit"
      seoDescription="Build a small quantum circuit gate by gate and inspect the resulting state."
      description={
        <p className="mt-2 text-small text-text-secondary">
          Pick a gate, click a wire to place it. For CNOT, click the control qubit first, then the
          target on the same column.
        </p>
      }
      panel={
        <>
          <div>
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Qubits</p>
            <Segmented>
              {Array.from({ length: MAX_QUBITS - MIN_QUBITS + 1 }, (_, i) => MIN_QUBITS + i).map(
                (n) => (
                  <SegmentedButton
                    key={n}
                    active={circuit.numQubits === n}
                    onClick={() => handleQubitCount(n)}
                  >
                    {n}
                  </SegmentedButton>
                )
              )}
            </Segmented>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Gate</p>
            <div className="flex flex-wrap gap-2">
              {GATE_INFO.map((info) => {
                const colors = CATEGORY_COLORS[info.category];
                const active = selectedGate === info.name;
                return (
                  <button
                    key={info.name}
                    onClick={() => {
                      setSelectedGate(info.name);
                      setPendingControl(null);
                    }}
                    className="rounded-panel px-3 py-2 text-small font-medium transition-colors duration-150"
                    style={{
                      backgroundColor: active ? colors.fill : "transparent",
                      color: active ? colors.text : "#94A3B8",
                      border: `1px solid ${active ? colors.fill : "#1E293B"}`,
                    }}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>

          {ROTATION_GATES.includes(selectedGate) && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="font-mono text-mono-label uppercase text-text-muted">Angle</label>
                <span className="readout font-mono text-small text-text-primary">
                  {rotationAngleDeg.toFixed(1)}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={0.1}
                value={rotationAngleDeg}
                onChange={(e) => setRotationAngleDeg(Number(e.target.value))}
                className="slider"
              />
            </div>
          )}

          <div className="mt-6">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Examples</p>
            <div className="flex flex-col gap-2">
              {circuitExamples.map((example) => (
                <button
                  key={example.slug}
                  onClick={() => handleExample(example.slug)}
                  className="rounded-md border border-border px-3 py-2 text-left text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleClear}
            className="mt-6 w-full rounded-md border border-border px-3 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
          >
            Clear Circuit
          </button>
        </>
      }
    >
      <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Circuit</p>
      <CircuitDiagram
        circuit={circuit}
        pendingControl={pendingControl}
        onCellClick={handleCellClick}
        onGateClick={handleGateClick}
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">
            Probability Distribution
          </p>
          <Histogram basisLabels={result.basisLabels} probabilities={result.probabilities} />
        </div>
        <div>
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Statevector</p>
          <AmplitudeTable
            basisLabels={result.basisLabels}
            statevector={result.statevector}
            probabilities={result.probabilities}
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
