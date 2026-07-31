export interface KeywordRule {
  label: string;
  test: (lowerText: string) => boolean;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-boundary matching — plain substring search would let "Ising" match inside "advertising". */
function wordBoundaryPattern(term: string): RegExp {
  return new RegExp(`\\b${escapeRegex(term.toLowerCase())}\\b`);
}

function simple(label: string, term: string): KeywordRule {
  const pattern = wordBoundaryPattern(term);
  return { label, test: (text) => pattern.test(text) };
}

function compound(label: string, terms: string[]): KeywordRule {
  const patterns = terms.map(wordBoundaryPattern);
  return { label, test: (text) => patterns.every((pattern) => pattern.test(text)) };
}

/** Weighted keyword rules matching the institute's actual research directions. */
export const KEYWORD_RULES: KeywordRule[] = [
  simple("QUBO", "qubo"),
  simple("Ising", "ising"),
  simple("quantum annealing", "quantum annealing"),
  simple("reverse annealing", "reverse annealing"),
  simple("VQE", "vqe"),
  simple("variational quantum", "variational quantum"),
  simple("quantum machine learning", "quantum machine learning"),
  simple("quantum kernel", "quantum kernel"),
  simple("barren plateau", "barren plateau"),
  compound("quantum + combinatorial optimization", ["quantum", "combinatorial optimization"]),
  compound("quantum + facility location", ["quantum", "facility location"]),
  compound("quantum + vehicle routing", ["quantum", "vehicle routing"]),
];

const TITLE_WEIGHT = 3;
const ABSTRACT_WEIGHT = 1;

export interface ScoreResult {
  score: number;
  matchedKeywords: string[];
}

/** Title matches score higher than abstract-only matches. */
export function scorePaper(title: string, abstract: string): ScoreResult {
  const titleLower = title.toLowerCase();
  const abstractLower = abstract.toLowerCase();
  const matchedKeywords: string[] = [];
  let score = 0;

  for (const rule of KEYWORD_RULES) {
    const inTitle = rule.test(titleLower);
    const inAbstract = rule.test(abstractLower);
    if (!inTitle && !inAbstract) continue;
    matchedKeywords.push(rule.label);
    score += inTitle ? TITLE_WEIGHT : ABSTRACT_WEIGHT;
  }

  return { score, matchedKeywords };
}
