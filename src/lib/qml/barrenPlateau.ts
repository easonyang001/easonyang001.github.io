import { seededRandom } from "../optimization/annealing.ts";

export type CostScope = "local" | "global";

export interface GradientVariancePoint {
  qubits: number;
  variance: number;
}

export interface GradientSample {
  index: number;
  value: number;
}

function gaussian(random: () => number): number {
  const u1 = Math.max(random(), 1e-9);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function expectedGradientVariance(qubits: number, depth: number, scope: CostScope): number {
  const widthScale = scope === "global" ? Math.pow(0.5, qubits) : 1 / Math.max(1, qubits);
  const depthScale = Math.exp(-0.12 * depth);
  return widthScale * depthScale;
}

export function sampleGradients({
  qubits,
  depth,
  scope,
  samples,
  seed,
}: {
  qubits: number;
  depth: number;
  scope: CostScope;
  samples: number;
  seed: number;
}): GradientSample[] {
  const random = seededRandom(seed);
  const std = Math.sqrt(expectedGradientVariance(qubits, depth, scope));
  return Array.from({ length: samples }, (_item, index) => ({
    index,
    value: gaussian(random) * std,
  }));
}

export function varianceTrend({
  maxQubits,
  depth,
  scope,
}: {
  maxQubits: number;
  depth: number;
  scope: CostScope;
}): GradientVariancePoint[] {
  return Array.from({ length: maxQubits }, (_item, index) => {
    const qubits = index + 1;
    return { qubits, variance: expectedGradientVariance(qubits, depth, scope) };
  });
}
