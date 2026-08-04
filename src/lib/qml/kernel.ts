import { DATASETS } from "./datasets.ts";
import type { Dataset } from "./types.ts";

export type KernelKind = "rbf" | "quantum";

export interface KernelDatasetInfo {
  slug: string;
  name: string;
  generate: () => Dataset;
}

export const KERNEL_DATASETS: KernelDatasetInfo[] = DATASETS.map((dataset) => ({
  slug: dataset.slug,
  name: dataset.name,
  generate: dataset.generate,
}));

export function rbfKernel(a: [number, number], b: [number, number], gamma: number): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.exp(-gamma * (dx * dx + dy * dy));
}

export function quantumFeatureVector(x: [number, number], depth: number): number[] {
  const features: number[] = [];
  for (let layer = 1; layer <= depth; layer++) {
    features.push(Math.cos(layer * x[0]));
    features.push(Math.sin(layer * x[0]));
    features.push(Math.cos(layer * x[1]));
    features.push(Math.sin(layer * x[1]));
    features.push(Math.cos(layer * (x[0] - x[1])));
    features.push(Math.sin(layer * (x[0] + x[1])));
  }
  const norm = Math.sqrt(features.reduce((sum, value) => sum + value * value, 0));
  return features.map((value) => value / norm);
}

export function quantumKernel(a: [number, number], b: [number, number], depth: number): number {
  const fa = quantumFeatureVector(a, depth);
  const fb = quantumFeatureVector(b, depth);
  const overlap = fa.reduce((sum, value, index) => sum + value * fb[index], 0);
  return overlap * overlap;
}

export function kernelValue(
  kind: KernelKind,
  a: [number, number],
  b: [number, number],
  options: { gamma: number; depth: number }
): number {
  return kind === "rbf"
    ? rbfKernel(a, b, options.gamma)
    : quantumKernel(a, b, options.depth);
}

export function kernelMatrix(
  dataset: Dataset,
  kind: KernelKind,
  options: { gamma: number; depth: number }
): number[][] {
  return dataset.map((a) => dataset.map((b) => kernelValue(kind, a.x, b.x, options)));
}

export function kernelAlignment(matrix: number[][], dataset: Dataset): number {
  let numerator = 0;
  let kernelNorm = 0;
  let labelNorm = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      const yi = dataset[i].label === 1 ? 1 : -1;
      const yj = dataset[j].label === 1 ? 1 : -1;
      const target = yi * yj;
      numerator += matrix[i][j] * target;
      kernelNorm += matrix[i][j] * matrix[i][j];
      labelNorm += target * target;
    }
  }
  return numerator / Math.sqrt(kernelNorm * labelNorm);
}
