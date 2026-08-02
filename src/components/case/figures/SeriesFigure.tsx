import FigureFrame from "./FigureFrame.tsx";
import { downloadCsv } from "../../../lib/csv.ts";
import type { SeriesFigure as SeriesFigureType } from "../../../types/figures.ts";

const W = 640;
const H = 320;
const PAD = { top: 16, right: 16, bottom: 36, left: 56 };

export default function SeriesFigure({ figure }: { figure: SeriesFigureType }) {
  const allPoints = figure.series.flatMap((s) => s.data);
  const xs = allPoints.map((p) => p[0]);
  const ys = allPoints.map((p) => p[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const sy = (y: number) => PAD.top + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;

  const yTicks = 4;
  const xTicks = 4;

  return (
    <FigureFrame
      heading={figure.heading}
      caption={figure.caption}
      onDownload={() =>
        downloadCsv(
          `${figure.heading ?? "series"}.csv`,
          [
            ["series", figure.xLabel ?? "x", figure.yLabel ?? "y"],
            ...figure.series.flatMap((s) => s.data.map((p) => [s.label, p[0], p[1]])),
          ]
        )
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={figure.heading ?? "Series chart"}>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = PAD.top + (plotH / yTicks) * i;
          const value = yMax - ((yMax - yMin) / yTicks) * i;
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1E293B" strokeWidth={1} />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="font-mono"
                style={{ fontSize: 10, fill: "#64748B", fontVariantNumeric: "tabular-nums" }}
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }, (_, i) => {
          const x = PAD.left + (plotW / xTicks) * i;
          const value = xMin + ((xMax - xMin) / xTicks) * i;
          return (
            <text
              key={i}
              x={x}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
              className="font-mono"
              style={{ fontSize: 10, fill: "#64748B", fontVariantNumeric: "tabular-nums" }}
            >
              {value.toFixed(0)}
            </text>
          );
        })}

        {figure.series.map((s, i) => (
          <path
            key={i}
            d={s.data.map((p, j) => `${j === 0 ? "M" : "L"}${sx(p[0])},${sy(p[1])}`).join(" ")}
            fill="none"
            stroke={s.emphasis ? "#8B5CF6" : "#64748B"}
            strokeWidth={s.emphasis ? 2 : 1.5}
          />
        ))}

        {figure.xLabel && (
          <text x={PAD.left + plotW / 2} y={H - 4} textAnchor="middle" className="font-mono" style={{ fontSize: 10, fill: "#64748B" }}>
            {figure.xLabel}
          </text>
        )}
        {figure.yLabel && (
          <text
            x={-(PAD.top + plotH / 2)}
            y={14}
            textAnchor="middle"
            transform="rotate(-90)"
            className="font-mono"
            style={{ fontSize: 10, fill: "#64748B" }}
          >
            {figure.yLabel}
          </text>
        )}
      </svg>
      <div className="mt-4 flex flex-wrap gap-4">
        {figure.series.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-small text-text-secondary">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.emphasis ? "#8B5CF6" : "#64748B" }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </FigureFrame>
  );
}
