import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ListPageLayout from "../components/ListPageLayout.tsx";
import EmptyState from "../components/EmptyState.tsx";
import { news } from "../data/news.ts";
import { sanitizeRichText } from "../lib/sanitize.ts";

export default function NewsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q === "" ? news : news.filter((item) => item.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <ListPageLayout
      title="News"
      resultCount={filtered.length}
      filters={
        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
              Search
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title"
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <Link
            to="/digest"
            className="inline-block text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
          >
            arXiv Digest &rarr;
          </Link>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search term." />
      ) : (
        <div className="border-l border-border pl-8">
          {filtered.map((item) => (
            <div key={item.slug} className="mb-8 last:mb-0">
              <time className="font-mono text-mono-label uppercase text-text-muted">
                {new Date(item.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-1 text-h3 text-text-primary">{item.title}</h2>
              <div
                className="mt-2 text-small text-text-secondary [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.description) }}
              />
            </div>
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
