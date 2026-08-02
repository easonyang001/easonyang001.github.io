/**
 * Hand-written, specific shapes for the 8 figure types this site knows how
 * to render. The generated case.ts intentionally types figures[] loosely
 * (the contract keeps `type` open-ended so new figure types don't need a
 * schema bump) -- these narrower interfaces are used only after checking
 * `.type` at render time. An unrecognized type is skipped, not rejected.
 */

interface FigureBase {
  heading?: string | null;
  caption?: string | null;
}

export interface SeriesPoint extends Array<number> {
  0: number;
  1: number;
}

export interface SeriesFigure extends FigureBase {
  type: "series";
  xLabel?: string | null;
  yLabel?: string | null;
  xScale?: "linear" | "log";
  yScale?: "linear" | "log";
  series: { label: string; emphasis?: boolean; data: SeriesPoint[] }[];
  annotations?: { label: string; x: number }[];
}

export interface PointsFigure extends FigureBase {
  type: "points";
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  layers: { label: string; role: "muted" | "emphasis"; points: SeriesPoint[]; radius?: number }[];
  isSynthetic?: boolean;
}

export interface MatrixFigure extends FigureBase {
  type: "matrix";
  xLabel?: string | null;
  yLabel?: string | null;
  xValues: number[];
  yValues: number[];
  values: number[][];
  valueLabel?: string | null;
  highlightBest?: boolean;
}

export interface BarsFigure extends FigureBase {
  type: "bars";
  metricLabel: string;
  higherIsBetter?: boolean;
  items: { label: string; value: number; emphasis?: boolean; distribution?: number[] | null }[];
}

export interface TableFigure extends FigureBase {
  type: "table";
  columns: string[];
  rows: (string | number)[][];
  numericColumns?: number[];
}

export interface BeforeAfterFigure extends FigureBase {
  type: "beforeAfter";
  before: { label: string; figure: KnownFigure };
  after: { label: string; figure: KnownFigure };
}

export interface ImageFigure extends FigureBase {
  type: "image";
  src: string;
  alt: string;
  sourceData: string;
}

export interface NoteFigure extends FigureBase {
  type: "note";
  markdown: string;
}

export type KnownFigure =
  | SeriesFigure
  | PointsFigure
  | MatrixFigure
  | BarsFigure
  | TableFigure
  | BeforeAfterFigure
  | ImageFigure
  | NoteFigure;

const KNOWN_TYPES = new Set<string>([
  "series",
  "points",
  "matrix",
  "bars",
  "table",
  "beforeAfter",
  "image",
  "note",
]);

export function isKnownFigure(fig: { type: string }): fig is KnownFigure {
  return KNOWN_TYPES.has(fig.type);
}
