import * as C from "./complex.ts";
import type { Complex } from "./types.ts";

export type SingleGateName = "H" | "X" | "Y" | "Z" | "S" | "T" | "Rx" | "Ry" | "Rz" | "M";
export type CircuitGateName = SingleGateName | "CNOT";

export type Matrix2 = [[Complex, Complex], [Complex, Complex]];

const SQRT1_2 = Math.SQRT1_2;

/** 2x2 matrix for a single-qubit gate. M has no matrix (marker only). */
export function singleGateMatrix(name: SingleGateName, param = 0): Matrix2 | null {
  switch (name) {
    case "H":
      return [
        [{ re: SQRT1_2, im: 0 }, { re: SQRT1_2, im: 0 }],
        [{ re: SQRT1_2, im: 0 }, { re: -SQRT1_2, im: 0 }],
      ];
    case "X":
      return [
        [C.ZERO, C.ONE],
        [C.ONE, C.ZERO],
      ];
    case "Y":
      return [
        [C.ZERO, { re: 0, im: -1 }],
        [{ re: 0, im: 1 }, C.ZERO],
      ];
    case "Z":
      return [
        [C.ONE, C.ZERO],
        [C.ZERO, { re: -1, im: 0 }],
      ];
    case "S":
      return [
        [C.ONE, C.ZERO],
        [C.ZERO, { re: 0, im: 1 }],
      ];
    case "T":
      return [
        [C.ONE, C.ZERO],
        [C.ZERO, C.expI(Math.PI / 4)],
      ];
    case "Rx": {
      const c: Complex = { re: Math.cos(param / 2), im: 0 };
      const s: Complex = { re: 0, im: -Math.sin(param / 2) };
      return [
        [c, s],
        [s, c],
      ];
    }
    case "Ry": {
      const c: Complex = { re: Math.cos(param / 2), im: 0 };
      const s = Math.sin(param / 2);
      return [
        [c, { re: -s, im: 0 }],
        [{ re: s, im: 0 }, c],
      ];
    }
    case "Rz":
      return [
        [C.expI(-param / 2), C.ZERO],
        [C.ZERO, C.expI(param / 2)],
      ];
    case "M":
      return null;
  }
}

export type GateCategory = "pauli" | "hadamard" | "phase" | "rotation" | "control";

export interface GateInfo {
  name: CircuitGateName;
  category: GateCategory;
}

export const GATE_INFO: GateInfo[] = [
  { name: "H", category: "hadamard" },
  { name: "X", category: "pauli" },
  { name: "Y", category: "pauli" },
  { name: "Z", category: "pauli" },
  { name: "S", category: "phase" },
  { name: "T", category: "phase" },
  { name: "Rx", category: "rotation" },
  { name: "Ry", category: "rotation" },
  { name: "Rz", category: "rotation" },
  { name: "CNOT", category: "control" },
  { name: "M", category: "control" },
];

/** Category colors sampled from the magma scale (5 max), with legible text per swatch. */
export const CATEGORY_COLORS: Record<GateCategory, { fill: string; text: string }> = {
  pauli: { fill: "#3B0F70", text: "#F8FAFC" },
  hadamard: { fill: "#8C2981", text: "#F8FAFC" },
  phase: { fill: "#DE4968", text: "#F8FAFC" },
  rotation: { fill: "#FE9F6D", text: "#020617" },
  control: { fill: "#FCFDBF", text: "#020617" },
};

export function gateCategory(name: CircuitGateName): GateCategory {
  const info = GATE_INFO.find((g) => g.name === name);
  return info ? info.category : "pauli";
}
