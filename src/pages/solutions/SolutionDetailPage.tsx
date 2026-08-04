import { useParams } from "react-router-dom";
import NotFoundPage from "../NotFoundPage.tsx";
import ImprovementSummary from "../../components/case/ImprovementSummary.tsx";
import FigureRenderer from "../../components/case/figures/FigureRenderer.tsx";
import { publishedCases } from "../../data/cases/index.ts";
import { useSeo } from "../../lib/seo/useSeo.ts";

const KIND_LABELS: Record<string, string> = {
  classical: "Classical",
  quantum_inspired: "Quantum-Inspired",
  quantum_simulated: "Quantum (Simulated)",
  quantum_hardware: "Quantum Hardware",
  hybrid: "Hybrid",
};

export default function SolutionDetailPage() {
  const { slug } = useParams();
  const c = publishedCases.find((item) => item.meta.slug === slug);

  useSeo({ title: c?.meta.title, description: c?.meta.oneLiner, path: `/solutions/${slug}` });

  if (!c) return <NotFoundPage />;

  return (
    <div className="section-container border-t border-border">
      <div className="max-w-prose">
        {c.meta.visibility === "internal" && (
          <p className="mb-4 font-mono text-mono-label uppercase text-accent">Internal Record</p>
        )}
        <h1 className="text-h2 text-text-primary">{c.meta.title}</h1>
        <p className="mt-4 font-mono text-mono-label uppercase text-text-muted">
          {KIND_LABELS[c.approach.chosen.kind] ?? c.approach.chosen.kind} &middot; {c.approach.chosen.name} &middot;{" "}
          {c.problem.scale.numVariables} variables &middot; {c.meta.date}
        </p>
        <p className="mt-4 text-body-lg text-text-secondary">{c.meta.oneLiner}</p>
      </div>

      <div className="my-12 border-t border-border" />

      <div className="max-w-2xl space-y-12">
        <ImprovementSummary improvement={c.improvement} />

        <section>
          <h2 className="text-h3 text-text-primary">Problem</h2>
          <p className="mt-3 text-body text-text-secondary">{c.problem.summary}</p>
          <p className="mt-3 text-body text-text-secondary">
            <span className="text-text-primary">Objective: </span>
            {c.problem.objective}
          </p>
          <p className="mt-2 font-mono text-small text-text-muted">{c.problem.scale.description}</p>
          {c.problem.constraints && c.problem.constraints.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-small text-text-secondary">
              {c.problem.constraints.map((con, i) => (
                <li key={i}>{con}</li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-h3 text-text-primary">Approach</h2>
          <div className="mt-3 glass-card p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-h4 text-text-primary">{c.approach.chosen.name}</h3>
              <span className="rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
                {KIND_LABELS[c.approach.chosen.kind] ?? c.approach.chosen.kind}
              </span>
            </div>
            <p className="mt-3 text-small text-text-secondary">{c.approach.chosen.rationale}</p>
            {c.approach.chosen.parameters && Object.keys(c.approach.chosen.parameters).length > 0 && (
              <div className="mt-4 space-y-1 border-t border-border pt-4">
                {Object.entries(c.approach.chosen.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between font-mono text-small">
                    <span className="text-text-muted">{key}</span>
                    <span className="text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {c.approach.alternatives && c.approach.alternatives.length > 0 && (
            <table className="mt-4 w-full text-small">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-mono text-mono-label uppercase text-text-muted">Alternative</th>
                  <th className="py-2 text-left font-mono text-mono-label uppercase text-text-muted">Why not</th>
                </tr>
              </thead>
              <tbody>
                {c.approach.alternatives.map((alt, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="py-2 pr-4 text-text-primary">{alt.name}</td>
                    <td className="py-2 text-text-secondary">{alt.whyNot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {c.figures && c.figures.length > 0 && (
          <section className="max-w-none space-y-8">
            <h2 className="text-h3 text-text-primary">Figures</h2>
            {c.figures.map((fig, i) => (
              <FigureRenderer key={i} figure={fig as { type: string }} />
            ))}
          </section>
        )}

        {(c.reliability || c.optimality) && (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {c.reliability && (
              <div className="glass-card p-8">
                <h3 className="text-h4 text-text-primary">Reliability</h3>
                <dl className="mt-3 space-y-1 font-mono text-small" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Runs</dt>
                    <dd className="text-text-primary">{c.reliability.numRuns}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Median</dt>
                    <dd className="text-text-primary">{c.reliability.median}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Range</dt>
                    <dd className="text-text-primary">
                      {c.reliability.min} &ndash; {c.reliability.max}
                    </dd>
                  </div>
                  {c.reliability.successRate != null && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Success rate</dt>
                      <dd className="text-text-primary">{(c.reliability.successRate * 100).toFixed(0)}%</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            {c.optimality && (
              <div className="glass-card p-8">
                <h3 className="text-h4 text-text-primary">Optimality</h3>
                <dl className="mt-3 space-y-1 font-mono text-small" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Bound</dt>
                    <dd className="text-text-primary">{c.optimality.boundValue}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Achieved</dt>
                    <dd className="text-text-primary">{c.optimality.achievedValue}</dd>
                  </div>
                  {c.optimality.gapPercent != null && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Gap</dt>
                      <dd className="text-text-primary">{c.optimality.gapPercent}%</dd>
                    </div>
                  )}
                </dl>
                {c.optimality.interpretation && (
                  <p className="mt-3 text-small text-text-secondary">{c.optimality.interpretation}</p>
                )}
              </div>
            )}
          </section>
        )}

        {c.value && c.value.items.length > 0 && (
          <section>
            <h2 className="text-h3 text-text-primary">Value</h2>
            <ul className="mt-3 divide-y divide-border border-t border-border">
              {c.value.items.map((item, i) => (
                <li key={i} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-text-primary">{item.label}</span>
                    <span className="font-mono text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {item.annualValue.toLocaleString()} {c.value?.currency ?? ""}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-mono-label uppercase text-text-muted">{item.confidence}</p>
                  {item.assumption && <p className="mt-1 text-small text-text-secondary">{item.assumption}</p>}
                </li>
              ))}
            </ul>
            {c.value.caveat && <p className="mt-3 text-small text-text-muted">{c.value.caveat}</p>}
          </section>
        )}

        {c.meta.visibility === "internal" && c.notes && (
          <section>
            <h2 className="text-h3 text-text-primary">Internal Notes</h2>
            <div className="mt-3 space-y-3 text-small text-text-secondary">
              {c.notes.whatWorked && (
                <p>
                  <span className="text-text-primary">What worked: </span>
                  {c.notes.whatWorked}
                </p>
              )}
              {c.notes.whatDidnt && (
                <p>
                  <span className="text-text-primary">What didn't: </span>
                  {c.notes.whatDidnt}
                </p>
              )}
              {c.notes.nextTime && (
                <p>
                  <span className="text-text-primary">Next time: </span>
                  {c.notes.nextTime}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="border-t border-border pt-8">
          <h2 className="text-h3 text-text-primary">Reproduce</h2>
          <dl className="mt-3 space-y-1 font-mono text-small">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-text-muted">Commit</dt>
              <dd className="truncate text-text-primary">{c.reproduce.commit}</dd>
            </div>
            {c.reproduce.repository && (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-text-muted">Repository</dt>
                <dd className="truncate text-text-primary">{c.reproduce.repository}</dd>
              </div>
            )}
            {c.reproduce.command && (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-text-muted">Command</dt>
                <dd className="truncate text-text-primary">{c.reproduce.command}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}
