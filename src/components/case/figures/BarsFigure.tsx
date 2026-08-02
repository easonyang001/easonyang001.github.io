import FigureFrame from "./FigureFrame.tsx";
import { downloadCsv } from "../../../lib/csv.ts";
import type { BarsFigure as BarsFigureType } from "../../../types/figures.ts";

const H = 280;
const BAR_W = 72;
const GAP = 32;
const PAD = { top: 16, bottom: 32, left: 8 };

export default function BarsFigure({ figure }: { figure: BarsFigureType }) {
  const values = figure.items.flatMap((i) => (i.distribution && i.distribution.length > 0 ? i.distribution : [i.value]));
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const plotH = H - PAD.top - PAD.bottom;
  const scale = (v: number) => (plotH * (v - min)) / (max - min || 1);
  const w = PAD.left * 2 + figure.items.length * (BAR_W + GAP);

  return (
    <FigureFrame
      heading={figure.heading}
      caption={figure.caption}
      onDownload={() =>
        downloadCsv(
          `${figure.heading ?? "bars"}.csv`,
          [["label", figure.metricLabel], ...figure.items.map((i) => [i.label, i.value])]
        )
      }
    >
      <svg viewBox={`0 0 ${w} ${H}`} className="w-full" role="img" aria-label={figure.heading ?? "Bar comparison"}>
        <line x1={PAD.left} y1={H - PAD.bottom} x2={w - PAD.left} y2={H - PAD.bottom} stroke="#1E293B" strokeWidth={1} />
        {figure.items.map((item, i) => {
          const x = PAD.left + i * (BAR_W + GAP);
          const barHeight = scale(item.value);
          const color = item.emphasis ? "#8B5CF6" : "#64748B";
          const dist = item.distribution;
          return (
            <g key={i}>
              <rect
                x={x}
                y={H - PAD.bottom - barHeight}
                width={BAR_W}
                height={barHeight}
                fill={color}
                fillOpacity={item.emphasis ? 0.85 : 0.5}
              />
              {dist && dist.length > 1 && (
                <g>
                  {(() => {
                    const sorted = [...dist].sort((a, b) => a - b);
                    const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
                    const boxTop = H - PAD.bottom - scale(q(0.75));
                    const boxBottom = H - PAD.bottom - scale(q(0.25));
                    const medianY = H - PAD.bottom - scale(q(0.5));
                    const cx = x + BAR_W / 2;
                    return (
                      <>
                        <line x1={cx} y1={H - PAD.bottom - scale(sorted[0])} x2={cx} y2={boxBottom} stroke="#F8FAFC" strokeWidth={1} />
                        <line
                          x1={cx}
                          y1={boxTop}
                          x2={cx}
                          y2={H - PAD.bottom - scale(sorted[sorted.length - 1])}
                          stroke="#F8FAFC"
                          strokeWidth={1}
                        />
                        <rect x={x + BAR_W / 4} y={boxTop} width={BAR_W / 2} height={boxBottom - boxTop} fill="none" stroke="#F8FAFC" strokeWidth={1} />
                        <line x1={x + BAR_W / 4} y1={medianY} x2={x + (3 * BAR_W) / 4} y2={medianY} stroke="#F8FAFC" strokeWidth={1.5} />
                      </>
                    );
                  })()}
                </g>
              )}
              <text
                x={x + BAR_W / 2}
                y={H - PAD.bottom - barHeight - 8}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 11, fill: "#F8FAFC", fontVariantNumeric: "tabular-nums" }}
              >
                {item.value.toFixed(3)}
              </text>
              <text
                x={x + BAR_W / 2}
                y={H - PAD.bottom + 16}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 11, fill: "#94A3B8" }}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </FigureFrame>
  );
}
