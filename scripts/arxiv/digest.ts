import { existsSync, readFileSync } from "node:fs";
import type { DigestPaper, ScoredPaper } from "./types.ts";

/** ISO 8601 week label, e.g. "2026-W31". */
export function getIsoWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Drops unscored/already-seen papers, ranks the rest, and caps the result. */
export function selectTopPapers(
  scored: ScoredPaper[],
  seenIds: Set<string>,
  limit = 10
): ScoredPaper[] {
  return scored
    .filter((p) => p.score > 0 && !seenIds.has(p.arxivId))
    .sort((a, b) => b.score - a.score || b.submittedDate.localeCompare(a.submittedDate))
    .slice(0, limit);
}

/** Never write an empty digest file — the caller should skip the write entirely when this is false. */
export function shouldWriteDigest(papers: DigestPaper[]): boolean {
  return papers.length > 0;
}

export function toDigestPapers(scored: ScoredPaper[]): DigestPaper[] {
  return scored.map(({ score, ...rest }) => {
    void score;
    return { ...rest, summary: "" };
  });
}

export function loadSeenIds(filePath: string): Set<string> {
  if (!existsSync(filePath)) return new Set();
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf-8"));
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function serializeSeenIds(ids: Set<string>): string {
  return `${JSON.stringify([...ids].sort(), null, 2)}\n`;
}

function escapeString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Pure string generation — no fs access, so it's directly testable. */
export function serializeDigestFile(weekLabel: string, papers: DigestPaper[]): string {
  const entries = papers
    .map(
      (p) => `  {
    arxivId: "${escapeString(p.arxivId)}",
    title: "${escapeString(p.title)}",
    authors: [${p.authors.map((a) => `"${escapeString(a)}"`).join(", ")}],
    categories: [${p.categories.map((c) => `"${escapeString(c)}"`).join(", ")}],
    submittedDate: "${escapeString(p.submittedDate)}",
    arxivUrl: "${escapeString(p.arxivUrl)}",
    matchedKeywords: [${p.matchedKeywords.map((k) => `"${escapeString(k)}"`).join(", ")}],
    summary: "${escapeString(p.summary)}",
  }`
    )
    .join(",\n");

  return `import type { DigestPaper } from "../../types/index.ts";

export const week = "${weekLabel}";

export const papers: DigestPaper[] = [
${entries}
];
`;
}
