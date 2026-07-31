import type { GateName, Qubit1State } from "../../lib/quantum/types.ts";
import { formatAngleDegrees, formatComplex, formatProbability, radToDeg, degToRad } from "../../lib/quantum/format.ts";
import { Segmented, SegmentedButton } from "../Segmented.tsx";

interface Preset {
  label: string;
  theta: number;
  phi: number;
}

const PRESETS: Preset[] = [
  { label: "|0⟩", theta: 0, phi: 0 },
  { label: "|1⟩", theta: Math.PI, phi: 0 },
  { label: "|+⟩", theta: Math.PI / 2, phi: 0 },
  { label: "|−⟩", theta: Math.PI / 2, phi: Math.PI },
  { label: "|+i⟩", theta: Math.PI / 2, phi: Math.PI / 2 },
  { label: "|−i⟩", theta: Math.PI / 2, phi: (3 * Math.PI) / 2 },
];

const GATES: GateName[] = ["X", "Y", "Z", "H", "Rx", "Ry", "Rz"];

function ReadoutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="font-mono text-mono-label uppercase text-text-muted">{label}</span>
      <span className="readout font-mono text-small text-text-primary">{value}</span>
    </div>
  );
}

interface ControlPanelProps {
  theta: number;
  phi: number;
  state: Qubit1State;
  probabilities: { p0: number; p1: number };
  rotationAngleDeg: number;
  onAnglesChange: (theta: number, phi: number) => void;
  onPreset: (theta: number, phi: number) => void;
  onGate: (gate: GateName) => void;
  onRotationAngleChange: (degrees: number) => void;
}

const ROTATION_GATES: GateName[] = ["Rx", "Ry", "Rz"];

export default function ControlPanel({
  theta,
  phi,
  state,
  probabilities,
  rotationAngleDeg,
  onAnglesChange,
  onPreset,
  onGate,
  onRotationAngleChange,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">State</p>
        <Segmented>
          {PRESETS.map((preset) => (
            <SegmentedButton key={preset.label} onClick={() => onPreset(preset.theta, preset.phi)}>
              {preset.label}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-mono text-mono-label uppercase text-text-muted">Theta</label>
            <span className="readout font-mono text-small text-text-primary">
              {formatAngleDegrees(theta)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={180}
            step={0.1}
            value={radToDeg(theta)}
            onChange={(e) => onAnglesChange(degToRad(Number(e.target.value)), phi)}
            className="slider"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-mono text-mono-label uppercase text-text-muted">Phi</label>
            <span className="readout font-mono text-small text-text-primary">
              {formatAngleDegrees(phi)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={0.1}
            value={radToDeg(phi)}
            onChange={(e) => onAnglesChange(theta, degToRad(Number(e.target.value)))}
            className="slider"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Gate</p>
        <div className="flex flex-col gap-2">
          <Segmented>
            {GATES.slice(0, 4).map((gate) => (
              <SegmentedButton key={gate} onClick={() => onGate(gate)}>
                {gate}
              </SegmentedButton>
            ))}
          </Segmented>
          <Segmented>
            {GATES.slice(4).map((gate) => (
              <SegmentedButton key={gate} onClick={() => onGate(gate)}>
                {gate}
              </SegmentedButton>
            ))}
          </Segmented>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="font-mono text-mono-label uppercase text-text-muted">
              Rotation Angle ({ROTATION_GATES.join(", ")})
            </label>
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
            onChange={(e) => onRotationAngleChange(Number(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <div className="mt-auto rounded-panel border border-panel-border divide-y divide-panel-divider">
        <ReadoutRow label="Alpha" value={formatComplex(state.alpha)} />
        <ReadoutRow label="Beta" value={formatComplex(state.beta)} />
        <ReadoutRow label="Theta" value={formatAngleDegrees(theta)} />
        <ReadoutRow label="Phi" value={formatAngleDegrees(phi)} />
        <ReadoutRow label="P(0)" value={formatProbability(probabilities.p0)} />
        <ReadoutRow label="P(1)" value={formatProbability(probabilities.p1)} />
      </div>
    </div>
  );
}
