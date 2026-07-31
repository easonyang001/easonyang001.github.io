import type { CircuitGateName } from "./gates.ts";

export const MAX_QUBITS = 4;
export const MIN_QUBITS = 1;
export const NUM_COLUMNS = 8;

export interface PlacedGate {
  id: string;
  name: CircuitGateName;
  /** Target qubit (the acted-on line; for CNOT this is the ⊕). */
  qubit: number;
  /** Control qubit, CNOT only. */
  control?: number;
  /** Time-slot column, 0-based. */
  column: number;
  /** Rotation angle in radians, Rx/Ry/Rz only. */
  param?: number;
}

export interface Circuit {
  numQubits: number;
  gates: PlacedGate[];
}

let nextId = 0;
export function newGateId(): string {
  nextId += 1;
  return `g${nextId}`;
}

export function emptyCircuit(numQubits: number): Circuit {
  return { numQubits, gates: [] };
}

export function addGate(circuit: Circuit, gate: Omit<PlacedGate, "id">): Circuit {
  return { ...circuit, gates: [...circuit.gates, { ...gate, id: newGateId() }] };
}

export function removeGate(circuit: Circuit, id: string): Circuit {
  return { ...circuit, gates: circuit.gates.filter((g) => g.id !== id) };
}

export function clearGates(circuit: Circuit): Circuit {
  return { ...circuit, gates: [] };
}

/** Drops gates that no longer fit after a qubit-count change. */
export function resizeCircuit(circuit: Circuit, numQubits: number): Circuit {
  return {
    numQubits,
    gates: circuit.gates.filter(
      (g) => g.qubit < numQubits && (g.control === undefined || g.control < numQubits)
    ),
  };
}

/** The cells a gate occupies (CNOT spans control and target rows). */
export function occupiedCells(gate: PlacedGate): { column: number; qubit: number }[] {
  const cells = [{ column: gate.column, qubit: gate.qubit }];
  if (gate.control !== undefined) cells.push({ column: gate.column, qubit: gate.control });
  return cells;
}

export function gateAtCell(circuit: Circuit, column: number, qubit: number): PlacedGate | undefined {
  return circuit.gates.find((g) =>
    occupiedCells(g).some((c) => c.column === column && c.qubit === qubit)
  );
}
