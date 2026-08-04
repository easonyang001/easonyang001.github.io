import { useMemo, useState } from "react";
import LabNarrative, { BLOCH_NARRATIVE } from "../../components/LabNarrative.tsx";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import BlochCanvas from "../../components/bloch/BlochCanvas.tsx";
import ControlPanel from "../../components/bloch/ControlPanel.tsx";
import {
  anglesToState,
  applySingleQubitGate,
  probabilityFromState,
  stateToAngles,
} from "../../lib/quantum/bloch.ts";
import { degToRad } from "../../lib/quantum/format.ts";
import type { GateName } from "../../lib/quantum/types.ts";

export default function BlochSpherePage() {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [rotationAngleDeg, setRotationAngleDeg] = useState(90);
  const [previousAngles, setPreviousAngles] = useState<{ theta: number; phi: number } | null>(null);
  const [gateRevision, setGateRevision] = useState(0);

  const state = useMemo(() => anglesToState({ theta, phi }), [theta, phi]);
  const probabilities = useMemo(() => probabilityFromState(state), [state]);
  const narrativeCtx = { theta, phi, p0: probabilities.p0, p1: probabilities.p1 };

  const handleAnglesChange = (nextTheta: number, nextPhi: number) => {
    setPreviousAngles({ theta, phi });
    setTheta(nextTheta);
    setPhi(nextPhi);
  };

  const handlePreset = (presetTheta: number, presetPhi: number) => {
    setPreviousAngles({ theta, phi });
    setTheta(presetTheta);
    setPhi(presetPhi);
  };

  const handleGate = (gate: GateName) => {
    setPreviousAngles({ theta, phi });
    const isRotation = gate === "Rx" || gate === "Ry" || gate === "Rz";
    const nextState = applySingleQubitGate(state, gate, isRotation ? degToRad(rotationAngleDeg) : 0);
    const angles = stateToAngles(nextState);
    setTheta(angles.theta);
    setPhi(angles.phi);
    setGateRevision((value) => value + 1);
  };

  return (
    <ToolPageLayout
      title="Bloch Sphere"
      path="/lab/bloch-sphere"
      seoDescription="Rotate a single qubit on the Bloch sphere with Rx, Ry, and Rz gates and see the resulting state and measurement probabilities."
      description={
        <p className="mt-2 text-small text-text-secondary">
          Rx, Ry, and Rz apply the rotation angle set in the panel below.
        </p>
      }
      panel={
        <ControlPanel
          theta={theta}
          phi={phi}
          state={state}
          probabilities={probabilities}
          rotationAngleDeg={rotationAngleDeg}
          onAnglesChange={handleAnglesChange}
          onPreset={handlePreset}
          onGate={handleGate}
          onRotationAngleChange={setRotationAngleDeg}
        />
      }
    >
      <LabNarrative config={BLOCH_NARRATIVE} ctx={narrativeCtx}>
        <div
          data-lab-visual="bloch-sphere"
          className="h-[50vh] w-full min-w-0 overflow-hidden rounded-lg border border-border bg-background lg:h-[560px]"
        >
          <BlochCanvas
            theta={theta}
            phi={phi}
            previousTheta={previousAngles?.theta}
            previousPhi={previousAngles?.phi}
            gateRevision={gateRevision}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3" aria-live="polite">
          <span className="font-mono text-mono-label uppercase text-text-muted">{"Target |1> angular error"}</span>
          <span className="readout font-mono text-small text-text-primary">{Math.abs(Math.PI - theta).toFixed(3)} rad</span>
        </div>
      </LabNarrative>
    </ToolPageLayout>
  );
}
