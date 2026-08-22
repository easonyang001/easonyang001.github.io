import { useMemo, useState } from "react";
import { ArrowRight, FileText, Link2, Code2, Quote } from "lucide-react";
import ListPageLayout from "../components/ListPageLayout.tsx";
import EmptyState from "../components/EmptyState.tsx";
import { publications } from "../data/publications.ts";
import { sanitizeRichText } from "../lib/sanitize.ts";

type PublicationDirectorySection = {
  title: "Publication" | "Preprint";
  statuses: Array<"Published" | "Accepted" | "Under Review" | "Preprint">;
};

const PUBLICATION_DIRECTORY_SECTIONS: PublicationDirectorySection[] = [
  { title: "Publication", statuses: ["Published", "Accepted", "Under Review"] },
  { title: "Preprint", statuses: ["Preprint"] },
];

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
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const areas = useMemo(() => ["All", ...new Set(publications.flatMap((p) => p.researchAreas))], []);
  const types = useMemo(() => ["All", ...new Set(publications.map((p) => p.type))], []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter(
      (pub) =>
        (q === "" || pub.title.toLowerCase().includes(q)) &&
        (area === "All" || pub.researchAreas.includes(area)) &&
        (type === "All" || pub.type === type)
    );
  }, [query, area, type]);

  const groupedBySection = useMemo(() => {
    const groups = new Map<PublicationDirectorySection["title"], typeof publications>();
    for (const section of PUBLICATION_DIRECTORY_SECTIONS) {
      groups.set(section.title, []);
    }

    for (const pub of filtered) {
      const section =
        pub.status === "Preprint" ? "Preprint" : "Publication";
      const existing = groups.get(section) ?? [];
      existing.push(pub);
      groups.set(section, existing);
    }

    return PUBLICATION_DIRECTORY_SECTIONS.map((section) => {
      const pubs = (groups.get(section.title) ?? []).slice().sort((a, b) => b.year - a.year);
      const byYear = new Map<number, typeof publications>();
      for (const pub of pubs) {
        const existing = byYear.get(pub.year) ?? [];
        existing.push(pub);
        byYear.set(pub.year, existing);
      }
      return {
        ...section,
        years: [...byYear.entries()].sort((a, b) => b[0] - a[0]),
      };
    });
  }, [filtered]);

  const sectionCounts = useMemo(
    () =>
      PUBLICATION_DIRECTORY_SECTIONS.map((section) => ({
        ...section,
        count: filtered.filter((pub) =>
          section.title === "Preprint" ? pub.status === "Preprint" : pub.status !== "Preprint"
        ).length,
      })),
    [filtered]
  );

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
      title="Publications"
      description="Peer-reviewed papers, preprints, and technical reports from Mrama Institute's research program."
      path="/publications"
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
        </div>
      }
      >
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {sectionCounts.map((section) => (
            <a
              key={section.title}
              href={`#${section.title.toLowerCase()}`}
              className="home-explore-card group block rounded-[26px] border border-white/14 bg-slate-950/72 p-6 text-left shadow-[0_20px_70px_rgba(2,6,23,0.38)] backdrop-blur-3xl transition-all duration-200 hover:border-white/20 hover:translate-y-[-2px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46">
                    Directory
                  </p>
                  <h2 className="mt-2 text-h3 text-white">{section.title}</h2>
                </div>
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/14 bg-white/8 px-3 text-small font-semibold text-white/84">
                  {section.count}
                </span>
              </div>
              <p className="mt-4 text-small text-white/68">
                {section.title === "Publication"
                  ? "Peer-reviewed work, accepted papers, and conference material."
                  : "Preprints and working papers currently in circulation."}
              </p>
              <div className="mt-6 flex items-center gap-2 text-small font-medium text-accent transition-colors duration-150 group-hover:text-accent-hover">
                <span>Open section</span>
                <ArrowRight size={15} strokeWidth={1.8} className="transition-transform duration-150 group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>

      {groupedBySection.every((section) => section.years.length === 0) ? (
        <EmptyState title="No matches" description="Try adjusting your search or filters." />
      ) : (
        <div className="space-y-14">
          {groupedBySection.map((section) => (
            <section key={section.title} id={section.title.toLowerCase()} className="space-y-8 scroll-mt-24">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                <div>
                  <p className="eyebrow">{section.title}</p>
                  <h2 className="mt-3 text-h2 text-text-primary">
                    {section.title === "Publication" ? "Published work" : "Working papers"}
                  </h2>
                </div>
                <span className="font-mono text-mono-label uppercase text-text-muted">
                  {section.years.reduce((count, [, pubs]) => count + pubs.length, 0)} items
                </span>
              </div>

              {section.years.length === 0 ? (
                <EmptyState
                  title={`No ${section.title.toLowerCase()}s`}
                  description="Try adjusting your search or filters."
                />
              ) : (
                <div className="space-y-6">
                  {section.years.map(([year, pubs]) => (
                    <div key={`${section.title}-${year}`} className="rounded-2xl border border-border bg-surface/40 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-mono text-mono-label uppercase tracking-[0.22em] text-accent">{year}</p>
                        <span className="font-mono text-mono-label uppercase text-text-muted">
                          {pubs.length} {pubs.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="mt-5 space-y-5 border-l border-border pl-6">
                        {pubs.map((pub) => (
                          <div key={pub.slug} className="relative">
                            <div className="absolute -left-[1.85rem] top-4 h-0.5 w-4 bg-border" />
                            <div className="glass-card p-8">
                              <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
                                <span>{pub.venue}</span>
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
            </section>
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
