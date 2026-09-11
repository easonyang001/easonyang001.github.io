import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

const BORDER_COLOR = "#1E293B";
const ACCENT_COLOR = "#8B5CF6";
const AXIS_EXTENT = 1.3;
const LABEL_EXTENT = 1.45;

interface GateAxisAngle {
  axis: [number, number, number];
  angle: number;
}

interface BlochCanvasProps {
  theta: number;
  phi: number;
  previousTheta?: number;
  previousPhi?: number;
  gateRevision?: number;
  lastGate?: GateAxisAngle | null;
}

/** Maps quantum (theta, phi) to a three.js coordinate with the |0>/|1> axis pointing up. */
function blochToThree(theta: number, phi: number): [number, number, number] {
  return [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
}

function AxisLabel({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <Html position={position} center>
      <span className="font-mono text-mono-label uppercase text-text-muted">{label}</span>
    </Html>
  );
}

function Axes() {
  return (
    <>
      <Line
        points={[
          [-AXIS_EXTENT, 0, 0],
          [AXIS_EXTENT, 0, 0],
        ]}
        color={BORDER_COLOR}
        lineWidth={1}
      />
      <Line
        points={[
          [0, -AXIS_EXTENT, 0],
          [0, AXIS_EXTENT, 0],
        ]}
        color={BORDER_COLOR}
        lineWidth={1}
      />
      <Line
        points={[
          [0, 0, -AXIS_EXTENT],
          [0, 0, AXIS_EXTENT],
        ]}
        color={BORDER_COLOR}
        lineWidth={1}
      />
      <AxisLabel position={[LABEL_EXTENT, 0, 0]} label="X" />
      <AxisLabel position={[0, LABEL_EXTENT, 0]} label="Z" />
      <AxisLabel position={[0, 0, LABEL_EXTENT]} label="Y" />
    </>
  );
}

function WireframeSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 24, 16]} />
      <meshBasicMaterial color={BORDER_COLOR} wireframe />
    </mesh>
  );
}

function StateVector({ theta, phi }: BlochCanvasProps) {
  const { tip, coneCenter, quaternion } = useMemo(() => {
    const t = blochToThree(theta, phi);
    const dir = new THREE.Vector3(...t).normalize();
    const coneHeight = 0.12;
    const center = new THREE.Vector3(...t).addScaledVector(dir, -coneHeight / 2);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { tip: t, coneCenter: center.toArray() as [number, number, number], quaternion: quat };
  }, [theta, phi]);

  return (
    <group>
      <Line points={[[0, 0, 0], tip]} color={ACCENT_COLOR} lineWidth={2} />
      <mesh position={coneCenter} quaternion={quaternion}>
        <coneGeometry args={[0.045, 0.12, 12]} />
        <meshBasicMaterial color={ACCENT_COLOR} />
      </mesh>
    </group>
  );
}

function TargetMarker() {
  return (
    <group position={[0, -1, 0]}>
      <mesh>
        <sphereGeometry args={[0.055, 16, 12]} />
        <meshBasicMaterial color="#FCFDBF" />
      </mesh>
      <AxisLabel position={[0.16, -0.05, 0]} label="Target |1>" />
    </group>
  );
}

function GhostVector({ theta, phi }: { theta: number; phi: number }) {
  const tip = useMemo(() => blochToThree(theta, phi), [theta, phi]);
  return <Line points={[[0, 0, 0], tip]} color="#94A3B8" lineWidth={1.5} transparent opacity={0.45} dashed dashSize={0.05} gapSize={0.04} />;
}

/**
 * Traces the actual physical path a gate sweeps on the sphere, rather than the shortest
 * path between the before/after points -- important because for a generic starting state
 * those are different curves. A gate's Bloch-space rotation is by `angle` about physical
 * axis `axis` (right-hand rule); the physical->three.js axis remap ((x,y,z) -> (x,z,y))
 * flips handedness, so the equivalent three.js-space rotation is by `-angle` about the
 * same-remapped axis. See gateAxisAngle in lib/quantum/bloch.ts for the per-gate values.
 */
function gateArcPoints(fromTheta: number, fromPhi: number, axis: [number, number, number], angle: number): [number, number, number][] {
  const start = new THREE.Vector3(...blochToThree(fromTheta, fromPhi));
  const threeAxis = new THREE.Vector3(axis[0], axis[2], axis[1]).normalize();
  const steps = 32;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    return start.clone().applyAxisAngle(threeAxis, -angle * t).multiplyScalar(1.03).toArray();
  });
}

function RotationArc({
  fromTheta,
  fromPhi,
  axis,
  angle,
  revision,
}: {
  fromTheta: number;
  fromPhi: number;
  axis: [number, number, number];
  angle: number;
  revision: number;
}) {
  const lineRef = useRef<Line2 | LineSegments2>(null);
  const elapsed = useRef(0);
  const points = useMemo(
    () => gateArcPoints(fromTheta, fromPhi, axis, angle),
    [fromTheta, fromPhi, axis, angle]
  );

  useEffect(() => {
    elapsed.current = 0;
  }, [revision]);

  useFrame((_state, delta) => {
    elapsed.current += delta;
    const material = lineRef.current?.material as (THREE.Material & { dashOffset?: number }) | undefined;
    if (!material) return;
    material.opacity = Math.max(0.18, 0.9 - elapsed.current * 0.2);
    if (typeof material.dashOffset === "number") material.dashOffset -= delta * 0.45;
  });

  return (
    <Line ref={lineRef} points={points} color="#D946EF" lineWidth={2} transparent opacity={0.9} dashed dashSize={0.06} gapSize={0.035} />
  );
}

export default function BlochCanvas({ theta, phi, previousTheta, previousPhi, gateRevision = 0, lastGate }: BlochCanvasProps) {
  return (
    <Canvas camera={{ position: [2.2, 1.6, 2.2], fov: 40 }}>
      <WireframeSphere />
      <Axes />
      <TargetMarker />
      {previousTheta !== undefined && previousPhi !== undefined && (
        <>
          <GhostVector theta={previousTheta} phi={previousPhi} />
          {gateRevision > 0 && lastGate && (
            <RotationArc
              fromTheta={previousTheta}
              fromPhi={previousPhi}
              axis={lastGate.axis}
              angle={lastGate.angle}
              revision={gateRevision}
            />
          )}
        </>
      )}
      <StateVector theta={theta} phi={phi} />
      <OrbitControls enableDamping={false} enableZoom={false} />
    </Canvas>
  );
}
