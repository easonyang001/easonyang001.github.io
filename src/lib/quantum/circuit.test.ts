import { describe, it, expect } from "vitest";
import { simulate } from "./simulator.ts";
import { circuitExamples } from "./examples.ts";
import type { Circuit } from "./circuit.ts";

const SQRT1_2 = Math.SQRT1_2;

describe("circuit simulator", () => {
  it("X|0> = |1>", () => {
    const circuit: Circuit = {
      numQubits: 1,
      gates: [{ id: "t1", name: "X", qubit: 0, column: 0 }],
    };
    const { probabilities } = simulate(circuit);
    expect(probabilities[0]).toBeCloseTo(0, 10);
    expect(probabilities[1]).toBeCloseTo(1, 10);
  });

  it("H|0> gives 0.5 / 0.5", () => {
    const circuit: Circuit = {
      numQubits: 1,
      gates: [{ id: "t1", name: "H", qubit: 0, column: 0 }],
    };
    const { probabilities } = simulate(circuit);
    expect(probabilities[0]).toBeCloseTo(0.5, 10);
    expect(probabilities[1]).toBeCloseTo(0.5, 10);
  });

  it("H + CNOT produces the Bell state", () => {
    const circuit: Circuit = {
      numQubits: 2,
      gates: [
        { id: "t1", name: "H", qubit: 0, column: 0 },
        { id: "t2", name: "CNOT", control: 0, qubit: 1, column: 1 },
      ],
    };
    const { statevector, probabilities, basisLabels } = simulate(circuit);
    expect(basisLabels).toEqual(["00", "01", "10", "11"]);
    expect(statevector[0].re).toBeCloseTo(SQRT1_2, 10);
    expect(statevector[3].re).toBeCloseTo(SQRT1_2, 10);
    expect(probabilities[0]).toBeCloseTo(0.5, 10);
    expect(probabilities[1]).toBeCloseTo(0, 10);
    expect(probabilities[2]).toBeCloseTo(0, 10);
    expect(probabilities[3]).toBeCloseTo(0.5, 10);
  });

  it("GHZ circuit puts all weight on |000> and |111>", () => {
    const ghz = circuitExamples.find((e) => e.slug === "ghz");
    expect(ghz).toBeDefined();
    const { probabilities } = simulate(ghz!.build());
    expect(probabilities[0]).toBeCloseTo(0.5, 10);
    expect(probabilities[7]).toBeCloseTo(0.5, 10);
    for (const i of [1, 2, 3, 4, 5, 6]) {
      expect(probabilities[i]).toBeCloseTo(0, 10);
    }
  });

  it("probabilities sum to 1 for a mixed circuit", () => {
    const circuit: Circuit = {
      numQubits: 4,
      gates: [
        { id: "t1", name: "H", qubit: 0, column: 0 },
        { id: "t2", name: "Rx", qubit: 1, column: 0, param: 1.23 },
        { id: "t3", name: "T", qubit: 2, column: 0 },
        { id: "t4", name: "CNOT", control: 0, qubit: 3, column: 1 },
        { id: "t5", name: "Ry", qubit: 2, column: 1, param: 2.5 },
        { id: "t6", name: "S", qubit: 1, column: 2 },
        { id: "t7", name: "Z", qubit: 0, column: 2 },
        { id: "t8", name: "M", qubit: 3, column: 3 },
      ],
    };
    const { probabilities } = simulate(circuit);
    const sum = probabilities.reduce((acc, p) => acc + p, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-10);
  });

  it("measure marker does not change the state", () => {
    const withM: Circuit = {
      numQubits: 1,
      gates: [
        { id: "t1", name: "H", qubit: 0, column: 0 },
        { id: "t2", name: "M", qubit: 0, column: 1 },
      ],
    };
    const withoutM: Circuit = {
      numQubits: 1,
      gates: [{ id: "t1", name: "H", qubit: 0, column: 0 }],
    };
    const a = simulate(withM);
    const b = simulate(withoutM);
    expect(a.statevector[0].re).toBeCloseTo(b.statevector[0].re, 12);
    expect(a.statevector[1].re).toBeCloseTo(b.statevector[1].re, 12);
  });
});
