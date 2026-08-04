import { useMemo, useState } from "react";
import ListPageLayout from "../components/ListPageLayout.tsx";
import EmptyState from "../components/EmptyState.tsx";
import { digestWeeks } from "../data/digest/index.ts";

export default function DigestPage() {
  const [keyword, setKeyword] = useState("All");

  const allKeywords = useMemo(() => {
    const set = new Set<string>();
    for (const week of digestWeeks) {
      for (const paper of week.papers) {
        for (const k of paper.matchedKeywords) set.add(k);
      }
    }
    return ["All", ...[...set].sort()];
  }, []);

  const filteredWeeks = useMemo(() => {
    if (keyword === "All") return digestWeeks;
    return digestWeeks
      .map((week) => ({
        week: week.week,
        papers: week.papers.filter((p) => p.matchedKeywords.includes(keyword)),
      }))
      .filter((week) => week.papers.length > 0);
  }, [keyword]);

  const totalPapers = filteredWeeks.reduce((sum, w) => sum + w.papers.length, 0);

  return (
    <ListPageLayout
      title="arXiv Digest"
      description="Automated arXiv listing, curated weekly. Summaries, where present, are written and reviewed by hand."
      path="/digest"
      resultCount={totalPapers}
      filters={
        allKeywords.length > 1 && (
          <div>
            <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
              Keyword
            </label>
            <select
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            >
              {allKeywords.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )
      }
    >
      {filteredWeeks.length === 0 ? (
        <EmptyState
          title="No digest issues yet"
          description="The weekly arXiv digest runs automatically — check back after the next scheduled run."
        />
      ) : (
        <div className="space-y-12">
          {filteredWeeks.map((week) => (
            <div key={week.week}>
              <p className="mb-6 font-mono text-mono-label uppercase text-accent">{week.week}</p>
              <div className="space-y-8 border-t border-border">
                {week.papers.map((paper) => (
                  <div key={paper.arxivId} className="border-b border-border pt-6 pb-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-mono-label uppercase text-text-muted">
                      <time>{paper.submittedDate}</time>
                      {paper.categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-md border border-border px-2 py-0.5 text-text-secondary"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-2 text-h3 text-text-primary">{paper.title}</h3>
                    <p className="mt-1 text-small text-text-secondary">{paper.authors.join(", ")}</p>

                    {paper.summary && (
                      <p className="mt-3 max-w-prose text-small text-text-secondary">{paper.summary}</p>
                    )}

                    <a
                      href={paper.arxivUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
                    >
                      View on arXiv &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
