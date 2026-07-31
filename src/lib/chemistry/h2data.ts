import type { MolecularHamiltonian } from "./types.ts";

const BOHR_PER_ANGSTROM = 1.8897259886;

/**
 * Self-constructed approximate H2 coefficient model — NOT reproduced from a
 * published ab initio table. No verified source for the literature digits
 * was available in this environment, and guessing digit-for-digit values
 * while citing a real paper would misattribute invented numbers, so this
 * builds a physically-motivated smooth model instead: g0 carries the exact
 * classical nuclear repulsion 1/R (Hartree, R in Bohr) plus a constant
 * electronic offset; g4=g5 model an exchange/bonding term that decays
 * exponentially with separation. The free constants below are calibrated
 * (see the model's minimum) so the exact 2x2 ground-state energy matches
 * the well-established H2/STO-3G equilibrium value of about -1.137 Hartree
 * at R = 0.735 A — that reference value is a standard, widely-reproduced
 * quantum chemistry fact, not from any single paper being cited here.
 */
const EXCHANGE_AMPLITUDE = 0.9577313836568347;
const EXCHANGE_DECAY_LENGTH_BOHR = 1.5;
const ELECTRONIC_OFFSET = -1.0731941939123484;

export const H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM = 0.735;
export const H2_EQUILIBRIUM_ENERGY_HARTREE = -1.137;

export function h2Hamiltonian(bondLengthAngstrom: number): MolecularHamiltonian {
  const r = Math.max(bondLengthAngstrom, 1e-6) * BOHR_PER_ANGSTROM;
  const g0 = 1 / r + ELECTRONIC_OFFSET;
  const g1 = -0.5 - 0.2 * Math.exp(-r);
  const g2 = g1;
  const g3 = 0.05 * Math.exp(-r / 2);
  const g4 = -EXCHANGE_AMPLITUDE * Math.exp(-r / EXCHANGE_DECAY_LENGTH_BOHR);
  const g5 = g4;
  return { bondLength: bondLengthAngstrom, g0, g1, g2, g3, g4, g5 };
}
