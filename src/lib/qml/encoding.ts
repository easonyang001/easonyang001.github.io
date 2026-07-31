import { newGateId, type PlacedGate } from "../quantum/circuit.ts";

/** Angle encoding: x -> RY(pi*x0) on qubit 0, RY(pi*x1) on qubit 1. */
export function encodingGates(x: [number, number], column: number): PlacedGate[] {
  return [
    { id: newGateId(), name: "Ry", qubit: 0, column, param: Math.PI * x[0] },
    { id: newGateId(), name: "Ry", qubit: 1, column, param: Math.PI * x[1] },
  ];
}

/** Inverts angle encoding: recovers x from the two RY angles (for round-trip tests). */
export function decodeAngles(gates: PlacedGate[]): [number, number] {
  const q0 = gates.find((g) => g.qubit === 0 && g.name === "Ry");
  const q1 = gates.find((g) => g.qubit === 1 && g.name === "Ry");
  return [(q0?.param ?? 0) / Math.PI, (q1?.param ?? 0) / Math.PI];
}
