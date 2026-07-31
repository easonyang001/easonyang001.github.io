export type PauliOp = "I" | "X" | "Y" | "Z";

export interface PauliTerm {
  coefficient: number;
  op0: PauliOp;
  op1: PauliOp;
}

/** H = g0 I + g1 Z0 + g2 Z1 + g3 Z0Z1 + g4 X0X1 + g5 Y0Y1, in Hartree. */
export interface MolecularHamiltonian {
  bondLength: number; // Angstrom
  g0: number;
  g1: number;
  g2: number;
  g3: number;
  g4: number;
  g5: number;
}
