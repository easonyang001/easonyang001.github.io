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
      description="Announcements, research updates, and project milestones from Mrama Institute."
      path="/news"
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
              <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
                <time>
                  {new Date(item.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>&middot;</span>
                <span className="text-accent">{item.category}</span>
              </div>
              <h2 className="mt-1 text-h3 text-text-primary">
                {item.content ? (
                  <Link to={`/news/${item.slug}`} className="transition-colors hover:text-accent">
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}
              </h2>
              <div
                className="mt-2 text-small text-text-secondary [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.summary) }}
              />
              {item.content && (
                <Link
                  to={`/news/${item.slug}`}
                  className="mt-3 inline-block text-small font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  Read article &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
