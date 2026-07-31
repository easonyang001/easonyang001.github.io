import { describe, it, expect } from "vitest";
import { encodingGates, decodeAngles } from "./encoding.ts";
import { predict, datasetLoss, datasetAccuracy } from "./cost.ts";
import { parameterShiftGradient } from "./gradient.ts";
import { initWeights, trainStep, seededRandom } from "./train.ts";
import { linearlySeparableDataset } from "./datasets.ts";

describe("angle encoding", () => {
  it("round-trips x through encode/decode", () => {
    const cases: [number, number][] = [
      [0, 0],
      [0.5, 0.25],
      [1, 1],
      [0.1, 0.9],
    ];
    for (const x of cases) {
      const gates = encodingGates(x, 0);
      const decoded = decodeAngles(gates);
      expect(decoded[0]).toBeCloseTo(x[0], 10);
      expect(decoded[1]).toBeCloseTo(x[1], 10);
    }
  });
});

describe("parameter-shift gradient", () => {
  it("matches central finite differences within 1e-5", () => {
    const dataset = linearlySeparableDataset(3).slice(0, 6);
    const layers = 2;
    const weights = initWeights(layers, 42);
    const analytic = parameterShiftGradient(dataset, weights, layers);

    const h = 1e-4;
    for (let k = 0; k < weights.length; k++) {
      const plus = weights.slice();
      plus[k] += h;
      const minus = weights.slice();
      minus[k] -= h;
      const numeric = (datasetLoss(dataset, plus, layers) - datasetLoss(dataset, minus, layers)) / (2 * h);
      expect(Math.abs(analytic[k] - numeric)).toBeLessThan(1e-5);
    }
  });
});

describe("training", () => {
  it("reaches >0.9 accuracy on the linearly separable dataset", () => {
    const dataset = linearlySeparableDataset(3);
    const layers = 2;
    let weights = initWeights(layers, 7);
    for (let epoch = 0; epoch < 60; epoch++) {
      weights = trainStep(dataset, weights, layers, 0.5);
    }
    const acc = datasetAccuracy(dataset, weights, layers);
    expect(acc).toBeGreaterThan(0.9);
  }, 20000);

  it("produces identical results for the same seed", () => {
    const w1 = initWeights(3, 123);
    const w2 = initWeights(3, 123);
    expect(w1).toEqual(w2);

    const dataset = linearlySeparableDataset(3).slice(0, 5);
    const trained1 = trainStep(dataset, w1, 3, 0.3);
    const trained2 = trainStep(dataset, w2, 3, 0.3);
    expect(trained1).toEqual(trained2);
  });

  it("seededRandom is deterministic", () => {
    const a = seededRandom(99);
    const b = seededRandom(99);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });
});

describe("prediction", () => {
  it("returns a probability in [0, 1]", () => {
    const weights = initWeights(2, 5);
    for (const x of [[0, 0], [1, 1], [0.5, 0.5]] as [number, number][]) {
      const p = predict(x, weights, 2);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
