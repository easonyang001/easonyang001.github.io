import { useMemo, useState } from "react";
import { FileText, Link2, Code2, Quote } from "lucide-react";
import ListPageLayout from "../components/ListPageLayout.tsx";
import EmptyState from "../components/EmptyState.tsx";
import { publications } from "../data/publications.ts";
import { sanitizeRichText } from "../lib/sanitize.ts";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PublicationsPage() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const areas = useMemo(() => ["All", ...new Set(publications.map((p) => p.area))], []);
  const types = useMemo(() => ["All", ...new Set(publications.map((p) => p.type))], []);
  const statuses = useMemo(() => ["All", ...new Set(publications.map((p) => p.status))], []);

  const eyebrow = useMemo(() => {
    const count = publications.length;
    const label = `${count} ${count === 1 ? "Publication" : "Publications"}`;
    if (count === 0) return label;
    const years = publications.map((p) => Number(p.year));
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? `${label} · ${min}` : `${label} · ${min}–${max}`;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter(
      (pub) =>
        (q === "" || pub.title.toLowerCase().includes(q)) &&
        (area === "All" || pub.area === area) &&
        (type === "All" || pub.type === type) &&
        (status === "All" || pub.status === status)
    );
  }, [query, area, type, status]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<string, typeof publications>();
    for (const pub of filtered) {
      const existing = groups.get(pub.year) ?? [];
      existing.push(pub);
      groups.set(pub.year, existing);
    }
    return [...groups.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  const handleCopyBibtex = async (bibtex: string | null, slug: string) => {
    if (!bibtex) return;
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch {
      // Clipboard unavailable; silently ignore.
    }
  };

  return (
    <ListPageLayout
      eyebrow={eyebrow}
      title="Publications"
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
          <FilterSelect label="Research Area" value={area} onChange={setArea} options={areas} />
          <FilterSelect label="Type" value={type} onChange={setType} options={types} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={statuses} />
        </div>
      }
    >
      {groupedByYear.length === 0 ? (
        <EmptyState title="No matches" description="Try adjusting your search or filters." />
      ) : (
        <div className="space-y-12">
          {groupedByYear.map(([year, pubs]) => (
            <div key={year}>
              <p className="mb-6 font-mono text-mono-label uppercase text-accent">{year}</p>
              <div className="relative border-l border-border pl-8">
                {pubs.map((pub) => (
                  <div key={pub.slug} className="relative mb-10 last:mb-0">
                    <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
                    <div className="glass-card p-8">
                      <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
                        <span>{pub.conference}</span>
                        <span>&middot;</span>
                        <span>{pub.type}</span>
                        <span>&middot;</span>
                        <span>{pub.status}</span>
                      </div>

                      <h3 className="mt-3 text-h3 text-text-primary">{pub.title}</h3>
                      <div
                        className="mt-3 max-w-prose text-small text-text-secondary [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(pub.abstract) }}
                      />

                      <div className="mt-5 flex flex-wrap gap-5">
                        {pub.pdfUrl && (
                          <a
                            href={pub.pdfUrl}
                            className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                          >
                            <FileText size={14} /> PDF
                          </a>
                        )}
                        {pub.doiUrl && (
                          <a
                            href={pub.doiUrl}
                            className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                          >
                            <Link2 size={14} /> DOI
                          </a>
                        )}
                        {pub.codeUrl && (
                          <a
                            href={pub.codeUrl}
                            className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                          >
                            <Code2 size={14} /> Code
                          </a>
                        )}
                        <button
                          onClick={() => handleCopyBibtex(pub.bibtex, pub.slug)}
                          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                        >
                          <Quote size={14} />
                          {copiedSlug === pub.slug ? "Copied!" : "BibTeX"}
                        </button>
                      </div>
                    </div>
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
