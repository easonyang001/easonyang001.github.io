import { newGateId, type Circuit } from "./circuit.ts";

export interface CircuitExample {
  slug: string;
  name: string;
  build: () => Circuit;
}

export const circuitExamples: CircuitExample[] = [
  {
    slug: "superposition",
    name: "Superposition",
    build: () => ({
      numQubits: 1,
      gates: [{ id: newGateId(), name: "H", qubit: 0, column: 0 }],
    }),
  },
  {
    slug: "bell",
    name: "Bell",
    build: () => ({
      numQubits: 2,
      gates: [
        { id: newGateId(), name: "H", qubit: 0, column: 0 },
        { id: newGateId(), name: "CNOT", control: 0, qubit: 1, column: 1 },
      ],
    }),
  },
  {
    slug: "ghz",
    name: "GHZ",
    build: () => ({
      numQubits: 3,
      gates: [
        { id: newGateId(), name: "H", qubit: 0, column: 0 },
        { id: newGateId(), name: "CNOT", control: 0, qubit: 1, column: 1 },
        { id: newGateId(), name: "CNOT", control: 0, qubit: 2, column: 2 },
      ],
    }),
  },
];
