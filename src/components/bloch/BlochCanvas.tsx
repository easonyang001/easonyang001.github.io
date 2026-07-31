import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";

const BORDER_COLOR = "#1E293B";
const ACCENT_COLOR = "#8B5CF6";
const AXIS_EXTENT = 1.3;
const LABEL_EXTENT = 1.45;

interface BlochCanvasProps {
  theta: number;
  phi: number;
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

export default function BlochCanvas({ theta, phi }: BlochCanvasProps) {
  return (
    <Canvas camera={{ position: [2.2, 1.6, 2.2], fov: 40 }}>
      <WireframeSphere />
      <Axes />
      <StateVector theta={theta} phi={phi} />
      <OrbitControls enableDamping={false} />
    </Canvas>
  );
}
