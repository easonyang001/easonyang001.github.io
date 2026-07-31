import { describe, it, expect } from "vitest";
import { scorePaper } from "./keywords.ts";

describe("scorePaper", () => {
  it("matches a simple keyword in the title with higher weight than abstract-only", () => {
    const titleHit = scorePaper("A New QUBO Formulation", "Some unrelated abstract.");
    const abstractHit = scorePaper("An Unrelated Title", "We study a QUBO formulation.");

    expect(titleHit.matchedKeywords).toContain("QUBO");
    expect(abstractHit.matchedKeywords).toContain("QUBO");
    expect(titleHit.score).toBeGreaterThan(abstractHit.score);
  });

  it("is case-insensitive", () => {
    const result = scorePaper("qubo and ISING models", "");
    expect(result.matchedKeywords).toContain("QUBO");
    expect(result.matchedKeywords).toContain("Ising");
  });

  it("only matches a compound rule when all its terms are present", () => {
    const both = scorePaper("Quantum Combinatorial Optimization", "");
    const onlyOne = scorePaper("Combinatorial Optimization", "");

    expect(both.matchedKeywords).toContain("quantum + combinatorial optimization");
    expect(onlyOne.matchedKeywords).not.toContain("quantum + combinatorial optimization");
  });

  it("does not match 'Ising' as a substring inside unrelated words", () => {
    const result = scorePaper(
      "PlatformBid: An Auto-Bidding Benchmark",
      "This paper is about advertising and raising bids, with nothing quantum involved."
    );
    expect(result.matchedKeywords).not.toContain("Ising");
    expect(result.score).toBe(0);
  });

  it("scores unrelated papers as zero with no matches", () => {
    const result = scorePaper("A Survey of Baroque Music", "This paper has nothing to do with quantum computing.");
    expect(result.score).toBe(0);
    expect(result.matchedKeywords).toEqual([]);
  });

  it("accumulates score across multiple distinct keyword hits", () => {
    const single = scorePaper("VQE for Molecules", "");
    const double = scorePaper("VQE and Quantum Kernel Methods", "");
    expect(double.score).toBeGreaterThan(single.score);
    expect(double.matchedKeywords).toContain("VQE");
    expect(double.matchedKeywords).toContain("quantum kernel");
  });
});
