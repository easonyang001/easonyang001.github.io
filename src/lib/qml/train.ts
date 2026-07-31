import { parameterShiftGradient } from "./gradient.ts";
import { datasetLoss, datasetAccuracy } from "./cost.ts";
import type { Dataset, TrainingState } from "./types.ts";

/** Deterministic PRNG (mulberry32) — same seed always produces the same sequence. */
export function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function initWeights(layers: number, seed: number): number[] {
  const rand = seededRandom(seed);
  return Array.from({ length: layers * 2 }, () => (rand() * 2 - 1) * Math.PI);
}

export function trainStep(
  dataset: Dataset,
  weights: number[],
  layers: number,
  learningRate: number
): number[] {
  const grad = parameterShiftGradient(dataset, weights, layers);
  return weights.map((w, i) => w - learningRate * grad[i]);
}

export function evaluate(
  dataset: Dataset,
  weights: number[],
  layers: number,
  epoch: number,
  lossHistory: number[]
): TrainingState {
  const loss = datasetLoss(dataset, weights, layers);
  const accuracy = datasetAccuracy(dataset, weights, layers);
  return { epoch, loss, accuracy, weights, lossHistory: [...lossHistory, loss] };
}
