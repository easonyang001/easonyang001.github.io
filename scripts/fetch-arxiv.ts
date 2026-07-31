import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildQueryUrl, fetchArxivFeed, sleep, ARXIV_REQUEST_INTERVAL_MS } from "./arxiv/query.ts";
import { parseAtomFeed } from "./arxiv/parseFeed.ts";
import { scorePaper } from "./arxiv/keywords.ts";
import {
  getIsoWeekLabel,
  loadSeenIds,
  selectTopPapers,
  serializeDigestFile,
  serializeSeenIds,
  shouldWriteDigest,
  toDigestPapers,
} from "./arxiv/digest.ts";
import type { DigestPaper, RawArxivPaper, ScoredPaper } from "./arxiv/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const SEEN_IDS_PATH = join(REPO_ROOT, "data", "digest", "seen-ids.json");
const DIGEST_DATA_DIR = join(REPO_ROOT, "src", "data", "digest");
const SUMMARY_PATH = join(REPO_ROOT, "digest-summary.md");

const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const RESULT_LIMIT = 10;
const DAYS_BACK = 7;

async function fetchAllRecentPapers(): Promise<RawArxivPaper[]> {
  const all: RawArxivPaper[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = buildQueryUrl({ daysBack: DAYS_BACK, maxResults: PAGE_SIZE, start: page * PAGE_SIZE });
    const xml = await fetchArxivFeed(url);
    const papers = parseAtomFeed(xml);
    all.push(...papers);

    if (papers.length < PAGE_SIZE) break; // reached the end of results
    if (page < MAX_PAGES - 1) await sleep(ARXIV_REQUEST_INTERVAL_MS);
  }

  return all;
}

function scoreAll(papers: RawArxivPaper[]): ScoredPaper[] {
  return papers.map(({ abstract, ...rest }) => {
    const { score, matchedKeywords } = scorePaper(rest.title, abstract);
    return { ...rest, score, matchedKeywords };
  });
}

/** If this week's file already exists (e.g. an earlier run today), load its papers so we merge instead of overwrite. */
async function loadExistingWeekPapers(weekFilePath: string): Promise<DigestPaper[]> {
  if (!existsSync(weekFilePath)) return [];
  const mod = (await import(pathToFileURL(weekFilePath).href)) as { papers?: DigestPaper[] };
  return mod.papers ?? [];
}

async function main() {
  console.log(`Fetching arXiv submissions from the last ${DAYS_BACK} days...`);
  const raw = await fetchAllRecentPapers();
  console.log(`Fetched ${raw.length} candidate papers.`);

  const scored = scoreAll(raw);
  const seenIds = loadSeenIds(SEEN_IDS_PATH);
  const selected = selectTopPapers(scored, seenIds, RESULT_LIMIT);
  const digestPapers = toDigestPapers(selected);

  if (!shouldWriteDigest(digestPapers)) {
    console.log("No new matching papers this week — nothing written.");
    return;
  }

  const week = getIsoWeekLabel(new Date());
  const weekFilePath = join(DIGEST_DATA_DIR, `${week}.ts`);
  const existingPapers = await loadExistingWeekPapers(weekFilePath);
  const mergedPapers = [...existingPapers, ...digestPapers];

  mkdirSync(DIGEST_DATA_DIR, { recursive: true });
  writeFileSync(weekFilePath, serializeDigestFile(week, mergedPapers));

  mkdirSync(dirname(SEEN_IDS_PATH), { recursive: true });
  const nextSeen = new Set(seenIds);
  for (const paper of digestPapers) nextSeen.add(paper.arxivId);
  writeFileSync(SEEN_IDS_PATH, serializeSeenIds(nextSeen));

  const summaryLines = [
    `## Digest ${week}`,
    "",
    `${digestPapers.length} new paper(s) added this run (${mergedPapers.length} total for the week), out of ${raw.length} candidates fetched.`,
    "",
    ...digestPapers.map((p) => `- [${p.title}](${p.arxivUrl}) — ${p.matchedKeywords.join(", ")}`),
  ];
  writeFileSync(SUMMARY_PATH, `${summaryLines.join("\n")}\n`);

  console.log(
    `Added ${digestPapers.length} new papers to src/data/digest/${week}.ts (${mergedPapers.length} total this week)`
  );
}

main().catch((error) => {
  console.error("digest fetch failed:", error);
  process.exitCode = 1;
});
