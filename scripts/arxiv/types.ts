export interface RawArxivPaper {
  arxivId: string;
  title: string;
  authors: string[];
  categories: string[];
  submittedDate: string; // ISO date
  arxivUrl: string;
  abstract: string; // used only for scoring, never persisted
}

export interface ScoredPaper extends Omit<RawArxivPaper, "abstract"> {
  matchedKeywords: string[];
  score: number;
}

/** What actually gets written to src/data/digest/YYYY-Www.ts — no abstract text. */
export interface DigestPaper {
  arxivId: string;
  title: string;
  authors: string[];
  categories: string[];
  submittedDate: string;
  arxivUrl: string;
  matchedKeywords: string[];
  summary: string;
}
