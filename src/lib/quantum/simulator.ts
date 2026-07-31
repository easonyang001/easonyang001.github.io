import * as C from "./complex.ts";
import type { Complex } from "./types.ts";
import { singleGateMatrix, type Matrix2, type SingleGateName } from "./gates.ts";
import type { Circuit, PlacedGate } from "./circuit.ts";

export interface SimulationResult {
  statevector: Complex[];
  probabilities: number[];
  basisLabels: string[];
}

/** Qubit 0 is the top wire and the most significant bit of the basis label. */
function bitPosition(qubit: number, numQubits: number): number {
  return numQubits - 1 - qubit;
}

function applySingleQubit(state: Complex[], m: Matrix2, qubit: number, numQubits: number): Complex[] {
  const stride = 1 << bitPosition(qubit, numQubits);
  const next = state.slice();
  for (let i = 0; i < state.length; i++) {
    if ((i & stride) === 0) {
      const a = state[i];
      const b = state[i | stride];
      next[i] = C.add(C.mul(m[0][0], a), C.mul(m[0][1], b));
      next[i | stride] = C.add(C.mul(m[1][0], a), C.mul(m[1][1], b));
    }
  }
  return next;
}

function applyCnot(state: Complex[], control: number, target: number, numQubits: number): Complex[] {
  const controlStride = 1 << bitPosition(control, numQubits);
  const targetStride = 1 << bitPosition(target, numQubits);
  const next = state.slice();
  for (let i = 0; i < state.length; i++) {
    if ((i & controlStride) !== 0 && (i & targetStride) === 0) {
      next[i] = state[i | targetStride];
      next[i | targetStride] = state[i];
    }
  }
  return next;
}

function applyPlacedGate(state: Complex[], gate: PlacedGate, numQubits: number): Complex[] {
  if (gate.name === "CNOT") {
    if (gate.control === undefined) return state;
    return applyCnot(state, gate.control, gate.qubit, numQubits);
  }
  const matrix = singleGateMatrix(gate.name as SingleGateName, gate.param ?? 0);
  if (!matrix) return state; // M is a marker, not an operation
  return applySingleQubit(state, matrix, gate.qubit, numQubits);
}

export function simulate(circuit: Circuit): SimulationResult {
  const size = 1 << circuit.numQubits;
  let state: Complex[] = Array.from({ length: size }, (_, i) =>
    i === 0 ? { re: 1, im: 0 } : { re: 0, im: 0 }
  );

  const ordered = [...circuit.gates].sort((a, b) => a.column - b.column);
  for (const gate of ordered) {
    state = applyPlacedGate(state, gate, circuit.numQubits);
  }

  const probabilities = state.map((amp) => C.magnitudeSquared(amp));
  const basisLabels = Array.from({ length: size }, (_, i) =>
    i.toString(2).padStart(circuit.numQubits, "0")
  );

  return { statevector: state, probabilities, basisLabels };
}
