import { newGateId, type Circuit, type PlacedGate } from "../quantum/circuit.ts";
import { encodingGates } from "./encoding.ts";

/** RY layer + CNOT entangler, repeated `layers` times. weights.length must equal layers * 2. */
export function ansatzGates(weights: number[], layers: number, startColumn: number): PlacedGate[] {
  const gates: PlacedGate[] = [];
  let column = startColumn;
  for (let l = 0; l < layers; l++) {
    gates.push({ id: newGateId(), name: "Ry", qubit: 0, column, param: weights[l * 2] });
    gates.push({ id: newGateId(), name: "Ry", qubit: 1, column, param: weights[l * 2 + 1] });
    column += 1;
    gates.push({ id: newGateId(), name: "CNOT", control: 0, qubit: 1, column });
    column += 1;
  }
  return gates;
}

export function buildVqcCircuit(x: [number, number], weights: number[], layers: number): Circuit {
  const encoding = encodingGates(x, 0);
  const ansatz = ansatzGates(weights, layers, 1);
  return { numQubits: 2, gates: [...encoding, ...ansatz] };
}
