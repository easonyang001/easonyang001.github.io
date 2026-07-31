import { describe, it, expect } from "vitest";
import { buildQueryUrl } from "./query.ts";

describe("buildQueryUrl", () => {
  it("includes all three target categories", () => {
    const url = buildQueryUrl({ now: new Date(Date.UTC(2026, 6, 31)) });
    expect(url).toContain("cat%3Aquant-ph");
    expect(url).toContain("cat%3Acs.LG");
    expect(url).toContain("cat%3Amath.OC");
  });

  it("builds a submittedDate range spanning exactly daysBack days", () => {
    const now = new Date(Date.UTC(2026, 6, 31, 6, 0));
    const url = buildQueryUrl({ now, daysBack: 7 });
    const decoded = decodeURIComponent(url.replace(/\+/g, " "));
    expect(decoded).toContain("submittedDate:[202607240600 TO 202607310600]");
  });

  it("targets the correct arXiv API host", () => {
    const url = buildQueryUrl();
    expect(url.startsWith("http://export.arxiv.org/api/query?")).toBe(true);
  });
});
