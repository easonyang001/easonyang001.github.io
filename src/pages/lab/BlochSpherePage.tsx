import { useMemo, useState } from "react";
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

  const state = useMemo(() => anglesToState({ theta, phi }), [theta, phi]);
  const probabilities = useMemo(() => probabilityFromState(state), [state]);

  const handleAnglesChange = (nextTheta: number, nextPhi: number) => {
    setTheta(nextTheta);
    setPhi(nextPhi);
  };

  const handlePreset = (presetTheta: number, presetPhi: number) => {
    setTheta(presetTheta);
    setPhi(presetPhi);
  };

  const handleGate = (gate: GateName) => {
    const isRotation = gate === "Rx" || gate === "Ry" || gate === "Rz";
    const nextState = applySingleQubitGate(state, gate, isRotation ? degToRad(rotationAngleDeg) : 0);
    const angles = stateToAngles(nextState);
    setTheta(angles.theta);
    setPhi(angles.phi);
  };

  return (
    <ToolPageLayout
      eyebrow="Lab"
      title="Bloch Sphere"
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
      <div className="h-[50vh] w-full min-w-0 overflow-hidden rounded-lg border border-border bg-background lg:h-[560px]">
        <BlochCanvas theta={theta} phi={phi} />
      </div>
    </ToolPageLayout>
  );
}
