import type { DigestPaper, DigestWeek } from "../../types/index.ts";

interface DigestModule {
  week: string;
  papers: DigestPaper[];
}

// Auto-discovers every weekly file the digest workflow adds (e.g. 2026-W31.ts) —
// no manual registration needed when a new week's PR merges.
const modules = import.meta.glob<DigestModule>("./????-W??.ts", { eager: true });

export const digestWeeks: DigestWeek[] = Object.values(modules)
  .map((m) => ({ week: m.week, papers: m.papers }))
  .sort((a, b) => b.week.localeCompare(a.week));
