import { useMemo, useState } from "react";
import ListPageLayout from "../components/ListPageLayout.tsx";
import EmptyState from "../components/EmptyState.tsx";
import { news } from "../data/news.ts";

export default function NewsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q === "" ? news : news.filter((item) => item.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <ListPageLayout
      eyebrow="News"
      title="News"
      resultCount={filtered.length}
      filters={
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
              <p className="mt-2 text-small text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
