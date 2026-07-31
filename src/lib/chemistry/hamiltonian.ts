import type { Complex } from "../quantum/types.ts";
import type { MolecularHamiltonian, PauliTerm } from "./types.ts";

export function hamiltonianTerms(h: MolecularHamiltonian): PauliTerm[] {
  return [
    { coefficient: h.g0, op0: "I", op1: "I" },
    { coefficient: h.g1, op0: "Z", op1: "I" },
    { coefficient: h.g2, op0: "I", op1: "Z" },
    { coefficient: h.g3, op0: "Z", op1: "Z" },
    { coefficient: h.g4, op0: "X", op1: "X" },
    { coefficient: h.g5, op0: "Y", op1: "Y" },
  ];
}

/** 4x4 matrix in the |00>,|01>,|10>,|11> basis (qubit 0 is the MSB). */
export function hamiltonianMatrix(h: MolecularHamiltonian): Complex[][] {
  const { g0, g1, g2, g3, g4, g5 } = h;
  const zero: Complex = { re: 0, im: 0 };
  const H11: Complex = { re: g0 + g1 + g2 + g3, im: 0 };
  const H22: Complex = { re: g0 + g1 - g2 - g3, im: 0 };
  const H33: Complex = { re: g0 - g1 + g2 - g3, im: 0 };
  const H44: Complex = { re: g0 - g1 - g2 + g3, im: 0 };
  const H14: Complex = { re: g4 - g5, im: 0 };
  const H23: Complex = { re: g4 + g5, im: 0 };
  return [
    [H11, zero, zero, H14],
    [zero, H22, H23, zero],
    [zero, H23, H33, zero],
    [H14, zero, zero, H44],
  ];
}

/** <psi|H|psi> for a 4-dimensional statevector. */
export function expectationValue(h: MolecularHamiltonian, state: Complex[]): Complex {
  const matrix = hamiltonianMatrix(h);
  let re = 0;
  let im = 0;
  for (let i = 0; i < 4; i++) {
    let hRe = 0;
    let hIm = 0;
    for (let j = 0; j < 4; j++) {
      hRe += matrix[i][j].re * state[j].re - matrix[i][j].im * state[j].im;
      hIm += matrix[i][j].re * state[j].im + matrix[i][j].im * state[j].re;
    }
    re += state[i].re * hRe + state[i].im * hIm;
    im += state[i].re * hIm - state[i].im * hRe;
  }
  return { re, im };
}
