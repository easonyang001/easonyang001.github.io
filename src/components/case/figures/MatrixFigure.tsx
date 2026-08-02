import FigureFrame from "./FigureFrame.tsx";
import { downloadCsv } from "../../../lib/csv.ts";
import { magmaColor, MAGMA_CSS_GRADIENT } from "../../../lib/viz/magma.ts";
import type { MatrixFigure as MatrixFigureType } from "../../../types/figures.ts";

const CELL = 48;
const LABEL_GUTTER = 56;

export default function MatrixFigure({ figure }: { figure: MatrixFigureType }) {
  const flat = figure.values.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  let bestI = 0;
  let bestJ = 0;
  if (figure.highlightBest) {
    let best = -Infinity;
    figure.values.forEach((row, i) =>
      row.forEach((v, j) => {
        if (v > best) {
          best = v;
          bestI = i;
          bestJ = j;
        }
      })
    );
  }

  const cols = figure.xValues.length;
  const rows = figure.yValues.length;
  const w = LABEL_GUTTER + cols * CELL;
  const h = LABEL_GUTTER + rows * CELL;

  return (
    <FigureFrame
      heading={figure.heading}
      caption={figure.caption}
      onDownload={() =>
        downloadCsv(
          `${figure.heading ?? "matrix"}.csv`,
          [
            ["", ...figure.xValues.map(String)],
            ...figure.values.map((row, i) => [String(figure.yValues[i]), ...row.map(String)]),
          ]
        )
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md" role="img" aria-label={figure.heading ?? "Parameter sweep heatmap"}>
        {figure.yValues.map((yv, i) => (
          <text
            key={`y${i}`}
            x={LABEL_GUTTER - 8}
            y={LABEL_GUTTER + i * CELL + CELL / 2 + 4}
            textAnchor="end"
            className="font-mono"
            style={{ fontSize: 10, fill: "#64748B", fontVariantNumeric: "tabular-nums" }}
          >
            {yv}
          </text>
        ))}
        {figure.xValues.map((xv, j) => (
          <text
            key={`x${j}`}
            x={LABEL_GUTTER + j * CELL + CELL / 2}
            y={LABEL_GUTTER - 8}
            textAnchor="middle"
            className="font-mono"
            style={{ fontSize: 10, fill: "#64748B", fontVariantNumeric: "tabular-nums" }}
          >
            {xv}
          </text>
        ))}
        {figure.values.map((row, i) =>
          row.map((v, j) => {
            const t = (v - min) / (max - min || 1);
            const isBest = figure.highlightBest && i === bestI && j === bestJ;
            return (
              <rect
                key={`${i}-${j}`}
                x={LABEL_GUTTER + j * CELL}
                y={LABEL_GUTTER + i * CELL}
                width={CELL}
                height={CELL}
                fill={magmaColor(t)}
                stroke={isBest ? "#8B5CF6" : "#020617"}
                strokeWidth={isBest ? 2 : 1}
              />
            );
          })
        )}
      </svg>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 w-32 rounded-md" style={{ background: MAGMA_CSS_GRADIENT }} />
        <span className="font-mono text-mono-label uppercase text-text-muted">
          {figure.valueLabel ?? "Value"}: {min.toFixed(1)} to {max.toFixed(1)}
        </span>
      </div>
    </FigureFrame>
  );
}
