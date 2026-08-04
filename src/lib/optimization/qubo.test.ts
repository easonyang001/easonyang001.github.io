import { describe, expect, it } from "vitest";
import { evaluateQubo } from "./qubo.ts";

describe("QUBO constraint penalties", () => {
  it("keeps feasibility separate and lets a sufficient penalty change the winner", () => {
    const matrix = [[-5, 0], [0, -4]];
    const unpenalized = evaluateQubo(matrix, 1, 0);
    const penalized = evaluateQubo(matrix, 1, 10);

    expect(unpenalized[0].feasible).toBe(false);
    expect(penalized[0].feasible).toBe(true);
    expect(penalized[0].energy).toBe(penalized[0].objectiveEnergy + penalized[0].penaltyEnergy);
  });
});
