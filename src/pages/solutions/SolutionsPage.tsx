import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ListPageLayout from "../../components/ListPageLayout.tsx";
import EmptyState from "../../components/EmptyState.tsx";
import { publishedCases } from "../../data/cases/index.ts";

const KIND_LABELS: Record<string, string> = {
  classical: "Classical",
  quantum_inspired: "Quantum-Inspired",
  quantum_simulated: "Quantum (Simulated)",
  quantum_hardware: "Quantum Hardware",
  hybrid: "Hybrid",
};

export default function SolutionsPage() {
  const [kind, setKind] = useState("All");
  const kinds = useMemo(
    () => ["All", ...new Set(publishedCases.map((c) => c.approach.chosen.kind))],
    []
  );
  const filtered = useMemo(
    () => (kind === "All" ? publishedCases : publishedCases.filter((c) => c.approach.chosen.kind === kind)),
    [kind]
  );

  return (
    <ListPageLayout
      title="Solutions"
      description="Solved optimization cases -- problem, approach, and measured improvement."
      resultCount={filtered.length}
      filters={
        <div>
          <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">Approach</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
          >
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k === "All" ? "All" : KIND_LABELS[k] ?? k}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different filter." />
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {filtered.map((c) => (
            <li key={c.meta.slug}>
              <Link
                to={`/solutions/${c.meta.slug}`}
                className="block py-6 transition-colors duration-150 hover:text-accent"
              >
                <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
                  <time>{c.meta.date}</time>
                  <span>&middot;</span>
                  <span>{KIND_LABELS[c.approach.chosen.kind] ?? c.approach.chosen.kind}</span>
                  <span>&middot;</span>
                  <span>{c.approach.chosen.name}</span>
                  {c.meta.visibility === "internal" && (
                    <>
                      <span>&middot;</span>
                      <span className="text-accent">Internal</span>
                    </>
                  )}
                </div>
                <h2 className="mt-2 text-h3 text-text-primary">{c.meta.title}</h2>
                <p className="mt-1 text-small text-text-secondary">{c.meta.oneLiner}</p>
                <p className="mt-3 font-mono text-small text-text-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {c.improvement.primary.name}: {c.improvement.primary.baseline}
                  {c.improvement.primary.unit === "%" ? "%" : ` ${c.improvement.primary.unit}`}
                  {" → "}
                  {c.improvement.primary.achieved}
                  {c.improvement.primary.unit === "%" ? "%" : ` ${c.improvement.primary.unit}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ListPageLayout>
  );
}
