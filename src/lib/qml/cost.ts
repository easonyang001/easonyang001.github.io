import { simulate } from "../quantum/simulator.ts";
import { buildVqcCircuit } from "./ansatz.ts";
import type { Dataset } from "./types.ts";

const EPS = 1e-9;

/** Prediction = P(qubit 0 measures |1>), read from the top wire (MSB of the basis label). */
export function predict(x: [number, number], weights: number[], layers: number): number {
  const circuit = buildVqcCircuit(x, weights, layers);
  const { probabilities, basisLabels } = simulate(circuit);
  let p1 = 0;
  for (let i = 0; i < basisLabels.length; i++) {
    if (basisLabels[i][0] === "1") p1 += probabilities[i];
  }
  return p1;
}

export function clipProbability(p: number): number {
  return Math.min(1 - EPS, Math.max(EPS, p));
}

export function binaryCrossEntropy(prediction: number, label: 0 | 1): number {
  const p = clipProbability(prediction);
  return label === 1 ? -Math.log(p) : -Math.log(1 - p);
}

export function datasetLoss(dataset: Dataset, weights: number[], layers: number): number {
  let total = 0;
  for (const point of dataset) {
    total += binaryCrossEntropy(predict(point.x, weights, layers), point.label);
  }
  return total / dataset.length;
}

export function datasetAccuracy(dataset: Dataset, weights: number[], layers: number): number {
  let correct = 0;
  for (const point of dataset) {
    const predictedLabel = predict(point.x, weights, layers) >= 0.5 ? 1 : 0;
    if (predictedLabel === point.label) correct += 1;
  }
  return correct / dataset.length;
}
