import { predict, clipProbability } from "./cost.ts";
import type { Dataset } from "./types.ts";

const SHIFT = Math.PI / 2;

/** Parameter-shift rule gradient of the mean binary cross-entropy loss over the dataset. */
export function parameterShiftGradient(dataset: Dataset, weights: number[], layers: number): number[] {
  const grad = new Array(weights.length).fill(0);

  for (const point of dataset) {
    const p = clipProbability(predict(point.x, weights, layers));
    const dLdp = point.label === 1 ? -1 / p : 1 / (1 - p);

    for (let k = 0; k < weights.length; k++) {
      const plus = weights.slice();
      plus[k] += SHIFT;
      const minus = weights.slice();
      minus[k] -= SHIFT;

      const pPlus = predict(point.x, plus, layers);
      const pMinus = predict(point.x, minus, layers);
      const dpdwk = (pPlus - pMinus) / 2;

      grad[k] += dLdp * dpdwk;
    }
  }

  return grad.map((g) => g / dataset.length);
}
