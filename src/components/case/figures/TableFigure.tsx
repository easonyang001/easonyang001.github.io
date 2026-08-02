import FigureFrame from "./FigureFrame.tsx";
import { downloadCsv } from "../../../lib/csv.ts";
import type { TableFigure as TableFigureType } from "../../../types/figures.ts";

export default function TableFigure({ figure }: { figure: TableFigureType }) {
  const numeric = new Set(figure.numericColumns ?? []);

  return (
    <FigureFrame
      heading={figure.heading}
      caption={figure.caption}
      onDownload={() => downloadCsv(`${figure.heading ?? "table"}.csv`, [figure.columns, ...figure.rows])}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b border-border">
              {figure.columns.map((col, i) => (
                <th
                  key={i}
                  className={`py-2 pr-4 font-mono text-mono-label uppercase text-text-muted ${
                    numeric.has(i) ? "text-right" : "text-left"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {figure.rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-2 pr-4 text-text-primary ${numeric.has(j) ? "text-right font-mono" : ""}`}
                    style={numeric.has(j) ? { fontVariantNumeric: "tabular-nums" } : undefined}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FigureFrame>
  );
}
