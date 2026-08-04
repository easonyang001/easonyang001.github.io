import { useMemo, useState } from "react";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import { downloadCsv } from "../../lib/csv.ts";
import {
  QUBO_TEMPLATES,
  cloneMatrix,
  evaluateQubo,
  formatBitstring,
  greedyQubo,
  type QuboMatrix,
} from "../../lib/optimization/qubo.ts";

function matrixRange(matrix: QuboMatrix): { min: number; max: number } {
  const values = matrix.flat();
  return { min: Math.min(...values), max: Math.max(...values) };
}

function cellColor(value: number, min: number, max: number): string {
  if (max === min) return "rgba(139, 92, 246, 0.24)";
  const t = (value - min) / (max - min);
  if (value < 0) return `rgba(217, 70, 239, ${0.18 + (1 - t) * 0.42})`;
  if (value > 0) return `rgba(139, 92, 246, ${0.16 + t * 0.44})`;
  return "rgba(148, 163, 184, 0.08)";
}

export default function QuboPage() {
  const [templateSlug, setTemplateSlug] = useState(QUBO_TEMPLATES[0].slug);
  const template = QUBO_TEMPLATES.find((item) => item.slug === templateSlug) ?? QUBO_TEMPLATES[0];
  const [matrix, setMatrix] = useState<QuboMatrix>(() => cloneMatrix(template.matrix));
  const [requiredCount, setRequiredCount] = useState<number | null>(null);

  const solutions = useMemo(() => evaluateQubo(matrix, requiredCount), [matrix, requiredCount]);
  const best = solutions[0];
  const greedy = useMemo(() => greedyQubo(matrix), [matrix]);
  const { min, max } = matrixRange(matrix);

  const handleTemplate = (slug: string) => {
    const next = QUBO_TEMPLATES.find((item) => item.slug === slug) ?? QUBO_TEMPLATES[0];
    setTemplateSlug(slug);
    setMatrix(cloneMatrix(next.matrix));
    setRequiredCount(null);
  };

  const updateCell = (row: number, col: number, value: number) => {
    setMatrix((current) =>
      current.map((r, i) => r.map((cell, j) => (i === row && j === col ? value : cell)))
    );
  };

  const exportSolutions = () => {
    downloadCsv("qubo-solutions.csv", [
      ["rank", "bitstring", "energy", "feasible", "violations"],
      ...solutions.map((solution, index) => [
        index + 1,
        formatBitstring(solution.bits),
        solution.energy,
        solution.feasible ? "yes" : "no",
        solution.violations.join("; "),
      ]),
    ]);
  };

  return (
    <ToolPageLayout
      eyebrow="Optimization Lab"
      title="QUBO Solver"
      path="/lab/qubo"
      seoDescription="Build a small binary quadratic objective, inspect the Q matrix, and compare exact search against a greedy local-search baseline."
      description={
        <p className="mt-3 text-small text-text-secondary">
          Build a small binary quadratic objective, inspect the Q matrix, and compare exact search
          against a greedy local-search baseline.
        </p>
      }
      panel={
        <>
          <div>
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Template</p>
            <Segmented>
              {QUBO_TEMPLATES.map((item) => (
                <SegmentedButton
                  key={item.slug}
                  active={templateSlug === item.slug}
                  onClick={() => handleTemplate(item.slug)}
                >
                  {item.name}
                </SegmentedButton>
              ))}
            </Segmented>
            <p className="mt-3 text-small text-text-secondary">{template.description}</p>
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
              Feasible count
            </label>
            <select
              value={requiredCount ?? "any"}
              onChange={(event) =>
                setRequiredCount(event.target.value === "any" ? null : Number(event.target.value))
              }
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            >
              <option value="any">Any selected count</option>
              {matrix.map((_row, index) => (
                <option key={index} value={index}>
                  Exactly {index}
                </option>
              ))}
              <option value={matrix.length}>Exactly {matrix.length}</option>
            </select>
          </div>

          <div className="mt-6 rounded-panel border border-panel-border divide-y divide-panel-divider">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Best</span>
              <span className="readout font-mono text-small text-text-primary">
                {formatBitstring(best.bits)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Energy</span>
              <span className="readout font-mono text-small text-text-primary">
                {best.energy.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Greedy</span>
              <span className="readout font-mono text-small text-text-primary">
                {formatBitstring(greedy.bits)} / {greedy.energy.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={exportSolutions}
            className="mt-6 w-full rounded-md border border-border px-3 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
          >
            Export Solutions
          </button>
        </>
      }
    >
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-mono-label uppercase text-text-muted">Q Matrix</p>
              <p className="mt-1 text-small text-text-secondary">
                Only the diagonal and upper triangle contribute to E(x) = x^T Q x.
              </p>
            </div>
            <span className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-muted">
              {matrix.length} variables
            </span>
          </div>

          <div
            className="grid overflow-hidden rounded-md border border-border"
            style={{ gridTemplateColumns: `repeat(${matrix.length + 1}, minmax(64px, 1fr))` }}
          >
            <div className="bg-readout-bg p-2" />
            {template.variables.map((name) => (
              <div key={name} className="bg-readout-bg p-2 text-center font-mono text-small text-text-muted">
                {name}
              </div>
            ))}
            {matrix.map((row, i) => [
              <div key={`row-${i}`} className="bg-readout-bg p-2 font-mono text-small text-text-muted">
                {template.variables[i]}
              </div>,
              ...row.map((value, j) => (
                <input
                  key={`${i}-${j}`}
                  type="number"
                  step={0.5}
                  disabled={j < i}
                  value={value}
                  onChange={(event) => updateCell(i, j, Number(event.target.value))}
                  className="min-w-0 border-l border-t border-border px-2 py-3 text-center font-mono text-small text-text-primary outline-none disabled:cursor-not-allowed disabled:text-text-muted"
                  style={{
                    backgroundColor: j < i ? "#060B18" : cellColor(value, min, max),
                  }}
                />
              )),
            ])}
          </div>
        </section>

        <section>
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Energy Ranking</p>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
            {solutions.slice(0, 8).map((solution, index) => (
              <div
                key={formatBitstring(solution.bits)}
                className="grid grid-cols-[48px_1fr_auto] items-center gap-3 px-4 py-3"
              >
                <span className="font-mono text-small text-text-muted">#{index + 1}</span>
                <div>
                  <p className="font-mono text-body text-text-primary">{formatBitstring(solution.bits)}</p>
                  <p className="text-small text-text-secondary">
                    {solution.feasible ? "feasible" : solution.violations.join("; ")}
                  </p>
                </div>
                <span className="readout font-mono text-small text-text-primary">
                  {solution.energy.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageLayout>
  );
}
