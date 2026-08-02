import type { MramaCaseSchemaV1 } from "../../types/case.ts";

type MetricEntry = MramaCaseSchemaV1["improvement"]["primary"];

function formatValue(v: number): string {
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function formatDelta(entry: MetricEntry): string {
  const diff = entry.achieved - entry.baseline;
  const sign = diff > 0 ? "+" : "";
  if (entry.unit === "%") {
    return `${sign}${diff.toFixed(1)}pp`;
  }
  return `${sign}${formatValue(diff)} ${entry.unit}`;
}

function MetricRow({ entry, primary }: { entry: MetricEntry; primary?: boolean }) {
  return (
    <div className={primary ? "" : "flex items-center justify-between gap-4"}>
      {!primary && <span className="text-small text-text-secondary">{entry.name}</span>}
      <div
        className={`flex items-baseline gap-3 font-mono ${primary ? "text-h2 md:text-h2-lg" : "text-small"}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span className="text-text-primary">
          {formatValue(entry.baseline)}
          {entry.unit === "%" ? "%" : ` ${entry.unit}`}
        </span>
        <span className="text-text-muted">&rarr;</span>
        <span className="text-text-primary">
          {formatValue(entry.achieved)}
          {entry.unit === "%" ? "%" : ` ${entry.unit}`}
        </span>
        <span className={primary ? "text-body-lg text-accent" : "text-accent"}>{formatDelta(entry)}</span>
      </div>
    </div>
  );
}

export default function ImprovementSummary({ improvement }: { improvement: MramaCaseSchemaV1["improvement"] }) {
  return (
    <div className="glass-card p-8">
      <p className="text-h4 text-text-primary">{improvement.primary.name}</p>
      <div className="mt-3">
        <MetricRow entry={improvement.primary} primary />
      </div>
      {improvement.secondary && improvement.secondary.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-border pt-6">
          {improvement.secondary.map((entry, i) => (
            <MetricRow key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
