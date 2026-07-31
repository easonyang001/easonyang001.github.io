const ARXIV_API_BASE = "http://export.arxiv.org/api/query";
export const ARXIV_REQUEST_INTERVAL_MS = 3000;
export const ARXIV_CATEGORIES = ["quant-ph", "cs.LG", "math.OC"];

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatArxivDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes())
  );
}

export interface BuildQueryOptions {
  daysBack?: number;
  maxResults?: number;
  start?: number;
  now?: Date;
}

/** Builds an arXiv API query URL for quant-ph + cross-listed cs.LG/math.OC, submitted in the last `daysBack` days. */
export function buildQueryUrl(options: BuildQueryOptions = {}): string {
  const now = options.now ?? new Date();
  const daysBack = options.daysBack ?? 7;
  const maxResults = options.maxResults ?? 200;
  const start = options.start ?? 0;

  const rangeEnd = formatArxivDate(now);
  const rangeStart = formatArxivDate(new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000));

  const categoryQuery = ARXIV_CATEGORIES.map((c) => `cat:${c}`).join(" OR ");
  const searchQuery = `(${categoryQuery}) AND submittedDate:[${rangeStart} TO ${rangeEnd}]`;

  const params = new URLSearchParams({
    search_query: searchQuery,
    start: String(start),
    max_results: String(maxResults),
    sortBy: "submittedDate",
    sortOrder: "descending",
  });

  return `${ARXIV_API_BASE}?${params.toString()}`;
}

/** Network call — fetches the raw Atom XML. Not covered by unit tests; parseAtomFeed() is tested against fixtures instead. */
export async function fetchArxivFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "mrama-institute-digest/1.0 (contact@mrama-institute.org)" },
  });
  if (!response.ok) {
    throw new Error(`arXiv API request failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
