import { describe, expect, it } from "vitest";
import {
  ANNEALING_NARRATIVE,
  BARREN_NARRATIVE,
  BLOCH_NARRATIVE,
  CIRCUIT_NARRATIVE,
  KERNEL_NARRATIVE,
  QUBO_NARRATIVE,
  VQC_NARRATIVE,
  VQE_NARRATIVE,
} from "./LabNarrative.tsx";

const LABS = [
  BLOCH_NARRATIVE,
  CIRCUIT_NARRATIVE,
  VQC_NARRATIVE,
  VQE_NARRATIVE,
  QUBO_NARRATIVE,
  ANNEALING_NARRATIVE,
  KERNEL_NARRATIVE,
  BARREN_NARRATIVE,
];

describe("interactive Lab learning experience", () => {
  it("gives every published Lab a complete guided experience", () => {
    for (const lab of LABS) {
      expect(lab.labSlug).toBeTruthy();
      expect(lab.mission?.steps.length).toBeGreaterThanOrEqual(4);
      expect(lab.mission?.conclusion.takeaway).toBeTruthy();
      expect(lab.mission?.conclusion.nextLabHref).toMatch(/^\/lab\//);
      expect(lab.modelScope).toBeTruthy();
      expect(lab.definitions?.length).toBeGreaterThanOrEqual(3);
      expect(lab.researchNotes?.length).toBeGreaterThanOrEqual(2);
      expect(lab.screenReaderSummary).toBeTypeOf("function");
    }
  });

  it("uses unique Lab and mission identifiers", () => {
    expect(new Set(LABS.map((lab) => lab.labSlug)).size).toBe(LABS.length);
    for (const lab of LABS) {
      const ids = lab.mission?.steps.map((step) => step.id) ?? [];
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("evaluates Bloch evidence from actual state values", () => {
    const steps = BLOCH_NARRATIVE.mission?.steps ?? [];
    expect(steps[0].completion({ p0: 1, p1: 0 })).toBe(true);
    expect(steps[1].completion({ p0: 0.5 })).toBe(true);
    expect(steps[2].completion({ p0: 0.5, phi: Math.PI / 2 })).toBe(true);
    expect(steps[3].completion({ p1: 1 })).toBe(true);
  });
});
