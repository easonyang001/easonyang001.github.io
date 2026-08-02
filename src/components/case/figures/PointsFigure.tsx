import FigureFrame from "./FigureFrame.tsx";
import { downloadCsv } from "../../../lib/csv.ts";
import type { PointsFigure as PointsFigureType } from "../../../types/figures.ts";

const W = 640;
const H = 400;
const PAD = 24;

export default function PointsFigure({ figure }: { figure: PointsFigureType }) {
  const { bounds } = figure;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;
  const sx = (x: number) => PAD + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin || 1)) * plotW;
  const sy = (y: number) => PAD + plotH - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin || 1)) * plotH;

  return (
    <FigureFrame
      heading={figure.heading}
      caption={figure.caption}
      isSynthetic={figure.isSynthetic}
      onDownload={() =>
        downloadCsv(
          `${figure.heading ?? "points"}.csv`,
          [["layer", "x", "y"], ...figure.layers.flatMap((l) => l.points.map((p) => [l.label, p[0], p[1]]))]
        )
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={figure.heading ?? "Point map"}>
        <rect x={PAD} y={PAD} width={plotW} height={plotH} fill="none" stroke="#1E293B" strokeWidth={1} />
        {figure.layers.map((layer, i) => (
          <g key={i}>
            {layer.points.map((p, j) => (
              <circle
                key={j}
                cx={sx(p[0])}
                cy={sy(p[1])}
                r={layer.radius ?? (layer.role === "emphasis" ? 5 : 3)}
                fill={layer.role === "emphasis" ? "#8B5CF6" : "#64748B"}
                fillOpacity={layer.role === "emphasis" ? 0.9 : 0.5}
              />
            ))}
          </g>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap gap-4">
        {figure.layers.map((layer, i) => (
          <div key={i} className="flex items-center gap-2 text-small text-text-secondary">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: layer.role === "emphasis" ? "#8B5CF6" : "#64748B" }}
            />
            {layer.label}
          </div>
        ))}
      </div>
    </FigureFrame>
  );
}
