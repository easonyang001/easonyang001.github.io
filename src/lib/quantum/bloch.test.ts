import { describe, it, expect } from "vitest";
import {
  anglesToState,
  stateToAngles,
  applySingleQubitGate,
  normalizeGlobalPhase,
  probabilityFromState,
} from "./bloch.ts";
import * as C from "./complex.ts";

describe("bloch sphere quantum math", () => {
  it("X|0> = |1>", () => {
    const zero = anglesToState({ theta: 0, phi: 0 });
    const result = applySingleQubitGate(zero, "X");
    const { p0, p1 } = probabilityFromState(result);
    expect(p0).toBeCloseTo(0, 10);
    expect(p1).toBeCloseTo(1, 10);
  });

  it("H|0> produces 0.5/0.5 probabilities", () => {
    const zero = anglesToState({ theta: 0, phi: 0 });
    const result = applySingleQubitGate(zero, "H");
    const { p0, p1 } = probabilityFromState(result);
    expect(p0).toBeCloseTo(0.5, 10);
    expect(p1).toBeCloseTo(0.5, 10);
  });

  it("angle <-> state round trip is consistent", () => {
    const cases = [
      { theta: Math.PI / 3, phi: Math.PI / 4 },
      { theta: Math.PI / 2, phi: (3 * Math.PI) / 2 },
      { theta: (2 * Math.PI) / 3, phi: Math.PI },
      { theta: 0.001, phi: 5.9 },
    ];
    for (const angles of cases) {
      const state = anglesToState(angles);
      const roundTrip = stateToAngles(state);
      expect(roundTrip.theta).toBeCloseTo(angles.theta, 9);
      expect(roundTrip.phi).toBeCloseTo(angles.phi, 9);
    }
  });

  it("handles the poles, where phi is undefined, without throwing", () => {
    const north = anglesToState({ theta: 0, phi: 1.7 });
    const south = anglesToState({ theta: Math.PI, phi: 2.4 });
    expect(stateToAngles(north).theta).toBeCloseTo(0, 10);
    expect(stateToAngles(south).theta).toBeCloseTo(Math.PI, 10);
  });

  it("normalizes global phase so alpha is real and non-negative", () => {
    const state = anglesToState({ theta: Math.PI / 2, phi: Math.PI / 6 });
    const arbitraryPhase = 0.9;
    const phased: typeof state = {
      alpha: C.mul(state.alpha, C.expI(arbitraryPhase)),
      beta: C.mul(state.beta, C.expI(arbitraryPhase)),
    };
    const normalized = normalizeGlobalPhase(phased);

    expect(normalized.alpha.im).toBeCloseTo(0, 10);
    expect(normalized.alpha.re).toBeGreaterThanOrEqual(-1e-10);
    expect(normalized.alpha.re).toBeCloseTo(state.alpha.re, 10);
    expect(normalized.beta.re).toBeCloseTo(state.beta.re, 10);
    expect(normalized.beta.im).toBeCloseTo(state.beta.im, 10);
  });

  it("keeps probabilities summing to 1 within 1e-10", () => {
    const cases = [
      { theta: 0, phi: 0 },
      { theta: Math.PI, phi: 0 },
      { theta: Math.PI / 2, phi: Math.PI / 3 },
      { theta: 1.23, phi: 4.56 },
    ];
    for (const angles of cases) {
      const state = anglesToState(angles);
      const { p0, p1 } = probabilityFromState(state);
      expect(Math.abs(p0 + p1 - 1)).toBeLessThan(1e-10);
    }
  });

  it("keeps probabilities summing to 1 after gate application", () => {
    const gates = ["X", "Y", "Z", "H", "Rx", "Ry", "Rz"] as const;
    const start = anglesToState({ theta: Math.PI / 3, phi: Math.PI / 5 });
    for (const gate of gates) {
      const result = applySingleQubitGate(start, gate, Math.PI / 2);
      const { p0, p1 } = probabilityFromState(result);
      expect(Math.abs(p0 + p1 - 1)).toBeLessThan(1e-10);
    }
  });
});
