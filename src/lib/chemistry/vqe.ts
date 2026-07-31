import type { Complex } from "../quantum/types.ts";
import { expectationValue } from "./hamiltonian.ts";
import type { MolecularHamiltonian } from "./types.ts";

/** |psi(theta)> = exp(-i*theta*Y0X1/2)|01>, confined to the {|01>,|10>} subspace. */
export function ansatzState(theta: number): Complex[] {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return [
    { re: 0, im: 0 },
    { re: c, im: 0 },
    { re: s, im: 0 },
    { re: 0, im: 0 },
  ];
}

export function energyAtTheta(h: MolecularHamiltonian, theta: number): number {
  return expectationValue(h, ansatzState(theta)).re;
}

/**
 * Closed-form energy and analytic gradient. Because the ansatz stays inside
 * the real symmetric {|01>,|10>} block, E(theta) = A + B*cos(theta) +
 * C*sin(theta) exactly — no finite-difference approximation needed.
 */
export function analyticEnergyAndGradient(
  h: MolecularHamiltonian,
  theta: number
): { energy: number; gradient: number } {
  const H22 = h.g0 + h.g1 - h.g2 - h.g3;
  const H33 = h.g0 - h.g1 + h.g2 - h.g3;
  const H23 = h.g4 + h.g5;
  const A = (H22 + H33) / 2;
  const B = (H22 - H33) / 2;

  const energy = A + B * Math.cos(theta) + H23 * Math.sin(theta);
  const gradient = -B * Math.sin(theta) + H23 * Math.cos(theta);
  return { energy, gradient };
}

export function scanEnergyCurve(h: MolecularHamiltonian, steps = 200): { theta: number; energy: number }[] {
  const points: { theta: number; energy: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    points.push({ theta, energy: analyticEnergyAndGradient(h, theta).energy });
  }
  return points;
}

export interface VqeResult {
  theta: number;
  energy: number;
  history: number[];
}

/** Gradient descent using the exact analytic gradient, from theta0. */
export function optimizeVQE(
  h: MolecularHamiltonian,
  theta0 = 0,
  learningRate = 0.3,
  iterations = 100
): VqeResult {
  let theta = theta0;
  const history: number[] = [analyticEnergyAndGradient(h, theta).energy];
  for (let i = 0; i < iterations; i++) {
    const { gradient } = analyticEnergyAndGradient(h, theta);
    theta -= learningRate * gradient;
    history.push(analyticEnergyAndGradient(h, theta).energy);
  }
  return { theta, energy: analyticEnergyAndGradient(h, theta).energy, history };
}
