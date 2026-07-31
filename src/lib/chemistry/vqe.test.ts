import { describe, it, expect } from "vitest";
import { h2Hamiltonian, H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM } from "./h2data.ts";
import { hamiltonianMatrix, expectationValue } from "./hamiltonian.ts";
import { exactDiagonalize } from "./exact.ts";
import { optimizeVQE, ansatzState, analyticEnergyAndGradient } from "./vqe.ts";

describe("H2 Hamiltonian", () => {
  it("is Hermitian at every bond length", () => {
    for (let r = 0.3; r <= 2.5; r += 0.2) {
      const matrix = hamiltonianMatrix(h2Hamiltonian(r));
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(matrix[i][j].re).toBeCloseTo(matrix[j][i].re, 12);
          expect(matrix[i][j].im).toBeCloseTo(-matrix[j][i].im, 12);
        }
      }
    }
  });

  it("gives a real expectation value (imaginary part < 1e-12)", () => {
    const h = h2Hamiltonian(H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM);
    for (const theta of [0, 0.3, 1.1, 2.4, 4.7, 6.0]) {
      const { im } = expectationValue(h, ansatzState(theta));
      expect(Math.abs(im)).toBeLessThan(1e-12);
    }
  });
});

describe("VQE vs exact diagonalization", () => {
  it("matches the exact ground energy within 1e-6 Hartree at equilibrium", () => {
    const h = h2Hamiltonian(H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM);
    const exact = exactDiagonalize(h);
    const vqe = optimizeVQE(h, 0.1, 0.3, 300);
    expect(Math.abs(vqe.energy - exact.groundEnergy)).toBeLessThan(1e-6);
  });

  it("converges to the exact ground energy across the full bond-length scan", () => {
    for (let r = 0.3; r <= 2.5; r += 0.1) {
      const h = h2Hamiltonian(r);
      const exact = exactDiagonalize(h);
      const vqe = optimizeVQE(h, 0.1, 0.3, 300);
      expect(Math.abs(vqe.energy - exact.groundEnergy)).toBeLessThan(1e-6);
    }
  });

  it("analytic gradient matches finite differences", () => {
    const h = h2Hamiltonian(1.0);
    const eps = 1e-6;
    for (const theta of [0.2, 1.5, 3.1, 5.0]) {
      const { gradient } = analyticEnergyAndGradient(h, theta);
      const ePlus = analyticEnergyAndGradient(h, theta + eps).energy;
      const eMinus = analyticEnergyAndGradient(h, theta - eps).energy;
      const numeric = (ePlus - eMinus) / (2 * eps);
      expect(Math.abs(gradient - numeric)).toBeLessThan(1e-5);
    }
  });
});

describe("equilibrium reference", () => {
  it("has minimum energy at the calibrated equilibrium bond length", () => {
    let bestR = 0.3;
    let bestE = Infinity;
    for (let r = 0.3; r <= 2.5; r += 0.01) {
      const e = exactDiagonalize(h2Hamiltonian(r)).groundEnergy;
      if (e < bestE) {
        bestE = e;
        bestR = r;
      }
    }
    expect(bestR).toBeCloseTo(H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM, 1);
    expect(bestE).toBeCloseTo(-1.137, 2);
  });
});
