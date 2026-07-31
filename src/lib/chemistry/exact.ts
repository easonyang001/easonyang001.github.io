import type { MolecularHamiltonian } from "./types.ts";

/**
 * Direct diagonalization of the {|01>, |10>} 2x2 block — the subspace the
 * single-parameter ansatz lives in. This is the "exact" reference the VQE
 * result is checked against.
 */
export function exactDiagonalize(h: MolecularHamiltonian): { groundEnergy: number; excitedEnergy: number } {
  const H22 = h.g0 + h.g1 - h.g2 - h.g3;
  const H33 = h.g0 - h.g1 + h.g2 - h.g3;
  const H23 = h.g4 + h.g5;

  const avg = (H22 + H33) / 2;
  const diff = (H22 - H33) / 2;
  const delta = Math.sqrt(diff * diff + H23 * H23);

  return { groundEnergy: avg - delta, excitedEnergy: avg + delta };
}
