import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getIsoWeekLabel,
  selectTopPapers,
  toDigestPapers,
  loadSeenIds,
  shouldWriteDigest,
  serializeDigestFile,
} from "./digest.ts";
import type { ScoredPaper } from "./types.ts";

function makePaper(overrides: Partial<ScoredPaper>): ScoredPaper {
  return {
    arxivId: "0000.00000",
    title: "Untitled",
    authors: ["Someone"],
    categories: ["quant-ph"],
    submittedDate: "2026-07-20",
    arxivUrl: "http://arxiv.org/abs/0000.00000v1",
    matchedKeywords: ["QUBO"],
    score: 1,
    ...overrides,
  };
}

describe("getIsoWeekLabel", () => {
  it("puts January 4th in week 1 (ISO 8601 definition)", () => {
    expect(getIsoWeekLabel(new Date(Date.UTC(2026, 0, 4)))).toBe("2026-W01");
  });

  it("gives every day of the same Mon-Sun span the same label", () => {
    const monday = new Date(Date.UTC(2026, 0, 5)); // confirmed Monday
    const label = getIsoWeekLabel(monday);
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday.getTime() + i * 86400000);
      expect(getIsoWeekLabel(day)).toBe(label);
    }
  });
});

describe("selectTopPapers", () => {
  it("excludes already-seen arXiv IDs", () => {
    const papers = [makePaper({ arxivId: "1111.11111", score: 5 }), makePaper({ arxivId: "2222.22222", score: 3 })];
    const seen = new Set(["1111.11111"]);
    const result = selectTopPapers(papers, seen);
    expect(result.map((p) => p.arxivId)).toEqual(["2222.22222"]);
  });

  it("excludes zero-score (no keyword match) papers", () => {
    const papers = [makePaper({ arxivId: "1111.11111", score: 0 }), makePaper({ arxivId: "2222.22222", score: 2 })];
    const result = selectTopPapers(papers, new Set());
    expect(result.map((p) => p.arxivId)).toEqual(["2222.22222"]);
  });

  it("sorts by descending score", () => {
    const papers = [
      makePaper({ arxivId: "a", score: 2 }),
      makePaper({ arxivId: "b", score: 9 }),
      makePaper({ arxivId: "c", score: 5 }),
    ];
    const result = selectTopPapers(papers, new Set());
    expect(result.map((p) => p.arxivId)).toEqual(["b", "c", "a"]);
  });

  it("caps the result at the given limit", () => {
    const papers = Array.from({ length: 25 }, (_, i) => makePaper({ arxivId: `id-${i}`, score: i + 1 }));
    const result = selectTopPapers(papers, new Set(), 10);
    expect(result).toHaveLength(10);
    // highest scores kept
    expect(result[0].arxivId).toBe("id-24");
  });
});

describe("toDigestPapers", () => {
  it("drops the score field and adds an empty summary", () => {
    const [digestPaper] = toDigestPapers([makePaper({ arxivId: "x", score: 7 })]);
    expect(digestPaper).not.toHaveProperty("score");
    expect(digestPaper.summary).toBe("");
    expect(digestPaper.arxivId).toBe("x");
  });
});

describe("shouldWriteDigest", () => {
  it("is false for an empty paper list", () => {
    expect(shouldWriteDigest([])).toBe(false);
  });

  it("is true when there is at least one paper", () => {
    expect(shouldWriteDigest(toDigestPapers([makePaper({})]))).toBe(true);
  });
});

describe("serializeDigestFile", () => {
  it("produces valid-looking TS with no abstract field anywhere", () => {
    const output = serializeDigestFile("2026-W31", toDigestPapers([makePaper({ title: 'Title with "quotes"' })]));
    expect(output).toContain('export const week = "2026-W31"');
    expect(output).toContain("export const papers: DigestPaper[]");
    expect(output).toContain('Title with \\"quotes\\"');
    expect(output).not.toMatch(/abstract/i);
  });
});

describe("loadSeenIds", () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("returns an empty set when the file does not exist", () => {
    dir = mkdtempSync(join(tmpdir(), "digest-test-"));
    const result = loadSeenIds(join(dir, "does-not-exist.json"));
    expect(result.size).toBe(0);
  });

  it("loads a valid seen-ids file", () => {
    dir = mkdtempSync(join(tmpdir(), "digest-test-"));
    const file = join(dir, "seen-ids.json");
    writeFileSync(file, JSON.stringify(["1111.11111", "2222.22222"]));
    const result = loadSeenIds(file);
    expect(result.has("1111.11111")).toBe(true);
    expect(result.has("2222.22222")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("falls back to an empty set on malformed JSON", () => {
    dir = mkdtempSync(join(tmpdir(), "digest-test-"));
    const file = join(dir, "seen-ids.json");
    writeFileSync(file, "{ not valid json ][");
    const result = loadSeenIds(file);
    expect(result.size).toBe(0);
  });

  it("falls back to an empty set when the JSON is not an array", () => {
    dir = mkdtempSync(join(tmpdir(), "digest-test-"));
    const file = join(dir, "seen-ids.json");
    writeFileSync(file, JSON.stringify({ not: "an array" }));
    const result = loadSeenIds(file);
    expect(result.size).toBe(0);
  });
});
